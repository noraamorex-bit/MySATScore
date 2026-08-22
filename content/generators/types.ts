/**
 * Template contract for the content pipeline.
 *
 * A *template* is an authored question pattern; `build` turns a seeded RNG into
 * one concrete *variant*. Because the RNG is deterministic, the same template
 * always produces the same variants in the same order, which is what keeps
 * question ids stable across bank rebuilds.
 */
import type {
  AnswerFormat,
  CalculatorUse,
  Choice,
  Difficulty,
  Domain,
  ModuleEligibility,
  QuestionSource,
  Stimulus,
  Subject,
} from "../../src/lib/sat/types";
import type { Rng } from "./rng";

export interface ItemBody {
  prompt: string;
  promptSuffix?: string;
  stimulus?: Stimulus;
  answerFormat: AnswerFormat;
  choices?: Choice[];
  correct: string;
  acceptedAnswers?: string[];
  explanation: string;
  distractorNotes?: Record<string, string>;
  /** Lets a template vary difficulty per variant. */
  difficulty?: Difficulty;
  /** Lets a template vary its skill tags per variant. */
  skills?: string[];
  /** Overrides the template subdomain for this variant. */
  subdomain?: string;
  /** Groups variants that share a passage. */
  setId?: string;
}

export interface Template {
  /** Also the id prefix for every variant, e.g. `m-alg-lin1` -> `m-alg-lin1-004`. */
  id: string;
  subject: Subject;
  domain: Domain;
  subdomain: string;
  skills: string[];
  difficulty: Difficulty;
  calculator?: CalculatorUse;
  moduleEligibility?: ModuleEligibility;
  source?: QuestionSource;
  /** How many variants to mint. */
  variants: number;
  build(rng: Rng, index: number): ItemBody;
}

export const ORIGINAL: QuestionSource = {
  kind: "original",
  attribution: "Written for MySATScore",
};

/** Thrown by a template when its own self-check fails during a build. */
export class TemplateError extends Error {
  constructor(templateId: string, message: string) {
    super(`[${templateId}] ${message}`);
    this.name = "TemplateError";
  }
}

/** Guards a computed answer against silent arithmetic mistakes. */
export function assertClose(actual: number, expected: number, label: string): void {
  if (Math.abs(actual - expected) > 1e-9) {
    throw new Error(`self-check failed (${label}): ${actual} !== ${expected}`);
  }
}
