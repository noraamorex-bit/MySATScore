/**
 * Scaled-scoring configuration.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPORTANT — read before changing numbers.
 *
 * College Board does not publish the equating tables used to convert a Digital
 * SAT raw score into the 200–800 section scale, and the conversion genuinely
 * depends on which second module the test taker was routed to. The anchors
 * below are a transparent, documented *model* of that behaviour, not official
 * data. They reproduce the properties that matter for practice:
 *
 *   • a section score is bounded to 200–800 and reported in 10-point steps;
 *   • the upper (harder) second module is the only path to the top of the
 *     scale, which is why routing matters;
 *   • the lower second module compresses toward a ceiling in the low-to-mid
 *     600s, matching widely reported test-taker experience;
 *   • the curve is steepest in the middle of the raw range and flattens at
 *     both ends, like a real equating table.
 *
 * This file is intentionally isolated from the scoring engine so it can be
 * swapped wholesale — replace the anchors (or the whole `SCORING_CONFIG`
 * object) when better verified information is available, and nothing else in
 * the codebase needs to change.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Subject } from "./types";

/** `[rawScore, scaledScore]` anchors; values between anchors are interpolated. */
export type ScaleAnchors = [raw: number, scaled: number][];

export interface SubjectScale {
  /** Maximum raw score for the section (number of scored questions). */
  maxRaw: number;
  lower: ScaleAnchors;
  upper: ScaleAnchors;
}

export interface ScoringConfig {
  /** Version stamp recorded on every attempt so old results stay explainable. */
  version: string;
  label: string;
  /** Section scores are reported in multiples of this value. */
  roundToNearest: number;
  minSectionScore: number;
  maxSectionScore: number;
  scales: Record<Subject, SubjectScale>;
}

export const SCORING_CONFIG: ScoringConfig = {
  version: "2024-dsat-model-v1",
  label: "Digital SAT modelled scale (v1)",
  roundToNearest: 10,
  minSectionScore: 200,
  maxSectionScore: 800,
  scales: {
    rw: {
      maxRaw: 54,
      upper: [
        [0, 200], [3, 230], [6, 280], [9, 330], [12, 375], [15, 415],
        [18, 450], [21, 480], [24, 510], [27, 540], [30, 570], [33, 600],
        [36, 630], [39, 660], [42, 690], [45, 720], [48, 750], [51, 780],
        [53, 795], [54, 800],
      ],
      lower: [
        [0, 200], [3, 220], [6, 255], [9, 290], [12, 325], [15, 355],
        [18, 385], [21, 410], [24, 435], [27, 460], [30, 485], [33, 510],
        [36, 535], [39, 560], [42, 585], [45, 605], [48, 620], [51, 635],
        [54, 650],
      ],
    },
    math: {
      maxRaw: 44,
      upper: [
        [0, 200], [2, 230], [4, 275], [6, 320], [8, 360], [10, 395],
        [12, 425], [14, 455], [16, 485], [18, 515], [20, 545], [22, 575],
        [24, 605], [26, 635], [28, 660], [30, 685], [32, 710], [34, 735],
        [36, 755], [38, 775], [40, 790], [42, 795], [44, 800],
      ],
      lower: [
        [0, 200], [2, 220], [4, 250], [6, 285], [8, 315], [10, 345],
        [12, 370], [14, 395], [16, 420], [18, 445], [20, 470], [22, 490],
        [24, 510], [26, 530], [28, 550], [30, 570], [32, 590], [34, 605],
        [36, 620], [38, 630], [40, 640], [42, 645], [44, 650],
      ],
    },
  },
};

/**
 * Adaptive routing policy. Deterministic by construction: the same module 1
 * responses always produce the same second module, and the thresholds live
 * here rather than being buried in the runtime.
 */
export interface RoutingPolicy {
  version: string;
  /**
   * `raw` routes on the plain number correct.
   * `weighted` gives harder questions more credit, so a student who answers
   * the easy half correctly and misses everything hard is not routed up.
   */
  strategy: "raw" | "weighted";
  /** Points awarded per correct answer under the `weighted` strategy. */
  weights: { easy: number; medium: number; hard: number };
  /**
   * Fraction of the maximum attainable module-1 score needed to route to the
   * upper (harder) second module, per subject.
   */
  upperThreshold: Record<Subject, number>;
}

export const ROUTING_POLICY: RoutingPolicy = {
  version: "dsat-routing-v1",
  strategy: "weighted",
  weights: { easy: 1, medium: 1.35, hard: 1.75 },
  upperThreshold: { rw: 0.6, math: 0.6 },
};
