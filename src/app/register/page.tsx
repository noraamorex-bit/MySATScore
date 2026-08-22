import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AuthForm } from "@/components/AuthForm";
import { registerAction } from "@/app/auth-actions";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await currentUser();
  return (
    <AppShell>
      <div className="py-8">
        <AuthForm mode="register" action={registerAction} guestNotice={user?.isGuest} />
      </div>
    </AppShell>
  );
}
