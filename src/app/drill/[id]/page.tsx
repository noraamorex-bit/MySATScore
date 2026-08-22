import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Empty, ButtonLink } from "@/components/ui";
import { DrillRunner } from "@/components/results/DrillRunner";
import { requireUser } from "@/lib/auth";
import { getAttemptResults } from "@/lib/analytics";

export const metadata: Metadata = { title: "Retry missed questions" };
export const dynamic = "force-dynamic";

/**
 * Untimed retry of everything missed on an attempt, with immediate feedback.
 * Nothing here is scored or recorded against the original attempt — it is
 * deliberately a study mode rather than a second sitting.
 */
export default async function DrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const results = await getAttemptResults(id, user.id);
  if (!results) notFound();

  const missed = results.review.filter((item) => !item.correct);

  return (
    <AppShell>
      <h1 className="text-[28px] font-semibold tracking-tight text-ink">Retry missed questions</h1>
      <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-muted">
        Untimed, with the explanation available as soon as you answer. This is practice only — your
        score for {results.attempt.title} does not change.
      </p>
      <div className="mt-6">
        {missed.length === 0 ? (
          <Empty
            title="Nothing to retry"
            body="You answered every question on this test correctly."
            action={<ButtonLink href={`/results/${id}`}>Back to results</ButtonLink>}
          />
        ) : (
          <DrillRunner
            questions={missed.map((item) => ({
              question: item.question,
              previousAnswer: item.given,
            }))}
            backHref={`/results/${id}/review`}
          />
        )}
      </div>
    </AppShell>
  );
}
