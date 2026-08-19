import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  agencySettings,
  clientUsers,
  contactEntries,
  InsertUser,
  portfolioItems,
  projectBriefActivity,
  projectBriefs,
  projects,
  services,
  successStats,
  clientAssets,
  teamMembers,
  users,
  projectMilestones,
  passwordResets,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getSiteContent() {
  const db = await getDb();
  if (!db) {
    return { settings: null, services: [], projects: [], portfolioItems: [], successStats: [], teamMembers: [] };
  }
  const [settings, serviceRows, projectRows, portfolioRows, statRows, teamRows, contactRows] = await Promise.all([
    db.select().from(agencySettings).limit(1),
    db.select().from(services).orderBy(asc(services.order)),
    db.select().from(projects).orderBy(asc(projects.order)),
    db.select().from(portfolioItems).orderBy(asc(portfolioItems.order)),
    db.select().from(successStats).orderBy(asc(successStats.order)),
    db.select().from(teamMembers).orderBy(asc(teamMembers.order)),
    db.select().from(contactEntries).orderBy(asc(contactEntries.order)),
  ]);
  return {
    settings: settings[0] ?? null,
    services: serviceRows,
    projects: projectRows,
    portfolioItems: portfolioRows,
    successStats: statRows,
    teamMembers: teamRows,
    contactEntries: contactRows,
  };
}

export async function updateSiteSettings(input: Partial<typeof agencySettings.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  const current = await db.select({ id: agencySettings.id }).from(agencySettings).limit(1);
  if (current[0]) {
    await db.update(agencySettings).set(input).where(eq(agencySettings.id, current[0].id));
  } else {
    await db.insert(agencySettings).values({
      siteTitle: input.siteTitle ?? "Zyvenox Lab — Digital Systems & Cyber Intelligence",
      tagline: input.tagline ?? "Architecting resilient digital systems.",
      description: input.description ?? "Zyvenox Lab is a technology studio.",
      portfolioVisible: input.portfolioVisible ?? 1,
      contactEmail: input.contactEmail ?? "contact@zyvenoxlab.com",
      contactPhone: input.contactPhone ?? "+1 (800) 993-8366",
      address: input.address ?? "Silicon Valley, CA",
      socialLinks: input.socialLinks,
    });
  }
}

export async function createService(input: typeof services.$inferInsert) {
  const db = await getDb();
  if (db) await db.insert(services).values(input);
}
export async function updateService(id: number, input: Partial<typeof services.$inferInsert>) {
  const db = await getDb();
  if (db) await db.update(services).set(input).where(eq(services.id, id));
}
export async function deleteService(id: number) {
  const db = await getDb();
  if (db) await db.delete(services).where(eq(services.id, id));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return rows[0];
}

export async function createProject(input: typeof projects.$inferInsert) {
  const db = await getDb();
  if (db) await db.insert(projects).values(input);
}
export async function updateProject(id: number, input: Partial<typeof projects.$inferInsert>) {
  const db = await getDb();
  if (db) await db.update(projects).set(input).where(eq(projects.id, id));
}
export async function deleteProject(id: number) {
  const db = await getDb();
  if (db) await db.delete(projects).where(eq(projects.id, id));
}

export async function createPortfolioItem(input: typeof portfolioItems.$inferInsert) {
  const db = await getDb();
  if (db) await db.insert(portfolioItems).values(input);
}
export async function updatePortfolioItem(id: number, input: Partial<typeof portfolioItems.$inferInsert>) {
  const db = await getDb();
  if (db) await db.update(portfolioItems).set(input).where(eq(portfolioItems.id, id));
}
export async function deletePortfolioItem(id: number) {
  const db = await getDb();
  if (db) await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
}

export async function createStat(input: typeof successStats.$inferInsert) {
  const db = await getDb();
  if (db) await db.insert(successStats).values(input);
}
export async function updateStat(id: number, input: Partial<typeof successStats.$inferInsert>) {
  const db = await getDb();
  if (db) await db.update(successStats).set(input).where(eq(successStats.id, id));
}
export async function deleteStat(id: number) {
  const db = await getDb();
  if (db) await db.delete(successStats).where(eq(successStats.id, id));
}

export async function createTeamMember(input: typeof teamMembers.$inferInsert) {
  const db = await getDb();
  if (db) await db.insert(teamMembers).values(input);
}
export async function updateTeamMember(id: number, input: Partial<typeof teamMembers.$inferInsert>) {
  const db = await getDb();
  if (db) await db.update(teamMembers).set(input).where(eq(teamMembers.id, id));
}
export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (db) await db.delete(teamMembers).where(eq(teamMembers.id, id));
}

export async function createContactEntry(input: typeof contactEntries.$inferInsert) {
  const db = await getDb();
  if (db) await db.insert(contactEntries).values(input);
}
export async function updateContactEntry(id: number, input: Partial<typeof contactEntries.$inferInsert>) {
  const db = await getDb();
  if (db) await db.update(contactEntries).set(input).where(eq(contactEntries.id, id));
}
export async function deleteContactEntry(id: number) {
  const db = await getDb();
  if (db) await db.delete(contactEntries).where(eq(contactEntries.id, id));
}

export async function createProjectBrief(input: typeof projectBriefs.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(projectBriefs).values(input);
  const briefId = Number(result[0]?.insertId ?? 0);
  if (briefId) {
    await db.insert(projectBriefActivity).values({
      briefId,
      kind: "submitted",
      title: "Project brief submitted",
      description: "Your brief is now in the Zyvenox Lab delivery queue.",
    });
  }
  return briefId;
}

export async function getBriefsByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectBriefs).where(eq(projectBriefs.clientEmail, email));
}

export async function getBriefsByClientId(clientUserId: number) {
  const db = await getDb();
  if (!db) return [];
  const briefs = await db.select().from(projectBriefs).where(eq(projectBriefs.clientUserId, clientUserId));
  return Promise.all(briefs.map(async (brief) => ({
    ...brief,
    activity: await db.select().from(projectBriefActivity).where(eq(projectBriefActivity.briefId, brief.id)).orderBy(desc(projectBriefActivity.createdAt)),
  })));
}

export async function addBriefActivity(briefId: number, input: Omit<typeof projectBriefActivity.$inferInsert, "briefId">) {
  const db = await getDb();
  if (db) await db.insert(projectBriefActivity).values({ ...input, briefId });
}

export async function getAllBriefs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectBriefs);
}

export async function updateBriefStatus(id: number, status: string, adminNotes?: string) {
  const db = await getDb();
  if (db) {
    await db.update(projectBriefs).set({ status, ...(adminNotes !== undefined ? { adminNotes } : {}) }).where(eq(projectBriefs.id, id));
    await db.insert(projectBriefActivity).values({
      briefId: id,
      kind: "milestone",
      title: `Milestone moved to ${status}`,
      description: adminNotes?.trim() || `The Zyvenox Lab team moved this workstream into ${status.toLowerCase()}.`,
    });
  }
}

export async function findClientByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const res = await db.select().from(clientUsers).where(eq(clientUsers.email, email)).limit(1);
  return res[0];
}

export async function createClientUser(input: typeof clientUsers.$inferInsert) {
  const db = await getDb();
  if (db) await db.insert(clientUsers).values(input);
}

export async function createClientAsset(input: typeof clientAssets.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(clientAssets).values(input);
  return Number(result[0]?.insertId ?? 0);
}

export async function getClientAssets(clientUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientAssets).where(eq(clientAssets.clientUserId, clientUserId)).orderBy(desc(clientAssets.createdAt));
}

export async function deleteClientAsset(id: number, clientUserId: number) {
  const db = await getDb();
  if (db) {
    await db.delete(clientAssets).where(and(eq(clientAssets.id, id), eq(clientAssets.clientUserId, clientUserId)));
  }
}
