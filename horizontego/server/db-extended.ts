import { eq, and, gte } from "drizzle-orm";
import { getDb } from "./db";
import { 
  jobApplications, 
  InsertJobApplication,
  exchangeRates,
  InsertExchangeRate,
  professions,
  InsertProfession,
  users
} from "../drizzle/schema";

// ============ Job Applications ============

export async function getApplicationStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalApplications: 0, applicationsToday: 0, documentsGenerated: 0 };

  const { sql } = await import('drizzle-orm');
  const { documents } = await import('../drizzle/schema');

  // Count total applications
  const totalAppsResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM jobApplications WHERE userId = ${userId}
  `);
  const totalApplications = (totalAppsResult as any)[0]?.[0]?.count || 0;

  // Count applications today
  const todayAppsResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM jobApplications 
    WHERE userId = ${userId} AND DATE(appliedAt) = CURDATE()
  `);
  const applicationsToday = (todayAppsResult as any)[0]?.[0]?.count || 0;

  // Count documents generated
  const docsResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM documents WHERE userId = ${userId}
  `);
  const documentsGenerated = (docsResult as any)[0]?.[0]?.count || 0;

  return {
    totalApplications,
    applicationsToday,
    documentsGenerated,
  };
}

export async function createJobApplication(application: InsertJobApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(jobApplications).values(application);
  return result;
}

export async function getUserApplications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(jobApplications).where(eq(jobApplications.userId, userId));
}

export async function getTodayApplicationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const applications = await db
    .select()
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.userId, userId),
        gte(jobApplications.appliedAt, today)
      )
    );
  
  return applications.length;
}

// ============ Exchange Rates ============

export async function upsertExchangeRate(rate: InsertExchangeRate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .insert(exchangeRates)
    .values(rate)
    .onDuplicateKeyUpdate({
      set: {
        rate: rate.rate,
        updatedAt: new Date(),
      },
    });
}

export async function getExchangeRate(baseCurrency: string, targetCurrency: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db
    .select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.baseCurrency, baseCurrency),
        eq(exchangeRates.targetCurrency, targetCurrency)
      )
    )
    .limit(1);
  
  return results.length > 0 ? results[0] : null;
}

export async function getAllExchangeRates() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(exchangeRates);
}

// ============ Professions ============

export async function createProfession(profession: InsertProfession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(professions).values(profession);
  return result;
}

export async function searchProfessions(query: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Simple search - in production, use full-text search
  return await db.select().from(professions);
}

export async function getProfessionByCode(code: string, codeType: "esco" | "onet") {
  const db = await getDb();
  if (!db) return null;
  
  const column = codeType === "esco" ? professions.escoCode : professions.onetCode;
  const results = await db.select().from(professions).where(eq(column, code)).limit(1);
  
  return results.length > 0 ? results[0] : null;
}

// ============ User Plan Management ============

export async function updateUserPlan(userId: number, plan: "free" | "starter" | "pro") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ plan }).where(eq(users.id, userId));
}

export async function updateUserResume(userId: number, resumeUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ 
    resumeUrl, 
    resumeUploadedAt: new Date() 
  }).where(eq(users.id, userId));
}

export async function resetDailyApplicationCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ 
    dailyApplicationsCount: 0,
    lastApplicationDate: new Date()
  }).where(eq(users.id, userId));
}

export async function incrementApplicationCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) return;
  
  const currentUser = user[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastAppDate = currentUser.lastApplicationDate ? new Date(currentUser.lastApplicationDate) : null;
  const isToday = lastAppDate && lastAppDate >= today;
  
  if (isToday) {
    await db.update(users).set({
      dailyApplicationsCount: (currentUser.dailyApplicationsCount || 0) + 1,
    }).where(eq(users.id, userId));
  } else {
    await db.update(users).set({
      dailyApplicationsCount: 1,
      lastApplicationDate: new Date(),
    }).where(eq(users.id, userId));
  }
}
