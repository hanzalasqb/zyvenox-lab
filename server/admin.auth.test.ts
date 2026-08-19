import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = { name: string; value: string; options: Record<string, unknown> };

function createContext() {
  const cookies: CookieCall[] = [];
  const ctx: TrpcContext = {
    user: null,
    isAdminSession: false,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => cookies.push({ name, value, options }),
      clearCookie: () => undefined,
    } as TrpcContext["res"],
  };
  return { ctx, cookies };
}

describe("admin.login", () => {
  it("creates an httpOnly signed session for the supplied hardcoded credentials", async () => {
    const { ctx, cookies } = createContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.login({ username: "hanzala", password: "hanzala-zyvenox" });
    expect(result).toMatchObject({ success: true });
    expect(result.token).toEqual(expect.any(String));
    expect(cookies).toHaveLength(1);
    expect(cookies[0]?.name).toBe("zyvenox_admin_session");
    expect(cookies[0]?.options).toMatchObject({ httpOnly: true, sameSite: "lax", maxAge: 12 * 60 * 60 * 1000 });
  });

  it("rejects invalid credentials", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.login({ username: "wrong", password: "wrong" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
