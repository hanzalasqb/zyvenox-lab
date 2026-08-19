import { jwtVerify, SignJWT } from "jose";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";

export const ADMIN_SESSION_COOKIE = "zyvenox_admin_session";
export const ADMIN_USERNAME = "hanzala";
export const ADMIN_PASSWORD = "hanzala-zyvenox";

const secret = new TextEncoder().encode(ENV.cookieSecret || "zyvenox-local-admin-session-secret");

function readCookie(req: Request, name: string) {
  const cookieHeader = req.headers.cookie ?? "";
  const entry = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

export async function createAdminToken() {
  return new SignJWT({ scope: "zyvenox-admin", username: ADMIN_USERNAME })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export async function verifyAdminRequest(req: Request) {
  const headerToken = req.headers["x-zyvenox-admin-token"];
  const token = readCookie(req, ADMIN_SESSION_COOKIE) ?? (typeof headerToken === "string" ? headerToken : null);
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.scope === "zyvenox-admin" && payload.username === ADMIN_USERNAME;
  } catch {
    return false;
  }
}

export function setAdminSessionCookie(res: Response, token: string) {
  res.cookie(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: ENV.isProduction,
    maxAge: 12 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAdminSessionCookie(res: Response) {
  res.clearCookie(ADMIN_SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: ENV.isProduction,
    path: "/",
  });
}
