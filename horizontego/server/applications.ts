import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db-extended";
import { canApplyToJob, getPlanLimits } from "./products";
import { storagePut } from "./storage";

export const applicationsRouter = router({
  /**
   * Upload resume to S3
   */
  uploadResume: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(), // base64 encoded
      mimeType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Decode base64
        const buffer = Buffer.from(input.fileData, "base64");
        
        // Generate unique file key
        const timestamp = Date.now();
        const fileKey = `resumes/${ctx.user.id}/${timestamp}-${input.fileName}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Update user record
        await db.updateUserResume(ctx.user.id, url);
        
        return { url };
      } catch (error) {
        console.error("[Applications] Error uploading resume:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload resume",
        });
      }
    }),

  /**
   * Apply to a job
   */
  applyToJob: protectedProcedure
    .input(z.object({
      jobId: z.number(),
      resumeUrl: z.string().optional(),
      coverLetter: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.user;
      
      // Check plan limits
      const todayCount = await db.getTodayApplicationCount(user.id);
      const canApply = canApplyToJob(user.plan, todayCount);
      
      if (!canApply) {
        const limits = getPlanLimits(user.plan);
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Você atingiu o limite de ${limits.dailyApplications} candidaturas por dia. Faça upgrade do seu plano para enviar mais candidaturas.`,
        });
      }
      
      // Use uploaded resume or provided URL
      const resumeUrl = input.resumeUrl || user.resumeUrl;
      
      if (!resumeUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você precisa fazer upload de um currículo antes de se candidatar",
        });
      }
      
      // Create application
      await db.createJobApplication({
        userId: user.id,
        jobId: input.jobId,
        resumeUrl,
        coverLetter: input.coverLetter,
        status: "pending",
      });
      
      // Increment application count
      await db.incrementApplicationCount(user.id);
      
      return {
        success: true,
        remainingApplications: getPlanLimits(user.plan).dailyApplications - (todayCount + 1),
      };
    }),

  /**
   * Get user's applications
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserApplications(ctx.user.id);
  }),

  /**
   * Get application stats
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    const todayCount = await db.getTodayApplicationCount(ctx.user.id);
    const limits = getPlanLimits(ctx.user.plan);
    
    return {
      todayCount,
      dailyLimit: limits.dailyApplications,
      remaining: Math.max(0, limits.dailyApplications - todayCount),
      plan: ctx.user.plan,
    };
  }),
});
