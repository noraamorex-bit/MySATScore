/**
 * Core question-bank domain model.
 *
 * This module is deliberately dependency-free: the content pipeline
 * (`content/generators`), the server, and the browser all import it, so it must
 * stay portable and serialisable. Anything stored in the bank JSON is described
 * here and validated by `schema.ts`.
 */

export type Subject = "rw" | "math";

/** Which module a question may appear in. Most questions are eligible for both. */
export type ModuleEligibility = "any" | "module1" | "module2";

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

/** Reading & Writing content domains, in College Board blueprint order. */
export type RwDomain =
  | "information-and-ideas"
  | "craft-and-structure"
  | "expression-of-ideas"
  | "standard-english-conventions";

/** Math content domains, in College Board blueprint order. */
export type MathDomain =
  | "algebra"
  | "advanced-math"
  | "problem-solving-and-data-analysis"
  | "geometry-and-trigonometry";

export type Domain = RwDomain | MathDomain;

export const RW_DOMAINS: RwDomain[] = [
  "information-and-ideas",
  "craft-and-structure",
  "expression-of-ideas",
  "standard-english-conventions",
];

export const MATH_DOMAINS: MathDomain[] = [
  "algebra",
  "advanced-math",
  "problem-solving-and-data-analysis",
  "geometry-and-trigonometry",
];

export const DOMAIN_LABELS: Record<Domain, string> = {
  "information-and-ideas": "Information and Ideas",
  "craft-and-structure": "Craft and Structure",
  "expression-of-ideas": "Expression of Ideas",
  "standard-english-conventions": "Standard English Conventions",
  algebra: "Algebra",
  "advanced-math": "Advanced Math",
  "problem-solving-and-data-analysis": "Problem-Solving and Data Analysis",
  "geometry-and-trigonometry": "Geometry and Trigonometry",
};

export const DOMAIN_SUBJECT: Record<Domain, Subject> = {
  "information-and-ideas": "rw",
  "craft-and-structure": "rw",
  "expression-of-ideas": "rw",
  "standard-english-conventions": "rw",
  algebra: "math",
  "advanced-math": "math",
  "problem-solving-and-data-analysis": "math",
  "geometry-and-trigonometry": "math",
};

/** Provenance of an item, so licensed imports stay distinguishable from ours. */
export type SourceKind =
  | "original" // written for this project
  | "official-public" // released by College Board under terms permitting reuse
  | "imported"; // supplied by an administrator

export interface QuestionSource {
  kind: SourceKind;
  /** Human-readable attribution, required for anything not `original`. */
  attribution?: string;
  /** Canonical URL for the released item, when one exists. */
  url?: string;
  /** License identifier or short terms summary for imported/official content. */
  license?: string;
}

/* ------------------------------------------------------------------ stimulus */

export interface TableStimulus {
  type: "table";
  /** Framing sentence shown above the table, as on quantitative-evidence items. */
  intro?: string;
  title?: string;
  caption?: string;
  columns: string[];
  rows: string[][];
  /** Column indices that hold numbers, so they can be right-aligned. */
  numericColumns?: number[];
}

export interface ChartSeries {
  label: string;
  /** Points in data space. For bar charts `x` indexes `categories`. */
  points: { x: number; y: number }[];
}

export interface ChartStimulus {
  type: "chart";
  chart: "scatter" | "line" | "bar" | "histogram";
  /** Framing sentence shown above the graph. */
  intro?: string;
  title?: string;
  caption?: string;
  xLabel: string;
  yLabel: string;
  /** Category labels for bar/histogram charts. */
  categories?: string[];
  series: ChartSeries[];
  xTicks?: number[];
  yTicks?: number[];
  /** Optional straight line drawn across the plot, e.g. a line of best fit. */
  trendline?: { slope: number; intercept: number; label?: string };
}

/** A geometry diagram described declaratively and rendered to SVG. */
export interface FigureStimulus {
  type: "figure";
  title?: string;
  caption?: string;
  width: number;
  height: number;
  shapes: FigureShape[];
  /** Real SAT figures are drawn to scale unless the item says otherwise. */
  notToScale?: boolean;
}

export type FigureShape =
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number; dashed?: boolean; arrow?: boolean }
  | { kind: "polygon"; points: [number, number][]; fill?: boolean }
  | { kind: "circle"; cx: number; cy: number; r: number; fill?: boolean }
  | { kind: "arc"; cx: number; cy: number; r: number; start: number; end: number }
  | { kind: "rightAngle"; x: number; y: number; dx: number; dy: number; size?: number }
  | { kind: "label"; x: number; y: number; text: string; anchor?: "start" | "middle" | "end"; math?: boolean };

/** An image referenced by URL. Used by imported content; originals use figures. */
export interface ImageStimulus {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface PassageStimulus {
  type: "passage";
  title?: string;
  /** Paragraphs of prose. Rendered in a serif reading face. */
  paragraphs: string[];
  /** Attribution line shown beneath the passage, e.g. adapted-from credit. */
  credit?: string;
  /** Bulleted notes, as used by SAT "student notes" rhetorical-synthesis items. */
  bullets?: string[];
}

export type Stimulus =
  | PassageStimulus
  | TableStimulus
  | ChartStimulus
  | FigureStimulus
  | ImageStimulus;

/* ------------------------------------------------------------------ question */

export type AnswerFormat = "multiple-choice" | "student-response";

export interface Choice {
  /** "A" | "B" | "C" | "D" */
  id: string;
  text: string;
}

/**
 * Calculator policy. Every Digital SAT math module permits the on-screen
 * calculator, but we track whether an item is *meant* to be done with one so
 * practice recommendations and analytics stay meaningful.
 */
export type CalculatorUse = "recommended" | "not-needed";

export interface Question {
  /** Stable, globally unique, human-inspectable. e.g. `m-alg-lineq-0007`. */
  id: string;
  subject: Subject;
  moduleEligibility: ModuleEligibility;
  domain: Domain;
  /** Blueprint skill/subdomain, e.g. "Linear equations in one variable". */
  subdomain: string;
  /** Finer-grained tags used for weak-skill analytics and practice sets. */
  skills: string[];
  difficulty: Difficulty;

  /** Optional shared context: a passage, table, chart, or figure. */
  stimulus?: Stimulus;
  /** The prompt itself. May contain inline `$...$` math. */
  prompt: string;
  /** Text shown directly above the choices, e.g. an underlined-blank sentence. */
  promptSuffix?: string;

  answerFormat: AnswerFormat;
  /** Present for multiple-choice items; always four choices on the real test. */
  choices?: Choice[];
  /**
   * Multiple choice: the choice id ("A"–"D").
   * Student response: the canonical answer string.
   */
  correct: string;
  /**
   * Student response items accept several equivalent forms
   * (e.g. `1/2`, `.5`, `0.5`). Every accepted literal is listed here.
   */
  acceptedAnswers?: string[];

  explanation: string;
  /** Why each wrong choice is tempting — the trap analysis. */
  distractorNotes?: Record<string, string>;

  calculator?: CalculatorUse;
  source: QuestionSource;

  /** Groups variants produced from one authored template. */
  templateId?: string;
  /** Groups items that share a passage (paired/evidence sets). */
  setId?: string;
  /** Bank format version, for migrations. */
  v: 1;
}

/** A question plus the per-user exposure data used by the assembler. */
export interface QuestionUsage {
  questionId: string;
  /** Times the question has been served across all users. */
  timesServed: number;
  /** Times it has been answered correctly, for empirical difficulty. */
  timesCorrect: number;
  lastServedAt?: string;
}

/* ---------------------------------------------------------------- test model */

export type ModuleNumber = 1 | 2;

/** Which routed form of module 2 a test taker received. */
export type RoutePath = "lower" | "upper";

export interface TestModule {
  subject: Subject;
  module: ModuleNumber;
  /** Only set for module 2. */
  route?: RoutePath;
  durationSeconds: number;
  questionIds: string[];
}

export type TestKind = "full" | "rw-only" | "math-only";

export interface AssembledTest {
  /** Stable id: curated forms use their catalogue id, generated use a nanoid. */
  id: string;
  kind: TestKind;
  title: string;
  /** Curated forms are fixed; generated forms are assembled per attempt. */
  curated: boolean;
  createdAt: string;
  /** Module 1s only. Module 2 is chosen at runtime by the routing engine. */
  modules: TestModule[];
  /**
   * Pre-selected module 2 pools, keyed `"rw:lower"`, `"rw:upper"`,
   * `"math:lower"`, `"math:upper"`. Reserved up front so a routed module can
   * never collide with module 1 or the other subject.
   */
  routedModules: Record<string, TestModule>;
}
