import Link from "next/link";
import type { ReactNode } from "react";
import { currentUser } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/practice", label: "Practice" },
  { href: "/history", label: "History" },
];

/** Chrome shared by every page outside the test runner, which is full-bleed. */
export async function AppShell({ children }: { children: ReactNode }) {
  const user = await currentUser();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
          <Link href="/" className="mr-2 flex items-center gap-2 rounded-lg py-1 pr-2">
            <Logo />
            <span className="text-[15px] font-semibold tracking-tight text-ink">MySATScore</span>
          </Link>
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-[14px] font-medium text-muted transition hover:bg-paper hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            {user?.role === "admin" ? (
              <Link
                href="/admin"
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-[14px] font-medium text-accent transition hover:bg-accent-soft"
              >
                Admin
              </Link>
            ) : null}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      <footer className="border-t border-line px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 text-[12.5px] text-faint">
          <p>
            MySATScore is an independent practice platform. All practice questions are original.
            SAT is a trademark of the College Board, which is not affiliated with and does not
            endorse this site.
          </p>
          <Link href="/about" className="hover:text-muted">
            How scoring works
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden="true">
      <rect x="1" y="1" width="26" height="26" rx="8" className="fill-accent" />
      <path
        d="M7.5 18.5 L11.5 9.5 L14 15 L16.5 11 L20.5 18.5"
        fill="none"
        stroke="white"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
