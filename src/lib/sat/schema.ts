/**
 * Runtime validation for anything entering the question bank — the generated
 * bank itself, admin edits, and CSV/JSON imports all pass through here.
 */
import { z } from "zod";
import { MATH_DOMAINS, RW_DOMAINS } from "./types";

export const difficultySchema = z.enum(["easy", "medium", "hard"]);
export const subjectSchema = z.enum(["rw", "math"]);
export const domainSchema = z.enum([...RW_DOMAINS, ...MATH_DOMAINS] as [string, ...string[]]);

const passageSchema = z.object({
  type: z.literal("passage"),
  title: z.string().optional(),
  paragraphs: z.array(z.string().min(1)).min(1),
  credit: z.string().optional(),
  bullets: z.array(z.string().min(1)).optional(),
});

const tableSchema = z.object({
  type: z.literal("table"),
  intro: z.string().optional(),
  title: z.string().optional(),
  caption: z.string().optional(),
  columns: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())).min(1),
  numericColumns: z.array(z.number().int()).optional(),
});

const chartSchema = z.object({
  type: z.literal("chart"),
  chart: z.enum(["scatter", "line", "bar", "histogram"]),
  intro: z.string().optional(),
  title: z.string().optional(),
  caption: z.string().optional(),
  xLabel: z.string(),
  yLabel: z.string(),
  categories: z.array(z.string()).optional(),
  series: z
    .array(
      z.object({
        label: z.string(),
        points: z.array(z.object({ x: z.number(), y: z.number() })).min(1),
      }),
    )
    .min(1),
  xTicks: z.array(z.number()).optional(),
  yTicks: z.array(z.number()).optional(),
  trendline: z
    .object({ slope: z.number(), intercept: z.number(), label: z.string().optional() })
    .optional(),
});

const figureShapeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("line"), x1: z.number(), y1: z.number(), x2: z.number(), y2: z.number(),
    dashed: z.boolean().optional(), arrow: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("polygon"),
    points: z.array(z.tuple([z.number(), z.number()])).min(3),
    fill: z.boolean().optional(),
  }),
  z.object({ kind: z.literal("circle"), cx: z.number(), cy: z.number(), r: z.number(), fill: z.boolean().optional() }),
  z.object({ kind: z.literal("arc"), cx: z.number(), cy: z.number(), r: z.number(), start: z.number(), end: z.number() }),
  z.object({ kind: z.literal("rightAngle"), x: z.number(), y: z.number(), dx: z.number(), dy: z.number(), size: z.number().optional() }),
  z.object({
    kind: z.literal("label"), x: z.number(), y: z.number(), text: z.string(),
    anchor: z.enum(["start", "middle", "end"]).optional(), math: z.boolean().optional(),
  }),
]);

const figureSchema = z.object({
  type: z.literal("figure"),
  title: z.string().optional(),
  caption: z.string().optional(),
  width: z.number().positive(),
  height: z.number().positive(),
  shapes: z.array(figureShapeSchema).min(1),
  notToScale: z.boolean().optional(),
});

const imageSchema = z.object({
  type: z.literal("image"),
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const stimulusSchema = z.discriminatedUnion("type", [
  passageSchema, tableSchema, chartSchema, figureSchema, imageSchema,
]);

export const questionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, "ids are lowercase, digits, and hyphens"),
    subject: subjectSchema,
    moduleEligibility: z.enum(["any", "module1", "module2"]),
    domain: domainSchema,
    subdomain: z.string().min(2),
    skills: z.array(z.string().min(2)),
    difficulty: difficultySchema,
    stimulus: stimulusSchema.optional(),
    prompt: z.string().min(8),
    promptSuffix: z.string().optional(),
    answerFormat: z.enum(["multiple-choice", "student-response"]),
    choices: z
      .array(z.object({ id: z.enum(["A", "B", "C", "D"]), text: z.string().min(1) }))
      .length(4)
      .optional(),
    correct: z.string().min(1),
    acceptedAnswers: z.array(z.string().min(1)).optional(),
    explanation: z.string().min(20),
    distractorNotes: z.record(z.string()).optional(),
    calculator: z.enum(["recommended", "not-needed"]).optional(),
    source: z.object({
      kind: z.enum(["original", "official-public", "imported"]),
      attribution: z.string().optional(),
      url: z.string().optional(),
      license: z.string().optional(),
    }),
    templateId: z.string().optional(),
    setId: z.string().optional(),
    v: z.literal(1),
  })
  .superRefine((q, ctx) => {
    if (q.answerFormat === "multiple-choice") {
      if (!q.choices) {
        ctx.addIssue({ code: "custom", message: "multiple-choice items need four choices" });
        return;
      }
      if (!q.choices.some((c) => c.id === q.correct)) {
        ctx.addIssue({ code: "custom", message: `correct answer "${q.correct}" is not among the choices` });
      }
      const texts = q.choices.map((c) => c.text);
      if (new Set(texts).size !== texts.length) {
        ctx.addIssue({ code: "custom", message: "choices must be distinct" });
      }
    } else {
      if (q.choices) {
        ctx.addIssue({ code: "custom", message: "student-response items must not have choices" });
      }
      if (!q.acceptedAnswers || q.acceptedAnswers.length === 0) {
        ctx.addIssue({ code: "custom", message: "student-response items need accepted answer forms" });
      } else if (!q.acceptedAnswers.includes(q.correct)) {
        ctx.addIssue({ code: "custom", message: "the canonical answer must appear in acceptedAnswers" });
      }
    }
    if (q.subject === "math" && !q.calculator) {
      ctx.addIssue({ code: "custom", message: "math items must declare a calculator policy" });
    }
    if (q.source.kind !== "original" && !q.source.attribution) {
      ctx.addIssue({ code: "custom", message: "non-original items require source attribution" });
    }
  });

export type ValidatedQuestion = z.infer<typeof questionSchema>;

export const bankSchema = z.object({
  version: z.number().int().positive(),
  generatedAt: z.string(),
  questions: z.array(questionSchema).min(1),
});
