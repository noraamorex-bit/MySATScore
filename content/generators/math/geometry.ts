/**
 * Geometry and Trigonometry templates (15% of the Math section).
 *
 * Figures are emitted as declarative `FigureStimulus` shapes and rendered to
 * SVG in the app, so they stay crisp on any display and readable in dark mode.
 * Where a figure cannot be drawn to scale from the sampled values it is marked
 * `notToScale`, exactly as the real test does.
 */
import { Rng } from "../rng";
import { ORIGINAL, assertClose, type ItemBody, type Template } from "../types";
import type { FigureShape, FigureStimulus } from "../../../src/lib/sat/types";
import { acceptedNumericForms, buildChoices, frac, num, signed, texFrac } from "../util";
import { NAMES } from "../corpus";

const base = { subject: "math", domain: "geometry-and-trigonometry", source: ORIGINAL } as const;

/** Pythagorean triples used so side lengths stay exact. */
const TRIPLES: [number, number, number][] = [
  [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29],
  [9, 12, 15], [6, 8, 10], [10, 24, 26], [12, 16, 20], [15, 20, 25],
];

function rightTriangleFigure(a: number, b: number, labels: { legA: string; legB: string; hyp: string }): FigureStimulus {
  const scale = 150 / Math.max(a, b);
  const w = Math.round(a * scale);
  const h = Math.round(b * scale);
  const ox = 40;
  const oy = 30 + h;
  const shapes: FigureShape[] = [
    { kind: "polygon", points: [[ox, oy], [ox + w, oy], [ox, oy - h]] },
    { kind: "rightAngle", x: ox, y: oy, dx: 1, dy: -1, size: 14 },
    { kind: "label", x: ox + w / 2, y: oy + 20, text: labels.legA, anchor: "middle", math: true },
    { kind: "label", x: ox - 12, y: oy - h / 2, text: labels.legB, anchor: "end", math: true },
    { kind: "label", x: ox + w / 2 + 16, y: oy - h / 2 - 6, text: labels.hyp, anchor: "start", math: true },
  ];
  return { type: "figure", width: Math.round(ox + w + 60), height: Math.round(oy + 36), shapes };
}

function genericTriangleFigure(vertexLabels: string[], angleLabels: string[]): FigureStimulus {
  const pts: [number, number][] = [[30, 170], [230, 170], [150, 40]];
  const shapes: FigureShape[] = [{ kind: "polygon", points: pts }];
  const offsets: [number, number][] = [[-14, 16], [14, 16], [0, -14]];
  pts.forEach((p, i) => {
    shapes.push({ kind: "label", x: p[0] + offsets[i][0], y: p[1] + offsets[i][1], text: vertexLabels[i], anchor: "middle" });
  });
  const inner: [number, number][] = [[52, 156], [206, 156], [150, 66]];
  inner.forEach((p, i) => {
    if (!angleLabels[i]) return;
    shapes.push({ kind: "label", x: p[0], y: p[1], text: angleLabels[i], anchor: "middle", math: true });
  });
  return { type: "figure", width: 270, height: 200, shapes, notToScale: true };
}

export const GEOMETRY_TEMPLATES: Template[] = [
  {
    ...base,
    id: "m-geo-angles",
    subdomain: "Lines, angles, and triangles",
    skills: ["Angles formed by parallel lines", "Supplementary angles"],
    difficulty: "easy",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const given = rng.int(28, 152);
      const wantCorresponding = rng.bool();
      const answer = wantCorresponding ? given : 180 - given;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(wantCorresponding ? 180 - given : given),
        num(90 - given > 0 ? 90 - given : given / 2),
        num(360 - given),
        num(given + 10),
      ]);
      const shapes: FigureShape[] = [
        { kind: "line", x1: 20, y1: 60, x2: 250, y2: 60 },
        { kind: "line", x1: 20, y1: 140, x2: 250, y2: 140 },
        { kind: "line", x1: 60, y1: 20, x2: 210, y2: 180 },
        { kind: "label", x: 258, y: 64, text: "m", anchor: "start" },
        { kind: "label", x: 258, y: 144, text: "n", anchor: "start" },
        { kind: "label", x: 214, y: 186, text: "t", anchor: "start" },
        { kind: "label", x: 118, y: 50, text: `${given}\\degree`, anchor: "middle", math: true },
        { kind: "label", x: 152, y: 132, text: "x\\degree", anchor: "middle", math: true },
      ];
      return {
        stimulus: {
          type: "figure",
          width: 280,
          height: 200,
          shapes,
          caption: `Lines $m$ and $n$ are parallel and are intersected by line $t$.`,
          notToScale: true,
        },
        prompt:
          `In the figure, lines $m$ and $n$ are parallel and line $t$ is a transversal. ` +
          `The two marked angles are ${wantCorresponding ? "corresponding angles" : "same-side interior angles"}. ` +
          `What is the value of $x$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation: wantCorresponding
          ? `Corresponding angles formed by a transversal cutting parallel lines are congruent, so ` +
            `$x = ${given}$.`
          : `Same-side interior angles formed by a transversal cutting parallel lines are supplementary, ` +
            `so $x + ${given} = 180$ and $x = ${answer}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-tri-angles",
    subdomain: "Lines, angles, and triangles",
    skills: ["Triangle angle sum", "Exterior angle theorem"],
    difficulty: "easy",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = rng.int(25, 80);
      const b = rng.int(25, 180 - a - 25);
      const c = 180 - a - b;
      assertClose(a + b + c, 180, "tri-angles");
      const correct = num(c);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(180 - c),
        num(a + b),
        num(90 - c > 0 ? 90 - c : c + 15),
        num(c + rng.int(5, 20)),
      ]);
      return {
        stimulus: genericTriangleFigure(["A", "B", "C"], [`${a}\\degree`, `${b}\\degree`, "x\\degree"]),
        prompt:
          `In triangle $ABC$ shown, the measure of angle $A$ is $${a}\\degree$ and the measure of angle ` +
          `$B$ is $${b}\\degree$. What is the value of $x$, the measure of angle $C$ in degrees?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The measures of the interior angles of a triangle sum to $180\\degree$, so ` +
          `$${a} + ${b} + x = 180$. Therefore $x = 180 - ${a + b} = ${c}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-similar",
    subdomain: "Lines, angles, and triangles",
    skills: ["Similar triangles", "Proportional sides"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const k = rng.pick([2, 2.5, 3, 4, 1.5]);
      const a = rng.int(3, 12);
      const b = rng.int(3, 12);
      const A = Number((a * k).toFixed(2));
      const B = Number((b * k).toFixed(2));
      const correct = num(B);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(Number((b / k).toFixed(2))),
        num(b + (A - a)),
        num(Number((b * (A / b)).toFixed(2))),
        num(B + rng.int(2, 8)),
      ]);
      return {
        prompt:
          `Triangle $DEF$ is similar to triangle $D'E'F'$, where $D$ corresponds to $D'$ and $E$ ` +
          `corresponds to $E'$. In triangle $DEF$, $DE = ${a}$ and $EF = ${b}$. In triangle ` +
          `$D'E'F'$, $D'E' = ${num(A)}$. What is the length of $E'F'$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Similar triangles have proportional corresponding sides. The scale factor is ` +
          `$\\dfrac{D'E'}{DE} = \\dfrac{${num(A)}}{${a}} = ${num(k)}$. Applying it to $EF$ gives ` +
          `$E'F' = ${b} \\times ${num(k)} = ${num(B)}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-pythag",
    subdomain: "Right triangles and trigonometry",
    skills: ["Pythagorean theorem", "Right triangle side lengths"],
    difficulty: "easy",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const [a, b, c] = rng.pick(TRIPLES);
      assertClose(a * a + b * b, c * c, "pythag");
      const findHyp = rng.bool();
      const answer = findHyp ? c : b;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(findHyp ? a + b : c - a),
        num(findHyp ? Math.abs(b - a) : Math.round(Math.sqrt(c * c + a * a))),
        num(answer + rng.int(2, 6)),
        num(Math.max(1, answer - rng.int(2, 6))),
      ]);
      return {
        stimulus: rightTriangleFigure(a, b, {
          legA: `${a}`,
          legB: findHyp ? `${b}` : "x",
          hyp: findHyp ? "x" : `${c}`,
        }),
        prompt:
          `In the right triangle shown, what is the value of $x$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation: findHyp
          ? `By the Pythagorean theorem, $x^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}$, ` +
            `so $x = ${c}$.`
          : `By the Pythagorean theorem, $${a}^2 + x^2 = ${c}^2$, so $x^2 = ${c * c} - ${a * a} = ${b * b}$ ` +
            `and $x = ${b}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-special",
    subdomain: "Right triangles and trigonometry",
    skills: ["Special right triangles", "30-60-90 and 45-45-90 ratios"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const isIsosceles = rng.bool();
      const leg = rng.int(2, 14);
      if (isIsosceles) {
        const correct = `$${leg}\\sqrt{2}$`;
        const { choices, correct: key } = buildChoices(
          rng,
          correct,
          [`$${leg}\\sqrt{3}$`, `$${2 * leg}$`, `$\\dfrac{${leg}\\sqrt{2}}{2}$`],
          { sortNumeric: false },
        );
        return {
          prompt:
            `In a right triangle, the two acute angles each measure $45\\degree$ and each leg has length ` +
            `$${leg}$. What is the length of the hypotenuse?`,
          answerFormat: "multiple-choice",
          choices,
          correct: key,
          explanation:
            `A $45\\degree$-$45\\degree$-$90\\degree$ triangle has sides in the ratio $1 : 1 : \\sqrt{2}$. ` +
            `With legs of length $${leg}$, the hypotenuse is $${leg}\\sqrt{2}$.`,
        };
      }
      const short = leg;
      const correct = `$${short}\\sqrt{3}$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [`$${short}\\sqrt{2}$`, `$${2 * short}$`, `$\\dfrac{${short}\\sqrt{3}}{2}$`],
        { sortNumeric: false },
      );
      return {
        prompt:
          `In a right triangle, the acute angles measure $30\\degree$ and $60\\degree$. The side opposite ` +
          `the $30\\degree$ angle has length $${short}$. What is the length of the side opposite the ` +
          `$60\\degree$ angle?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `A $30\\degree$-$60\\degree$-$90\\degree$ triangle has sides in the ratio ` +
          `$1 : \\sqrt{3} : 2$, where $1$ is opposite the $30\\degree$ angle. Since that side is ` +
          `$${short}$, the side opposite the $60\\degree$ angle is $${short}\\sqrt{3}$ and the ` +
          `hypotenuse is $${2 * short}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-trig",
    subdomain: "Right triangles and trigonometry",
    skills: ["Sine, cosine, and tangent", "SOH-CAH-TOA"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 14,
    build(rng: Rng): ItemBody {
      const [a, b, c] = rng.pick(TRIPLES);
      const fn = rng.pick(["\\sin", "\\cos", "\\tan"] as const);
      // Angle theta is at the vertex between leg `a` and the hypotenuse.
      const value = fn === "\\sin" ? frac(b, c) : fn === "\\cos" ? frac(a, c) : frac(b, a);
      const correct = texFrac(value);
      const alternatives = [frac(a, c), frac(b, c), frac(b, a), frac(a, b), frac(c, a)]
        .filter((f) => f.n !== value.n || f.d !== value.d)
        .map((f) => `$${texFrac(f)}$`);
      const { choices, correct: key } = buildChoices(rng, `$${correct}$`, alternatives, {
        sortNumeric: false,
      });
      // Show the reduction only when the raw ratio is not already in lowest terms.
      const show = (n: number, d: number) =>
        `\\dfrac{${n}}{${d}}` === correct ? correct : `\\dfrac{${n}}{${d}} = ${correct}`;
      return {
        stimulus: rightTriangleFigure(a, b, { legA: `${a}`, legB: `${b}`, hyp: `${c}` }),
        prompt:
          `In the right triangle shown, $\\theta$ is the measure of the angle formed by the side of ` +
          `length $${a}$ and the hypotenuse. What is the value of $${fn}(\\theta)$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Relative to $\\theta$, the opposite side has length $${b}$, the adjacent side has length ` +
          `$${a}$, and the hypotenuse has length $${c}$. ` +
          (fn === "\\sin"
            ? `Sine is opposite over hypotenuse: $${show(b, c)}$.`
            : fn === "\\cos"
              ? `Cosine is adjacent over hypotenuse: $${show(a, c)}$.`
              : `Tangent is opposite over adjacent: $${show(b, a)}$.`),
      };
    },
  },
  {
    ...base,
    id: "m-geo-trig-comp",
    subdomain: "Right triangles and trigonometry",
    skills: ["Complementary angle identity", "sin(x) = cos(90 - x)"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const deg = rng.int(12, 78);
      const complement = 90 - deg;
      const correct = num(complement);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(deg),
        num(180 - deg),
        num(90 + deg),
        num(complement + rng.int(3, 12)),
      ]);
      return {
        prompt:
          `In a right triangle, the measure of one acute angle is $${deg}\\degree$. If ` +
          `$\\sin(${deg}\\degree) = \\cos(k\\degree)$ for some $0 < k < 90$, what is the value of $k$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `In a right triangle the two acute angles are complementary, and the sine of one equals the ` +
          `cosine of the other: $\\sin(\\theta) = \\cos(90\\degree - \\theta)$. ` +
          `So $k = 90 - ${deg} = ${complement}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-circle-basic",
    subdomain: "Circles",
    skills: ["Area and circumference of a circle"],
    difficulty: "easy",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      // r = 2 would make the area and circumference both 4*pi, collapsing two options.
      const r = rng.int(3, 15);
      const wantArea = rng.bool();
      const correct = wantArea ? `$${r * r}\\pi$` : `$${2 * r}\\pi$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          wantArea ? `$${2 * r}\\pi$` : `$${r * r}\\pi$`,
          `$${r}\\pi$`,
          `$${4 * r}\\pi$`,
          `$${2 * r * r}\\pi$`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt:
          `A circle in the xy-plane has a radius of $${r}$. What is the ` +
          `${wantArea ? "area" : "circumference"} of the circle?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation: wantArea
          ? `The area of a circle is $A = \\pi r^2$. With $r = ${r}$, $A = \\pi(${r})^2 = ${r * r}\\pi$.`
          : `The circumference of a circle is $C = 2\\pi r$. With $r = ${r}$, $C = 2\\pi(${r}) = ${2 * r}\\pi$.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-circle-eq",
    subdomain: "Circles",
    skills: ["Equation of a circle", "Center and radius"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const h = rng.intExcept(-8, 8, [0]);
      const k = rng.intExcept(-8, 8, [0]);
      const r = rng.int(2, 11);
      const askCenter = rng.bool();
      if (askCenter) {
        const correct = `$(${h}, ${k})$`;
        const { choices, correct: key } = buildChoices(
          rng,
          correct,
          [`$(${-h}, ${-k})$`, `$(${-h}, ${k})$`, `$(${h}, ${-k})$`],
          { sortNumeric: false },
        );
        return {
          prompt:
            `$(x ${signed(-h)})^2 + (y ${signed(-k)})^2 = ${r * r}$\n\n` +
            `The given equation defines a circle in the xy-plane. What are the coordinates of the ` +
            `center of the circle?`,
          answerFormat: "multiple-choice",
          choices,
          correct: key,
          explanation:
            `In the standard form $(x - h)^2 + (y - k)^2 = r^2$, the center is $(h, k)$. ` +
            `Matching terms, $h = ${h}$ and $k = ${k}$, so the center is $(${h}, ${k})$. ` +
            `The radius is $\\sqrt{${r * r}} = ${r}$.`,
        };
      }
      const correct = num(r);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(r * r),
        num(2 * r),
        num(Math.round(r / 2)),
        num(r + rng.int(2, 5)),
      ]);
      return {
        prompt:
          `$(x ${signed(-h)})^2 + (y ${signed(-k)})^2 = ${r * r}$\n\n` +
          `The given equation defines a circle in the xy-plane. What is the radius of the circle?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `In the standard form $(x - h)^2 + (y - k)^2 = r^2$, the right side is the *square* of the ` +
          `radius. Since $r^2 = ${r * r}$, the radius is $r = ${r}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-arc",
    subdomain: "Circles",
    skills: ["Arc length", "Sector area", "Central angles"],
    difficulty: "hard",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const r = rng.pick([3, 4, 6, 8, 9, 12]);
      const angle = rng.pick([30, 45, 60, 90, 120, 135, 150]);
      const fraction = frac(angle, 360);
      const wantArc = rng.bool();
      const arcNum = frac(angle * 2 * r, 360);
      const sectorNum = frac(angle * r * r, 360);
      const value = wantArc ? arcNum : sectorNum;
      const correct = `$${texFrac(value)}\\pi$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `$${texFrac(wantArc ? sectorNum : arcNum)}\\pi$`,
          `$${texFrac(frac(angle, 360))}\\pi$`,
          `$${wantArc ? 2 * r : r * r}\\pi$`,
          `$${texFrac(frac(value.n * 2, value.d))}\\pi$`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt:
          `A sector of a circle with radius $${r}$ has a central angle of $${angle}\\degree$. ` +
          `What is the ${wantArc ? "length of the arc bounding this sector" : "area of the sector"}?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The sector is $\\dfrac{${angle}}{360} = ${texFrac(fraction)}$ of the full circle. ` +
          (wantArc
            ? `The full circumference is $2\\pi(${r}) = ${2 * r}\\pi$, so the arc length is ` +
              `$${texFrac(fraction)} \\times ${2 * r}\\pi = ${texFrac(arcNum)}\\pi$.`
            : `The full area is $\\pi(${r})^2 = ${r * r}\\pi$, so the sector area is ` +
              `$${texFrac(fraction)} \\times ${r * r}\\pi = ${texFrac(sectorNum)}\\pi$.`),
      };
    },
  },
  {
    ...base,
    id: "m-geo-volume",
    subdomain: "Area and volume",
    skills: ["Volume of solids", "Applying volume formulas"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 14,
    build(rng: Rng): ItemBody {
      const kind = rng.pick(["cylinder", "rectangular prism", "cone", "sphere"] as const);
      if (kind === "rectangular prism") {
        const l = rng.int(3, 15), w = rng.int(3, 15), h = rng.int(3, 15);
        const v = l * w * h;
        const { choices, correct: key } = buildChoices(rng, num(v), [
          num(2 * (l * w + l * h + w * h)),
          num(l + w + h),
          num(l * w),
          num(v / 3),
        ]);
        return {
          prompt:
            `A storage box is a rectangular prism with length $${l}$ inches, width $${w}$ inches, and ` +
            `height $${h}$ inches. What is the volume, in cubic inches, of the box?`,
          answerFormat: "multiple-choice",
          choices,
          correct: key,
          explanation: `The volume of a rectangular prism is $V = \\ell w h = ${l} \\times ${w} \\times ${h} = ${v}$ cubic inches.`,
        };
      }
      const r = rng.int(2, 10);
      const h = rng.int(3, 18);
      if (kind === "cylinder") {
        const correct = `$${r * r * h}\\pi$`;
        const { choices, correct: key } = buildChoices(
          rng,
          correct,
          [`$${2 * r * h}\\pi$`, `$${r * h}\\pi$`, `$${num((r * r * h) / 3)}\\pi$`, `$${r * r}\\pi$`],
          { sortNumeric: false },
        );
        return {
          prompt:
            `A right circular cylinder has a radius of $${r}$ centimeters and a height of $${h}$ ` +
            `centimeters. What is the volume, in cubic centimeters, of the cylinder?`,
          answerFormat: "multiple-choice",
          choices,
          correct: key,
          explanation: `The volume of a cylinder is $V = \\pi r^2 h = \\pi(${r})^2(${h}) = ${r * r * h}\\pi$ cubic centimeters.`,
        };
      }
      if (kind === "cone") {
        const vFrac = frac(r * r * h, 3);
        const correct = `$${texFrac(vFrac)}\\pi$`;
        const { choices, correct: key } = buildChoices(
          rng,
          correct,
          [`$${r * r * h}\\pi$`, `$${texFrac(frac(r * r * h, 2))}\\pi$`, `$${r * h}\\pi$`, `$${texFrac(frac(r * h, 3))}\\pi$`],
          { sortNumeric: false },
        );
        return {
          prompt:
            `A right circular cone has a radius of $${r}$ meters and a height of $${h}$ meters. ` +
            `What is the volume, in cubic meters, of the cone?`,
          answerFormat: "multiple-choice",
          choices,
          correct: key,
          explanation:
            `The volume of a cone is $V = \\dfrac{1}{3}\\pi r^2 h = \\dfrac{1}{3}\\pi(${r})^2(${h}) = ` +
            `${texFrac(vFrac)}\\pi$ cubic meters — one third of the cylinder with the same base and height.`,
        };
      }
      const vFrac = frac(4 * r * r * r, 3);
      const correct = `$${texFrac(vFrac)}\\pi$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [`$${4 * r * r}\\pi$`, `$${r * r * r}\\pi$`, `$${texFrac(frac(4 * r * r, 3))}\\pi$`, `$${4 * r * r * r}\\pi$`],
        { sortNumeric: false },
      );
      return {
        prompt: `A sphere has a radius of $${r}$ units. What is the volume of the sphere?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The volume of a sphere is $V = \\dfrac{4}{3}\\pi r^3 = \\dfrac{4}{3}\\pi(${r})^3 = ` +
          `${texFrac(vFrac)}\\pi$ cubic units.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-scale",
    subdomain: "Area and volume",
    skills: ["Scaling area and volume", "Similar solids"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const k = rng.pick([2, 3, 4, 5]);
      const isVolume = rng.bool();
      const factor = isVolume ? k ** 3 : k ** 2;
      const correct = num(factor);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(k),
        num(isVolume ? k ** 2 : k ** 3),
        num(k * 2),
        num(factor + k),
      ]);
      return {
        prompt:
          `Two solids are similar, and every linear dimension of the larger solid is $${k}$ times the ` +
          `corresponding dimension of the smaller solid. The ${isVolume ? "volume" : "surface area"} ` +
          `of the larger solid is how many times the ${isVolume ? "volume" : "surface area"} of the ` +
          `smaller solid?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation: isVolume
          ? `Volume scales with the cube of the linear scale factor, because volume is a product of ` +
            `three lengths. So the ratio is $${k}^3 = ${factor}$.`
          : `Surface area scales with the square of the linear scale factor, because area is a product ` +
            `of two lengths. So the ratio is $${k}^2 = ${factor}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-coord",
    subdomain: "Lines, angles, and triangles",
    skills: ["Distance formula", "Midpoint"],
    difficulty: "easy",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const [a, b, c] = rng.pick(TRIPLES);
      const x1 = rng.int(-8, 6);
      const y1 = rng.int(-8, 6);
      const x2 = x1 + a;
      const y2 = y1 + b;
      assertClose(Math.hypot(x2 - x1, y2 - y1), c, "coord-distance");
      const correct = num(c);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(a + b),
        num(Math.abs(b - a)),
        num(c + rng.int(2, 7)),
        num(Math.max(1, c - rng.int(2, 7))),
      ]);
      return {
        prompt:
          `In the xy-plane, what is the distance between the points $(${x1}, ${y1})$ and $(${x2}, ${y2})$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The horizontal change is $${x2} - (${x1}) = ${a}$ and the vertical change is ` +
          `$${y2} - (${y1}) = ${b}$. By the distance formula, ` +
          `$d = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a * a + b * b}} = ${c}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-radian",
    subdomain: "Circles",
    skills: ["Radian and degree conversion"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const deg = rng.pick([30, 45, 60, 90, 120, 135, 150, 180, 210, 240, 270, 300, 315]);
      const r = frac(deg, 180);
      const correct = r.d === 1 ? `$${r.n === 1 ? "" : r.n}\\pi$` : `$${texFrac(r)}\\pi$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `$${texFrac(frac(180, deg))}\\pi$`,
          `$${texFrac(frac(r.n * 2, r.d))}\\pi$`,
          `$${texFrac(frac(r.n, r.d * 2))}\\pi$`,
          `$${texFrac(frac(deg, 360))}\\pi$`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt: `An angle has a measure of $${deg}\\degree$. What is the measure of this angle, in radians?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Because $180\\degree = \\pi$ radians, multiply by $\\dfrac{\\pi}{180}$: ` +
          `$${deg} \\cdot \\dfrac{\\pi}{180} = ${texFrac(r)}\\pi$ radians.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-inscribed",
    subdomain: "Circles",
    skills: ["Central and inscribed angles", "Arc measure"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const inscribed = rng.int(15, 80);
      const central = 2 * inscribed;
      const fromInscribed = rng.bool();
      const answer = fromInscribed ? central : inscribed;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(fromInscribed ? inscribed : central),
        num(180 - answer),
        num(90 - answer > 0 ? 90 - answer : answer + 30),
        num(answer + rng.int(5, 20)),
      ]);
      return {
        prompt: fromInscribed
          ? `In a circle, an inscribed angle intercepts an arc. The inscribed angle measures ` +
            `$${inscribed}\\degree$. What is the measure, in degrees, of the intercepted arc?`
          : `In a circle, a central angle intercepts an arc of measure $${central}\\degree$. What is the ` +
            `measure, in degrees, of an inscribed angle that intercepts the same arc?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `An inscribed angle measures half the arc it intercepts, and a central angle measures the ` +
          `full arc. ` +
          (fromInscribed
            ? `So the arc is $2 \\times ${inscribed} = ${central}$ degrees.`
            : `So the inscribed angle is $\\dfrac{${central}}{2} = ${inscribed}$ degrees.`),
      };
    },
  },
  {
    ...base,
    id: "m-geo-spr-area",
    subdomain: "Area and volume",
    skills: ["Composite area", "Student-produced response"],
    difficulty: "hard",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const side = rng.int(8, 24);
      const cut = rng.int(2, Math.floor(side / 2) - 1);
      const answer = side * side - cut * cut;
      const name = rng.pick(NAMES);
      return {
        stimulus: {
          type: "figure",
          width: 260,
          height: 220,
          notToScale: true,
          shapes: [
            { kind: "polygon", points: [[30, 30], [210, 30], [210, 190], [30, 190]] },
            { kind: "polygon", points: [[150, 130], [210, 130], [210, 190], [150, 190]], fill: true },
            { kind: "label", x: 120, y: 20, text: `${side}`, anchor: "middle" },
            { kind: "label", x: 222, y: 110, text: `${side}`, anchor: "start" },
            { kind: "label", x: 180, y: 205, text: `${cut}`, anchor: "middle" },
          ],
          caption: "The shaded square is removed from the corner of the larger square.",
        },
        prompt:
          `${name} cuts a square of side length $${cut}$ centimeters from one corner of a square sheet ` +
          `of side length $${side}$ centimeters, as shown. What is the area, in square centimeters, of ` +
          `the remaining piece?`,
        answerFormat: "student-response",
        correct: num(answer),
        acceptedAnswers: acceptedNumericForms(answer),
        explanation:
          `The large square has area $${side}^2 = ${side * side}$ square centimeters and the removed ` +
          `square has area $${cut}^2 = ${cut * cut}$ square centimeters. The remaining area is ` +
          `$${side * side} - ${cut * cut} = ${answer}$ square centimeters.`,
      };
    },
  },
  {
    ...base,
    id: "m-geo-spr-angle",
    subdomain: "Lines, angles, and triangles",
    skills: ["Isosceles triangles", "Angle relationships", "Student-produced response"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const vertex = rng.int(20, 140) - (rng.int(20, 140) % 2);
      const bases = (180 - vertex) / 2;
      assertClose(vertex + 2 * bases, 180, "isosceles");
      return {
        stimulus: genericTriangleFigure(["P", "Q", "R"], ["x\\degree", "x\\degree", `${vertex}\\degree`]),
        prompt:
          `In isosceles triangle $PQR$ shown, $PR = QR$ and the measure of angle $R$ is ` +
          `$${vertex}\\degree$. What is the value of $x$?`,
        answerFormat: "student-response",
        correct: num(bases),
        acceptedAnswers: acceptedNumericForms(bases),
        explanation:
          `In an isosceles triangle the angles opposite the congruent sides are congruent, so both base ` +
          `angles measure $x\\degree$. Since the angles sum to $180\\degree$, $2x + ${vertex} = 180$, ` +
          `giving $x = ${bases}$.`,
      };
    },
  },
];
