import { describe, expect, it } from "vitest";
import { generateCaseStudyPdf } from "./pdf";
import { hashPassword, verifyPassword } from "./clientAuth";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("client portal security and exports", () => {
  it("hashes passwords with a salted one-way representation", () => {
    const first = hashPassword("strong-client-password");
    const second = hashPassword("strong-client-password");
    expect(first).not.toBe("strong-client-password");
    expect(first).not.toBe(second);
    expect(verifyPassword("strong-client-password", first)).toBe(true);
    expect(verifyPassword("wrong-password", first)).toBe(false);
  });

  it("rejects brief submissions without an authenticated client account", async () => {
    const context: TrpcContext = {
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
      user: null,
      isAdminSession: false,
      clientUser: null,
    };
    const caller = appRouter.createCaller(context);
    await expect(caller.clientPortal.submitBrief({
      clientEmail: "qa@example.test",
      clientName: "QA Operator",
      projectTitle: "Secure portal test",
      serviceCategory: "Full-stack platform",
      estimatedBudget: "$50k – $80k",
      estimatedTimeline: "8 – 12 weeks",
      briefDescription: "This test must be rejected without an authenticated client session.",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("generates a non-empty PDF case study document", async () => {
    const pdf = await generateCaseStudyPdf({
      title: "ApexCloud Enterprise Core",
      client: "Apex Financial",
      category: "Full-Stack Architecture",
      summary: "A resilient distributed core for high-volume financial workloads.",
      metrics: "99.999% uptime",
    });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(1000);
  });
});
