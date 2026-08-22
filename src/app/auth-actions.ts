"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  clearSession, hashPassword, isAdminEmail, sessionUserId, setSession, verifyPassword,
} from "@/lib/auth";

export interface AuthFormState {
  error?: string;
}

const credentials = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
  name: z.string().trim().max(80).optional(),
});

/**
 * Creates an account. When the visitor is already using the app as a guest,
 * their guest row is upgraded in place, so every test they have already taken
 * — and every question they have already seen — carries over.
 */
export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details you entered" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists. Try signing in." };

  const passwordHash = await hashPassword(parsed.data.password);
  const role = isAdminEmail(email) ? "admin" : "student";
  const data = { email, passwordHash, name: parsed.data.name ?? null, role, isGuest: false };

  // The visitor already holds an anonymous session id. Claiming that same id
  // keeps every attempt and every question-exposure record they built up as a
  // guest, whether or not the row has been materialised yet.
  const sessionId = await sessionUserId();
  const current = sessionId
    ? await db.user.findUnique({ where: { id: sessionId }, select: { isGuest: true } })
    : null;

  const user =
    sessionId && (current === null || current.isGuest)
      ? await db.user.upsert({
          where: { id: sessionId },
          create: { id: sessionId, ...data },
          update: data,
        })
      : await db.user.create({ data });

  await setSession(user.id);
  redirect("/");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password" };

  const user = await db.user.findUnique({ where: { email } });
  // The same message either way, so the form cannot be used to test which
  // addresses have accounts.
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Those credentials do not match an account" };
  }

  await setSession(user.id);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/");
}
