import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Bar, ButtonLink, Card, Pill, SectionHeading, Stat } from "@/components/ui";
import { ScoreDial } from "@/components/results/ScoreDial";
import { BreakdownTable } from "@/components/results/BreakdownTable";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAttemptResults } from "@/lib/analytics";
import { SUBJECT_LABEL } from "@/lib/sat/blueprint";
import { formatDateTime, formatDuration, formatPercent } from "@/lib/format";
import { ROUTE_LABEL } from "@/lib/sat/blueprint";

export const metadata: Metadata = { title: "Results" };
export const dynamic = "force-dynamic";

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const attempt = await db.attempt.findFirst({ where: { id, userId: user.id } });
  if (!attempt) notFound();
  if (attempt.status === "in-progress") redirect(`/attempt/${id}`);

  const results = await getAttemptResults(id, user.id);
  if (!results) notFound();

  const { score, summary } = results;
  const rw = score.sections.find((s) => s.subject === "rw");
  const math = score.sections.find((s) => s.subject === "math");

  return (
    <AppShell>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Pill tone="accent">{results.attempt.curated ? "Curated form" : "Generated form"}</Pill>
        {results.attempt.completedAt ? (
          <span className="text-[13px] text-muted">
            Completed {formatDateTime(results.attempt.completedAt)}
          </span>
        ) : null}
      </div>
      <h1 className="text-[30px] font-semibold tracking-tight text-ink sm:text-[34px]">
        {results.attempt.title}
      </h1>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Card className="flex flex-col items-center justify-center gap-4 py-8">
          <ScoreDial
            total={score.total}
            sections={score.sections.map((s) => ({
              subject: s.subject,
              label: SUBJECT_LABEL[s.subject],
              scaled: s.scaled,
            }))}
          />
          <p className="max-w-xs text-center text-[13px] leading-relaxed text-muted">
            {score.total !== null
              ? "Total SAT score, reported on the 400–1600 scale."
              : "Section score only. Take a full-length test for a total score."}
          </p>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          {rw ? <SectionCard label="Reading and Writing" section={rw} /> : null}
          {math ? <SectionCard label="Math" section={math} /> : null}
          <Stat
            label="Correct"
            value={`${summary.correct}/${summary.total}`}
            sub={`${formatPercent(summary.accuracy)} accuracy`}
            tone="accent"
          />
          <Stat
            label="Unanswered"
            value={summary.unanswered}
            sub={summary.flagged > 0 ? `${summary.flagged} marked for review` : "None marked for review"}
            tone={summary.unanswered > 0 ? "negative" : "default"}
          />
          <Stat
            label="Time on questions"
            value={formatDuration(summary.totalTimeMs / 1000)}
            sub={`${summary.averageSecondsPerQuestion}s average per question`}
          />
          <Stat label="Incorrect" value={summary.incorrect} sub="Answered but wrong" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <ButtonLink href={`/results/${id}/review`}>Review every question</ButtonLink>
        <ButtonLink href={`/results/${id}/review?filter=incorrect`} variant="ghost">
          Review {summary.incorrect + summary.unanswered} missed
        </ButtonLink>
        <ButtonLink href="/practice" variant="quiet">
          Take another test
        </ButtonLink>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionHeading title="Performance by domain" hint="Matched to the SAT content blueprint." />
          <BreakdownTable rows={results.byDomain} />
        </div>
        <div>
          <SectionHeading
            title="Performance by difficulty"
            hint="Difficulty is hidden during the test, and shown here only."
          />
          <BreakdownTable rows={results.byDifficulty} />
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionHeading title="Recommended practice" hint="Based on this test only." />
          <ul className="space-y-3">
            {results.recommendations.map((rec) => (
              <Card as="li" key={rec.title}>
                <p className="text-[15px] font-semibold text-ink">{rec.title}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{rec.detail}</p>
              </Card>
            ))}
          </ul>
        </div>
        <div>
          <SectionHeading
            title="Weakest skills"
            hint="Skills with at least three questions and accuracy below 75%."
          />
          {results.weakestSkills.length === 0 ? (
            <Card>
              <p className="text-[14px] text-muted">
                No skill fell below 75% with enough questions to be meaningful on this test.
              </p>
            </Card>
          ) : (
            <ul className="space-y-2.5">
              {results.weakestSkills.map((skill) => (
                <Card as="li" key={skill.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[14.5px] font-medium text-ink">{skill.label}</p>
                    <p className="shrink-0 text-[13px] tabular-nums text-muted">
                      {skill.correct}/{skill.total}
                    </p>
                  </div>
                  <div className="mt-2">
                    <Bar value={skill.accuracy} tone={skill.accuracy < 0.5 ? "negative" : "accent"} />
                  </div>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="mt-10 text-[12.5px] leading-relaxed text-faint">
        Scaled with configuration <code>{results.attempt.scoringVersion ?? "default"}</code>, routed
        with <code>{results.attempt.routingVersion ?? "default"}</code>.{" "}
        <Link href="/about" className="underline hover:text-muted">
          How these scores are calculated
        </Link>
      </p>
    </AppShell>
  );
}

function SectionCard({
  label,
  section,
}: {
  label: string;
  section: { scaled: number; raw: number; total: number; route: string | null; cappedByRoute: boolean; ceiling: number };
}) {
  return (
    <div className="card px-4 py-3.5">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-1 text-[26px] font-semibold leading-none tabular-nums text-ink">
        {section.scaled}
      </p>
      <p className="mt-1.5 text-[13px] text-muted">
        {section.raw} of {section.total} correct
        {section.route ? ` · ${ROUTE_LABEL[section.route as "lower" | "upper"]}` : ""}
      </p>
      {section.cappedByRoute ? (
        <p className="mt-1 text-[12px] text-caution">
          The standard second module caps this section near {section.ceiling}.
        </p>
      ) : null}
    </div>
  );
}
