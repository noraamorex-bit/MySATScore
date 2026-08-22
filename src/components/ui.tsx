import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";

export function Card({
  children, className, as: Tag = "div",
}: { children: ReactNode; className?: string; as?: "div" | "section" | "li" }) {
  return <Tag className={clsx("card p-5", className)}>{children}</Tag>;
}

export function SectionHeading({
  title, hint, action,
}: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[19px] font-semibold tracking-tight text-ink">{title}</h2>
        {hint ? <p className="mt-0.5 text-[14px] text-muted">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label, value, sub, tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "accent" | "positive" | "negative" | "caution";
}) {
  return (
    <div className="card px-4 py-3.5">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <p
        className={clsx(
          "mt-1 text-[26px] font-semibold leading-none tabular-nums tracking-tight",
          tone === "accent" && "text-accent",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
          tone === "caution" && "text-caution",
          tone === "default" && "text-ink",
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-1.5 text-[13px] text-muted">{sub}</p> : null}
    </div>
  );
}

export function Bar({ value, tone = "accent" }: { value: number; tone?: "accent" | "positive" | "negative" }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/70" role="presentation">
      <div
        className={clsx(
          "h-full rounded-full transition-[width] duration-500",
          tone === "accent" && "bg-accent",
          tone === "positive" && "bg-positive",
          tone === "negative" && "bg-negative",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-[14px] leading-relaxed text-muted">{body}</p>
      {action}
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "positive" | "negative" | "caution" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tone === "neutral" && "bg-paper text-muted ring-1 ring-inset ring-line",
        tone === "accent" && "bg-accent-soft text-accent",
        tone === "positive" && "bg-positive/10 text-positive",
        tone === "negative" && "bg-negative/10 text-negative",
        tone === "caution" && "bg-caution/10 text-caution",
      )}
    >
      {children}
    </span>
  );
}

export function ButtonLink({
  href, children, variant = "primary", className, prefetch,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "quiet";
  className?: string;
  prefetch?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={clsx(
        variant === "primary" && "btn-primary",
        variant === "ghost" && "btn-ghost",
        variant === "quiet" && "btn-quiet",
        className,
      )}
    >
      {children}
    </Link>
  );
}
