import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ButtonLink, Card, Empty, Pill, SectionHeading, Stat } from "@/components/ui";
import { ScoreTrend } from "@/components/ScoreTrend";
import { StartTestForm } from "@/components/StartTestForm";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserOverview } from "@/lib/analytics";
import { getBank } from "@/lib/bank";
import { listCatalogue } from "@/lib/catalogue";
import { MODULE_SPEC, TOTAL_QUESTIONS, TOTAL_TESTING_MINUTES } from "@/lib/sat/blueprint";
import { formatDate, formatDuration } from "@/lib/format";

export default async function DashboardPage() {
  const user = await requireUser();
  const [overview, bank, catalogue, live] = await Promise.all([
    getUserOverview(user.id),
    getBank(),
    listCatalogue(),
    db.attempt.findFirst({
      where: { userId: user.id, status: "in-progress" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const hasHistory = overview.testsCompleted > 0;

  return (
    <AppShell>
      {live ? (
        <Card className="mb-8 flex flex-wrap items-center justify-between gap-4 border-accent/40 bg-accent-soft/60">
          <div>
            <Pill tone="accent">In progress</Pill>
            <p className="mt-2 text-[16px] font-semibold text-ink">{live.title}</p>
            <p className="text-[13.5px] text-muted">
              Started {formatDate(live.createdAt)}. Your timer is held on the server — pick up
              exactly where you left off.
            </p>
          </div>
          <ButtonLink href={`/attempt/${live.id}`}>Resume test</ButtonLink>
        </Card>
      ) : null}

      {hasHistory ? (
        <>
          <SectionHeading
            title={`Welcome back${user.name && !user.isGuest ? `, ${user.name}` : ""}`}
            hint="Your score progression across every completed test."
          />
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Latest total" value={overview.latest ?? "—"} tone="accent" />
            <Stat label="Best total" value={overview.best ?? "—"} />
            <Stat
              label="Change"
              value={overview.delta === null ? "—" : `${overview.delta > 0 ? "+" : ""}${overview.delta}`}
              tone={overview.delta === null ? "default" : overview.delta >= 0 ? "positive" : "negative"}
              sub="Since your first test"
            />
            <Stat label="Tests completed" value={overview.testsCompleted} />
          </div>
          <Card className="mb-10">
            <ScoreTrend history={overview.history} />
          </Card>
        </>
      ) : (
        <section className="mb-10">
          <div className="max-w-2xl">
            <Pill tone="accent">Adaptive · Full length · Scaled scoring</Pill>
            <h1 className="mt-4 text-[34px] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[42px]">
              Practise the Digital SAT the way it is actually administered.
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Two adaptive Reading and Writing modules, two adaptive Math modules,
              {" "}{TOTAL_QUESTIONS} questions, {formatDuration(TOTAL_TESTING_MINUTES * 60)} of
              timed testing, and a 10-minute break in between. Your second module is chosen from
              your first-module performance, exactly as on test day.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Card>
              <p className="text-[13px] font-semibold uppercase tracking-wide text-faint">
                Reading and Writing
              </p>
              <p className="mt-1.5 text-[15px] text-ink">
                2 modules · {MODULE_SPEC.rw.questions} questions · {MODULE_SPEC.rw.minutes} minutes each
              </p>
            </Card>
            <Card>
              <p className="text-[13px] font-semibold uppercase tracking-wide text-faint">Math</p>
              <p className="mt-1.5 text-[15px] text-ink">
                2 modules · {MODULE_SPEC.math.questions} questions · {MODULE_SPEC.math.minutes} minutes each
              </p>
            </Card>
            <Card>
              <p className="text-[13px] font-semibold uppercase tracking-wide text-faint">
                Question bank
              </p>
              <p className="mt-1.5 text-[15px] text-ink">
                {bank.stats.active.toLocaleString()} original questions · never repeated for you
              </p>
            </Card>
          </div>
        </section>
      )}

      <SectionHeading
        title="Start a test"
        hint="Generated forms draw from questions you have not seen before."
        action={
          <ButtonLink href="/practice" variant="ghost">
            Browse all {catalogue.length} forms
          </ButtonLink>
        }
      />
      <StartTestForm />

      {hasHistory ? (
        <section className="mt-10">
          <SectionHeading title="Recent tests" />
          <ul className="grid gap-3 sm:grid-cols-2">
            {[...overview.history].reverse().slice(0, 4).map((entry) => (
              <Card as="li" key={entry.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-ink">{entry.title}</p>
                  <p className="text-[13px] text-muted">
                    {formatDate(entry.completedAt)} · {entry.correct}/{entry.totalQuestions} correct
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[22px] font-semibold tabular-nums text-accent">
                    {entry.total ?? "—"}
                  </span>
                  <Link href={`/results/${entry.id}`} className="btn-ghost btn-sm">
                    Results
                  </Link>
                </div>
              </Card>
            ))}
          </ul>
        </section>
      ) : (
        <div className="mt-10">
          <Empty
            title="No completed tests yet"
            body="Take a full-length form to see your scaled score, domain breakdown, and recommended practice areas."
          />
        </div>
      )}
    </AppShell>
  );
}
