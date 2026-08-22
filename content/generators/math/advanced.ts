/**
 * Advanced Math templates (35% of the Math section): quadratics, polynomials,
 * exponential models, radicals, rational expressions, and function notation.
 */
import { Rng } from "../rng";
import { ORIGINAL, assertClose, type ItemBody, type Template } from "../types";
import {
  acceptedNumericForms, buildChoices, factorOf, frac, joinTerms, linear, money,
  num, quadratic, signed, term, texFrac,
} from "../util";
import { CITY_SETTINGS, MEASURED_QUANTITIES, NAMES, SPECIES, TIME_UNITS } from "../corpus";

const base = { subject: "math", domain: "advanced-math", source: ORIGINAL } as const;

/** Distinct small integer roots, so factoring stays clean. */
function roots(rng: Rng): [number, number] {
  const r1 = rng.intExcept(-9, 9, [0]);
  const r2 = rng.intExcept(-9, 9, [0, r1]);
  return [r1, r2];
}

export const ADVANCED_TEMPLATES: Template[] = [
  {
    ...base,
    id: "m-adv-factor",
    subdomain: "Nonlinear equations in one variable",
    skills: ["Factoring quadratics", "Zero product property"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 16,
    build(rng: Rng): ItemBody {
      const [r1, r2] = roots(rng);
      const b = -(r1 + r2);
      const c = r1 * r2;
      assertClose(r1 * r1 + b * r1 + c, 0, "factor-root1");
      const larger = Math.max(r1, r2);
      const correct = num(larger);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(Math.min(r1, r2)),
        num(-larger === larger ? larger + 3 : -larger),
        num(c),
        num(b),
      ]);
      return {
        prompt: `$${quadratic(1, b, c)} = 0$\n\nWhat is the greatest solution to the given equation?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Factor the left side as $${factorOf(r1)}${factorOf(r2)} = 0$. By the zero product property, ` +
          `$x = ${r1}$ or $x = ${r2}$, so the greatest solution is $${larger}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-quadform",
    subdomain: "Nonlinear equations in one variable",
    skills: ["Quadratic formula", "Sum and product of roots"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 14,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 5);
      const b = rng.intExcept(-14, 14, [0]);
      const c = rng.intExcept(-16, 16, [0]);
      const disc = b * b - 4 * a * c;
      if (disc <= 0) {
        // Force two real solutions by flipping the sign of c.
        const c2 = -Math.abs(c);
        const sum = frac(-b, a);
        return {
          prompt:
            `$${quadratic(a, b, c2)} = 0$\n\nIf $x_1$ and $x_2$ are the two solutions to the given ` +
            `equation, what is the value of $x_1 + x_2$?`,
          answerFormat: "student-response",
          correct: (sum.d === 1 ? num(sum.n) : `${sum.n}/${sum.d}`),
          acceptedAnswers: acceptedNumericForms(sum),
          explanation:
            `For $ax^2 + bx + c = 0$, the sum of the solutions is $-\\dfrac{b}{a}$. ` +
            `Here $a = ${a}$ and $b = ${b}$, so $x_1 + x_2 = ${texFrac(sum)}$.`,
        };
      }
      const correct = num(disc);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(b * b + 4 * a * c),
        num(b * b - 4 * c),
        num(Math.sqrt(disc)),
        num(-disc),
      ]);
      const solutions = disc > 0 ? (Number.isInteger(Math.sqrt(disc)) ? "two rational solutions" : "two irrational solutions") : "no real solutions";
      return {
        prompt:
          `$${quadratic(a, b, c)} = 0$\n\nWhat is the value of the discriminant, $b^2 - 4ac$, ` +
          `of the given quadratic equation?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Here $a = ${a}$, $b = ${b}$, and $c = ${c}$, so ` +
          `$b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${b * b} - (${4 * a * c}) = ${disc}$. ` +
          `Because the discriminant is positive, the equation has ${solutions}.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-vertex",
    subdomain: "Nonlinear functions",
    skills: ["Vertex of a parabola", "Completing the square"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 14,
    build(rng: Rng): ItemBody {
      const a = rng.pick([1, 1, 2, -1, -2, 3]);
      const h = rng.intExcept(-8, 8, [0]);
      const k = rng.intExcept(-20, 20, [0]);
      // f(x) = a(x - h)^2 + k  ->  standard form
      const b = -2 * a * h;
      const c = a * h * h + k;
      assertClose(a * h * h + b * h + c, k, "vertex");
      const askMin = a > 0;
      const correct = `$(${h}, ${k})$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [`$(${-h}, ${k})$`, `$(${h}, ${-k})$`, `$(${k}, ${h})$`, `$(${num(b)}, ${num(c)})$`],
        { sortNumeric: false },
      );
      return {
        prompt:
          `The function $f$ is defined by $f(x) = ${quadratic(a, b, c)}$. What is the vertex of the ` +
          `graph of $y = f(x)$ in the xy-plane?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Rewriting in vertex form gives $f(x) = ${a === 1 ? "" : a === -1 ? "-" : a}(x ${signed(-h)})^2 ${signed(k)}$, ` +
          `so the vertex is $(${h}, ${k})$. Equivalently, the x-coordinate is ` +
          `$-\\dfrac{b}{2a} = -\\dfrac{${b}}{${2 * a}} = ${h}$, and $f(${h}) = ${k}$. ` +
          `Because $a ${a > 0 ? ">" : "<"} 0$, this point is the ${askMin ? "minimum" : "maximum"} of $f$.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-zeros",
    subdomain: "Nonlinear functions",
    skills: ["Zeros of a polynomial", "Factored form"],
    difficulty: "easy",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const [r1, r2] = roots(rng);
      const a = rng.pick([1, 2, 3, 5]);
      const sum = r1 + r2;
      const correct = num(sum);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(-sum === sum ? sum + 4 : -sum),
        num(r1 * r2),
        num(r1 - r2),
        num(a * sum),
      ]);
      return {
        prompt:
          `The function $p$ is defined by $p(x) = ${a === 1 ? "" : a}${factorOf(r1)}${factorOf(r2)}$. ` +
          `What is the sum of the zeros of $p$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `A zero occurs where a factor equals $0$: $x ${signed(-r1)} = 0$ gives $x = ${r1}$, and ` +
          `$x ${signed(-r2)} = 0$ gives $x = ${r2}$. The constant factor $${a}$ does not affect the zeros. ` +
          `Their sum is $${r1} + (${r2}) = ${sum}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-exp-model",
    subdomain: "Nonlinear functions",
    skills: ["Exponential growth and decay", "Modeling with exponential functions"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 14,
    build(rng: Rng): ItemBody {
      const species = rng.pick(SPECIES);
      const t = rng.pick(TIME_UNITS);
      const start = rng.int(2, 40) * 25;
      const growing = rng.bool();
      const pct = rng.pick([2, 3, 4, 5, 8, 10, 12, 15, 20, 25]);
      const factor = growing ? 1 + pct / 100 : 1 - pct / 100;
      const correct = `$P(t) = ${start}(${num(factor)})^{t}$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `$P(t) = ${start}(${num(growing ? 1 - pct / 100 : 1 + pct / 100)})^{t}$`,
          `$P(t) = ${start}(${num(pct / 100)})^{t}$`,
          `$P(t) = ${start} ${growing ? "+" : "-"} ${num((start * pct) / 100)}t$`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt:
          `A population of ${species} in a laboratory culture is initially $${start}$ organisms. ` +
          `Each ${t.singular}, the population ${growing ? "increases" : "decreases"} by $${pct}\\%$ of its ` +
          `value at the start of that ${t.singular}. Which function models the population $P(t)$ after ` +
          `$t$ ${t.plural}?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `A constant percent change each period is exponential, not linear. ` +
          `${growing ? "Growing" : "Shrinking"} by $${pct}\\%$ multiplies the population by ` +
          `$1 ${growing ? "+" : "-"} ${num(pct / 100)} = ${num(factor)}$ each ${t.singular}, so ` +
          `$P(t) = ${start}(${num(factor)})^{t}$.`,
        distractorNotes: {
          linear: "The linear option would mean a constant number of organisms is added or removed each period, not a constant percent.",
        },
      };
    },
  },
  {
    ...base,
    id: "m-adv-exp-interp",
    subdomain: "Nonlinear functions",
    skills: ["Interpreting exponential parameters", "Growth rate from a base"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const city = rng.pick(CITY_SETTINGS);
      const start = rng.int(3, 30) * 1000;
      const pct = rng.pick([3, 4, 6, 7, 8, 12, 15]);
      const periodsPerYear = rng.pick([2, 3, 4, 6]);
      const factor = 1 + pct / 100;
      const answer = `$${pct}\\%$ every $${num(12 / periodsPerYear)}$ months`;
      const { choices, correct: key } = buildChoices(
        rng,
        answer,
        [
          `$${pct}\\%$ every year`,
          `$${num(pct * periodsPerYear)}\\%$ every $${num(12 / periodsPerYear)}$ months`,
          `$${num(factor * 100)}\\%$ every $${num(12 / periodsPerYear)}$ months`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt:
          `The number of households in ${city} subscribing to a municipal broadband service is modeled by ` +
          `$N(t) = ${start}(${num(factor)})^{${periodsPerYear}t}$, where $t$ is the number of years since ` +
          `the service launched. Which statement best describes the growth of $N$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The exponent is $${periodsPerYear}t$, so the base $${num(factor)}$ is applied $${periodsPerYear}$ ` +
          `times per year — that is, once every $\\dfrac{12}{${periodsPerYear}} = ${num(12 / periodsPerYear)}$ months. ` +
          `A base of $${num(factor)}$ is a $${pct}\\%$ increase, so the number of subscribers grows by ` +
          `$${pct}\\%$ every $${num(12 / periodsPerYear)}$ months.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-radical",
    subdomain: "Nonlinear equations in one variable",
    skills: ["Radical equations", "Extraneous solutions"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const r = rng.int(2, 11);
      const a = rng.int(2, 6);
      const b = rng.intExcept(-12, 12, [0]);
      // sqrt(a x + b) = r  ->  x = (r^2 - b)/a
      const x = (r * r - b) / a;
      if (!Number.isInteger(x)) {
        const b2 = r * r - a * rng.int(1, 12);
        const x2 = (r * r - b2) / a;
        assertClose(Math.sqrt(a * x2 + b2), r, "radical-alt");
        return radicalItem(rng, a, b2, r, x2);
      }
      assertClose(Math.sqrt(a * x + b), r, "radical");
      return radicalItem(rng, a, b, r, x);
    },
  },
  {
    ...base,
    id: "m-adv-rational",
    subdomain: "Nonlinear equations in one variable",
    skills: ["Rational equations", "Restricted domain values"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const p = rng.intExcept(-8, 8, [0]);
      const k = rng.int(2, 9);
      const x = rng.intExcept(-10, 12, [0, -p]);
      // k/(x + p) = m  ->  m = k/(x+p); choose x so m is tidy.
      const denom = x + p;
      const mFrac = frac(k, denom);
      const correct = num(x);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(-p),
        num(x + rng.int(1, 4)),
        num(k - p),
        num(-x === x ? x + 5 : -x),
      ]);
      return {
        prompt:
          `$\\dfrac{${k}}{x ${signed(p)}} = ${texFrac(mFrac)}$\n\nWhat value of $x$ satisfies the given equation?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Cross multiply: $${k} \\cdot ${mFrac.d} = ${mFrac.n}(x ${signed(p)})$, so ` +
          `$${k * mFrac.d} = ${mFrac.n}x ${signed(mFrac.n * p)}$ and $x = ${x}$. ` +
          `Note that $x = ${-p}$ must be excluded because it makes the denominator zero.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-compose",
    subdomain: "Nonlinear functions",
    skills: ["Function notation", "Composition of functions"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 14,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 6);
      const b = rng.intExcept(-9, 9, [0]);
      const c = rng.pick([1, 2, 3]);
      const d = rng.intExcept(-9, 9, [0]);
      const input = rng.intExcept(-5, 6, [0]);
      const gVal = c * input * input + d;
      const answer = a * gVal + b;
      assertClose(a * (c * input * input + d) + b, answer, "compose");
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(c * (a * input + b) ** 2 + d),
        num(gVal),
        num(a * input + b),
        num(answer + rng.int(2, 9)),
      ]);
      return {
        prompt:
          `The functions $f$ and $g$ are defined by $f(x) = ${linear(a, b)}$ and ` +
          `$g(x) = ${quadratic(c, 0, d)}$. What is the value of $f(g(${input}))$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `First evaluate the inner function: $g(${input}) = ${c}(${input})^2 ${signed(d)} = ${gVal}$. ` +
          `Then $f(${gVal}) = ${a}(${gVal}) ${signed(b)} = ${answer}$.`,
        distractorNotes: {
          order: "Evaluating $g(f(x))$ instead of $f(g(x))$ reverses the composition and gives a different value.",
        },
      };
    },
  },
  {
    ...base,
    id: "m-adv-transform",
    subdomain: "Nonlinear functions",
    skills: ["Function transformations", "Translations of graphs"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const h = rng.int(1, 7);
      const k = rng.int(1, 9);
      const right = rng.bool();
      const up = rng.bool();
      const inner = right ? `x - ${h}` : `x + ${h}`;
      const outer = up ? `+ ${k}` : `- ${k}`;
      const correct = `$g(x) = f(${inner}) ${outer}$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `$g(x) = f(${right ? `x + ${h}` : `x - ${h}`}) ${outer}$`,
          `$g(x) = f(${inner}) ${up ? `- ${k}` : `+ ${k}`}$`,
          `$g(x) = f(${right ? `x + ${h}` : `x - ${h}`}) ${up ? `- ${k}` : `+ ${k}`}$`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt:
          `The graph of $y = g(x)$ is the graph of $y = f(x)$ translated $${h}$ units ` +
          `${right ? "to the right" : "to the left"} and $${k}$ units ${up ? "up" : "down"}. ` +
          `Which equation defines $g$ in terms of $f$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `A horizontal shift of $${h}$ units ${right ? "right" : "left"} replaces $x$ with ` +
          `$${inner}$ — horizontal translations move opposite the sign inside the function. ` +
          `A vertical shift of $${k}$ units ${up ? "up" : "down"} adds $${up ? k : -k}$ outside the function. ` +
          `So $g(x) = f(${inner}) ${outer}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-exponents",
    subdomain: "Equivalent expressions",
    skills: ["Exponent rules", "Rational exponents"],
    difficulty: "easy",
    calculator: "not-needed",
    variants: 14,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 9);
      const b = rng.intExcept(2, 9, [a]);
      const m = rng.int(2, 7);
      const n = rng.intExcept(2, 7, [m]);
      const correct = `$${a * b}x^{${m + n}}$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `$${a * b}x^{${m * n}}$`,
          `$${a + b}x^{${m + n}}$`,
          `$${a * b}x^{${Math.abs(m - n)}}$`,
          `$${a + b}x^{${m * n}}$`,
          `$${a * b}x^{${m + n + 1}}$`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt: `Which expression is equivalent to $(${a}x^{${m}})(${b}x^{${n}})$, where $x > 0$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Multiply the coefficients and add the exponents: $${a} \\cdot ${b} = ${a * b}$ and ` +
          `$x^{${m}} \\cdot x^{${n}} = x^{${m} + ${n}} = x^{${m + n}}$, so the product is $${a * b}x^{${m + n}}$.`,
        distractorNotes: {
          trap: "Exponents are added when powers with the same base are multiplied; they are multiplied only when a power is raised to a power.",
        },
      };
    },
  },
  {
    ...base,
    id: "m-adv-remainder",
    subdomain: "Nonlinear functions",
    skills: ["Factor theorem", "Evaluating polynomials"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const r = rng.intExcept(-6, 6, [0]);
      const a = rng.int(1, 4);
      const b = rng.intExcept(-8, 8, [0]);
      const c = rng.intExcept(-15, 15, [0]);
      // p(x) = a x^2 + b x + c ; p(r) is the remainder when divided by (x - r).
      const value = a * r * r + b * r + c;
      const correct = num(value);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(a * r * r - b * r + c),
        num(c),
        num(a + b + c),
        num(-value === value ? value + 7 : -value),
      ]);
      return {
        prompt:
          `The polynomial $p$ is defined by $p(x) = ${quadratic(a, b, c)}$. What is the remainder when ` +
          `$p(x)$ is divided by $x ${signed(-r)}$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `By the remainder theorem, dividing $p(x)$ by $x ${signed(-r)}$ leaves a remainder of $p(${r})$. ` +
          `Evaluating: $p(${r}) = ${a}(${r})^2 ${signed(b)}(${r}) ${signed(c)} = ${value}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-quadlinear",
    subdomain: "Systems of equations in two variables",
    skills: ["Quadratic-linear systems", "Intersection points"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const [r1, r2] = roots(rng);
      const m = rng.intExcept(-4, 4, [0]);
      const c = rng.intExcept(-8, 8, [0]);
      // y = x^2 + bx + k and y = m x + c intersect where x^2 + (b-m)x + (k-c) = 0
      // Pick roots first, then work backwards.
      const b = -(r1 + r2) + m;
      const k = r1 * r2 + c;
      assertClose(r1 * r1 + b * r1 + k, m * r1 + c, "quadlinear");
      const answer = r1 * r2;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(r1 + r2),
        num(k),
        num(-answer === answer ? answer + 6 : -answer),
        num(r1 - r2),
      ]);
      return {
        prompt:
          `$$\\begin{cases} y = ${quadratic(1, b, k)} \\\\ y = ${linear(m, c)} \\end{cases}$$\n\n` +
          `The graphs of the equations in the given system intersect at two points, $(x_1, y_1)$ and ` +
          `$(x_2, y_2)$. What is the value of $x_1 x_2$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Set the expressions for $y$ equal: $${quadratic(1, b, k)} = ${linear(m, c)}$. ` +
          `Rearranging gives $${quadratic(1, b - m, k - c)} = 0$, which factors as ` +
          `$${factorOf(r1)}${factorOf(r2)} = 0$. The x-coordinates are $${r1}$ and $${r2}$, ` +
          `so their product is $${answer}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-projectile",
    subdomain: "Nonlinear functions",
    skills: ["Maximum of a quadratic", "Quadratic models in context"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = -rng.pick([4, 5, 8, 16]);
      const tPeak = rng.pick([1, 1.5, 2, 2.5, 3]);
      const b = -2 * a * tPeak;
      const c = rng.int(2, 40);
      const peak = a * tPeak * tPeak + b * tPeak + c;
      assertClose(-b / (2 * a), tPeak, "projectile-peak");
      const askTime = rng.bool();
      const answer = askTime ? tPeak : peak;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(askTime ? peak : tPeak),
        num(c),
        num(askTime ? tPeak * 2 : peak - c),
        num(askTime ? tPeak + 1 : peak + 10),
      ]);
      const name = rng.pick(NAMES);
      return {
        prompt:
          `${name} launches a model rocket from a platform. Its height above the ground, in feet, ` +
          `$t$ seconds after launch is given by $h(t) = ${quadratic(a, b, c, "t")}$. ` +
          (askTime
            ? `How many seconds after launch does the rocket reach its maximum height?`
            : `What is the maximum height, in feet, that the rocket reaches?`),
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The graph of $h$ is a downward-opening parabola, so the maximum occurs at the vertex, ` +
          `$t = -\\dfrac{b}{2a} = -\\dfrac{${b}}{2(${a})} = ${num(tPeak)}$ seconds. ` +
          (askTime
            ? `So the maximum height is reached $${num(tPeak)}$ seconds after launch.`
            : `Substituting: $h(${num(tPeak)}) = ${num(peak)}$ feet.`),
      };
    },
  },
  {
    ...base,
    id: "m-adv-ratexp",
    subdomain: "Equivalent expressions",
    skills: ["Simplifying rational expressions", "Factoring"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      let [r1, r2] = roots(rng);
      // Opposite roots collapse several distractors onto the key, so nudge them apart.
      if (r1 === -r2) r2 = r2 > 0 ? r2 + 1 : r2 - 1;
      const b = -(r1 + r2);
      const c = r1 * r2;
      const correct = `$x ${signed(-r2)}$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `$x ${signed(-r1)}$`,
          `$x ${signed(r2)}$`,
          `$x ${signed(r1)}$`,
          `$x ${signed(c)}$`,
          `$x ${signed(-c)}$`,
          `$x ${signed(b)}$`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt:
          `Which expression is equivalent to $\\dfrac{${quadratic(1, b, c)}}{x ${signed(-r1)}}$, ` +
          `where $x \\ne ${r1}$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Factor the numerator: $${quadratic(1, b, c)} = ${factorOf(r1)}${factorOf(r2)}$. ` +
          `Cancelling the common factor $${factorOf(r1)}$ leaves $x ${signed(-r2)}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-nonlin-table",
    subdomain: "Nonlinear functions",
    skills: ["Exponential functions from tables", "Constant ratio"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 12) * rng.pick([1, 5, 10]);
      const r = rng.pick([2, 3, 4, 5]);
      const rows = [0, 1, 2, 3].map((x) => [String(x), num(a * r ** x)]);
      const target = 5;
      const answer = a * r ** target;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(a * r ** 4),
        num(a + r * target),
        num(a * r * target),
        num(a * (r + 1) ** target),
      ]);
      return {
        stimulus: {
          type: "table",
          title: "Values of the function g",
          columns: ["x", "g(x)"],
          rows,
          numericColumns: [0, 1],
        },
        prompt:
          `The table shows four values of $x$ and their corresponding values of $g(x)$, where $g$ is ` +
          `an exponential function. What is the value of $g(${target})$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Each increase of $1$ in $x$ multiplies $g(x)$ by $${r}$, so $g(x) = ${a}(${r})^{x}$. ` +
          `Then $g(${target}) = ${a}(${r})^{${target}} = ${answer}$.`,
        distractorNotes: {
          linear: "Treating the pattern as a constant *difference* rather than a constant *ratio* leads to a linear model and a much smaller value.",
        },
      };
    },
  },
  {
    ...base,
    id: "m-adv-disc-param",
    subdomain: "Nonlinear equations in one variable",
    skills: ["Discriminant conditions", "Equations with parameters"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = rng.pick([1, 2, 4, 9]);
      const c = rng.int(1, 9);
      // x^2 * a + b x + c = 0 has exactly one solution when b^2 = 4ac.
      const bSquared = 4 * a * c;
      const bPos = Math.sqrt(bSquared);
      if (!Number.isInteger(bPos)) {
        const c2 = a; // 4*a*a -> b = 2a
        const b2 = 2 * a;
        return discParamItem(rng, a, c2, b2);
      }
      return discParamItem(rng, a, c, bPos);
    },
  },
  {
    ...base,
    id: "m-adv-spr-quad",
    subdomain: "Nonlinear equations in one variable",
    skills: ["Solving quadratics", "Student-produced response"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = rng.pick([1, 2, 3]);
      const [r1, r2] = roots(rng);
      const b = -a * (r1 + r2);
      const c = a * r1 * r2;
      const positive = [r1, r2].filter((r) => r > 0);
      const answer = positive.length === 1 ? positive[0] : Math.max(r1, r2);
      const which = positive.length === 1 ? "positive solution" : "greatest solution";
      assertClose(a * answer * answer + b * answer + c, 0, "spr-quad");
      return {
        prompt: `$${quadratic(a, b, c)} = 0$\n\nWhat is the ${which} to the given equation?`,
        answerFormat: "student-response",
        correct: num(answer),
        acceptedAnswers: acceptedNumericForms(answer),
        explanation:
          `Factoring gives $${a === 1 ? "" : a}${factorOf(r1)}${factorOf(r2)} = 0$, so the solutions ` +
          `are $x = ${r1}$ and $x = ${r2}$. The ${which} is $${answer}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-halflife",
    subdomain: "Nonlinear functions",
    skills: ["Exponential decay", "Half-life models"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const q = rng.pick(MEASURED_QUANTITIES);
      const start = rng.pick([80, 120, 160, 240, 320, 400, 640]);
      const half = rng.pick([3, 4, 5, 6, 8, 10, 12]);
      const periods = rng.int(2, 4);
      const elapsed = half * periods;
      const answer = start / 2 ** periods;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(start / 2 ** (periods - 1)),
        num(start / (2 * periods)),
        num(start / 2 ** (periods + 2)),
        num(start / 2 ** (periods + 1)),
      ]);
      return {
        prompt:
          `A radioactive tracer decays so that ${q.quantity}, measured in ${q.unit}, is halved every ` +
          `$${half}$ hours. If the initial amount is $${start}$ ${q.unit}, what amount, in ${q.unit}, ` +
          `remains after $${elapsed}$ hours?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `$${elapsed}$ hours is $\\dfrac{${elapsed}}{${half}} = ${periods}$ half-lives. ` +
          `Each half-life multiplies the amount by $\\dfrac{1}{2}$, so the remaining amount is ` +
          `$${start} \\cdot \\left(\\dfrac{1}{2}\\right)^{${periods}} = ${answer}$ ${q.unit}.`,
      };
    },
  },
  {
    ...base,
    id: "m-adv-equivform",
    subdomain: "Equivalent expressions",
    skills: ["Rewriting expressions to reveal structure", "Difference of squares"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const correct = `$(${term(a, "x")} ${signed(b)})(${term(a, "x")} - ${b})$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `$(${term(a, "x")} ${signed(b)})^2$`,
          `$(${term(a, "x")} - ${b})^2$`,
          `$(${term(a * a, "x")} ${signed(b * b)})(x - 1)$`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt: `Which of the following is equivalent to $${a * a}x^{2} - ${b * b}$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Both terms are perfect squares: $${a * a}x^2 = (${a}x)^2$ and $${b * b} = ${b}^2$. ` +
          `A difference of squares factors as $A^2 - B^2 = (A + B)(A - B)$, giving ` +
          `$(${a}x + ${b})(${a}x - ${b})$.`,
        distractorNotes: {
          square: `$(${a}x ${signed(b)})^2$ expands to $${a * a}x^2 + ${2 * a * b}x + ${b * b}$, which has a middle term the original expression does not.`,
        },
      };
    },
  },
];

/* ------------------------------------------------------------------ helpers */

function radicalItem(rng: Rng, a: number, b: number, r: number, x: number): ItemBody {
  const correct = num(x);
  const { choices, correct: key } = buildChoices(rng, correct, [
    num(r * r - b), // squared but never divided by the coefficient
    num(r - b), // never squared
    num(-x === x ? x + 5 : -x),
    num(x + rng.int(2, 6)),
  ]);
  return {
    prompt: `$\\sqrt{${linear(a, b)}} = ${r}$\n\nWhat value of $x$ satisfies the given equation?`,
    answerFormat: "multiple-choice",
    choices,
    correct: key,
    explanation:
      `Square both sides: $${linear(a, b)} = ${r * r}$. Then $${a}x = ${r * r - b}$, so $x = ${x}$. ` +
      `Checking in the original equation, $\\sqrt{${a}(${x}) ${signed(b)}} = \\sqrt{${r * r}} = ${r}$, ` +
      `so the solution is not extraneous.`,
  };
}

function discParamItem(rng: Rng, a: number, c: number, b: number): ItemBody {
  const correct = num(b);
  const { choices, correct: key } = buildChoices(rng, correct, [
    num(b * b),
    num(2 * a * c),
    num(a * c),
    num(b + rng.int(2, 6)),
  ]);
  return {
    prompt:
      `$${term(a, "x", 2)} + kx + ${c} = 0$\n\n` +
      `In the given equation, $k$ is a positive constant. If the equation has exactly one real ` +
      `solution, what is the value of $k$?`,
    answerFormat: "multiple-choice",
    choices,
    correct: key,
    explanation:
      `A quadratic has exactly one real solution when its discriminant is zero: $k^2 - 4ac = 0$. ` +
      `Here $a = ${a}$ and $c = ${c}$, so $k^2 = 4(${a})(${c}) = ${4 * a * c}$ and $k = ${b}$ ` +
      `(taking the positive value, as specified).`,
  };
}
