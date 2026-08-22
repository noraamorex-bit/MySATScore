import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ButtonLink, Card, Empty, Pill, SectionHeading, Stat } from "@/components/ui";
import { ScoreTrend } from "@/components/ScoreTrend";
import { requireUser } from "@/lib/auth";
import { getUserOverview } from "@/lib/analytics";
import { db } from "@/lib/db";
import { formatDate, formatPercent } from "@/lib/format";
import { ROUTE_LABEL } from "@/lib/sat/blueprint";
import { deleteAttemptAction } from "@/app/actions";

export const metadata: Metadata = { title: "Test history" };
export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  full: "Full length",
  "rw-only": "Reading and Writing",
  "math-only": "Math",
};

export default async function HistoryPage() {
  const user = await requireUser();
  const [overview, abandoned] = await Promise.all([
    getUserOverview(user.id),
    db.attempt.findMany({
      where: { userId: user.id, status: "abandoned" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const rows = [...overview.history].reverse();

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight text-ink">Test history</h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Every completed test, with the score it produced.
          </p>
        </div>
        <ButtonLink href="/practice">Take another test</ButtonLink>
      </div>

      {rows.length === 0 ? (
        <div className="mt-8">
          <Empty
            title="No completed tests yet"
            body="Your score progression appears here once you finish your first full-length test."
            action={<ButtonLink href="/practice">Start a test</ButtonLink>}
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Tests completed" value={overview.testsCompleted} />
            <Stat label="Best total" value={overview.best ?? "—"} tone="accent" />
            <Stat label="Latest total" value={overview.latest ?? "—"} />
            <Stat
              label="Questions seen"
              value={overview.questionsSeen}
              sub={`of ${overview.bankSize.toLocaleString()} in the bank`}
            />
          </div>

          <Card className="mt-6">
            <ScoreTrend history={overview.history} />
          </Card>

          <SectionHeading title="All attempts" />
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-line bg-paper text-left text-[12px] uppercase tracking-wide text-faint">
                    <th scope="col" className="px-4 py-2.5 font-semibold">Test</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Date</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-semibold">R&amp;W</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-semibold">Math</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-semibold">Total</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-semibold">Accuracy</th>
                    <th scope="col" className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry) => (
                    <tr key={entry.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <Link href={`/results/${entry.id}`} className="font-medium text-ink hover:text-accent">
                          {entry.title}
                        </Link>
                        <p className="mt-0.5 flex flex-wrap gap-1.5 text-[11.5px] text-faint">
                          <span>{KIND_LABEL[entry.kind] ?? entry.kind}</span>
                          {entry.routes.rw ? <span>· R&amp;W {ROUTE_LABEL[entry.routes.rw]}</span> : null}
                          {entry.routes.math ? <span>· Math {ROUTE_LABEL[entry.routes.math]}</span> : null}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(entry.completedAt)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{entry.rw ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{entry.math ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-[16px] font-semibold tabular-nums text-accent">
                        {entry.total ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted">
                        {formatPercent(entry.accuracy)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/results/${entry.id}/review`} className="btn-quiet btn-sm">
                            Review
                          </Link>
                          <form action={deleteAttemptAction}>
                            <input type="hidden" name="attemptId" value={entry.id} />
                            <button type="submit" className="btn-quiet btn-sm text-negative">
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {abandoned.length > 0 ? (
        <section className="mt-10">
          <SectionHeading
            title="Abandoned attempts"
            hint="Started but not finished. Starting a new test abandons any test still open."
          />
          <ul className="space-y-2">
            {abandoned.map((attempt) => (
              <Card as="li" key={attempt.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-[14.5px] font-medium text-ink">{attempt.title}</p>
                  <p className="text-[12.5px] text-muted">{formatDate(attempt.createdAt)}</p>
                </div>
                <Pill tone="caution">Abandoned</Pill>
              </Card>
            ))}
          </ul>
        </section>
      ) : null}
    </AppShell>
  );
}
