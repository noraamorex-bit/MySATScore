/**
 * Additional Expression of Ideas items, weighted toward the easier end.
 *
 * Transitions are the highest-volume skill in this domain, and a full form
 * needs fifteen Expression of Ideas questions across its three Reading and
 * Writing modules, so depth here directly determines how many non-repeating
 * tests the bank can support.
 */
import { Rng } from "../rng";
import { ORIGINAL, type ItemBody, type Template } from "../types";
import { buildChoices } from "../util";
import type { Difficulty } from "../../../src/lib/sat/types";

const base = { subject: "rw", domain: "expression-of-ideas", source: ORIGINAL } as const;

interface Seed {
  text: string;
  answer: string;
  wrong: [string, string, string];
  why: string;
}

const SEEDS: Seed[] = [
  {
    text: "Sea otters have no blubber. ______ they rely on the densest fur of any mammal — around a million hairs per square inch — to stay warm.",
    answer: "Instead,",
    wrong: ["Similarly,", "In addition,", "For example,"],
    why: "The second sentence names what replaces the missing blubber, which calls for a substitution transition.",
  },
  {
    text: "The bridge was designed for a maximum load of forty tonnes. ______ vehicles above that weight are routed through the town centre.",
    answer: "Accordingly,",
    wrong: ["Nevertheless,", "In contrast,", "Meanwhile,"],
    why: "The routing follows from the load limit, so a resultative transition is required.",
  },
  {
    text: "Bamboo is a grass rather than a tree. ______ some species can grow nearly a metre in a single day.",
    answer: "Partly for that reason,",
    wrong: ["In contrast,", "Nonetheless,", "Afterward,"],
    why: "The growth rate follows from bamboo's being a grass, so the transition must signal cause rather than contrast.",
  },
  {
    text: "Most volcanic eruptions are preceded by measurable ground swelling. ______ the 1980 eruption of Mount St. Helens was tracked for weeks by surveyors watching a bulge grow on the north flank.",
    answer: "For instance,",
    wrong: ["However,", "Consequently,", "In conclusion,"],
    why: "The second sentence gives a specific case of the general claim, calling for an illustrative transition.",
  },
  {
    text: "Paper made from cotton rag can last for centuries. ______ paper made from wood pulp yellows and becomes brittle within decades unless it is treated.",
    answer: "By contrast,",
    wrong: ["As a result,", "Likewise,", "In particular,"],
    why: "The two kinds of paper behave oppositely, which calls for a contrastive transition.",
  },
  {
    text: "The theatre's acoustics were praised from its opening night. ______ the architect had never designed a concert hall before.",
    answer: "Remarkably,",
    wrong: ["Therefore,", "Similarly,", "Subsequently,"],
    why: "The second sentence makes the first surprising, which calls for a transition signalling that surprise.",
  },
  {
    text: "Honey does not spoil. ______ jars recovered from Egyptian tombs have been found still edible after three thousand years.",
    answer: "In fact,",
    wrong: ["Nevertheless,", "By comparison,", "Beforehand,"],
    why: "The second sentence strengthens and confirms the first with a striking example.",
  },
  {
    text: "The census counted only heads of household. ______ historians using it to estimate population must multiply by an assumed household size.",
    answer: "As a result,",
    wrong: ["Even so,", "Similarly,", "Previously,"],
    why: "The methodological consequence follows from the limitation, so a resultative transition is needed.",
  },
  {
    text: "Antarctic ice cores preserve trapped air bubbles from the moment the snow compacted. ______ they record the composition of the atmosphere directly rather than by inference.",
    answer: "Because of this,",
    wrong: ["Nevertheless,", "In contrast,", "For example,"],
    why: "The direct record follows from the trapped bubbles, so the transition must be causal.",
  },
  {
    text: "The manuscript was catalogued in 1908 and then forgotten. ______ it was rediscovered in 2004 by a graduate student checking shelf marks.",
    answer: "Nearly a century later,",
    wrong: ["Similarly,", "Therefore,", "In other words,"],
    why: "The second sentence marks the next event in a chronological account, calling for a sequential transition.",
  },
  {
    text: "Titanium is as strong as many steels and far lighter. ______ it is difficult to machine and expensive to refine, which limits its use.",
    answer: "However,",
    wrong: ["Likewise,", "Consequently,", "Specifically,"],
    why: "An advantage is followed by an offsetting drawback, so a contrastive transition is required.",
  },
  {
    text: "A lighthouse keeper's log recorded the weather every four hours without fail. ______ climate scientists now use these logs to extend records back beyond instrumental data.",
    answer: "Consequently,",
    wrong: ["In contrast,", "Nonetheless,", "For instance,"],
    why: "The scientific use follows from the completeness of the logs.",
  },
  {
    text: "Fungi were long classified with plants. ______ genetic evidence has shown that they are more closely related to animals.",
    answer: "In fact,",
    wrong: ["Likewise,", "Therefore,", "Meanwhile,"],
    why: "The second sentence corrects the classification stated in the first, calling for a corrective transition.",
  },
  {
    text: "The train line has run at a loss every year since 1974. ______ closing it would leave four towns without any public transport at all.",
    answer: "Still,",
    wrong: ["Thus,", "Moreover,", "That is,"],
    why: "A reason to close the line is set against a reason not to, so the transition must concede and contrast.",
  },
  {
    text: "Marble is metamorphosed limestone, and limestone is made largely of the shells of marine organisms. ______ a marble column is, in a literal sense, compressed sea life.",
    answer: "In other words,",
    wrong: ["However,", "For instance,", "Previously,"],
    why: "The second sentence restates the first in more vivid terms, calling for a clarifying transition.",
  },
  {
    text: "Snow reflects most of the sunlight that strikes it. ______ bare ground absorbs it, which is why an early thaw tends to accelerate itself.",
    answer: "Dark",
    wrong: ["Similarly, dark", "Consequently, dark", "For example, dark"],
    why: "The sentence contrasts reflective snow with absorbent bare ground; adding a transition of similarity, result, or example misstates the relationship.",
  },
  {
    text: "The dictionary took seventy years to complete. ______ several of its original editors did not live to see it published.",
    answer: "Unsurprisingly,",
    wrong: ["In contrast,", "For example,", "Beforehand,"],
    why: "The second sentence is an expected consequence of the first, which is what the transition should signal.",
  },
  {
    text: "Most seeds germinate only after a period of cold. ______ some pine species require the heat of a fire to open their cones at all.",
    answer: "A few,",
    wrong: ["Similarly,", "Consequently,", "In summary,"],
    why: "The second sentence names an exception to the general rule, so a transition of similarity or result would misdescribe it.",
  },
  {
    text: "Guitar strings are usually replaced when they lose brightness. ______ many jazz players deliberately keep old strings, preferring the duller tone.",
    answer: "Even so,",
    wrong: ["Accordingly,", "Likewise,", "In brief,"],
    why: "The players' preference runs against the usual practice, calling for a concessive contrast.",
  },
  {
    text: "Concrete continues to gain strength for years after it is poured. ______ engineers specify a twenty-eight-day test because that is when most of the strength has developed.",
    answer: "Nevertheless,",
    wrong: ["Therefore,", "Similarly,", "For example,"],
    why: "The fixed twenty-eight-day test stands in tension with continuing strength gain, so a contrastive transition is needed.",
  },
  {
    text: "The archive contains no correspondence from the composer's final decade. ______ his letters from that period were destroyed in a fire in 1919.",
    answer: "The gap is explained simply:",
    wrong: ["The gap is surprising:", "Similarly,", "In addition,"],
    why: "The second sentence supplies the reason for the gap, so the transition should introduce an explanation.",
  },
  {
    text: "Whales navigate partly by listening. ______ shipping noise in busy waters can mask the calls they use to stay in contact.",
    answer: "For that reason,",
    wrong: ["Nonetheless,", "In contrast,", "Afterward,"],
    why: "The vulnerability to noise follows from the reliance on hearing.",
  },
  {
    text: "Both authors describe the same street in the same decade. ______ one remembers it as crowded and loud, the other as nearly deserted.",
    answer: "Yet",
    wrong: ["Thus", "Furthermore", "Likewise"],
    why: "The two accounts conflict despite the shared subject, so a contrastive transition is required.",
  },
  {
    text: "Sourdough bread keeps longer than bread made with commercial yeast. ______ the acids produced during a long fermentation slow the growth of mould.",
    answer: "This is because",
    wrong: ["In contrast,", "Even so,", "Subsequently,"],
    why: "The second sentence explains the first, so the transition must introduce a cause.",
  },
  {
    text: "The species was declared extinct in 1989. ______ a small population was found in 2011 on an island that had never been surveyed.",
    answer: "Then,",
    wrong: ["Similarly,", "Therefore,", "In short,"],
    why: "The rediscovery is the next event in a sequence, and it reverses the first sentence rather than following from it.",
  },
  {
    text: "Solar panels lose efficiency as they get hotter. ______ a cool, bright day generates more power than a hot, bright one.",
    answer: "Counterintuitively,",
    wrong: ["Predictably,", "Similarly,", "In addition,"],
    why: "The result runs against what most readers would expect, which the transition should flag.",
  },
  {
    text: "The vault holds duplicate seed samples from more than a thousand gene banks. ______ it stores no unique material of its own.",
    answer: "By design,",
    wrong: ["Unfortunately,", "Similarly,", "As a result,"],
    why: "Holding only duplicates is the vault's intended function, not a shortcoming or a consequence.",
  },
  {
    text: "Ravens can recognize individual human faces and remember them for years. ______ they appear to share that information: a person who has threatened one bird is soon scolded by others that were never present.",
    answer: "More surprisingly,",
    wrong: ["Less importantly,", "In contrast,", "Beforehand,"],
    why: "The second observation escalates the first, so the transition should mark an increase in significance.",
  },
];

export const EXPRESSION_TEMPLATES_2: Template[] = [
  {
    ...base,
    id: "rw-eoi2-transition",
    subdomain: "Transitions",
    skills: ["Logical transitions", "Relationships between ideas"],
    difficulty: "easy" as Difficulty,
    variants: SEEDS.length,
    build(rng: Rng, index: number): ItemBody {
      const seed = SEEDS[index % SEEDS.length];
      const { choices, correct } = buildChoices(rng, seed.answer, seed.wrong, { sortNumeric: false });
      return {
        stimulus: { type: "passage", paragraphs: [seed.text] },
        prompt: "Which choice completes the text with the most logical transition?",
        answerFormat: "multiple-choice",
        choices,
        correct,
        explanation: seed.why,
      };
    },
  },
];
