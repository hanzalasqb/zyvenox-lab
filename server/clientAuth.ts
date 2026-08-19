import { jwtVerify, SignJWT } from "jose";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";

export const CLIENT_SESSION_COOKIE = "zyvenox_client_session";
const secret = new TextEncoder().encode(ENV.cookieSecret || "zyvenox-client-session-secret");

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

function readCookie(req: Request, name: string) {
  const cookieHeader = req.headers.cookie ?? "";
  const entry = cookieHeader.split(";").map((p) => p.trim()).find((p) => p.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

export async function createClientToken(id: number, email: string, name: string) {
  return new SignJWT({ scope: "zyvenox-client", id, email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyClientRequest(req: Request) {
  const headerToken = req.headers["x-zyvenox-client-token"];
  const token = readCookie(req, CLIENT_SESSION_COOKIE) ?? (typeof headerToken === "string" ? headerToken : null);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.scope === "zyvenox-client" && typeof payload.email === "string" && typeof payload.id === "number") {
      return { id: payload.id, email: payload.email, name: String(payload.name ?? "") };
    }
  } catch {
    return null;
  }
  return null;
}

export function setClientSessionCookie(res: Response, token: string) {
  res.cookie(CLIENT_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: ENV.isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearClientSessionCookie(res: Response) {
  res.clearCookie(CLIENT_SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: ENV.isProduction,
    path: "/",
  });
}
