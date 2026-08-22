import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AuthForm } from "@/components/AuthForm";
import { loginAction } from "@/app/auth-actions";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AppShell>
      <div className="py-8">
        <AuthForm mode="login" action={loginAction} />
      </div>
    </AppShell>
  );
}
