/**
 * Algebra templates (35% of the Math section).
 *
 * Every template computes its own answer from the sampled parameters and, where
 * a substitution check is meaningful, verifies that answer before returning —
 * a generated item can never quietly disagree with its own key.
 */
import { Rng } from "../rng";
import { ORIGINAL, assertClose, type ItemBody, type Template } from "../types";
import {
  acceptedNumericForms, buildChoices, frac, linear, money, num, plainFrac,
  signed, term, texFrac,
} from "../util";
import { ITEMS, MEASURED_QUANTITIES, NAMES, ORGANIZATIONS, TIME_UNITS } from "../corpus";

const base = {
  subject: "math",
  domain: "algebra",
  source: ORIGINAL,
} as const;

export const ALGEBRA_TEMPLATES: Template[] = [
  /* --------------------------------------------- linear equations, one var */
  {
    ...base,
    id: "m-alg-lineq1",
    subdomain: "Linear equations in one variable",
    skills: ["Solving linear equations", "Inverse operations"],
    difficulty: "easy",
    calculator: "not-needed",
    variants: 16,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 9);
      const x = rng.intExcept(-9, 12, [0]);
      const b = rng.intExcept(-20, 20, [0]);
      const c = a * x + b;
      assertClose(a * x + b, c, "lineq1");
      const correct = num(x);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(x + rng.int(1, 3)),
        num(c - b),           // forgot to divide
        num((c + b) / a === x ? x - 4 : (c + b) / a), // sign slip on b
      ]);
      return {
        prompt: `$${linear(a, b)} = ${c}$\n\nWhat value of $x$ is the solution to the given equation?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Subtract $${b < 0 ? `(${b})` : b}$ from both sides to get $${a}x = ${c - b}$. ` +
          `Dividing both sides by $${a}$ gives $x = ${x}$. ` +
          `Checking: $${a}(${x}) ${signed(b)} = ${c}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-alg-lineq2",
    subdomain: "Linear equations in one variable",
    skills: ["Distributive property", "Variables on both sides"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 16,
    build(rng: Rng): ItemBody {
      // a(x + p) = b(x + q), solved so the root is a tidy value.
      let a = rng.int(2, 7);
      let b = rng.intExcept(2, 8, [a]);
      const x = rng.intExcept(-8, 10, [0]);
      // a*x + a*p = b*x + b*q  ->  choose p, derive q.
      const p = rng.intExcept(-9, 9, [0]);
      const numer = (a - b) * x + a * p;
      if (numer % b !== 0) {
        // Re-pick p so q lands on an integer.
        const target = ((b - ((numer % b) + b) % b) + a * p) % b;
        void target;
      }
      let q = numer / b;
      if (!Number.isInteger(q)) {
        // Scale a and b apart until q is an integer; guaranteed for b | a*p.
        const adjustedP = p * b;
        q = ((a - b) * x + a * adjustedP) / b;
        assertClose(a * (x + adjustedP), b * (x + q), "lineq2-adjusted");
        const eq = `$${a}(x ${signed(adjustedP)}) = ${b}(x ${signed(q)})$`;
        return mkSolveFor(rng, eq, x, a, b, adjustedP, q);
      }
      assertClose(a * (x + p), b * (x + q), "lineq2");
      const eq = `$${a}(x ${signed(p)}) = ${b}(x ${signed(q)})$`;
      return mkSolveFor(rng, eq, x, a, b, p, q);
    },
  },
  {
    ...base,
    id: "m-alg-literal",
    subdomain: "Linear equations in one variable",
    skills: ["Rearranging formulas", "Solving for a variable"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const correct = `y = \\dfrac{${a}x - c}{${b}}`;
      const { choices, correct: key } = buildChoices(
        rng,
        `$${correct}$`,
        [
          `$y = \\dfrac{${a}x + c}{${b}}$`,
          `$y = \\dfrac{c - ${a}x}{${b}}$`,
          `$y = ${a}x - \\dfrac{c}{${b}}$`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt: `$${a}x - ${b}y = c$\n\nThe given equation relates the variables $x$, $y$, and $c$. Which equation correctly expresses $y$ in terms of $x$ and $c$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Isolate the $y$ term: subtract $${a}x$ from both sides to get $-${b}y = c - ${a}x$. ` +
          `Divide both sides by $-${b}$: $y = \\dfrac{c - ${a}x}{-${b}} = \\dfrac{${a}x - c}{${b}}$.`,
        distractorNotes: {
          note: "The common error is dividing by $" + b + "$ rather than $-" + b + "$, which flips both signs in the numerator.",
        },
      };
    },
  },

  /* ------------------------------------------------- lines in the xy-plane */
  {
    ...base,
    id: "m-alg-slope",
    subdomain: "Linear equations in two variables",
    skills: ["Slope from two points", "Rate of change"],
    difficulty: "easy",
    calculator: "not-needed",
    variants: 14,
    build(rng: Rng): ItemBody {
      const x1 = rng.int(-6, 4);
      const dx = rng.int(2, 6);
      const x2 = x1 + dx;
      const m = frac(rng.intExcept(-12, 12, [0]), dx);
      const y1 = rng.int(-8, 8);
      const y2 = y1 + (m.n * dx) / m.d;
      assertClose((y2 - y1) / (x2 - x1), m.n / m.d, "slope");
      const correct = texFrac(m);
      const { choices, correct: key } = buildChoices(
        rng,
        `$${correct}$`,
        [
          `$${texFrac(frac(-m.n, m.d))}$`,
          `$${texFrac(frac(m.d, m.n))}$`,
          `$${texFrac(frac(y2 + y1, x2 + x1 === 0 ? 1 : x2 + x1))}$`,
      ],
        { sortNumeric: false },
      );
      return {
        prompt: `A line in the xy-plane passes through the points $(${x1}, ${y1})$ and $(${x2}, ${num(y2)})$. What is the slope of this line?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Slope is $\\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${num(y2)} - (${y1})}{${x2} - (${x1})} = \\dfrac{${num(y2 - y1)}}{${dx}} = ${correct}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-alg-lineform",
    subdomain: "Linear equations in two variables",
    skills: ["Point-slope form", "Writing equations of lines"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 14,
    build(rng: Rng): ItemBody {
      const m = rng.intExcept(-6, 6, [0]);
      const px = rng.intExcept(-7, 7, [0]);
      const py = rng.int(-9, 9);
      const b = py - m * px;
      const correct = `y = ${linear(m, b)}`;
      const { choices, correct: key } = buildChoices(
        rng,
        `$${correct}$`,
        [
          `$y = ${linear(m, py)}$`,
          `$y = ${linear(-m, b)}$`,
          `$y = ${linear(m, b + 2 * m * px)}$`,
      ],
        { sortNumeric: false },
      );
      return {
        prompt: `Line $\\ell$ has a slope of $${m}$ and passes through the point $(${px}, ${py})$. Which equation defines line $\\ell$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Use point-slope form: $y - (${py}) = ${m}(x - (${px}))$. Distributing gives ` +
          `$y = ${m}x ${signed(-m * px)} ${signed(py)}$, so $y = ${linear(m, b)}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-alg-perp",
    subdomain: "Linear equations in two variables",
    skills: ["Parallel and perpendicular slopes"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const n = rng.int(2, 7);
      const d = rng.intExcept(2, 7, [n]);
      const m = frac(rng.bool() ? n : -n, d);
      const perp = frac(-m.d, m.n);
      const b = rng.intExcept(-9, 9, [0]);
      const isPerp = rng.bool();
      const target = isPerp ? perp : m;
      const wrong = isPerp ? m : perp;
      const { choices, correct: key } = buildChoices(
        rng,
        `$${texFrac(target)}$`,
        [
          `$${texFrac(wrong)}$`,
          `$${texFrac(frac(-target.n, target.d))}$`,
          `$${texFrac(frac(target.d, target.n))}$`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt:
          `In the xy-plane, line $k$ is defined by $y = ${texFrac(m)}x ${signed(b)}$. ` +
          `Line $j$ is ${isPerp ? "perpendicular" : "parallel"} to line $k$. What is the slope of line $j$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation: isPerp
          ? `Perpendicular lines have slopes that are negative reciprocals. The negative reciprocal of $${texFrac(m)}$ is $${texFrac(perp)}$.`
          : `Parallel lines have equal slopes, so line $j$ also has slope $${texFrac(m)}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-alg-intercept",
    subdomain: "Linear equations in two variables",
    skills: ["Intercepts", "Standard form"],
    difficulty: "easy",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const k = a * b * rng.int(1, 4);
      const wantX = rng.bool();
      const xInt = k / a;
      const yInt = k / b;
      const value = wantX ? xInt : yInt;
      const other = wantX ? yInt : xInt;
      const { choices, correct: key } = buildChoices(rng, num(value), [
        num(other),
        num(k),
        num(-value),
      ]);
      return {
        prompt:
          `$${a}x + ${b}y = ${k}$\n\nThe graph of the given equation in the xy-plane has an ` +
          `${wantX ? "x" : "y"}-intercept at $${wantX ? `(a, 0)` : `(0, b)`}$, where $${wantX ? "a" : "b"}$ is a constant. ` +
          `What is the value of $${wantX ? "a" : "b"}$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation: wantX
          ? `At the x-intercept, $y = 0$, so $${a}x = ${k}$ and $x = ${num(xInt)}$.`
          : `At the y-intercept, $x = 0$, so $${b}y = ${k}$ and $y = ${num(yInt)}$.`,
      };
    },
  },

  /* --------------------------------------------------- linear models (word) */
  {
    ...base,
    id: "m-alg-model",
    subdomain: "Linear functions",
    skills: ["Building linear models", "Interpreting rate of change"],
    difficulty: "easy",
    calculator: "recommended",
    variants: 14,
    build(rng: Rng): ItemBody {
      const q = rng.pick(MEASURED_QUANTITIES);
      const t = rng.pick(TIME_UNITS);
      const start = rng.int(4, 60);
      const rate = rng.intExcept(-9, 9, [0]);
      const nn = rng.int(5, 14);
      const value = start + rate * nn;
      const correct = num(value);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(start + rate * (nn - 1)),
        num(start * rate),
        num(start - rate * nn),
      ]);
      return {
        prompt:
          `The function $f(t) = ${linear(rate, start, "t")}$ gives ${q.quantity}, in ${q.unit}, ` +
          `$t$ ${t.plural} after an experiment begins. What is ${q.quantity}, in ${q.unit}, ` +
          `$${nn}$ ${t.plural} after the experiment begins?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Substitute $t = ${nn}$: $f(${nn}) = ${rate}(${nn}) ${signed(start)} = ${num(rate * nn)} ${signed(start)} = ${correct}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-alg-interpret",
    subdomain: "Linear functions",
    skills: ["Interpreting slope and intercept in context"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const name = rng.pick(NAMES);
      const org = rng.pick(ORGANIZATIONS);
      const fee = rng.int(15, 90);
      const rate = rng.int(3, 24);
      const askSlope = rng.bool();
      const correct = askSlope
        ? `The cost, in dollars, for each additional hour of rental`
        : `The cost, in dollars, of the one-time membership fee`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          askSlope
            ? `The cost, in dollars, of the one-time membership fee`
            : `The cost, in dollars, for each additional hour of rental`,
          `The total number of hours ${name} rented equipment`,
          `The total cost, in dollars, of ${name}'s rental`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt:
          `${name} rents equipment from ${org}. The total cost $C$, in dollars, is modeled by ` +
          `$C(h) = ${rate}h + ${fee}$, where $h$ is the number of hours the equipment is rented. ` +
          `What is the best interpretation of $${askSlope ? rate : fee}$ in this context?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation: askSlope
          ? `$${rate}$ is the coefficient of $h$, so it is the rate at which the cost grows: ${money(rate)} for each additional hour.`
          : `$${fee}$ is the constant term, the value of $C(h)$ when $h = 0$ — the cost before any hours are counted, so it is the one-time fee.`,
      };
    },
  },

  /* ------------------------------------------------------ systems of equations */
  {
    ...base,
    id: "m-alg-sys1",
    subdomain: "Systems of two linear equations in two variables",
    skills: ["Elimination", "Substitution"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 16,
    build(rng: Rng): ItemBody {
      const x = rng.intExcept(-8, 9, [0]);
      const y = rng.intExcept(-8, 9, [0]);
      const a1 = rng.intExcept(-6, 6, [0]);
      const b1 = rng.intExcept(-6, 6, [0]);
      let a2 = rng.intExcept(-6, 6, [0]);
      let b2 = rng.intExcept(-6, 6, [0]);
      if (a1 * b2 - a2 * b1 === 0) { a2 = a1 + 1; b2 = b1 - 1; }
      const c1 = a1 * x + b1 * y;
      const c2 = a2 * x + b2 * y;
      assertClose(a1 * x + b1 * y, c1, "sys1-eq1");
      assertClose(a2 * x + b2 * y, c2, "sys1-eq2");
      const askSum = rng.bool();
      const value = askSum ? x + y : x;
      const correct = num(value);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(askSum ? x - y : y),
        num(value + rng.int(1, 4)),
        num(-value === value ? value + 7 : -value),
      ]);
      return {
        prompt:
          `$$\\begin{cases} ${linear(a1, 0)} ${signed(b1)}y = ${c1} \\\\ ${linear(a2, 0)} ${signed(b2)}y = ${c2} \\end{cases}$$\n\n` +
          `The solution to the given system of equations is $(x, y)$. What is the value of $${askSum ? "x + y" : "x"}$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Solving the system gives $x = ${x}$ and $y = ${y}$. ` +
          `Check the first equation: $${a1}(${x}) ${signed(b1)}(${y}) = ${c1}$. ` +
          (askSum ? `Therefore $x + y = ${num(x + y)}$.` : `Therefore $x = ${x}$.`),
      };
    },
  },
  {
    ...base,
    id: "m-alg-sys-none",
    subdomain: "Systems of two linear equations in two variables",
    skills: ["No solution and infinitely many solutions", "Proportional coefficients"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 8);
      const b = rng.intExcept(-8, 8, [0]);
      const k = rng.int(2, 5);
      const c = rng.intExcept(-12, 12, [0]);
      const noSolution = rng.bool();
      // Second equation: k*a x + k*b y = value. Parallel unless value = k*c.
      const value = noSolution ? k * c + rng.intExcept(1, 6, []) : k * c;
      const answer = k * a;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(a),
        num(a * (k + 1)),
        num(k * b === answer ? answer + k : k * b),
      ]);
      return {
        prompt:
          `$$\\begin{cases} ${term(a, "x")} ${signed(b)}y = ${c} \\\\ px ${signed(k * b)}y = ${value} \\end{cases}$$\n\n` +
          `In the given system of equations, $p$ is a constant. If the system has ` +
          `${noSolution ? "no solution" : "infinitely many solutions"}, what is the value of $p$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The $y$-coefficients are $${b}$ and $${k * b}$, so the second equation must be $${k}$ times the first ` +
          `on the left side. That forces $p = ${k}\\cdot${a} = ${answer}$. ` +
          (noSolution
            ? `The constants do not match ($${k}\\cdot(${c}) = ${k * c} \\ne ${value}$), so the lines are parallel and there is no solution.`
            : `The constants also match ($${k}\\cdot(${c}) = ${value}$), so the two equations describe the same line.`),
      };
    },
  },
  {
    ...base,
    id: "m-alg-sys-word",
    subdomain: "Systems of two linear equations in two variables",
    skills: ["Modeling with systems", "Two-variable word problems"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 14,
    build(rng: Rng): ItemBody {
      const name = rng.pick(NAMES);
      const itemA = rng.pick(ITEMS);
      let itemB = rng.pick(ITEMS);
      while (itemB.singular === itemA.singular) itemB = rng.pick(ITEMS);
      const priceA = rng.int(2, 9);
      const priceB = rng.intExcept(2, 12, [priceA]);
      const countA = rng.int(3, 14);
      const countB = rng.int(3, 14);
      const total = countA + countB;
      const spend = priceA * countA + priceB * countB;
      const askA = rng.bool();
      const answer = askA ? countA : countB;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(askA ? countB : countA),
        num(total),
        num(answer + rng.int(2, 5)),
      ]);
      return {
        prompt:
          `${name} bought a total of $${total}$ items, consisting of ${itemA.plural} and ${itemB.plural}. ` +
          `Each ${itemA.singular} cost ${money(priceA)} and each ${itemB.singular} cost ${money(priceB)}. ` +
          `${name} spent ${money(spend)} in total. How many ${askA ? itemA.plural : itemB.plural} did ${name} buy?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Let $a$ be the number of ${itemA.plural} and $b$ the number of ${itemB.plural}. ` +
          `Then $a + b = ${total}$ and $${priceA}a + ${priceB}b = ${spend}$. ` +
          `Substituting $b = ${total} - a$ into the second equation gives ` +
          `$${priceA}a + ${priceB}(${total} - a) = ${spend}$, so $a = ${countA}$ and $b = ${countB}$.`,
      };
    },
  },

  /* ------------------------------------------------------------ inequalities */
  {
    ...base,
    id: "m-alg-ineq1",
    subdomain: "Linear inequalities in one or two variables",
    skills: ["Solving linear inequalities", "Reversing the inequality sign"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = -rng.int(2, 8);
      const b = rng.intExcept(-15, 15, [0]);
      const boundary = rng.intExcept(-8, 8, [0]);
      const c = a * boundary + b;
      const op = rng.pick(["<", ">", "\\le", "\\ge"] as const);
      const flipped = { "<": ">", ">": "<", "\\le": "\\ge", "\\ge": "\\le" }[op];
      const plain = { "<": "<", ">": ">", "\\le": "\\leq", "\\ge": "\\geq" };
      const correct = `$x ${flipped} ${boundary}$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `$x ${op} ${boundary}$`,
          `$x ${flipped} ${num(-boundary === boundary ? boundary + 3 : -boundary)}$`,
          `$x ${op} ${num(c - b)}$`,
      ],
        { sortNumeric: false },
      );
      return {
        prompt: `$${linear(a, b)} ${op} ${c}$\n\nWhich inequality is equivalent to the given inequality?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Subtract $${b}$ from both sides: $${a}x ${op} ${c - b}$. Dividing both sides by the ` +
          `negative number $${a}$ reverses the inequality, giving $x ${flipped} ${boundary}$.`,
        distractorNotes: {
          trap: `Forgetting to reverse the sign when dividing by a negative number produces $x ${plain[op]} ${boundary}$.`,
        },
      };
    },
  },
  {
    ...base,
    id: "m-alg-ineq-word",
    subdomain: "Linear inequalities in one or two variables",
    skills: ["Modeling with inequalities", "Constraint systems"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const name = rng.pick(NAMES);
      const item = rng.pick(ITEMS);
      const price = rng.int(3, 15);
      const fixed = rng.int(10, 60);
      const budget = fixed + price * rng.int(5, 20) + rng.int(0, price - 1);
      const maxCount = Math.floor((budget - fixed) / price);
      const correct = num(maxCount);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(maxCount + 1),
        num(Math.floor(budget / price)),
        num(maxCount - rng.int(2, 4)),
      ]);
      return {
        prompt:
          `${name} has ${money(budget)} to spend. A delivery fee of ${money(fixed)} is charged on the order, ` +
          `and each ${item.singular} costs ${money(price)}. What is the greatest number of ${item.plural} ` +
          `${name} can order?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The constraint is $${price}n + ${fixed} \\le ${budget}$, so $${price}n \\le ${budget - fixed}$ and ` +
          `$n \\le ${num((budget - fixed) / price)}$. Because $n$ must be a whole number, the greatest possible ` +
          `value is $${maxCount}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-alg-abs",
    subdomain: "Linear equations in one variable",
    skills: ["Absolute value equations", "Case analysis"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = rng.int(1, 5);
      const h = rng.intExcept(-9, 9, [0]);
      const k = rng.int(2, 18);
      // |a x + h| = k  ->  x = (-h ± k)/a
      const r1 = (-h + k) / a;
      const r2 = (-h - k) / a;
      const sum = r1 + r2;
      const correct = num(sum);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(r1),
        num(r2),
        num(Math.abs(r1 - r2)),
      ]);
      return {
        prompt: `$|${linear(a, h)}| = ${k}$\n\nWhat is the sum of all solutions to the given equation?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The equation splits into $${linear(a, h)} = ${k}$ and $${linear(a, h)} = -${k}$, giving ` +
          `$x = ${num(r1)}$ and $x = ${num(r2)}$. Their sum is $${correct}$.`,
      };
    },
  },

  /* -------------------------------------------------------- tables and rates */
  {
    ...base,
    id: "m-alg-table",
    subdomain: "Linear functions",
    skills: ["Linear functions from tables", "Constant rate of change"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const m = rng.intExcept(-7, 7, [0]);
      const b = rng.int(-12, 20);
      const xs = [rng.int(0, 3), 0, 0, 0];
      for (let i = 1; i < 4; i += 1) xs[i] = xs[i - 1] + rng.int(1, 3);
      const rows = xs.map((x) => [String(x), num(m * x + b)]);
      const target = xs[3] + rng.int(2, 6);
      const answer = m * target + b;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(answer + m),
        num(answer - m),
        num(m * target),
      ]);
      return {
        stimulus: {
          type: "table",
          title: "Values of the linear function f",
          columns: ["x", "f(x)"],
          rows,
          numericColumns: [0, 1],
        },
        prompt:
          `The table gives four values of $x$ and their corresponding values of $f(x)$, where $f$ is a ` +
          `linear function. What is the value of $f(${target})$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Each increase of $1$ in $x$ changes $f(x)$ by $${m}$, so $f(x) = ${linear(m, b)}$. ` +
          `Then $f(${target}) = ${m}(${target}) ${signed(b)} = ${correct}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-alg-equiv",
    subdomain: "Linear equations in two variables",
    skills: ["Equivalent expressions", "Combining like terms"],
    difficulty: "easy",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 8);
      const b = rng.intExcept(-9, 9, [0]);
      const c = rng.int(2, 6);
      const d = rng.intExcept(-9, 9, [0]);
      const ra = a + c;
      const rb = b + d;
      const correct = `$${linear(ra, rb)}$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `$${linear(a - c, rb)}$`,
          `$${linear(ra, b - d)}$`,
          `$${linear(a * c, rb)}$`,
      ],
        { sortNumeric: false },
      );
      return {
        prompt: `Which expression is equivalent to $(${linear(a, b)}) + (${linear(c, d)})$?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Combine like terms: $${a}x + ${c}x = ${ra}x$ and $${b} ${signed(d)} = ${rb}$, ` +
          `so the sum is $${linear(ra, rb)}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-alg-spr-lineq",
    subdomain: "Linear equations in one variable",
    skills: ["Solving linear equations", "Student-produced response"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 14,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const c = rng.int(2, 9);
      // a(x - b) = c x + d, solved for a tidy fraction or integer.
      const x = frac(rng.int(-20, 40), rng.pick([1, 1, 2, 3, 4, 5]));
      const d = a * (x.n - b * x.d) / x.d - (c * x.n) / x.d;
      if (!Number.isInteger(d) || a === c) {
        const simple = rng.int(2, 40);
        return {
          prompt: `$${a}(x - ${b}) = ${a * (simple - b)}$\n\nWhat is the solution to the given equation?`,
          answerFormat: "student-response",
          correct: num(simple),
          acceptedAnswers: acceptedNumericForms(simple),
          explanation: `Divide both sides by $${a}$: $x - ${b} = ${simple - b}$, so $x = ${simple}$.`,
        };
      }
      assertClose(a * (x.n / x.d - b), (c * x.n) / x.d + d, "spr-lineq");
      return {
        prompt: `$${a}(x - ${b}) = ${linear(c, d)}$\n\nWhat is the solution to the given equation?`,
        answerFormat: "student-response",
        correct: plainFrac(x),
        acceptedAnswers: acceptedNumericForms(x),
        explanation:
          `Distribute on the left: $${a}x - ${a * b} = ${linear(c, d)}$. Collect the $x$ terms: ` +
          `$${a - c}x = ${a * b + d}$, so $x = ${texFrac(x)}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-alg-sys-spr",
    subdomain: "Systems of two linear equations in two variables",
    skills: ["Elimination", "Student-produced response"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const x = rng.intExcept(-9, 12, [0]);
      const y = rng.intExcept(-9, 12, [0]);
      const a1 = rng.int(2, 7);
      const b1 = rng.intExcept(-7, 7, [0]);
      const a2 = rng.intExcept(-7, 7, [0, a1]);
      const b2 = rng.intExcept(-7, 7, [0]);
      if (a1 * b2 - a2 * b1 === 0) {
        const alt = b2 + 1;
        const c1 = a1 * x + b1 * y;
        const c2 = a2 * x + alt * y;
        return sysSpr(a1, b1, c1, a2, alt, c2, x, y);
      }
      return sysSpr(a1, b1, a1 * x + b1 * y, a2, b2, a2 * x + b2 * y, x, y);
    },
  },
  {
    ...base,
    id: "m-alg-proportion",
    subdomain: "Linear equations in one variable",
    skills: ["Proportional reasoning", "Cross multiplication"],
    difficulty: "easy",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const k = rng.int(2, 9);
      const a = rng.int(2, 12);
      const b = a * k;
      const c = rng.int(3, 15);
      const d = c * k;
      const correct = num(d);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(c * (k + 1)),
        num(c + b - a),
        num(Math.round((c * a) / b) === d ? d + 5 : Math.round((c * a) / b)),
      ]);
      return {
        prompt:
          `In a scale drawing, $${a}$ centimeters represents $${b}$ meters. At this scale, how many ` +
          `meters are represented by $${c}$ centimeters?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The scale factor is $\\dfrac{${b}}{${a}} = ${k}$ meters per centimeter, so $${c}$ centimeters ` +
          `represents $${c} \\times ${k} = ${d}$ meters.`,
      };
    },
  },
];

/* ------------------------------------------------------------------ helpers */

function mkSolveFor(
  rng: Rng, equation: string, x: number, a: number, b: number, p: number, q: number,
): ItemBody {
  const correct = num(x);
  const { choices, correct: key } = buildChoices(rng, correct, [
    num(-x === x ? x + 5 : -x),
    num(x + rng.int(1, 4)),
    num(a * p - b * q === x ? x - 6 : a * p - b * q),
      ]);
  return {
    prompt: `${equation}\n\nWhat value of $x$ satisfies the given equation?`,
    answerFormat: "multiple-choice",
    choices,
    correct: key,
    explanation:
      `Distribute on both sides: $${a}x ${signed(a * p)} = ${b}x ${signed(b * q)}$. ` +
      `Collect the $x$ terms on one side: $${a - b}x = ${b * q - a * p}$, so $x = ${x}$.`,
  };
}

function sysSpr(
  a1: number, b1: number, c1: number, a2: number, b2: number, c2: number, x: number, y: number,
): ItemBody {
  assertClose(a1 * x + b1 * y, c1, "sys-spr-1");
  assertClose(a2 * x + b2 * y, c2, "sys-spr-2");
  const answer = x * y;
  return {
    prompt:
      `$$\\begin{cases} ${term(a1, "x")} ${signed(b1)}y = ${c1} \\\\ ${term(a2, "x")} ${signed(b2)}y = ${c2} \\end{cases}$$\n\n` +
      `The solution to the given system of equations is $(x, y)$. What is the value of $xy$?`,
    answerFormat: "student-response",
    correct: num(answer),
    acceptedAnswers: acceptedNumericForms(answer),
    explanation:
      `Using elimination, the solution is $x = ${x}$ and $y = ${y}$. ` +
      `Verify in the first equation: $${a1}(${x}) ${signed(b1)}(${y}) = ${c1}$. ` +
      `Therefore $xy = (${x})(${y}) = ${answer}$.`,
  };
}
