/**
 * Session token signing, using Web Crypto so the same implementation runs in
 * middleware (edge runtime) and on the server (Node).
 *
 * A token is `<userId>.<expiryMs>.<hmac>`. It carries no secrets — the user id
 * is opaque — and the signature is what makes it unforgeable.
 */
const encoder = new TextEncoder();

export const SESSION_COOKIE = "mss_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 60; // 60 days

function toBase64Url(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await hmacKey(secret);
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

/** Constant-time string comparison, so signatures cannot be probed byte by byte. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSessionToken(userId: string, secret: string): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${expires}`;
  return `${payload}.${await sign(payload, secret)}`;
}

/** Returns the user id, or null when the token is missing, altered, or expired. */
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresRaw, signature] = parts;
  if (!userId || !expiresRaw) return null;
  const expected = await sign(`${userId}.${expiresRaw}`, secret);
  if (!safeEqual(expected, signature)) return null;
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < Date.now()) return null;
  return userId;
}

/**
 * The signing secret. Development falls back to a fixed value so the app runs
 * with no configuration; production refuses to start without a real one.
 */
export function sessionSecret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set to at least 16 characters in production");
    }
    return "mysatscore-development-secret-do-not-use-in-production";
  }
  return value;
}
