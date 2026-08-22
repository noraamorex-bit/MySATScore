/**
 * Shared machinery for passage-based Reading and Writing items.
 *
 * A `PassageSeed` is one authored passage together with the questions written
 * against it. Questions sharing a passage are linked by `setId` so the app can
 * show them as a set in review, and so the assembler never places two questions
 * about the same passage in one module.
 */
import { Rng } from "../rng";
import { ORIGINAL, type ItemBody, type Template } from "../types";
import type {
  ChartStimulus, Difficulty, RwDomain, Stimulus, TableStimulus,
} from "../../../src/lib/sat/types";
import { buildChoices } from "../util";

export interface SeedQuestion {
  domain: RwDomain;
  subdomain: string;
  skills: string[];
  difficulty: Difficulty;
  prompt: string;
  answer: string;
  wrong: [string, string, string];
  why: string;
}

export interface PassageSeed {
  /** Short slug; question ids are derived from it. */
  slug: string;
  title?: string;
  /**
   * Passage paragraphs. A paragraph that is exactly "Text 1" or "Text 2" is
   * rendered as a label, which is how paired-passage items are presented.
   */
  paragraphs: string[];
  credit?: string;
  /** Data display for quantitative-evidence items. */
  data?: TableStimulus | ChartStimulus;
  questions: SeedQuestion[];
}

function stimulusFor(seed: PassageSeed): Stimulus {
  if (seed.data) return seed.data;
  return {
    type: "passage",
    title: seed.title,
    paragraphs: seed.paragraphs,
    credit: seed.credit,
  };
}

/**
 * Flattens seeds into one template per domain. Splitting by domain keeps the
 * blueprint assembler able to request "seven Information and Ideas questions"
 * without inspecting individual items.
 */
export function passageTemplates(
  idPrefix: string,
  seeds: PassageSeed[],
): Template[] {
  const byDomain = new Map<RwDomain, { seed: PassageSeed; q: SeedQuestion }[]>();
  for (const seed of seeds) {
    for (const q of seed.questions) {
      const list = byDomain.get(q.domain) ?? [];
      list.push({ seed, q });
      byDomain.set(q.domain, list);
    }
  }

  const templates: Template[] = [];
  for (const [domain, entries] of byDomain) {
    templates.push({
      id: `${idPrefix}-${domain === "information-and-ideas" ? "ii" : "cs"}`,
      subject: "rw",
      domain,
      subdomain: "Passage-based",
      skills: [],
      difficulty: "medium",
      source: ORIGINAL,
      variants: entries.length,
      build(rng: Rng, index: number): ItemBody {
        const { seed, q } = entries[index % entries.length];
        const { choices, correct } = buildChoices(rng, q.answer, q.wrong, { sortNumeric: false });
        const stimulus = stimulusFor(seed);
        if (seed.data && seed.paragraphs.length > 0) {
          // Quantitative items pair a framing paragraph with the data display.
          (stimulus as TableStimulus | ChartStimulus).intro = seed.paragraphs.join(" ");
        }
        return {
          stimulus,
          prompt: q.prompt,
          answerFormat: "multiple-choice",
          choices,
          correct,
          explanation: q.why,
          difficulty: q.difficulty,
          skills: q.skills,
          subdomain: q.subdomain,
          setId: `${idPrefix}-${seed.slug}`,
        };
      },
    });
  }
  return templates;
}
