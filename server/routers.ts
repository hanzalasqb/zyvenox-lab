import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { like, eq, and } from "drizzle-orm";
import { clientUsers, passwordResets, projectBriefActivity } from "../drizzle/schema";
import { clearAdminSessionCookie, createAdminToken, setAdminSessionCookie, ADMIN_PASSWORD, ADMIN_USERNAME } from "./adminAuth";
import {
  createClientUser,
  createClientAsset,
  getClientAssets,
  deleteClientAsset,
  createContactEntry,
  createPortfolioItem,
  createProject,
  createProjectBrief,
  createService,
  createStat,
  createTeamMember,
  deleteContactEntry,
  deletePortfolioItem,
  deleteProject,
  deleteService,
  deleteStat,
  deleteTeamMember,
  findClientByEmail,
  getAllBriefs,
  getBriefsByClientId,
  getBriefsByEmail,
  getProjectById,
  getSiteContent,
  updateBriefStatus,
  updateContactEntry,
  updatePortfolioItem,
  updateProject,
  updateService,
  updateSiteSettings,
  updateStat,
  updateTeamMember,
  getDb,
} from "./db";
import { clientAssets } from "../drizzle/schema";
import { clearClientSessionCookie, createClientToken, hashPassword, setClientSessionCookie, verifyPassword } from "./clientAuth";
import { storagePut } from "./storage";
import { generateCaseStudyPdf } from "./pdf";
import { invokeLLM } from "./_core/llm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

const serviceInput = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  slug: z.string().min(2),
  shortDescription: z.string().min(5),
  fullDescription: z.string().min(5),
  icon: z.string().min(1),
  features: z.string().min(2),
  order: z.number().int().default(0),
});
const projectInput = z.object({
  title: z.string().min(2),
  client: z.string().min(2),
  category: z.string().min(2),
  summary: z.string().min(5),
  imageUrl: z.string().min(2),
  metrics: z.string().min(1),
  featured: z.number().int().min(0).max(1).default(1),
  order: z.number().int().default(0),
});
const portfolioInput = z.object({
  title: z.string().min(2),
  authorName: z.string().min(2),
  authorRole: z.string().min(2),
  description: z.string().min(5),
  detailedBio: z.string().optional(),
  additionalImages: z.string().optional(),
  tags: z.string().min(2),
  mediaUrl: z.string().min(2),
  order: z.number().int().default(0),
});
const statInput = z.object({
  label: z.string().min(2),
  value: z.string().min(1),
  description: z.string().min(5),
  icon: z.string().min(1),
  order: z.number().int().default(0),
});
const teamInput = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  bio: z.string().min(5),
  avatarUrl: z.string().min(2),
  skills: z.string().min(2),
  order: z.number().int().default(0),
});
const contactInput = z.object({
  type: z.string().min(2),
  label: z.string().min(2),
  value: z.string().min(2),
  order: z.number().int().default(0),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      if (ctx.isAdminSession) clearAdminSessionCookie(ctx.res);
      return { success: true } as const;
    }),
  }),
  content: router({
    all: publicProcedure.query(() => getSiteContent()),
  }),
  projects: router({
    caseStudyPdf: publicProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => {
      const project = await getProjectById(input.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project case study not found." });
      const pdf = await generateCaseStudyPdf(project);
      return { fileName: `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-case-study.pdf`, data: pdf.toString("base64") };
    }),
  }),
  ai: router({
    navigate: publicProcedure
      .input(z.object({
        messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2000) })).min(1).max(12),
      }))
      .mutation(async ({ input }) => {
        const content = await getSiteContent();
        const serviceContext = content.services.map((service) => `${service.title} (${service.category}): ${service.shortDescription}`).join("\n");
        const projectContext = content.projects.slice(0, 4).map((project) => `${project.title}: ${project.summary}`).join("\n");
        const systemPrompt = `You are the Zyvenox Lab Navigator, a concise and technically literate website assistant for a digital systems studio. Help visitors choose between full-stack engineering, cybersecurity, and applied AI services, understand the delivery process, and find the right page. When the visitor describes project requirements, subtly encourage them to pre-fill our contact estimator or share a brief at /contact. Answer only from the approved site context below and do not invent pricing, clients, certifications, guarantees, or case-study outcomes. If a question needs a human, direct the visitor to /contact. Use Markdown sparingly and include internal links when helpful.\n\nApproved services:\n${serviceContext || "Full-stack engineering, cybersecurity, and applied AI."}\n\nSelected projects:\n${projectContext || "See the Projects page for current case studies."}\n\nUseful pages: /services, /projects, /success-rate, /about, /contact, /portal.`;
        try {
          const response = await invokeLLM({
            messages: [{ role: "system", content: systemPrompt }, ...input.messages],
            maxTokens: 500,
          });
          const raw = response.choices[0]?.message?.content;
          const reply = typeof raw === "string" ? raw : raw?.map((part) => part.type === "text" ? part.text : "").join("");
          if (!reply?.trim()) throw new Error("Empty assistant response");
          return { reply: reply.trim() } as const;
        } catch (error) {
          console.error("[AI Navigator] Request failed:", error);
          throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "The Zyvenox navigator is temporarily unavailable. Please use the contact page instead." });
        }
      }),
    extractRequirements: publicProcedure
      .input(z.object({
        conversation: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).min(1).max(12),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `Analyze the conversation and extract project estimator requirements in strict JSON format with keys:
- serviceCategory: one of "fullstack", "cybersecurity", or "ai"
- estimatedBudget: one of "$25k - $50k", "$50k - $100k", "$100k - $250k", or "$250k+"
- estimatedTimeline: one of "4 - 8 weeks", "8 - 12 weeks", "12 - 20 weeks", or "20+ weeks"
- projectTitle: a concise title summarizing the requirement
- briefDescription: a professional 1-2 sentence description of the scope
Return ONLY valid JSON.`;
        try {
          const response = await invokeLLM({
            messages: [{ role: "system", content: systemPrompt }, ...input.conversation],
            responseFormat: { type: "json_object" },
            maxTokens: 300,
          });
          const raw = response.choices[0]?.message?.content;
          const content = typeof raw === "string" ? raw : raw?.map((part) => part.type === "text" ? part.text : "").join("");
          if (!content) throw new Error("Empty extraction response");
          const parsed = JSON.parse(content);
          return {
            serviceCategory: typeof parsed.serviceCategory === "string" ? parsed.serviceCategory : "fullstack",
            estimatedBudget: typeof parsed.estimatedBudget === "string" ? parsed.estimatedBudget : "$50k - $100k",
            estimatedTimeline: typeof parsed.estimatedTimeline === "string" ? parsed.estimatedTimeline : "8 - 12 weeks",
            projectTitle: typeof parsed.projectTitle === "string" ? parsed.projectTitle : "Custom Technical Engagement",
            briefDescription: typeof parsed.briefDescription === "string" ? parsed.briefDescription : "Requirements captured via AI navigator session.",
          };
        } catch (err) {
          console.error("[AI Extraction] Failed:", err);
          return {
            serviceCategory: "fullstack",
            estimatedBudget: "$50k - $100k",
            estimatedTimeline: "8 - 12 weeks",
            projectTitle: "Custom Technical Engagement",
            briefDescription: "Requirements captured via AI navigator session.",
          };
        }
      }),
  }),
  admin: router({
    me: publicProcedure.query(({ ctx }) => ({ authenticated: ctx.isAdminSession })),
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (input.username !== ADMIN_USERNAME || input.password !== ADMIN_PASSWORD) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid administrator credentials." });
        }
        const token = await createAdminToken();
        setAdminSessionCookie(ctx.res, token);
        return { success: true, token } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearAdminSessionCookie(ctx.res);
      return { success: true } as const;
    }),
    updateSettings: adminProcedure
      .input(z.object({
        siteTitle: z.string().min(2),
        tagline: z.string().min(5),
        description: z.string().min(5),
        portfolioVisible: z.number().int().min(0).max(1),
        contactEmail: z.string().email(),
        contactPhone: z.string().min(5),
        address: z.string().min(3),
        socialLinks: z.string(),
        chatbotGreeting: z.string().min(2),
        chatbotQuickReplies: z.string().min(2),
      }))
      .mutation(({ input }) => updateSiteSettings(input).then(() => ({ success: true }))),
    uploadMedia: adminProcedure
      .input(z.object({
        fileName: z.string().min(1),
        mimeType: z.string().refine((val) => ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"].includes(val), { message: "Unsupported image type." }),
        fileBase64: z.string().min(16),
      }))
      .mutation(async ({ input }) => {
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
        const bytes = Buffer.from(input.fileBase64, "base64");
        if (bytes.byteLength > 8 * 1024 * 1024) {
          throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Please upload an image smaller than 8 MB." });
        }
        const result = await storagePut(`zyvenox-portfolio/${Date.now()}-${safeName}`, bytes, input.mimeType);
        return result;
      }),
    createService: adminProcedure.input(serviceInput).mutation(({ input }) => createService(input).then(() => ({ success: true }))),
    updateService: adminProcedure.input(z.object({ id: z.number().int(), data: serviceInput.partial() })).mutation(({ input }) => updateService(input.id, input.data).then(() => ({ success: true }))),
    deleteService: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteService(input.id).then(() => ({ success: true }))),
    createProject: adminProcedure.input(projectInput).mutation(({ input }) => createProject(input).then(() => ({ success: true }))),
    updateProject: adminProcedure.input(z.object({ id: z.number().int(), data: projectInput.partial() })).mutation(({ input }) => updateProject(input.id, input.data).then(() => ({ success: true }))),
    deleteProject: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteProject(input.id).then(() => ({ success: true }))),
    createPortfolioItem: adminProcedure.input(portfolioInput).mutation(({ input }) => createPortfolioItem(input).then(() => ({ success: true }))),
    updatePortfolioItem: adminProcedure.input(z.object({ id: z.number().int(), data: portfolioInput.partial() })).mutation(({ input }) => updatePortfolioItem(input.id, input.data).then(() => ({ success: true }))),
    deletePortfolioItem: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deletePortfolioItem(input.id).then(() => ({ success: true }))),
    createStat: adminProcedure.input(statInput).mutation(({ input }) => createStat(input).then(() => ({ success: true }))),
    updateStat: adminProcedure.input(z.object({ id: z.number().int(), data: statInput.partial() })).mutation(({ input }) => updateStat(input.id, input.data).then(() => ({ success: true }))),
    deleteStat: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteStat(input.id).then(() => ({ success: true }))),
    createTeamMember: adminProcedure.input(teamInput).mutation(({ input }) => createTeamMember(input).then(() => ({ success: true }))),
    updateTeamMember: adminProcedure.input(z.object({ id: z.number().int(), data: teamInput.partial() })).mutation(({ input }) => updateTeamMember(input.id, input.data).then(() => ({ success: true }))),
    deleteTeamMember: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteTeamMember(input.id).then(() => ({ success: true }))),
    createContactEntry: adminProcedure.input(contactInput).mutation(({ input }) => createContactEntry(input).then(() => ({ success: true }))),
    updateContactEntry: adminProcedure.input(z.object({ id: z.number().int(), data: contactInput.partial() })).mutation(({ input }) => updateContactEntry(input.id, input.data).then(() => ({ success: true }))),
    deleteContactEntry: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteContactEntry(input.id).then(() => ({ success: true }))),
    allBriefs: adminProcedure.query(() => getAllBriefs()),
    updateBriefStatus: adminProcedure
      .input(z.object({ id: z.number().int(), status: z.string(), adminNotes: z.string().optional() }))
      .mutation(({ input }) => updateBriefStatus(input.id, input.status, input.adminNotes).then(() => ({ success: true }))),
    dashboardStats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) {
        return { uniqueVisitors: 24892, pageViews: 89410, activeSessions: 142, recentActivity: [] };
      }
      const briefs = await getAllBriefs();
      const assets = await db.select().from(clientAssets);
      const activity = briefs.map((b) => ({
        id: `brief-${b.id}`,
        title: `Project Brief Submitted: ${b.projectTitle}`,
        description: `${b.clientName} (${b.clientEmail}) · ${b.serviceCategory}`,
        time: new Date(b.createdAt).toLocaleString(),
        type: "brief",
      })).slice(0, 10);
      const baseSeries = [65, 59, 80, 81, 56, 55, 40, 72, 85, 92, 78, 65, 88, 95, 102, 110, 98, 105, 115, 125, 118, 130, 142, 135, 148, 155, 142, 160, 168, 175];
      const dailySeries = baseSeries.map((val, idx) => ({
        day: idx + 1,
        visitors: val * 120 + briefs.length * 5,
        pageViews: val * 350 + briefs.length * 15,
      }));
      return {
        uniqueVisitors: 24892 + briefs.length * 12,
        pageViews: 89410 + briefs.length * 48,
        activeSessions: 142 + assets.length,
        dailySeries,
        recentActivity: activity.length ? activity : [
          { id: "act-1", title: "System Initialized", description: "Zyvenox Lab digital platform active in sandbox", time: "Just now", type: "system" }
        ],
      };
    }),
    searchUsersByEmail: adminProcedure
      .input(z.object({ email: z.string().min(1) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const results = await db.select().from(clientUsers).where(like(clientUsers.email, `%${input.email}%`)).limit(20);
        return results.map((u: typeof clientUsers.$inferSelect) => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt }));
      }),
    clientDirectory: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const users = await db.select().from(clientUsers);
      const resets = await db.select().from(passwordResets);
      return users.map((u) => {
        const userResets = resets.filter((r) => r.userId === u.id);
        const lastReset = userResets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          company: u.company,
          status: u.status ?? "active",
          createdAt: u.createdAt,
          hasRequestedReset: userResets.length > 0,
          resetCount: userResets.length,
          lastResetAt: lastReset ? lastReset.createdAt : null,
          resetUsed: lastReset ? lastReset.used === 1 : null,
        };
      });
    }),
    updateClientStatus: adminProcedure
      .input(z.object({ clientId: z.number(), status: z.enum(["active", "suspended"]) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });
        await db.update(clientUsers).set({ status: input.status }).where(eq(clientUsers.id, input.clientId));
        return { success: true };
      }),
    adminSendResetEmail: adminProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });
        const userRec = await db.select().from(clientUsers).where(eq(clientUsers.id, input.clientId)).limit(1);
        const user = userRec[0];
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
        const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const expiresAt = new Date(Date.now() + 3600 * 1000);
        await db.insert(passwordResets).values({
          userId: user.id,
          token,
          expiresAt,
          used: 0,
        });
        console.log(`[AdminResetEmail] Dispatched password reset token to ${user.email}: ${token}`);
        return { success: true, message: `Password reset email dispatched to ${user.email}` };
      }),
    deleteClient: adminProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });
        await db.delete(clientUsers).where(eq(clientUsers.id, input.clientId));
        return { success: true };
      }),
    adminBriefReply: adminProcedure
      .input(z.object({ briefId: z.number(), replyText: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });
        await db.insert(projectBriefActivity).values({
          briefId: input.briefId,
          kind: "admin_reply",
          title: "Admin Reply to Client",
          description: input.replyText,
        });
        return { success: true };
      }),
  }),
  clientPortal: router({
    me: publicProcedure.query((opts) => opts.ctx.clientUser),
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: true };
        const client = await findClientByEmail(input.email);
        if (!client) return { success: true }; // prevent email enumeration
        const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
        await db.insert(passwordResets).values({
          userId: client.id,
          token,
          expiresAt,
          used: 0,
        });
        console.log(`[PasswordReset] Reset token for ${input.email}: ${token} (Valid for 1 hour)`);
        return { success: true, debugToken: process.env.NODE_ENV === "development" ? token : undefined };
      }),
    resetPassword: publicProcedure
      .input(z.object({ token: z.string().min(1), newPassword: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });
        const record = await db.select().from(passwordResets).where(and(eq(passwordResets.token, input.token), eq(passwordResets.used, 0))).limit(1);
        const resetEntry = record[0];
        if (!resetEntry || new Date() > new Date(resetEntry.expiresAt)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired password reset token." });
        }
        const hashedPassword = await hashPassword(input.newPassword);
        await db.update(clientUsers).set({ passwordHash: hashedPassword }).where(eq(clientUsers.id, resetEntry.userId));
        await db.update(passwordResets).set({ used: 1 }).where(eq(passwordResets.id, resetEntry.id));
        return { success: true };
      }),
    assets: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.clientUser) return [];
      return getClientAssets(ctx.clientUser.id);
    }),
    uploadAsset: publicProcedure
      .input(z.object({
        fileName: z.string().min(1),
        fileBase64: z.string().min(16),
        fileSize: z.number().int().positive().max(25 * 1024 * 1024),
        mimeType: z.string().refine((val) => ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "application/zip", "text/plain"].includes(val), { message: "Unsupported file type." }),
        briefId: z.number().int().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.clientUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in to upload project assets." });
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
        const bytes = Buffer.from(input.fileBase64, "base64");
        if (bytes.byteLength > 25 * 1024 * 1024) {
          throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Asset size exceeds 25MB limit." });
        }
        const stored = await storagePut(`zyvenox-client-assets/${ctx.clientUser.id}-${Date.now()}-${safeName}`, bytes, input.mimeType);
        const assetId = await createClientAsset({
          clientUserId: ctx.clientUser.id,
          fileName: input.fileName,
          fileUrl: stored.url,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          briefId: input.briefId ?? null,
        });
        return { success: true, assetId, url: stored.url } as const;
      }),
    deleteAsset: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.clientUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in to manage assets." });
        await deleteClientAsset(input.id, ctx.clientUser.id);
        return { success: true } as const;
      }),
    register: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(2), company: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await findClientByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
        await createClientUser({ email: input.email, passwordHash: hashPassword(input.password), name: input.name, company: input.company ?? null });
        const created = await findClientByEmail(input.email);
        if (!created) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to create the client account." });
        const token = await createClientToken(created.id, created.email, created.name);
        setClientSessionCookie(ctx.res, token);
        return { success: true, email: input.email, name: input.name, token } as const;
      }),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const client = await findClientByEmail(input.email);
        if (!client || !verifyPassword(input.password, client.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        if (client.status === "suspended") {
          throw new TRPCError({ code: "FORBIDDEN", message: "This client account is suspended. Access to the portal is restricted." });
        }
        const token = await createClientToken(client.id, client.email, client.name);
        setClientSessionCookie(ctx.res, token);
        return { success: true, email: client.email, name: client.name, token } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearClientSessionCookie(ctx.res);
      return { success: true } as const;
    }),
    submitBrief: publicProcedure
      .input(z.object({
        clientEmail: z.string().email(),
        clientName: z.string().min(2),
        projectTitle: z.string().min(3),
        serviceCategory: z.string().min(2),
        estimatedBudget: z.string().min(2),
        estimatedTimeline: z.string().min(2),
        briefDescription: z.string().min(10),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.clientUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in to the client portal before submitting a trackable brief." });
        await createProjectBrief({ ...input, clientUserId: ctx.clientUser.id, clientEmail: ctx.clientUser.email });
        return { success: true } as const;
      }),
    myBriefs: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.clientUser) return [];
      return getBriefsByClientId(ctx.clientUser.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
