"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthFormState } from "@/app/auth-actions";

export function AuthForm({
  mode,
  action,
  guestNotice,
}: {
  mode: "login" | "register";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  guestNotice?: boolean;
}) {
  const [state, formAction] = useActionState(action, {});
  const isRegister = mode === "register";

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="text-[26px] font-semibold tracking-tight text-ink">
        {isRegister ? "Create your account" : "Sign in"}
      </h1>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
        {isRegister
          ? guestNotice
            ? "Your tests so far are saved to this browser. Creating an account keeps them and makes them available anywhere."
            : "Keep your score history and make sure no question repeats across your tests."
          : "Welcome back."}
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {isRegister ? (
          <div>
            <label htmlFor="name" className="label">
              Name <span className="font-normal text-faint">(optional)</span>
            </label>
            <input id="name" name="name" autoComplete="name" className="field" />
          </div>
        ) : null}
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email" name="email" type="email" required
            autoComplete="email" autoCapitalize="none" spellCheck={false}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password" name="password" type="password" required minLength={8}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="field"
          />
          {isRegister ? (
            <p className="mt-1.5 text-[12.5px] text-faint">At least 8 characters.</p>
          ) : null}
        </div>

        {state.error ? (
          <p role="alert" className="rounded-lg bg-negative/10 px-3.5 py-2.5 text-[13.5px] text-negative">
            {state.error}
          </p>
        ) : null}

        <SubmitButton label={isRegister ? "Create account" : "Sign in"} />
      </form>

      <p className="mt-6 text-center text-[14px] text-muted">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/register" className="font-medium text-accent hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Working…" : label}
    </button>
  );
}
