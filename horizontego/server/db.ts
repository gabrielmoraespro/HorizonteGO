import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  countries, InsertCountry,
  jobs, InsertJob,
  checklistSteps, InsertChecklistStep,
  userProgress, InsertUserProgress,
  documents, InsertDocument,
  exchangeRates, InsertExchangeRate,
  securityTips, InsertSecurityTip,
  userFavorites, InsertUserFavorite
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER HELPERS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(userId: number, data: { name?: string; email?: string; profilePhotoUrl?: string | null }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function updateUserPayment(
  userId: number, 
  stripePaymentId: string,
  plan: 'starter' | 'pro' = 'starter'
) {
  const db = await getDb();
  if (!db) return;

  await db.update(users)
    .set({ 
      hasPaid: true, 
      paymentDate: new Date(), 
      stripePaymentId,
      plan
    })
    .where(eq(users.id, userId));
}

// ============= COUNTRY HELPERS =============

export async function getAllCountries() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(countries);
}

export async function getCountryByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(countries).where(eq(countries.code, code)).limit(1);
  return result[0];
}

export async function createCountry(country: InsertCountry) {
  const db = await getDb();
  if (!db) return;
  await db.insert(countries).values(country);
}

// ============= JOB HELPERS =============

export async function getAllJobs(filters?: { 
  countryId?: number; 
  isActive?: boolean;
  location?: string;
  category?: string;
  education?: string;
  language?: string;
  employmentType?: string;
  remoteWork?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions: any[] = [];
  
  if (filters?.countryId) {
    conditions.push(eq(jobs.countryId, filters.countryId));
  }
  if (filters?.isActive !== undefined) {
    conditions.push(eq(jobs.isActive, filters.isActive));
  }
  if (filters?.location) {
    conditions.push(eq(jobs.location, filters.location));
  }
  if (filters?.category) {
    conditions.push(eq(jobs.category, filters.category));
  }
  if (filters?.education) {
    conditions.push(eq(jobs.education, filters.education));
  }
  if (filters?.language) {
    conditions.push(eq(jobs.language, filters.language));
  }
  if (filters?.employmentType) {
    conditions.push(eq(jobs.employmentType, filters.employmentType));
  }
  if (filters?.remoteWork !== undefined) {
    conditions.push(eq(jobs.remoteWork, filters.remoteWork));
  }
  
  let query = db.select().from(jobs);
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(jobs.postedAt));
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result[0];
}

export async function createJob(job: InsertJob) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(jobs).values(job);
  return result;
}

export async function updateJob(id: number, job: Partial<InsertJob>) {
  const db = await getDb();
  if (!db) return;
  await db.update(jobs).set(job).where(eq(jobs.id, id));
}

export async function deleteJob(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobs).where(eq(jobs.id, id));
}

// ============= CHECKLIST HELPERS =============

export async function getChecklistStepsByCountry(countryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(checklistSteps)
    .where(eq(checklistSteps.countryId, countryId))
    .orderBy(checklistSteps.orderIndex);
}

export async function createChecklistStep(step: InsertChecklistStep) {
  const db = await getDb();
  if (!db) return;
  await db.insert(checklistSteps).values(step);
}

// ============= USER PROGRESS HELPERS =============

export async function getUserProgressByCountry(userId: number, countryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userProgress)
    .where(and(
      eq(userProgress.userId, userId),
      eq(userProgress.countryId, countryId)
    ));
}

export async function toggleStepCompletion(userId: number, stepId: number, isCompleted: boolean) {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(userProgress)
    .where(and(
      eq(userProgress.userId, userId),
      eq(userProgress.stepId, stepId)
    ))
    .limit(1);

  if (existing.length > 0) {
    await db.update(userProgress)
      .set({ 
        isCompleted, 
        completedAt: isCompleted ? new Date() : null 
      })
      .where(eq(userProgress.id, existing[0].id));
  } else {
    await db.insert(userProgress).values({
      userId,
      stepId,
      countryId: 0, // Will be updated by the caller
      isCompleted,
      completedAt: isCompleted ? new Date() : null
    });
  }
}

export async function markStepAsViewed(userId: number, stepId: number) {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(userProgress)
    .where(and(
      eq(userProgress.userId, userId),
      eq(userProgress.stepId, stepId)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Only update viewedAt if not already set
    if (!existing[0].viewedAt) {
      await db.update(userProgress)
        .set({ viewedAt: new Date() })
        .where(eq(userProgress.id, existing[0].id));
    }
  } else {
    // Create new progress entry with viewedAt
    await db.insert(userProgress).values({
      userId,
      stepId,
      countryId: 0, // Will be updated by the caller
      isCompleted: false,
      viewedAt: new Date()
    });
  }
}

// ============= DOCUMENT HELPERS =============

export async function getUserDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));
}

export async function createDocument(doc: InsertDocument) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(documents).values(doc);
  return result;
}

export async function deleteDocument(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(documents).where(and(
    eq(documents.id, id),
    eq(documents.userId, userId)
  ));
}

// ============= EXCHANGE RATE HELPERS =============

export async function getExchangeRate(baseCurrency: string, targetCurrency: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(exchangeRates)
    .where(and(
      eq(exchangeRates.baseCurrency, baseCurrency),
      eq(exchangeRates.targetCurrency, targetCurrency)
    ))
    .limit(1);
  return result[0];
}

export async function upsertExchangeRate(rate: InsertExchangeRate) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(exchangeRates).values(rate).onDuplicateKeyUpdate({
    set: { rate: rate.rate, updatedAt: new Date() }
  });
}

// ============= SECURITY TIPS HELPERS =============

export async function getSecurityTips(countryId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (countryId) {
    return await db.select().from(securityTips)
      .where(and(
        eq(securityTips.isActive, true),
        eq(securityTips.countryId, countryId)
      ));
  }
  
  return await db.select().from(securityTips)
    .where(eq(securityTips.isActive, true));
}

export async function createSecurityTip(tip: InsertSecurityTip) {
  const db = await getDb();
  if (!db) return;
  await db.insert(securityTips).values(tip);
}

// ============= USER FAVORITES HELPERS =============

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userFavorites)
    .where(eq(userFavorites.userId, userId));
}

export async function toggleFavorite(userId: number, jobId: number) {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(userFavorites)
    .where(and(
      eq(userFavorites.userId, userId),
      eq(userFavorites.jobId, jobId)
    ))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(userFavorites).where(eq(userFavorites.id, existing[0].id));
    return false;
  } else {
    await db.insert(userFavorites).values({ userId, jobId });
    return true;
  }
}
