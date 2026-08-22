import Link from "next/link";
import { Card, SectionHeading, Stat } from "@/components/ui";
import { getBank } from "@/lib/bank";
import { listCatalogue } from "@/lib/catalogue";
import { unusedQuestionCount } from "@/lib/admin";
import { db } from "@/lib/db";
import { DOMAIN_LABELS } from "@/lib/sat/types";
import { formatDateTime } from "@/lib/format";

export default async function AdminOverview() {
  const [bank, catalogue, unused, attempts, users, recent] = await Promise.all([
    getBank(),
    listCatalogue(),
    unusedQuestionCount(),
    db.attempt.count(),
    db.user.count(),
    db.attempt.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, title: true, status: true, createdAt: true, kind: true },
    }),
  ]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Active questions" value={bank.stats.active.toLocaleString()} tone="accent" />
        <Stat label="Never served" value={unused.toLocaleString()} sub="Available for new forms" />
        <Stat label="Retired" value={bank.stats.retired} sub={`${bank.stats.custom} custom`} />
        <Stat label="Curated forms" value={catalogue.length} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Users" value={users} />
        <Stat label="Attempts" value={attempts} />
        <Stat
          label="Reading and Writing"
          value={bank.stats.bySubject.rw}
          sub={`${bank.stats.bySubject.math} math`}
        />
        <Stat
          label="Easy / medium / hard"
          value={`${bank.stats.byDifficulty.easy}/${bank.stats.byDifficulty.medium}/${bank.stats.byDifficulty.hard}`}
        />
      </div>

      <SectionHeading
        title="Bank composition"
        hint="Compare with the blueprint targets on the scoring page."
      />
      <Card>
        <ul className="grid gap-2 sm:grid-cols-2">
          {Object.entries(bank.stats.byDomain)
            .sort((a, b) => b[1] - a[1])
            .map(([domain, count]) => (
              <li key={domain} className="flex items-baseline justify-between gap-3 text-[14px]">
                <span className="text-ink">{DOMAIN_LABELS[domain as never] ?? domain}</span>
                <span className="tabular-nums text-muted">{count}</span>
              </li>
            ))}
        </ul>
      </Card>

      <SectionHeading title="Recent attempts" />
      <Card className="p-0">
        <ul className="divide-y divide-line">
          {recent.length === 0 ? (
            <li className="px-4 py-6 text-[14px] text-muted">No attempts yet.</li>
          ) : (
            recent.map((attempt) => (
              <li key={attempt.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-medium text-ink">{attempt.title}</p>
                  <p className="text-[12.5px] text-muted">
                    {attempt.kind} · {formatDateTime(attempt.createdAt)}
                  </p>
                </div>
                <span className="chip">{attempt.status}</span>
              </li>
            ))
          )}
        </ul>
      </Card>

      <SectionHeading title="Quick actions" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/questions/new" className="card p-5 transition hover:shadow-lift">
          <p className="text-[15px] font-semibold text-ink">Write a question</p>
          <p className="mt-1 text-[13.5px] text-muted">
            Full editor with a live preview of exactly what a test taker sees.
          </p>
        </Link>
        <Link href="/admin/import" className="card p-5 transition hover:shadow-lift">
          <p className="text-[15px] font-semibold text-ink">Import JSON or CSV</p>
          <p className="mt-1 text-[13.5px] text-muted">
            Bulk-load questions, with per-row validation and a downloadable template.
          </p>
        </Link>
        <Link href="/admin/tests" className="card p-5 transition hover:shadow-lift">
          <p className="text-[15px] font-semibold text-ink">Build a curated test</p>
          <p className="mt-1 text-[13.5px] text-muted">
            Assemble a fixed form that avoids questions already used elsewhere.
          </p>
        </Link>
      </div>
    </div>
  );
}
