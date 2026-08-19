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

export const agencySettings = mysqlTable("agency_settings", {
  id: int("id").autoincrement().primaryKey(),
  siteTitle: varchar("site_title", { length: 255 }).default("Zyvenox Lab — Digital Systems & Cyber Intelligence").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  portfolioVisible: int("portfolio_visible").default(1).notNull(), // 1 for visible, 0 for hidden
  contactEmail: varchar("contact_email", { length: 255 }).default("contact@zyvenoxlab.com").notNull(),
  contactPhone: varchar("contact_phone", { length: 64 }).default("+1 (800) 993-8366").notNull(),
  address: text("address").notNull(),
  socialLinks: text("social_links"), // JSON string
  chatbotGreeting: text("chatbot_greeting").default("I’m the Zyvenox Lab navigator. Ask me which capability fits your brief, what a delivery phase looks like, or where to start.").notNull(),
  chatbotQuickReplies: text("chatbot_quick_replies").default("Which service fits a legacy platform rebuild?,How can Zyvenox Lab help with cybersecurity?,What does an AI delivery engagement include?").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const clientAssets = mysqlTable("client_assets", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("client_user_id").notNull(),
  briefId: int("brief_id"),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: int("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientAsset = typeof clientAssets.$inferSelect;

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(), // "fullstack", "cybersecurity", "ai"
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull(),
  icon: varchar("icon", { length: 64 }).default("Code").notNull(),
  features: text("features").notNull(), // JSON array of sub-features
  order: int("order").default(0).notNull(),
});

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  client: varchar("client", { length: 255 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  summary: text("summary").notNull(),
  imageUrl: text("image_url").notNull(),
  metrics: varchar("metrics", { length: 128 }).default("99.9% Uptime").notNull(),
  featured: int("featured").default(1).notNull(),
  order: int("order").default(0).notNull(),
});

export const portfolioItems = mysqlTable("portfolio_items", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  authorRole: varchar("author_role", { length: 255 }).notNull(),
  description: text("description").notNull(),
  detailedBio: text("detailed_bio"),
  additionalImages: text("additional_images"), // JSON array of image URLs/paths
  tags: varchar("tags", { length: 255 }).notNull(), // comma separated
  mediaUrl: text("media_url").notNull(),
  order: int("order").default(0).notNull(),
});

export const successStats = mysqlTable("success_stats", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 128 }).notNull(),
  value: varchar("value", { length: 64 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 64 }).default("ShieldCheck").notNull(),
  order: int("order").default(0).notNull(),
});

export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  skills: varchar("skills", { length: 255 }).notNull(),
  order: int("order").default(0).notNull(),
});

export type AgencySettings = typeof agencySettings.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type SuccessStat = typeof successStats.$inferSelect;
export const contactEntries = mysqlTable("contact_entries", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 64 }).notNull(), // "phone", "email", "address", "social"
  label: varchar("label", { length: 255 }).notNull(),
  value: text("value").notNull(),
  order: int("order").default(0).notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export const clientUsers = mysqlTable("client_users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  status: varchar("status", { length: 32 }).default("active").notNull(), // "active" or "suspended"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const projectBriefs = mysqlTable("project_briefs", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("client_user_id"),
  clientEmail: varchar("client_email", { length: 320 }).notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  projectTitle: varchar("project_title", { length: 255 }).notNull(),
  serviceCategory: varchar("service_category", { length: 128 }).notNull(),
  estimatedBudget: varchar("estimated_budget", { length: 64 }).notNull(),
  estimatedTimeline: varchar("estimated_timeline", { length: 64 }).notNull(),
  briefDescription: text("brief_description").notNull(),
  status: varchar("status", { length: 64 }).default("Under Review").notNull(), // "Under Review", "Architectural Review", "In Development", "Completed"
  adminNotes: text("admin_notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactEntry = typeof contactEntries.$inferSelect;
export type ClientUser = typeof clientUsers.$inferSelect;
export type ProjectBrief = typeof projectBriefs.$inferSelect;

export const projectBriefActivity = mysqlTable("project_brief_activity", {
  id: int("id").autoincrement().primaryKey(),
  briefId: int("brief_id").notNull(),
  kind: varchar("kind", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectBriefActivity = typeof projectBriefActivity.$inferSelect;

export const projectMilestones = mysqlTable("project_milestones", {
  id: int("id").autoincrement().primaryKey(),
  briefId: int("brief_id").notNull(),
  clientUserId: int("client_user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  amount: int("amount").notNull(), // in cents
  status: varchar("status", { length: 64 }).default("pending").notNull(), // pending, paid, completed
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id", { length: 255 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const passwordResets = mysqlTable("password_resets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: int("used").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
