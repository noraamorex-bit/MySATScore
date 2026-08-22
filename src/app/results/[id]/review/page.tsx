import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import clsx from "clsx";
import { AppShell } from "@/components/AppShell";
import { ButtonLink, Pill } from "@/components/ui";
import { ReviewList } from "@/components/results/ReviewList";
import { requireUser } from "@/lib/auth";
import { getAttemptResults } from "@/lib/analytics";

export const metadata: Metadata = { title: "Question review" };
export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "incorrect", label: "Incorrect" },
  { key: "correct", label: "Correct" },
  { key: "skipped", label: "Skipped" },
  { key: "flagged", label: "Marked" },
] as const;

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { id } = await params;
  const { filter = "all" } = await searchParams;
  const user = await requireUser();
  const results = await getAttemptResults(id, user.id);
  if (!results) notFound();

  const counts = {
    all: results.review.length,
    incorrect: results.review.filter((r) => !r.correct && !r.skipped).length,
    correct: results.review.filter((r) => r.correct).length,
    skipped: results.review.filter((r) => r.skipped).length,
    flagged: results.review.filter((r) => r.flagged).length,
  };

  const visible = results.review.filter((item) => {
    if (filter === "incorrect") return !item.correct && !item.skipped;
    if (filter === "correct") return item.correct;
    if (filter === "skipped") return item.skipped;
    if (filter === "flagged") return item.flagged;
    return true;
  });

  const missed = counts.incorrect + counts.skipped;

  return (
    <AppShell>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Link href={`/results/${id}`} className="text-[13px] font-medium text-accent hover:underline">
          ← Back to results
        </Link>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-ink">Question review</h1>
          <p className="mt-1 text-[14.5px] text-muted">{results.attempt.title}</p>
        </div>
        {missed > 0 ? (
          <ButtonLink href={`/drill/${id}`}>Retry {missed} missed questions</ButtonLink>
        ) : (
          <Pill tone="positive">Every question correct</Pill>
        )}
      </div>

      <nav className="mt-6 flex flex-wrap gap-1.5" aria-label="Filter questions">
        {FILTERS.map((option) => (
          <Link
            key={option.key}
            href={`/results/${id}/review${option.key === "all" ? "" : `?filter=${option.key}`}`}
            scroll={false}
            className={clsx(
              "rounded-full border px-3.5 py-1.5 text-[13.5px] font-medium transition",
              filter === option.key
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-muted hover:text-ink",
            )}
          >
            {option.label}
            <span className="ml-1.5 tabular-nums opacity-70">{counts[option.key]}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        <ReviewList items={visible} />
      </div>
    </AppShell>
  );
}
