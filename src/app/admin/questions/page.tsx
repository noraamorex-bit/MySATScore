import Link from "next/link";
import clsx from "clsx";
import { ButtonLink, Card, Pill, SectionHeading } from "@/components/ui";
import { RichLine } from "@/components/RichText";
import { searchBank, getBank } from "@/lib/bank";
import { MATH_DOMAINS, RW_DOMAINS, DOMAIN_LABELS } from "@/lib/sat/types";
import type { Difficulty, Domain, Subject } from "@/lib/sat/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const filter = {
    subject: (params.subject as Subject) || undefined,
    domain: (params.domain as Domain) || undefined,
    difficulty: (params.difficulty as Difficulty) || undefined,
    search: params.q,
    includeRetired: params.retired === "1",
  };

  const [matches, bank] = await Promise.all([searchBank(filter), getBank()]);
  const total = matches.length;
  const visible = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...params, ...overrides })) {
      if (value) next.set(key, value);
    }
    return `/admin/questions${next.toString() ? `?${next}` : ""}`;
  };

  return (
    <div>
      <SectionHeading
        title="Question bank"
        hint={`${total.toLocaleString()} matching · ${bank.stats.active.toLocaleString()} active in total`}
        action={
          <div className="flex gap-2">
            <a href="/api/admin/export" className="btn-ghost btn-sm">
              Export CSV
            </a>
            <ButtonLink href="/admin/questions/new">New question</ButtonLink>
          </div>
        }
      />

      <Card className="mb-5">
        <form method="get" className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <div>
            <label htmlFor="q" className="label">Search</label>
            <input id="q" name="q" defaultValue={params.q ?? ""} placeholder="Prompt, id, skill…" className="field" />
          </div>
          <div>
            <label htmlFor="subject" className="label">Subject</label>
            <select id="subject" name="subject" defaultValue={params.subject ?? ""} className="field">
              <option value="">Any</option>
              <option value="rw">Reading and Writing</option>
              <option value="math">Math</option>
            </select>
          </div>
          <div>
            <label htmlFor="domain" className="label">Domain</label>
            <select id="domain" name="domain" defaultValue={params.domain ?? ""} className="field">
              <option value="">Any</option>
              <optgroup label="Reading and Writing">
                {RW_DOMAINS.map((d) => (
                  <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>
                ))}
              </optgroup>
              <optgroup label="Math">
                {MATH_DOMAINS.map((d) => (
                  <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label htmlFor="difficulty" className="label">Difficulty</label>
            <select id="difficulty" name="difficulty" defaultValue={params.difficulty ?? ""} className="field">
              <option value="">Any</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary">Filter</button>
          </div>
          <label className="flex items-center gap-2 text-[13.5px] text-muted sm:col-span-5">
            <input type="checkbox" name="retired" value="1" defaultChecked={params.retired === "1"} />
            Include retired questions
          </label>
        </form>
      </Card>

      <ul className="space-y-2">
        {visible.map((question) => {
          const retired = bank.retiredIds.has(question.id);
          return (
            <li key={question.id}>
              <Link
                href={`/admin/questions/${question.id}`}
                className={clsx(
                  "card flex items-start gap-3 px-4 py-3 transition hover:shadow-lift",
                  retired && "opacity-60",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[14.5px] leading-snug text-ink">
                    <RichLine text={question.prompt.split("\n")[0]} />
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[12px] text-muted">
                    <span className="font-mono text-faint">{question.id}</span>
                    <span>· {DOMAIN_LABELS[question.domain]}</span>
                    <span>· {question.subdomain}</span>
                    <span className="capitalize">· {question.difficulty}</span>
                    {question.source.kind !== "original" ? <span>· {question.source.kind}</span> : null}
                  </p>
                </div>
                {retired ? <Pill tone="negative">Retired</Pill> : null}
              </Link>
            </li>
          );
        })}
      </ul>

      {total === 0 ? (
        <Card className="text-center text-[14px] text-muted">No questions match those filters.</Card>
      ) : null}

      {pages > 1 ? (
        <nav className="mt-6 flex items-center justify-between" aria-label="Pagination">
          <Link
            href={buildHref({ page: String(Math.max(1, page - 1)) })}
            className={clsx("btn-ghost btn-sm", page === 1 && "pointer-events-none opacity-40")}
          >
            Previous
          </Link>
          <p className="text-[13px] text-muted">Page {page} of {pages}</p>
          <Link
            href={buildHref({ page: String(Math.min(pages, page + 1)) })}
            className={clsx("btn-ghost btn-sm", page === pages && "pointer-events-none opacity-40")}
          >
            Next
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
