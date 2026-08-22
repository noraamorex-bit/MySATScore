import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { currentUser } from "@/lib/auth";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/import", label: "Import" },
  { href: "/admin/tests", label: "Curated tests" },
  { href: "/admin/usage", label: "Usage" },
  { href: "/admin/scoring", label: "Scoring" },
];

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user || user.role !== "admin") redirect("/login");

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
          Content management
        </p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-ink">Admin console</h1>
      </div>
      <nav className="mb-8 flex flex-wrap gap-1.5 border-b border-line pb-3" aria-label="Admin sections">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-full px-3.5 py-1.5 text-[14px] font-medium text-muted transition hover:bg-paper hover:text-ink"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </AppShell>
  );
}
