import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * API integrations table - stores third-party API credentials
 */
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 64 }).notNull(), // e.g., "dataforseo"
  apiLogin: text("apiLogin").notNull(),
  apiPassword: text("apiPassword").notNull(),
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

/**
 * SEO audits table - stores audit metadata and status
 */
export const audits = mysqlTable("audits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  creditsUsed: int("creditsUsed").default(0).notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Audit = typeof audits.$inferSelect;
export type InsertAudit = typeof audits.$inferInsert;

/**
 * Audit reports table - stores detailed audit results
 */
export const auditReports = mysqlTable("auditReports", {
  id: int("id").autoincrement().primaryKey(),
  auditId: int("auditId").notNull().unique(),
  
  // On-Page & Technical data
  totalPages: int("totalPages").default(0),
  errors404: int("errors404").default(0),
  errors5xx: int("errors5xx").default(0),
  missingTitles: int("missingTitles").default(0),
  missingDescriptions: int("missingDescriptions").default(0),
  duplicateTitles: int("duplicateTitles").default(0),
  duplicateDescriptions: int("duplicateDescriptions").default(0),
  missingH1: int("missingH1").default(0),
  missingAltText: int("missingAltText").default(0),
  avgLoadTime: int("avgLoadTime").default(0), // milliseconds
  mobileScore: int("mobileScore").default(0),
  
  // Off-Page & Authority data
  totalBacklinks: int("totalBacklinks").default(0),
  referringDomains: int("referringDomains").default(0),
  dofollowLinks: int("dofollowLinks").default(0),
  nofollowLinks: int("nofollowLinks").default(0),
  toxicLinks: int("toxicLinks").default(0),
  avgDomainRank: int("avgDomainRank").default(0),
  
  // Keywords & SERP data
  totalKeywords: int("totalKeywords").default(0),
  top3Rankings: int("top3Rankings").default(0),
  top10Rankings: int("top10Rankings").default(0),
  featuredSnippets: int("featuredSnippets").default(0),
  
  // Detailed JSON data
  criticalIssues: text("criticalIssues"), // JSON array
  warnings: text("warnings"), // JSON array
  goodSignals: text("goodSignals"), // JSON array
  rawData: text("rawData"), // Full JSON dump for advanced analysis
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AuditReport = typeof auditReports.$inferSelect;
export type InsertAuditReport = typeof auditReports.$inferInsert;