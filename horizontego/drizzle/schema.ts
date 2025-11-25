import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  plan: mysqlEnum("plan", ["free", "starter", "pro"]).default("free").notNull(),
  hasPaid: boolean("hasPaid").default(false).notNull(),
  paymentDate: timestamp("paymentDate"),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  profilePhotoUrl: text("profilePhotoUrl"),
  resumeUrl: text("resumeUrl"),
  resumeUploadedAt: timestamp("resumeUploadedAt"),
  dailyApplicationsCount: int("dailyApplicationsCount").default(0).notNull(),
  lastApplicationDate: timestamp("lastApplicationDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscriptions table for Stripe recurring billing
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull(),
  planName: mysqlEnum("planName", ["starter", "pro"]).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // active, canceled, past_due, etc
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAt: timestamp("cancelAt"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Countries supported by the platform
 */
export const countries = mysqlTable("countries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 3 }).notNull().unique(), // CAN, NOR, etc
  currency: varchar("currency", { length: 3 }).notNull(), // CAD, NOK
  flagEmoji: varchar("flagEmoji", { length: 10 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Country = typeof countries.$inferSelect;
export type InsertCountry = typeof countries.$inferInsert;

/**
 * Jobs/vacancies for seasonal workers
 */
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  countryId: int("countryId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  requirements: text("requirements"),
  benefits: text("benefits"), // JSON string: housing, meals, etc
  salary: varchar("salary", { length: 100 }),
  sourceUrl: text("sourceUrl"),
  sourceName: varchar("sourceName", { length: 100 }), // NAV.NO, Job Bank Canada, etc
  isVerified: boolean("isVerified").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  externalId: varchar("externalId", { length: 255 }), // ID from external API
  // Campos de filtro
  category: varchar("category", { length: 100 }), // Categoria/setor
  education: varchar("education", { length: 100 }), // Formação acadêmica
  language: varchar("language", { length: 100 }), // Língua de trabalho
  employmentType: varchar("employmentType", { length: 100 }), // Tipo de emprego (tempo integral, parcial, etc)
  remoteWork: boolean("remoteWork").default(false), // Trabalho remoto/home office
  postedAt: timestamp("postedAt"), // Data de publicação da vaga
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

/**
 * Checklist steps for each country
 */
export const checklistSteps = mysqlTable("checklistSteps", {
  id: int("id").autoincrement().primaryKey(),
  countryId: int("countryId").notNull(),
  stage: mysqlEnum("stage", ["preparation", "documentation", "application", "interview", "approval", "boarding"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  url: text("url"),
  orderIndex: int("orderIndex").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistStep = typeof checklistSteps.$inferSelect;
export type InsertChecklistStep = typeof checklistSteps.$inferInsert;

/**
 * User progress tracking
 */
export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  countryId: int("countryId").notNull(),
  stepId: int("stepId").notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  viewedAt: timestamp("viewedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/**
 * User-generated documents
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["resume", "cover_letter", "email"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  language: varchar("language", { length: 10 }).default("pt-BR").notNull(),
  targetCountry: varchar("targetCountry", { length: 3 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Exchange rates cache
 */
export const exchangeRates = mysqlTable("exchangeRates", {
  id: int("id").autoincrement().primaryKey(),
  baseCurrency: varchar("baseCurrency", { length: 3 }).notNull(),
  targetCurrency: varchar("targetCurrency", { length: 3 }).notNull(),
  rate: varchar("rate", { length: 20 }).notNull(), // Store as string to avoid precision issues
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = typeof exchangeRates.$inferInsert;

/**
 * Security tips and scam alerts
 */
export const securityTips = mysqlTable("securityTips", {
  id: int("id").autoincrement().primaryKey(),
  countryId: int("countryId"),
  category: mysqlEnum("category", ["scam_alert", "verification", "safety_tip", "official_resource"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high"]).default("medium").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SecurityTip = typeof securityTips.$inferSelect;
export type InsertSecurityTip = typeof securityTips.$inferInsert;

/**
 * User favorites (jobs)
 */
export const userFavorites = mysqlTable("userFavorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobId: int("jobId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;

/**
 * Job applications tracking
 */
export const jobApplications = mysqlTable("jobApplications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobId: int("jobId").notNull(),
  resumeUrl: text("resumeUrl").notNull(),
  coverLetter: text("coverLetter"),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
});

export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = typeof jobApplications.$inferInsert;

/**
 * Professions equivalence (ESCO/O*NET)
 */
export const professions = mysqlTable("professions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 255 }),
  description: text("description"),
  internationalEquivalents: text("internationalEquivalents"), // JSON string
  escoCode: varchar("escoCode", { length: 50 }),
  onetCode: varchar("onetCode", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Profession = typeof professions.$inferSelect;
export type InsertProfession = typeof professions.$inferInsert;
