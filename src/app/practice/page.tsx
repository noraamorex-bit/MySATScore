import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Card, SectionHeading, Pill } from "@/components/ui";
import { StartTestForm } from "@/components/StartTestForm";
import { CuratedList } from "@/components/CuratedList";
import { requireUser } from "@/lib/auth";
import { listCatalogue } from "@/lib/catalogue";
import { getBank } from "@/lib/bank";
import { seenQuestionIds } from "@/lib/attempts";
import { MODULE_SPEC, TOTAL_QUESTIONS, TOTAL_TESTING_MINUTES, BREAK_MINUTES } from "@/lib/sat/blueprint";
import { formatDuration } from "@/lib/format";

export const metadata: Metadata = { title: "Practice" };
export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const user = await requireUser();
  const [catalogue, bank, seen] = await Promise.all([
    listCatalogue(),
    getBank(),
    seenQuestionIds(user.id),
  ]);

  const unseen = bank.stats.active - seen.size;
  const full = catalogue.filter((entry) => entry.kind === "full");
  const sections = catalogue.filter((entry) => entry.kind !== "full");

  return (
    <AppShell>
      <h1 className="text-[30px] font-semibold tracking-tight text-ink">Practice</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-muted">
        Generate a fresh adaptive form, or take one of the curated tests so your results are
        comparable with anyone else who sat the same form.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Structure</p>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink">
            {TOTAL_QUESTIONS} questions · {formatDuration(TOTAL_TESTING_MINUTES * 60)} of testing ·
            optional {BREAK_MINUTES}-minute break
          </p>
        </Card>
        <Card>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Modules</p>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink">
            R&amp;W {MODULE_SPEC.rw.questions}×2 at {MODULE_SPEC.rw.minutes} min · Math{" "}
            {MODULE_SPEC.math.questions}×2 at {MODULE_SPEC.math.minutes} min
          </p>
        </Card>
        <Card>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Your bank</p>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink">
            {unseen.toLocaleString()} unseen of {bank.stats.active.toLocaleString()} questions
          </p>
        </Card>
      </div>

      <section className="mt-10">
        <SectionHeading
          title="Generate a new test"
          hint="Assembled to the blueprint from questions you have not seen."
        />
        <StartTestForm />
      </section>

      <section className="mt-12">
        <SectionHeading
          title="Curated full-length tests"
          hint="Fixed forms. Everyone who takes Practice Test 3 answers the same questions."
          action={<Pill>{full.length} forms</Pill>}
        />
        <CuratedList entries={full} />
      </section>

      <section className="mt-12">
        <SectionHeading
          title="Single-section sets"
          hint="Both adaptive modules of one section, scored on the 200–800 scale."
          action={<Pill>{sections.length} sets</Pill>}
        />
        <CuratedList entries={sections} />
      </section>
    </AppShell>
  );
}
