/**
 * Builds `content/bank/questions.json` from the templates.
 *
 * The build is deterministic: each variant is generated from the seed
 * `<templateId>:<index>`, so rebuilding produces identical ids and identical
 * content. That is what makes the curated test forms — which reference question
 * ids — stable across deployments.
 *
 *   npm run bank:build
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Rng } from "./rng";
import { ALL_TEMPLATES } from "./index";
import { ORIGINAL } from "./types";
import { mintId } from "./util";
import { questionSchema } from "../../src/lib/sat/schema";
import type { Difficulty, Question } from "../../src/lib/sat/types";
import { buildCuratedCatalogue } from "./curate";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANK_PATH = resolve(HERE, "../bank/questions.json");
const CURATED_PATH = resolve(HERE, "../curated/tests.json");

/**
 * Difficulty spread within a template.
 *
 * A template declares the level it is centred on, but its variants are not all
 * equally hard: a linear equation with small positive coefficients is easier
 * than the same template sampled with negative fractional ones, and a passage
 * question's difficulty depends on the passage. Rather than pretend every
 * variant sits exactly at the declared level, the build distributes variants
 * across a narrow band around it.
 *
 * This is an approximation. Per-item difficulty can be corrected in the admin
 * question editor, and empirical difficulty (percent correct) is tracked
 * separately in question usage statistics.
 */
const DIFFICULTY_SPREAD: Record<Difficulty, Partial<Record<Difficulty, number>>> = {
  easy: { easy: 0.7, medium: 0.3 },
  medium: { easy: 0.25, medium: 0.55, hard: 0.2 },
  hard: { medium: 0.2, hard: 0.8 },
};

/**
 * Assigns each variant index a difficulty so the template's variants match the
 * spread exactly. Deterministic: the same template always produces the same
 * assignment.
 */
function spreadDifficulties(declared: Difficulty, variants: number, seed: string): Difficulty[] {
  const spread = DIFFICULTY_SPREAD[declared];
  const levels = (Object.keys(spread) as Difficulty[]).filter((d) => (spread[d] ?? 0) > 0);
  const exact = levels.map((d) => (spread[d] as number) * variants);
  const counts = exact.map(Math.floor);
  let left = variants - counts.reduce((a, b) => a + b, 0);
  const order = levels
    .map((_, i) => ({ i, frac: exact[i] - counts[i] }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (left <= 0) break;
    counts[i] += 1;
    left -= 1;
  }

  const pool: Difficulty[] = [];
  levels.forEach((d, i) => { for (let k = 0; k < counts[i]; k += 1) pool.push(d); });
  // Shuffle deterministically so difficulty does not correlate with variant index.
  const rng = new Rng(`difficulty:${seed}`);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng.next() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function buildBank(): { questions: Question[]; problems: string[] } {
  const questions: Question[] = [];
  const problems: string[] = [];
  const seenIds = new Set<string>();
  const seenPrompts = new Map<string, string>();

  const templateIds = new Set<string>();
  for (const template of ALL_TEMPLATES) {
    if (templateIds.has(template.id)) {
      problems.push(`duplicate template id: ${template.id}`);
      continue;
    }
    templateIds.add(template.id);

    const variantDifficulty = spreadDifficulties(template.difficulty, template.variants, template.id);

    for (let index = 0; index < template.variants; index += 1) {
      const rng = new Rng(`${template.id}:${index}`);
      let body;
      try {
        body = template.build(rng, index);
      } catch (error) {
        problems.push(`${template.id}#${index}: build failed — ${(error as Error).message}`);
        continue;
      }

      const id = mintId(template.id, index);
      if (seenIds.has(id)) {
        problems.push(`duplicate question id: ${id}`);
        continue;
      }

      const question: Question = {
        id,
        subject: template.subject,
        moduleEligibility: template.moduleEligibility ?? "any",
        domain: template.domain,
        subdomain: body.subdomain ?? template.subdomain,
        skills: body.skills?.length ? body.skills : template.skills,
        // A template that computes its own per-variant difficulty wins; otherwise
        // the variant takes its place in the template's difficulty spread.
        difficulty: body.difficulty ?? variantDifficulty[index] ?? template.difficulty,
        stimulus: body.stimulus,
        prompt: body.prompt,
        promptSuffix: body.promptSuffix,
        answerFormat: body.answerFormat,
        choices: body.choices,
        correct: body.correct,
        acceptedAnswers: body.acceptedAnswers,
        explanation: body.explanation,
        distractorNotes: body.distractorNotes,
        calculator: template.subject === "math" ? (template.calculator ?? "recommended") : undefined,
        source: template.source ?? ORIGINAL,
        templateId: template.id,
        setId: body.setId,
        v: 1,
      };

      const parsed = questionSchema.safeParse(question);
      if (!parsed.success) {
        problems.push(
          `${id}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"} ${i.message}`).join("; ")}`,
        );
        continue;
      }

      // Two variants that render identically would let the same question appear
      // twice in one test under different ids.
      const fingerprint = JSON.stringify([
        question.prompt,
        question.stimulus ?? null,
        question.choices?.map((c) => c.text) ?? question.correct,
      ]);
      const previous = seenPrompts.get(fingerprint);
      if (previous) {
        problems.push(`${id}: identical content to ${previous}`);
        continue;
      }
      seenPrompts.set(fingerprint, id);

      seenIds.add(id);
      questions.push(question);
    }
  }

  return { questions, problems };
}

function main(): void {
  const { questions, problems } = buildBank();

  for (const problem of problems) console.error(`  ! ${problem}`);

  mkdirSync(dirname(BANK_PATH), { recursive: true });
  writeFileSync(
    BANK_PATH,
    `${JSON.stringify({ version: 1, generatedAt: "static", questions }, null, 1)}\n`,
  );

  const catalogue = buildCuratedCatalogue(questions);
  mkdirSync(dirname(CURATED_PATH), { recursive: true });
  writeFileSync(CURATED_PATH, `${JSON.stringify(catalogue, null, 1)}\n`);

  const bySubject = { rw: 0, math: 0 };
  const byDomain: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  for (const q of questions) {
    bySubject[q.subject] += 1;
    byDomain[q.domain] = (byDomain[q.domain] ?? 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] ?? 0) + 1;
  }

  console.log(`\nBank written to ${BANK_PATH}`);
  console.log(`  templates : ${ALL_TEMPLATES.length}`);
  console.log(`  questions : ${questions.length}  (rw ${bySubject.rw}, math ${bySubject.math})`);
  console.log(`  difficulty: ${JSON.stringify(byDifficulty)}`);
  for (const [domain, n] of Object.entries(byDomain).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${domain.padEnd(34)} ${n}`);
  }
  console.log(`  curated forms: ${catalogue.tests.length}`);
  if (problems.length) {
    console.error(`\n${problems.length} problem(s) — those items were skipped.`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && process.argv[1].endsWith("build.ts")) main();
