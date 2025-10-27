import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, integrations, InsertIntegration, audits, InsertAudit, auditReports, InsertAuditReport } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

// Integration queries
export async function createIntegration(data: InsertIntegration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(integrations).values(data);
  return result;
}

export async function getUserIntegrations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(integrations).where(eq(integrations.userId, userId));
}

export async function getActiveIntegration(userId: number, provider: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(integrations)
    .where(eq(integrations.userId, userId))
    .limit(1);
  return result.find(i => i.provider === provider && i.isActive === 1);
}

export async function updateIntegration(id: number, data: Partial<InsertIntegration>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(integrations).set(data).where(eq(integrations.id, id));
}

export async function deleteIntegration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(integrations).where(eq(integrations.id, id));
}

// Audit queries
export async function createAudit(data: InsertAudit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(audits).values(data);
  return result;
}

export async function getUserAudits(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(audits).where(eq(audits.userId, userId)).orderBy(audits.createdAt);
}

export async function getAuditById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(audits).where(eq(audits.id, id)).limit(1);
  return result[0];
}

export async function updateAudit(id: number, data: Partial<InsertAudit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(audits).set(data).where(eq(audits.id, id));
}

// Audit report queries
export async function createAuditReport(data: InsertAuditReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(auditReports).values(data);
}

export async function getAuditReport(auditId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(auditReports).where(eq(auditReports.auditId, auditId)).limit(1);
  return result[0];
}

export async function updateAuditReport(auditId: number, data: Partial<InsertAuditReport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(auditReports).set(data).where(eq(auditReports.auditId, auditId));
}
