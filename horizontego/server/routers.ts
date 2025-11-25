import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { paymentRouter } from "./payment";
import { applicationsRouter } from "./applications";

// Helper to check if user has paid
const paidProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.user.hasPaid && ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Payment required to access this feature' 
    });
  }
  return next({ ctx });
});

// Helper for admin-only procedures
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  payment: paymentRouter,
  applications: applicationsRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= COUNTRIES =============
  countries: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCountries();
    }),
    
    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return await db.getCountryByCode(input.code);
      }),
  }),

  // ============= JOBS =============
  jobs: router({
    list: paidProcedure
      .input(z.object({
        countryId: z.number().optional(),
        isActive: z.boolean().optional(),
        location: z.string().optional(),
        category: z.string().optional(),
        education: z.string().optional(),
        language: z.string().optional(),
        employmentType: z.string().optional(),
        remoteWork: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllJobs(input);
      }),
    
    getById: paidProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getJobById(input.id);
      }),

    // Admin endpoints
    create: adminProcedure
      .input(z.object({
        countryId: z.number(),
        title: z.string(),
        company: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        requirements: z.string().optional(),
        benefits: z.string().optional(),
        salary: z.string().optional(),
        sourceUrl: z.string().optional(),
        sourceName: z.string().optional(),
        isVerified: z.boolean().default(false),
        isActive: z.boolean().default(true),
        externalId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createJob(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          company: z.string().optional(),
          location: z.string().optional(),
          description: z.string().optional(),
          requirements: z.string().optional(),
          benefits: z.string().optional(),
          salary: z.string().optional(),
          sourceUrl: z.string().optional(),
          sourceName: z.string().optional(),
          isVerified: z.boolean().optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateJob(input.id, input.data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteJob(input.id);
        return { success: true };
      }),
  }),

  // ============= CHECKLIST & PROGRESS =============
  checklist: router({
    getSteps: paidProcedure
      .input(z.object({ countryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChecklistStepsByCountry(input.countryId);
      }),

    getUserProgress: paidProcedure
      .input(z.object({ countryId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getUserProgressByCountry(ctx.user.id, input.countryId);
      }),

    toggleStep: paidProcedure
      .input(z.object({
        stepId: z.number(),
        isCompleted: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.toggleStepCompletion(ctx.user.id, input.stepId, input.isCompleted);
        return { success: true };
      }),

    markViewed: paidProcedure
      .input(z.object({ stepId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.markStepAsViewed(ctx.user.id, input.stepId);
        return { success: true };
      }),

    // Admin: create checklist steps
    createStep: adminProcedure
      .input(z.object({
        countryId: z.number(),
        stage: z.enum(["preparation", "documentation", "application", "interview", "approval", "boarding"]),
        title: z.string(),
        description: z.string().optional(),
        orderIndex: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        await db.createChecklistStep(input);
        return { success: true };
      }),
  }),

  // ============= DOCUMENTS =============
  documents: router({
    list: paidProcedure.query(async ({ ctx }) => {
      return await db.getUserDocuments(ctx.user.id);
    }),

    generate: paidProcedure
      .input(z.object({
        type: z.enum(["resume", "cover_letter", "email"]),
        personalInfo: z.object({
          fullName: z.string(),
          email: z.string(),
          phone: z.string().optional(),
          location: z.string().optional(),
        }),
        professionalInfo: z.object({
          experience: z.string(),
          skills: z.string(),
          education: z.string().optional(),
        }),
        targetCountry: z.string(),
        targetPosition: z.string().optional(),
        language: z.string().default("pt-BR"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Use LLM to generate document
        let prompt = "";
        
        if (input.type === "resume") {
          prompt = `Create a professional resume in ${input.language === "pt-BR" ? "Portuguese (Brazil)" : "English"} for a seasonal worker application to ${input.targetCountry}.

Personal Information:
- Name: ${input.personalInfo.fullName}
- Email: ${input.personalInfo.email}
${input.personalInfo.phone ? `- Phone: ${input.personalInfo.phone}` : ""}
${input.personalInfo.location ? `- Location: ${input.personalInfo.location}` : ""}

Professional Background:
${input.professionalInfo.experience}

Skills:
${input.professionalInfo.skills}

${input.professionalInfo.education ? `Education:\n${input.professionalInfo.education}` : ""}

${input.targetPosition ? `Target Position: ${input.targetPosition}` : ""}

Format the resume professionally with clear sections. Focus on skills relevant to seasonal work.`;
        } else if (input.type === "cover_letter") {
          prompt = `Write a professional cover letter in ${input.language === "pt-BR" ? "Portuguese (Brazil)" : "English"} for a seasonal worker position in ${input.targetCountry}.

Applicant: ${input.personalInfo.fullName}
${input.targetPosition ? `Position: ${input.targetPosition}` : ""}

Background:
${input.professionalInfo.experience}

Skills:
${input.professionalInfo.skills}

The letter should express enthusiasm, highlight relevant experience, and show cultural awareness.`;
        } else {
          prompt = `Write a professional job application email in ${input.language === "pt-BR" ? "Portuguese (Brazil)" : "English"} for a seasonal worker position in ${input.targetCountry}.

From: ${input.personalInfo.fullName} (${input.personalInfo.email})
${input.targetPosition ? `Position: ${input.targetPosition}` : ""}

Keep it concise, professional, and friendly. Mention attached resume and express interest in the opportunity.`;
        }

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a professional career advisor helping people create job application documents." },
            { role: "user", content: prompt }
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const content = typeof messageContent === 'string' ? messageContent : "";

        // Save to database
        const title = `${input.type === "resume" ? "Currículo" : input.type === "cover_letter" ? "Carta de Apresentação" : "Email"} - ${input.targetCountry}`;
        
        await db.createDocument({
          userId: ctx.user.id,
          type: input.type,
          title,
          content,
          language: input.language,
          targetCountry: input.targetCountry,
        });

        return { content, title };
      }),

    delete: paidProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteDocument(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============= CALCULATOR =============
  calculator: router({
    calculate: paidProcedure
      .input(z.object({
        monthlySalary: z.number(),
        currency: z.string(),
        monthlyExpenses: z.number(),
        durationMonths: z.number(),
        housingIncluded: z.boolean().default(false),
        mealsIncluded: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        // Get exchange rates
        const brlRate = input.currency === "BRL" ? 1 : 
          parseFloat((await db.getExchangeRate(input.currency, "BRL"))?.rate || "1");
        
        const totalIncome = input.monthlySalary * input.durationMonths;
        const totalExpenses = input.monthlyExpenses * input.durationMonths;
        const netSavings = totalIncome - totalExpenses;
        const netSavingsBRL = netSavings * brlRate;

        return {
          totalIncome,
          totalExpenses,
          netSavings,
          netSavingsBRL,
          currency: input.currency,
          exchangeRate: brlRate,
        };
      }),

    getExchangeRate: paidProcedure
      .input(z.object({
        from: z.string(),
        to: z.string(),
      }))
      .query(async ({ input }) => {
        const rate = await db.getExchangeRate(input.from, input.to);
        return rate;
      }),
  }),

  // ============= SECURITY =============
  security: router({
    getTips: paidProcedure
      .input(z.object({
        countryId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getSecurityTips(input?.countryId);
      }),

    // Admin: create security tip
    createTip: adminProcedure
      .input(z.object({
        countryId: z.number().optional(),
        category: z.enum(["scam_alert", "verification", "safety_tip", "official_resource"]),
        title: z.string(),
        description: z.string(),
        severity: z.enum(["low", "medium", "high"]).default("medium"),
      }))
      .mutation(async ({ input }) => {
        await db.createSecurityTip({ ...input, isActive: true });
        return { success: true };
      }),
  }),

  // ============= FAVORITES =============
  favorites: router({
    list: paidProcedure.query(async ({ ctx }) => {
      return await db.getUserFavorites(ctx.user.id);
    }),

    toggle: paidProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const isFavorited = await db.toggleFavorite(ctx.user.id, input.jobId);
        return { isFavorited };
      }),
  }),

  // ============= PROFESSIONS =============
  professions: router({
    search: paidProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        const { searchESCOOccupations } = await import('./integrations/esco');
        const results = await searchESCOOccupations(input.query, 'pt');
        
        // Transform to frontend format
        return results.map(occ => ({
          title: occ.title,
          description: occ.description,
          alternativeLabels: occ.alternativeLabels,
          sector: occ.iscoGroup,
          internationalEquivalents: occ.alternativeLabels || [],
        }));
      }),
  }),

  // ============= FRAUD CHECK =============
  fraudCheck: router({
    checkJob: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        const { checkJobForFraud, getFraudCheckSummary } = await import('./fraud-detection');
        
        const job = await db.getJobById(input.jobId);
        if (!job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Vaga não encontrada' });
        }
        
        const result = checkJobForFraud(job);
        return {
          ...result,
          summary: getFraudCheckSummary(result),
        };
      }),
  }),

  // ============= PROFILE =============
  profile: router({
    updateName: protectedProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUser(ctx.user.id, { name: input.name });
        return { success: true };
      }),

    updateEmail: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUser(ctx.user.id, { email: input.email });
        return { success: true };
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const { getApplicationStats } = await import('./db-extended');
      return await getApplicationStats(ctx.user.id);
    }),

    uploadProfilePhoto: protectedProcedure
      .input(z.object({ 
        file: z.string(), // base64 encoded image
        filename: z.string()
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import('./storage');
        
        // Decode base64
        const buffer = Buffer.from(input.file.split(',')[1], 'base64');
        
        // Upload to S3
        const key = `profile-photos/${ctx.user.id}-${Date.now()}-${input.filename}`;
        const { url } = await storagePut(key, buffer, 'image/jpeg');
        
        // Update user
        await db.updateUser(ctx.user.id, { profilePhotoUrl: url });
        
        return { url };
      }),

    removeProfilePhoto: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.updateUser(ctx.user.id, { profilePhotoUrl: null });
        return { success: true };
      }),

    uploadResume: protectedProcedure
      .input(z.object({ 
        file: z.string(), // base64 encoded PDF
        filename: z.string()
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import('./storage');
        const { updateUserResume } = await import('./db-extended');
        
        // Decode base64
        const buffer = Buffer.from(input.file.split(',')[1], 'base64');
        
        // Upload to S3
        const key = `resumes/${ctx.user.id}-${Date.now()}-${input.filename}`;
        const { url } = await storagePut(key, buffer, 'application/pdf');
        
        // Update user
        await updateUserResume(ctx.user.id, url);
        
        return { url };
      }),

    removeResume: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { updateUserResume } = await import('./db-extended');
        await updateUserResume(ctx.user.id, '');
        return { success: true };
      }),
  }),

  // ============= ADMIN =============
  admin: router({
    createCountry: adminProcedure
      .input(z.object({
        name: z.string(),
        code: z.string(),
        currency: z.string(),
        flagEmoji: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCountry(input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
