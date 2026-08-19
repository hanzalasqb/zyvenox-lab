import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
    user: null,
    isAdminSession: false,
    clientUser: null,
  };
}

describe("Zyvenox Lab Advanced Extensions", () => {
  it("requires authentication for client asset uploads", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.clientPortal.uploadAsset({
      fileName: "spec.pdf",
      fileUrl: "data:application/pdf;base64,AAAA",
      fileSize: 1024,
      mimeType: "application/pdf",
    })).rejects.toThrow();
  });

  it("validates conversation input bounds for AI requirement extraction", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.ai.extractRequirements({
      conversation: [],
    })).rejects.toThrow();
  });
});
