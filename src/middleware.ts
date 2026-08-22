import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, sessionSecret, signSessionToken, verifySessionToken,
} from "@/lib/session-token";

/**
 * Issues a session cookie to every visitor.
 *
 * A first-time visitor gets a signed anonymous id here rather than in a page,
 * because cookies cannot be written during a render. The matching User row is
 * created lazily the first time the server actually needs one, so a crawler
 * hitting the site never creates a database row.
 */
export async function middleware(request: NextRequest) {
  const secret = sessionSecret();
  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(existing, secret)) return NextResponse.next();

  const token = await signSessionToken(`guest_${crypto.randomUUID()}`, secret);

  // Make the new cookie visible to this same request, not just the next one.
  request.cookies.set(SESSION_COOKIE, token);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
