"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/auth";

export function UserMenu({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user || user.isGuest) {
    return (
      <div className="flex items-center gap-1.5">
        <Link href="/login" className="btn-quiet btn-sm hidden sm:inline-flex">
          Sign in
        </Link>
        <Link href="/register" className="btn-primary btn-sm">
          {user?.isGuest ? "Save progress" : "Create account"}
        </Link>
      </div>
    );
  }

  const initials = (user.name ?? user.email ?? "?").trim().slice(0, 1).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-[14px] font-semibold text-accent transition hover:brightness-95"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {initials}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 animate-scale-in overflow-hidden rounded-xl border border-line bg-raised shadow-pop"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-[14px] font-semibold text-ink">{user.name ?? "Account"}</p>
            <p className="truncate text-[12.5px] text-muted">{user.email}</p>
          </div>
          <Link href="/history" className="block px-4 py-2.5 text-[14px] text-ink hover:bg-paper" role="menuitem">
            Test history
          </Link>
          {user.role === "admin" ? (
            <Link href="/admin" className="block px-4 py-2.5 text-[14px] text-ink hover:bg-paper" role="menuitem">
              Admin console
            </Link>
          ) : null}
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="block w-full px-4 py-2.5 text-left text-[14px] text-negative hover:bg-paper"
              role="menuitem"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
