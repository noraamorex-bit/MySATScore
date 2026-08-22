/**
 * Authentication.
 *
 * Sessions are stateless: a signed, HTTP-only cookie carrying the user id and
 * an expiry, signed with HMAC-SHA-256 over `AUTH_SECRET` (see `session-token`,
 * which uses Web Crypto so middleware and the server share one implementation).
 * Passwords are hashed with scrypt and a per-user salt using Node's crypto
 * primitives, so there is no dependency to keep current and nothing to
 * misconfigure.
 *
 * Guest users are real User rows flagged `isGuest`, which means every feature —
 * attempts, history, exposure tracking, analytics — behaves identically before
 * and after someone creates an account, and a guest can be upgraded in place.
 */
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { db } from "./db";
import {
  SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, sessionSecret, signSessionToken, verifySessionToken,
} from "./session-token";

const scrypt = promisify(scryptCallback) as (
  password: string, salt: Buffer, keylen: number,
) => Promise<Buffer>;

/* --------------------------------------------------------------- passwords */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const derived = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

/* ---------------------------------------------------------------- sessions */

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  isGuest: boolean;
}

/**
 * Writes a session cookie. Only callable from a Server Action or Route Handler;
 * the anonymous session every visitor starts with is issued by middleware
 * instead, because a render cannot write cookies.
 */
export async function setSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSessionToken(userId, sessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** The id carried by the current session cookie, verified. */
export async function sessionUserId(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value, sessionSecret());
}

/** The signed-in user, or null. Never creates anything. */
export async function currentUser(): Promise<SessionUser | null> {
  const userId = await sessionUserId();
  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, isGuest: true },
  });
  return user ?? null;
}

/**
 * The current user, materialising the anonymous session into a real row the
 * first time it is needed.
 *
 * Guests are ordinary User rows flagged `isGuest`, so attempts, history,
 * exposure tracking, and analytics all behave identically before and after
 * someone creates an account — and registering upgrades the row in place,
 * carrying every test already taken with it.
 */
export async function requireUser(): Promise<SessionUser> {
  const userId = await sessionUserId();
  if (!userId) {
    // Middleware issues the cookie, so this only happens when it is bypassed.
    throw new AuthError("No session. Reload the page to start one.");
  }
  return db.user.upsert({
    where: { id: userId },
    create: { id: userId, isGuest: true, name: "Guest" },
    update: {},
    select: { id: true, email: true, name: true, role: true, isGuest: true },
  });
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user || user.role !== "admin") {
    throw new AuthError("Administrator access is required for this action.");
  }
  return user;
}

export class AuthError extends Error {
  readonly status = 403;
}

export function isAdminEmail(email: string): boolean {
  const configured = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  return Boolean(configured) && email.toLowerCase().trim() === configured;
}
