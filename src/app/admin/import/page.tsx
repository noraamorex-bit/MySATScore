import { Card, SectionHeading } from "@/components/ui";
import { ImportForm } from "@/components/admin/ImportForm";
import { CSV_COLUMNS } from "@/lib/admin";

export default function ImportPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div>
        <SectionHeading
          title="Import questions"
          hint="Each row is validated on its own — a bad row is reported and skipped, not fatal."
        />
        <ImportForm />
      </div>

      <div>
        <SectionHeading title="Formats" />
        <Card className="space-y-4 text-[13.5px] leading-relaxed text-muted">
          <div>
            <p className="text-[14px] font-semibold text-ink">JSON</p>
            <p className="mt-1">
              An array of question objects, or an object with a <code>questions</code> array — the
              same shape as <code>content/bank/questions.json</code>. Every field in the schema is
              accepted, including passages, tables, charts, and figures.
            </p>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink">CSV</p>
            <p className="mt-1">
              One question per row with this header, in this order:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-paper p-3 font-mono text-[11.5px] text-ink">
              {CSV_COLUMNS.join(",")}
            </pre>
            <p className="mt-2">
              <code>skills</code> and <code>acceptedAnswers</code> are pipe-separated.{" "}
              <code>passage</code> is optional; blank lines within it become paragraphs. Export the
              current bank from the Questions tab to get a working example.
            </p>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink">Attribution</p>
            <p className="mt-1">
              Imported questions are recorded with{" "}
              <code>source.kind = &quot;imported&quot;</code>. If you are importing officially
              released material, edit each item afterwards to record the correct attribution, URL,
              and licence — the schema requires attribution for anything not marked original.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
