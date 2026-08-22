import { Card, Pill, SectionHeading } from "@/components/ui";
import { BuildFormForm } from "@/components/admin/BuildFormForm";
import { db } from "@/lib/db";
import { listCatalogue } from "@/lib/catalogue";
import { deleteFormAction, toggleFormAction } from "@/app/admin/actions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminTestsPage() {
  const [managed, catalogue] = await Promise.all([
    db.curatedForm.findMany({ orderBy: { createdAt: "desc" } }),
    listCatalogue(),
  ]);
  const generated = catalogue.filter((entry) => !entry.managed);

  return (
    <div>
      <SectionHeading
        title="Build a curated test"
        hint="A curated form is fixed: everyone who takes it answers the same questions."
      />
      <BuildFormForm />

      <SectionHeading
        title="Forms you have built"
        action={<Pill>{managed.length}</Pill>}
      />
      {managed.length === 0 ? (
        <Card className="text-[14px] text-muted">
          None yet. Forms you build appear here and on the practice page.
        </Card>
      ) : (
        <ul className="space-y-2">
          {managed.map((form) => (
            <Card as="li" key={form.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-ink">{form.title}</p>
                <p className="text-[12.5px] text-muted">
                  <span className="font-mono">{form.id}</span> · {form.kind} ·{" "}
                  {formatDate(form.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {form.published ? <Pill tone="positive">Published</Pill> : <Pill>Unpublished</Pill>}
                <form action={toggleFormAction}>
                  <input type="hidden" name="id" value={form.id} />
                  <input type="hidden" name="published" value={form.published ? "false" : "true"} />
                  <button type="submit" className="btn-ghost btn-sm">
                    {form.published ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <form action={deleteFormAction}>
                  <input type="hidden" name="id" value={form.id} />
                  <button type="submit" className="btn-quiet btn-sm text-negative">
                    Delete
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </ul>
      )}

      <SectionHeading
        title="Forms shipped with the bank"
        hint="Built at bank-build time with fixed seeds; rebuild the bank to regenerate them."
        action={<Pill>{generated.length}</Pill>}
      />
      <Card className="p-0">
        <ul className="divide-y divide-line">
          {generated.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
              <div>
                <p className="text-[14px] font-medium text-ink">{entry.title}</p>
                <p className="text-[12px] text-muted">
                  <span className="font-mono">{entry.id}</span> · {entry.questionCount} questions
                </p>
              </div>
              <span className="chip">{entry.kind}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
