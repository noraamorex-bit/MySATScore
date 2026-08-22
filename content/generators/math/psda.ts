/**
 * Problem-Solving and Data Analysis templates (15% of the Math section):
 * ratios, percentages, statistics, probability from two-way tables, scatterplot
 * models, and inference from sample data.
 */
import { Rng } from "../rng";
import { ORIGINAL, assertClose, type ItemBody, type Template } from "../types";
import { acceptedNumericForms, buildChoices, frac, money, num, signed, texFrac } from "../util";
import { CITY_SETTINGS, ITEMS, NAMES, ORGANIZATIONS, SPECIES } from "../corpus";

const base = {
  subject: "math",
  domain: "problem-solving-and-data-analysis",
  source: ORIGINAL,
} as const;

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};
const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length;
const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);
const ordinal = (n: number): string => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
};
/** True when a value is reportable without a ragged decimal tail. */
const tidy = (v: number): boolean => Math.abs(v * 100 - Math.round(v * 100)) < 1e-9;

export const PSDA_TEMPLATES: Template[] = [
  {
    ...base,
    id: "m-psda-pctchange",
    subdomain: "Percentages",
    skills: ["Percent increase and decrease"],
    difficulty: "easy",
    calculator: "recommended",
    variants: 14,
    build(rng: Rng): ItemBody {
      const city = rng.pick(CITY_SETTINGS);
      const before = rng.int(3, 40) * 100;
      const pct = rng.pick([4, 5, 8, 10, 12, 15, 20, 25, 30, 40]);
      const up = rng.bool();
      const after = up ? before * (1 + pct / 100) : before * (1 - pct / 100);
      assertClose(Math.abs(after - before) / before, pct / 100, "pctchange");
      const correct = num(after);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(up ? before * (1 - pct / 100) : before * (1 + pct / 100)),
        num(before + (up ? pct : -pct)),
        num((before * pct) / 100),
        num(before),
      ]);
      return {
        prompt:
          `In ${city}, the number of registered bicycles was $${before}$ in 2019. By 2024 that number had ` +
          `${up ? "increased" : "decreased"} by $${pct}\\%$. How many registered bicycles were there in 2024?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `A $${pct}\\%$ ${up ? "increase" : "decrease"} multiplies the original value by ` +
          `$1 ${up ? "+" : "-"} ${num(pct / 100)} = ${num(up ? 1 + pct / 100 : 1 - pct / 100)}$. ` +
          `So the 2024 count is $${before} \\times ${num(up ? 1 + pct / 100 : 1 - pct / 100)} = ${num(after)}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-reverse-pct",
    subdomain: "Percentages",
    skills: ["Reverse percent problems", "Working backward from a total"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const pct = rng.pick([10, 15, 20, 25, 30, 40]);
      const original = rng.int(4, 30) * 20;
      const discounted = original * (1 - pct / 100);
      const item = rng.pick(ITEMS);
      const correct = num(original);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(discounted * (1 + pct / 100)), // adds the percent back to the wrong base
        num(discounted + pct),
        num(original - pct),
        num(original + (original * pct) / 100),
      ]);
      return {
        prompt:
          `After a discount of $${pct}\\%$, the price of a ${item.singular} is ${money(discounted)}. ` +
          `What was the price, in dollars, before the discount?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The sale price is $${num(1 - pct / 100)}$ times the original price $p$: ` +
          `$${num(1 - pct / 100)}p = ${num(discounted)}$. Dividing gives ` +
          `$p = \\dfrac{${num(discounted)}}{${num(1 - pct / 100)}} = ${num(original)}$.`,
        distractorNotes: {
          trap: `Adding $${pct}\\%$ back to the sale price is not the inverse of removing $${pct}\\%$ from the original — the percentages are taken of different bases.`,
        },
      };
    },
  },
  {
    ...base,
    id: "m-psda-ratio",
    subdomain: "Ratios, rates, proportional relationships, and units",
    skills: ["Ratios", "Proportional reasoning"],
    difficulty: "easy",
    calculator: "recommended",
    variants: 14,
    build(rng: Rng): ItemBody {
      const a = rng.int(2, 9);
      const b = rng.intExcept(2, 9, [a]);
      const k = rng.int(3, 14);
      const total = (a + b) * k;
      const askA = rng.bool();
      const answer = (askA ? a : b) * k;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num((askA ? b : a) * k),
        num(total / 2),
        num(total - answer + rng.int(1, 5)),
        num(answer + k),
      ]);
      const org = rng.pick(ORGANIZATIONS);
      return {
        prompt:
          `At ${org}, the ratio of volunteers to staff members is $${a}$ to $${b}$. There are $${total}$ ` +
          `people in total. How many ${askA ? "volunteers" : "staff members"} are there?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The ratio splits the group into $${a} + ${b} = ${a + b}$ equal parts, so each part is ` +
          `$\\dfrac{${total}}{${a + b}} = ${k}$ people. ` +
          `There are $${askA ? a : b} \\times ${k} = ${answer}$ ${askA ? "volunteers" : "staff members"}.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-unitrate",
    subdomain: "Ratios, rates, proportional relationships, and units",
    skills: ["Unit rates", "Unit conversion"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 14,
    build(rng: Rng): ItemBody {
      const perMinute = rng.pick([1.5, 2.5, 3, 4, 6, 7.5, 12]);
      const minutes = rng.pick([20, 30, 45, 60, 90, 120]);
      const answer = perMinute * minutes;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(perMinute * (minutes / 60)),
        num(minutes / perMinute),
        num(perMinute * minutes * 60),
        num(answer / 2),
      ]);
      const species = rng.pick(SPECIES);
      return {
        prompt:
          `A filtration system used in a tank of ${species} processes water at a constant rate of ` +
          `$${num(perMinute)}$ liters per minute. At this rate, how many liters does the system process ` +
          `in $${num(minutes / 60)}$ hour${minutes === 60 ? "" : "s"}?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `$${num(minutes / 60)}$ hour${minutes === 60 ? "" : "s"} is $${minutes}$ minutes. ` +
          `At $${num(perMinute)}$ liters per minute, the system processes ` +
          `$${num(perMinute)} \\times ${minutes} = ${num(answer)}$ liters.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-center",
    subdomain: "One-variable data: distributions and measures of center and spread",
    skills: ["Mean", "Median"],
    difficulty: "easy",
    calculator: "recommended",
    variants: 14,
    build(rng: Rng): ItemBody {
      const n = rng.pick([5, 7, 9]);
      const values = Array.from({ length: n - 1 }, () => rng.int(2, 40));
      // Choose the final value so the mean is a whole number, as the real test does.
      const target = Math.ceil(sum(values) / n) * n;
      values.push(Math.max(2, target - sum(values)));
      const wantMedian = rng.bool();
      const answer = wantMedian ? median(values) : Number(mean(values).toFixed(4));
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(wantMedian ? Number(mean(values).toFixed(2)) : median(values)),
        num(Math.max(...values)),
        num(Math.min(...values)),
        num(Math.max(...values) - Math.min(...values)),
      ]);
      return {
        stimulus: {
          type: "table",
          title: "Recorded values",
          columns: ["Observation", "Value"],
          rows: values.map((v, i) => [String(i + 1), String(v)]),
          numericColumns: [0, 1],
        },
        prompt:
          `The table lists $${n}$ values recorded during a field study. What is the ` +
          `${wantMedian ? "median" : "mean"} of these values?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation: wantMedian
          ? `Ordering the values gives $${[...values].sort((a, b) => a - b).join(", ")}$. With $${n}$ ` +
            `values, the median is the ${ordinal((n + 1) / 2)} value, $${median(values)}$.`
          : `The sum of the values is $${values.reduce((a, b) => a + b, 0)}$, and there are $${n}$ of them, ` +
            `so the mean is $\\dfrac{${values.reduce((a, b) => a + b, 0)}}{${n}} = ${num(answer)}$.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-freq",
    subdomain: "One-variable data: distributions and measures of center and spread",
    skills: ["Median from a frequency table", "Weighted mean"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const values = [0, 1, 2, 3, 4].map((v) => v + rng.int(0, 2));
      const uniq = Array.from(new Set(values)).sort((a, b) => a - b);
      const freqs = uniq.map(() => rng.int(2, 12));
      const expanded: number[] = [];
      uniq.forEach((v, i) => { for (let j = 0; j < freqs[i]; j += 1) expanded.push(v); });
      const total = expanded.length;
      const med = median(expanded);
      const avg = Number(mean(expanded).toFixed(4));
      const wantMedian = rng.bool() || !tidy(avg);
      const answer = wantMedian ? med : avg;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(wantMedian ? Number(avg.toFixed(2)) : med),
        num(median(uniq)),
        num(Number(mean(uniq).toFixed(2))),
        num(uniq[uniq.length - 1]),
      ]);
      return {
        stimulus: {
          type: "table",
          title: "Number of sensors reporting each fault count",
          columns: ["Faults recorded", "Number of sensors"],
          rows: uniq.map((v, i) => [String(v), String(freqs[i])]),
          numericColumns: [0, 1],
        },
        prompt:
          `The table summarizes the number of faults recorded by each of $${total}$ sensors during one ` +
          `week. What is the ${wantMedian ? "median" : "mean"} number of faults recorded per sensor?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation: wantMedian
          ? `There are $${total}$ data values in all. Counting up the frequencies until reaching the ` +
            `middle of the ordered list gives a median of $${num(med)}$.`
          : `The total number of faults is $${expanded.reduce((a, b) => a + b, 0)}$ across $${total}$ ` +
            `sensors, so the mean is $\\dfrac{${expanded.reduce((a, b) => a + b, 0)}}{${total}} = ${num(avg)}$.`,
        distractorNotes: {
          trap: "Averaging only the distinct values in the left column ignores how many sensors reported each count.",
        },
      };
    },
  },
  {
    ...base,
    id: "m-psda-center-shift",
    subdomain: "One-variable data: distributions and measures of center and spread",
    skills: ["Effect of an added value on center", "Reasoning about statistics"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const nn = rng.pick([9, 11, 15]);
      const centre = rng.int(20, 60);
      const values = Array.from({ length: nn }, () => centre + rng.int(-6, 6));
      const outlier = centre + rng.int(60, 200);
      const before = { mean: mean(values), median: median(values) };
      const after = { mean: mean([...values, outlier]), median: median([...values, outlier]) };
      const meanUp = after.mean > before.mean + 0.5;
      void meanUp;
      const correct = "The mean increases by more than the median increases.";
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          "The median increases by more than the mean increases.",
          "The mean and the median increase by the same amount.",
          "The mean increases and the median decreases.",
        ],
        { sortNumeric: false },
      );
      return {
        prompt:
          `A data set consists of $${nn}$ values, each between $${Math.min(...values)}$ and ` +
          `$${Math.max(...values)}$. A new value of $${outlier}$ is then added to the data set. ` +
          `Which statement correctly compares the mean and the median of the data set before and after ` +
          `the new value is added?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The mean uses every value, so a value far above the others pulls it up sharply: it rises from ` +
          `about $${num(Number(before.mean.toFixed(1)))}$ to about $${num(Number(after.mean.toFixed(1)))}$. ` +
          `The median depends only on position in the ordered list, so adding one large value shifts it by ` +
          (after.median === before.median
            ? `at most one position — here it stays at $${num(before.median)}$. `
            : `at most one position — from $${num(before.median)}$ to $${num(after.median)}$. `) +
          `The mean is sensitive to outliers; the median is resistant to them.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-spread",
    subdomain: "One-variable data: distributions and measures of center and spread",
    skills: ["Standard deviation", "Comparing distributions"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const centre = rng.int(30, 70);
      const tight = [centre - 2, centre - 1, centre, centre + 1, centre + 2];
      const spread = [centre - 20, centre - 10, centre, centre + 10, centre + 20];
      const tightFirst = rng.bool();
      const listA = tightFirst ? tight : spread;
      const listB = tightFirst ? spread : tight;
      const correct = `Data set ${tightFirst ? "B" : "A"}, because its values are farther from the mean.`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `Data set ${tightFirst ? "A" : "B"}, because its values are farther from the mean.`,
          "Neither, because the two data sets have the same mean.",
          "Neither, because the two data sets have the same number of values.",
        ],
        { sortNumeric: false },
      );
      return {
        stimulus: {
          type: "table",
          title: "Two data sets",
          columns: ["Data set", "Values"],
          rows: [["A", listA.join(", ")], ["B", listB.join(", ")]],
        },
        prompt: `Which data set has the greater standard deviation?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Both data sets have a mean of $${centre}$ and five values each, so those facts cannot ` +
          `distinguish them. Standard deviation measures typical distance from the mean. In data set ` +
          `${tightFirst ? "A" : "B"} the values are within $2$ of the mean, while in data set ` +
          `${tightFirst ? "B" : "A"} they are as far as $20$ from it, so data set ` +
          `${tightFirst ? "B" : "A"} has the greater standard deviation.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-twoway",
    subdomain: "Probability and conditional probability",
    skills: ["Two-way tables", "Simple probability"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 14,
    build(rng: Rng): ItemBody {
      const a = rng.int(8, 40), b = rng.int(8, 40), c = rng.int(8, 40), d = rng.int(8, 40);
      const total = a + b + c + d;
      const rowLabels = ["Ninth grade", "Tenth grade"];
      const colLabels = ["Chose robotics", "Chose journalism"];
      const answer = frac(a, total);
      const correct = texFrac(answer);
      const { choices, correct: key } = buildChoices(
        rng,
        `$${correct}$`,
        [
          `$${texFrac(frac(a, a + b))}$`,
          `$${texFrac(frac(a, a + c))}$`,
          `$${texFrac(frac(a + b, total))}$`,
          `$${texFrac(frac(d, total))}$`,
        ],
        { sortNumeric: false },
      );
      return {
        stimulus: {
          type: "table",
          title: "Elective chosen, by grade level",
          columns: ["", ...colLabels, "Total"],
          rows: [
            [rowLabels[0], String(a), String(b), String(a + b)],
            [rowLabels[1], String(c), String(d), String(c + d)],
            ["Total", String(a + c), String(b + d), String(total)],
          ],
          numericColumns: [1, 2, 3],
        },
        prompt:
          `The table shows the elective chosen by each of $${total}$ students. If one of these students ` +
          `is selected at random, what is the probability that the student is in ${rowLabels[0].toLowerCase()} ` +
          `and chose robotics?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `$${a}$ of the $${total}$ students are both in ${rowLabels[0].toLowerCase()} and chose robotics, ` +
          `so the probability is $\\dfrac{${a}}{${total}} = ${correct}$.`,
        distractorNotes: {
          conditional: `$\\dfrac{${a}}{${a + b}}$ is the *conditional* probability of choosing robotics given ninth grade — a different question, because it uses only the ninth-grade row as its denominator.`,
        },
      };
    },
  },
  {
    ...base,
    id: "m-psda-conditional",
    subdomain: "Probability and conditional probability",
    skills: ["Conditional probability", "Reading a two-way table"],
    difficulty: "hard",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const a = rng.int(10, 60), b = rng.int(10, 60), c = rng.int(10, 60), d = rng.int(10, 60);
      const total = a + b + c + d;
      const answer = frac(c, c + d);
      const correct = texFrac(answer);
      const { choices, correct: key } = buildChoices(
        rng,
        `$${correct}$`,
        [
          `$${texFrac(frac(c, total))}$`,
          `$${texFrac(frac(c, a + c))}$`,
          `$${texFrac(frac(a, a + b))}$`,
          `$${texFrac(frac(d, c + d))}$`,
        ],
        { sortNumeric: false },
      );
      return {
        stimulus: {
          type: "table",
          title: "Results of a soil treatment trial",
          columns: ["", "Germinated", "Did not germinate", "Total"],
          rows: [
            ["Untreated", String(a), String(b), String(a + b)],
            ["Treated", String(c), String(d), String(c + d)],
            ["Total", String(a + c), String(b + d), String(total)],
          ],
          numericColumns: [1, 2, 3],
        },
        prompt:
          `The table summarizes the results of a trial on $${total}$ seeds. If one of the treated seeds ` +
          `is selected at random, what is the probability that it germinated?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The condition "treated" restricts attention to the $${c + d}$ seeds in the treated row. ` +
          `Of those, $${c}$ germinated, so the probability is $\\dfrac{${c}}{${c + d}} = ${correct}$.`,
        distractorNotes: {
          trap: `Using $${total}$ as the denominator answers a different question — the probability that a randomly chosen seed is both treated and germinated.`,
        },
      };
    },
  },
  {
    ...base,
    id: "m-psda-scatter",
    subdomain: "Two-variable data: models and scatterplots",
    skills: ["Line of best fit", "Predicting from a model"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 14,
    build(rng: Rng): ItemBody {
      const slope = rng.pick([1.5, 2, 2.5, 3, 4, -1.5, -2, -3]);
      const intercept = rng.int(10, 60);
      const xs = Array.from({ length: 9 }, (_, i) => i * 2 + 2);
      const points = xs.map((x) => ({
        x,
        y: Number((slope * x + intercept + rng.int(-4, 4)).toFixed(1)),
      }));
      const target = 24;
      const answer = slope * target + intercept;
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(slope * target),
        num(intercept),
        num(slope + intercept),
        num(answer + rng.int(8, 20)),
      ]);
      return {
        stimulus: {
          type: "chart",
          chart: "scatter",
          title: "Yield versus days of exposure",
          xLabel: "Days of exposure",
          yLabel: "Yield (grams)",
          series: [{ label: "Observed", points }],
          trendline: { slope, intercept, label: "Line of best fit" },
        },
        prompt:
          `The scatterplot shows the relationship between days of exposure and yield for nine samples, ` +
          `along with the line of best fit. Based on this line, what yield, in grams, is predicted for ` +
          `$${target}$ days of exposure?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The line of best fit is $y = ${num(slope)}x ${signed(intercept)}$. Substituting $x = ${target}$ ` +
          `gives $y = ${num(slope)}(${target}) ${signed(intercept)} = ${num(answer)}$ grams.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-scatter-slope",
    subdomain: "Two-variable data: models and scatterplots",
    skills: ["Interpreting slope in context", "Linear models"],
    difficulty: "medium",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const slope = rng.pick([0.4, 0.8, 1.2, 2.5, 3.5]);
      const intercept = rng.int(5, 40);
      const points = Array.from({ length: 8 }, (_, i) => ({
        x: i * 3 + 3,
        y: Number((slope * (i * 3 + 3) + intercept + rng.int(-3, 3)).toFixed(1)),
      }));
      const correct = `The predicted number of nesting pairs increases by about $${num(slope)}$ for each additional hectare of restored wetland.`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `The predicted number of nesting pairs increases by about $${intercept}$ for each additional hectare of restored wetland.`,
          `There are about $${num(slope)}$ nesting pairs when no wetland has been restored.`,
          `The predicted area of restored wetland increases by about $${num(slope)}$ hectares for each additional nesting pair.`,
        ],
        { sortNumeric: false },
      );
      return {
        stimulus: {
          type: "chart",
          chart: "scatter",
          title: "Nesting pairs versus restored wetland",
          xLabel: "Restored wetland (hectares)",
          yLabel: "Nesting pairs",
          series: [{ label: "Survey sites", points }],
          trendline: { slope, intercept, label: "Line of best fit" },
        },
        prompt:
          `The line of best fit for the data shown is $y = ${num(slope)}x + ${intercept}$, where $x$ is the ` +
          `area of restored wetland, in hectares, and $y$ is the number of nesting pairs. What is the best ` +
          `interpretation of the slope of this line?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Slope is the change in $y$ per one-unit change in $x$. Here one additional hectare of restored ` +
          `wetland corresponds to a predicted increase of about $${num(slope)}$ nesting pairs. ` +
          `The value $${intercept}$ is the y-intercept, the predicted count when $x = 0$.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-inference",
    subdomain: "Inference from sample statistics and margin of error",
    skills: ["Margin of error", "Confidence intervals"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const city = rng.pick(CITY_SETTINGS);
      const estimate = rng.int(30, 70);
      const moe = rng.pick([2, 2.5, 3, 3.5, 4]);
      const lo = Number((estimate - moe).toFixed(1));
      const hi = Number((estimate + moe).toFixed(1));
      const correct = `Between $${num(lo)}\\%$ and $${num(hi)}\\%$`;
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          `Between $${num(estimate - 2 * moe)}\\%$ and $${num(estimate + 2 * moe)}\\%$`,
          `Exactly $${estimate}\\%$`,
          `Between $${num(estimate)}\\%$ and $${num(hi)}\\%$`,
        ],
        { sortNumeric: false },
      );
      return {
        prompt:
          `A random sample of residents of ${city} was surveyed about a proposed transit line. ` +
          `In the sample, $${estimate}\\%$ supported the proposal, with an associated margin of error of ` +
          `$${num(moe)}$ percentage points at a $95\\%$ confidence level. Which is the most appropriate ` +
          `conclusion about the percentage of all ${city} residents who support the proposal?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The confidence interval is the sample estimate plus or minus the margin of error: ` +
          `$${estimate}\\% \\pm ${num(moe)}\\%$, that is, from $${num(lo)}\\%$ to $${num(hi)}\\%$. ` +
          `A margin of error describes an interval of plausible values, not a single exact value.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-study-design",
    subdomain: "Evaluating statistical claims: observational studies and experiments",
    skills: ["Generalizability", "Causal versus associational claims"],
    difficulty: "hard",
    calculator: "not-needed",
    variants: 12,
    build(rng: Rng): ItemBody {
      const name = rng.pick(NAMES);
      const random = rng.bool();
      const correct = random
        ? "The conclusion is appropriate, because participants were randomly assigned to the two groups."
        : "The conclusion is not appropriate, because participants were not randomly assigned to the two groups.";
      const { choices, correct: key } = buildChoices(
        rng,
        correct,
        [
          random
            ? "The conclusion is not appropriate, because participants were not randomly assigned to the two groups."
            : "The conclusion is appropriate, because participants were randomly assigned to the two groups.",
          "The conclusion is not appropriate, because the sample size was too small to detect any difference.",
          "The conclusion is appropriate, because the two groups reported different average results.",
        ],
        { sortNumeric: false },
      );
      const design = random
        ? `${name} randomly assigned each of the 400 volunteers to either a standing-desk group or a seated group`
        : `${name} recruited 400 volunteers and allowed each one to choose either the standing-desk group or the seated group`;
      return {
        prompt:
          `${design}. After eight weeks, the standing-desk group reported a higher average alertness score ` +
          `than the seated group. ${name} concluded that using a standing desk causes an increase in ` +
          `alertness. Is this conclusion appropriate?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation: random
          ? `Random assignment to treatment groups is what licenses a causal conclusion: it makes the two ` +
            `groups comparable at the start, so a difference in outcomes is attributable to the treatment.`
          : `When participants choose their own group, the groups may differ systematically in ways that ` +
            `also affect alertness. Without random assignment the study can establish an association, but ` +
            `not causation.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-bar",
    subdomain: "Two-variable data: models and scatterplots",
    skills: ["Reading bar graphs", "Comparing categories"],
    difficulty: "easy",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const cats = ["Compost", "Glass", "Metal", "Paper", "Plastic"];
      const values = cats.map(() => rng.int(20, 180));
      const maxIdx = values.indexOf(Math.max(...values));
      const minIdx = values.indexOf(Math.min(...values));
      const answer = values[maxIdx] - values[minIdx];
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(values[maxIdx]),
        num(values[minIdx]),
        num(values.reduce((a, b) => a + b, 0)),
        num(Math.round(mean(values))),
      ]);
      return {
        stimulus: {
          type: "chart",
          chart: "bar",
          title: "Material collected in one month",
          xLabel: "Material",
          yLabel: "Mass collected (kilograms)",
          categories: cats,
          series: [{ label: "Mass", points: values.map((y, x) => ({ x, y })) }],
        },
        prompt:
          `The bar graph shows the mass of each material collected at a recycling center in one month. ` +
          `How many more kilograms of the most-collected material were collected than of the ` +
          `least-collected material?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `The tallest bar is ${cats[maxIdx]} at $${values[maxIdx]}$ kilograms and the shortest is ` +
          `${cats[minIdx]} at $${values[minIdx]}$ kilograms. The difference is ` +
          `$${values[maxIdx]} - ${values[minIdx]} = ${answer}$ kilograms.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-spr-percent",
    subdomain: "Percentages",
    skills: ["Percent of a number", "Student-produced response"],
    difficulty: "medium",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const total = rng.int(4, 30) * 25;
      const pct1 = rng.pick([20, 25, 30, 40, 60]);
      const pct2 = rng.pick([10, 20, 25, 50]);
      const first = (total * pct1) / 100;
      const answer = (first * pct2) / 100;
      assertClose((total * pct1 * pct2) / 10000, answer, "spr-percent");
      return {
        prompt:
          `A shipment contains $${total}$ ${rng.pick(ITEMS).plural}. Of these, $${pct1}\\%$ are marked for ` +
          `inspection, and $${pct2}\\%$ of the inspected items are set aside for repackaging. How many ` +
          `items are set aside for repackaging?`,
        answerFormat: "student-response",
        correct: num(answer),
        acceptedAnswers: acceptedNumericForms(answer),
        explanation:
          `First, $${pct1}\\%$ of $${total}$ is $${num(first)}$ items marked for inspection. ` +
          `Then $${pct2}\\%$ of $${num(first)}$ is $${num(answer)}$ items set aside for repackaging.`,
      };
    },
  },
  {
    ...base,
    id: "m-psda-density",
    subdomain: "Ratios, rates, proportional relationships, and units",
    skills: ["Density and rate conversion", "Multi-step unit reasoning"],
    difficulty: "hard",
    calculator: "recommended",
    variants: 12,
    build(rng: Rng): ItemBody {
      const density = rng.pick([1.2, 2.5, 3.4, 4.8, 7.9]);
      const volume = rng.pick([25, 40, 60, 120, 250]);
      const answer = Number((density * volume).toFixed(2));
      const correct = num(answer);
      const { choices, correct: key } = buildChoices(rng, correct, [
        num(Number((volume / density).toFixed(2))),
        num(Number((density / volume).toFixed(4))),
        num(density + volume),
        num(answer / 10),
      ]);
      return {
        prompt:
          `A metal alloy has a density of $${num(density)}$ grams per cubic centimeter. A solid block of ` +
          `this alloy has a volume of $${volume}$ cubic centimeters. What is the mass, in grams, of the block?`,
        answerFormat: "multiple-choice",
        choices,
        correct: key,
        explanation:
          `Density is mass per unit volume, so mass equals density times volume: ` +
          `$${num(density)} \\dfrac{\\text{g}}{\\text{cm}^3} \\times ${volume}\\ \\text{cm}^3 = ${num(answer)}$ grams. ` +
          `The cubic-centimeter units cancel, leaving grams.`,
      };
    },
  },
];
