/**
 * Additional Standard English Conventions items.
 *
 * This second file exists because the blueprint asks for seven conventions
 * questions in each 27-question module — twenty-one across a full form's three
 * Reading and Writing modules — and a bank that supports many non-repeating
 * tests needs depth here more than anywhere else. The items lean easier than
 * those in `conventions.ts`, which keeps the standard (lower) second module
 * reachable without watering down the harder forms.
 */
import { Rng } from "../rng";
import { ORIGINAL, type ItemBody, type Template } from "../types";
import { buildChoices } from "../util";
import type { Difficulty } from "../../../src/lib/sat/types";

const base = { subject: "rw", domain: "standard-english-conventions", source: ORIGINAL } as const;

const PROMPT = "Which choice completes the text so that it conforms to the conventions of Standard English?";

interface Seed {
  text: string;
  answer: string;
  wrong: [string, string, string];
  why: string;
}

function template(
  id: string,
  subdomain: string,
  skills: string[],
  difficulty: Difficulty,
  seeds: Seed[],
): Template {
  return {
    ...base,
    id,
    subdomain,
    skills,
    difficulty,
    variants: seeds.length,
    build(rng: Rng, index: number): ItemBody {
      const seed = seeds[index % seeds.length];
      const { choices, correct } = buildChoices(rng, seed.answer, seed.wrong, { sortNumeric: false });
      return {
        stimulus: { type: "passage", paragraphs: [seed.text] },
        prompt: PROMPT,
        answerFormat: "multiple-choice",
        choices,
        correct,
        explanation: seed.why,
      };
    },
  };
}

/* ------------------------------------------------------- verb forms (easy) */

const VERB_SEEDS: Seed[] = [
  {
    text: "The observatory's oldest telescope ______ in continuous use since 1893.",
    answer: "has been",
    wrong: ["have been", "were", "being"],
    why: "The singular subject *telescope* takes the singular auxiliary *has*, and *since 1893* calls for the present perfect.",
  },
  {
    text: "Each spring, thousands of sandhill cranes ______ along a sixty-mile stretch of the Platte River.",
    answer: "gather",
    wrong: ["gathers", "has gathered", "gathering"],
    why: "The plural subject *thousands* takes the plural verb *gather*, and *each spring* calls for the simple present.",
  },
  {
    text: "The recipe ______ for two cups of stock, but the cook doubled everything.",
    answer: "called",
    wrong: ["call", "have called", "calling"],
    why: "The second clause is in the past tense (*doubled*), so the first verb must be the past-tense *called*.",
  },
  {
    text: "Before the bridge opened, ferries ______ the only way to cross the estuary.",
    answer: "were",
    wrong: ["was", "are", "being"],
    why: "The plural subject *ferries* takes the plural past-tense verb *were*.",
  },
  {
    text: "The exhibition ______ next month and will run through the end of the year.",
    answer: "opens",
    wrong: ["open", "opening", "have opened"],
    why: "The singular subject *exhibition* takes the singular verb *opens*; the present tense is standard for a scheduled future event.",
  },
  {
    text: "Neither of the two prototypes ______ the impact test on the first attempt.",
    answer: "passed",
    wrong: ["pass", "have passed", "passing"],
    why: "*Neither* is singular, and *on the first attempt* places the action in the past, so *passed* is correct.",
  },
  {
    text: "The engineers ______ the sensor array three times before the readings stabilized.",
    answer: "recalibrated",
    wrong: ["recalibrate", "recalibrating", "has recalibrated"],
    why: "The clause *before the readings stabilized* is in the past, so the main verb must be the past-tense *recalibrated*.",
  },
  {
    text: "A single colony of these ants ______ as many as half a million individuals.",
    answer: "contains",
    wrong: ["contain", "containing", "have contained"],
    why: "The subject is the singular *colony*; *of these ants* is a prepositional phrase. The singular verb *contains* is required.",
  },
  {
    text: "Every year since the survey began, participation ______ by roughly two percent.",
    answer: "has grown",
    wrong: ["have grown", "growing", "grow"],
    why: "The singular subject *participation* takes *has*, and an action continuing to the present calls for the present perfect.",
  },
  {
    text: "The two paintings ______ almost identical until they are viewed under ultraviolet light.",
    answer: "look",
    wrong: ["looks", "looking", "has looked"],
    why: "The plural subject *paintings* takes the plural verb *look*.",
  },
  {
    text: "By the time the funding arrived, the laboratory ______ its equipment to another department.",
    answer: "had transferred",
    wrong: ["has transferred", "transfers", "transferring"],
    why: "The transfer happened before another past event, which the past perfect *had transferred* expresses.",
  },
  {
    text: "Most of the seedlings ______ the first frost, but a few did not.",
    answer: "survived",
    wrong: ["survives", "surviving", "has survived"],
    why: "With *most of*, the verb agrees with the plural *seedlings*, and *did not* places the sentence in the past.",
  },
  {
    text: "The archive ______ material in eleven languages, including three that are no longer spoken.",
    answer: "holds",
    wrong: ["hold", "holding", "have held"],
    why: "The singular subject *archive* takes the singular verb *holds*.",
  },
  {
    text: "Researchers ______ the same reef every October for the past twenty years.",
    answer: "have surveyed",
    wrong: ["has surveyed", "surveys", "surveying"],
    why: "The plural subject *researchers* takes *have*, and *for the past twenty years* calls for the present perfect.",
  },
];

/* ------------------------------------------------- commas in lists (easy) */

const LIST_SEEDS: Seed[] = [
  {
    text: "The kit contains a compass, a folding knife, ______ a length of waxed cord.",
    answer: "and",
    wrong: [", and,", "and,", ", and also,"],
    why: "In a simple series, the final item is joined by *and* with no additional comma after it.",
  },
  {
    text: "Three cities hosted the exhibition: ______ Lisbon, and Kraków.",
    answer: "Marseille,",
    wrong: ["Marseille", "Marseille;", "Marseille:"],
    why: "Items in a series are separated by commas, so *Marseille* needs a comma before the next item.",
  },
  {
    text: "The technique requires patience, a steady hand, and ______ practice.",
    answer: "considerable",
    wrong: ["considerable,", ", considerable", "; considerable"],
    why: "*Considerable* modifies *practice* directly, so no punctuation separates the adjective from its noun.",
  },
  {
    text: "The greenhouse maintains three zones: a humid tropical room, a temperate room, ______ a cool alpine room.",
    answer: "and",
    wrong: ["and,", ", and,", "; and"],
    why: "The final item in a series takes *and* with no comma after it.",
  },
  {
    text: "She studied physics at Manchester, worked briefly in radio astronomy, ______ eventually turned to seismology.",
    answer: "and",
    wrong: ["and,", ", and,", "; and,"],
    why: "Three parallel verb phrases form a series; the last is joined by *and* with no extra punctuation.",
  },
  {
    text: "The report lists the causes in order: overloading, poor maintenance, ______ an undersized relay.",
    answer: "and",
    wrong: ["and,", ", and,", "; and,"],
    why: "The last item in the series takes *and*, and no comma follows the conjunction.",
  },
  {
    text: "Her best-known works are a string quartet, two song cycles, ______ an unfinished opera.",
    answer: "and",
    wrong: ["and,", ", and,", ": and"],
    why: "A simple series ends with *and* before the final item, without additional punctuation.",
  },
  {
    text: "The samples were labeled by site, ______ and depth before being shipped to the laboratory.",
    answer: "date,",
    wrong: ["date", "date;", "date:"],
    why: "Each item in a series is followed by a comma, so *date* takes a comma before *and depth*.",
  },
  {
    text: "The trail crosses two rivers, a meadow, ______ a stretch of exposed granite.",
    answer: "and",
    wrong: ["and,", ", and,", "; and,"],
    why: "The final item in the series is introduced by *and* with no comma after it.",
  },
  {
    text: "Applicants must submit a portfolio, ______ and two letters of reference.",
    answer: "a statement of purpose,",
    wrong: ["a statement of purpose", "a statement of purpose;", "a statement of purpose:"],
    why: "The middle item in a series is followed by a comma before the conjunction that introduces the last item.",
  },
];

/* ----------------------------------------- introductory elements (easy) */

const INTRO_SEEDS: Seed[] = [
  {
    text: "After nearly a decade of restoration ______ the organ was played publicly for the first time since 1968.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "An introductory phrase is set off from the main clause by a comma.",
  },
  {
    text: "In the shallow water near the reef crest ______ juvenile fish shelter among the branching corals.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "A long introductory prepositional phrase takes a comma before the main clause begins.",
  },
  {
    text: "Although the notation looks unfamiliar ______ the underlying arithmetic is entirely ordinary.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "An introductory subordinate clause beginning with *although* is followed by a comma.",
  },
  {
    text: "Startled by the sudden noise ______ the flock lifted from the field all at once.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "An introductory participial phrase must be followed by a comma.",
  },
  {
    text: "By 1911 ______ the technique had spread to workshops in every major printing centre.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "An introductory element is separated from the main clause by a comma.",
  },
  {
    text: "To reach the summit before the afternoon storms ______ climbers leave the high camp before three in the morning.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "An introductory infinitive phrase is followed by a comma.",
  },
  {
    text: "Because the sample had been stored below freezing ______ the DNA remained intact after forty years.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "An introductory *because* clause is subordinate and takes a comma before the main clause.",
  },
  {
    text: "Working from a single photograph ______ the modelmaker reconstructed the entire facade.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "The introductory participial phrase requires a comma before the main clause.",
  },
  {
    text: "Once the kiln reaches temperature ______ the glaze fuses to the clay body within minutes.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "An introductory clause beginning with *once* is subordinate and takes a comma.",
  },
  {
    text: "Unlike its close relatives ______ this species forages almost entirely at night.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "An introductory phrase beginning with *unlike* is set off by a comma.",
  },
];

/* ---------------------------------------- pronouns and comparison (easy) */

const CLARITY_SEEDS: Seed[] = [
  {
    text: "The revised design is far more efficient than ______ was.",
    answer: "the original",
    wrong: ["the original one's", "the originals", "the originals'"],
    why: "The comparison needs a plain singular noun phrase; no possessive or plural is involved.",
  },
  {
    text: "Of the two proposals, the second is ______ .",
    answer: "the more detailed",
    wrong: ["the most detailed", "more detailed than any", "most detailed of them"],
    why: "When exactly two things are compared, the comparative form *more detailed* is used, not the superlative.",
  },
  {
    text: "Among the four candidate sites, the coastal one has ______ average wind speed.",
    answer: "the highest",
    wrong: ["the higher", "a higher", "more high"],
    why: "With more than two items compared, the superlative *the highest* is correct.",
  },
  {
    text: "The new alloy is lighter than ______ used in the previous model.",
    answer: "the one",
    wrong: ["that of", "those", "them"],
    why: "The comparison is with a single alloy, so the singular *the one* keeps the two sides parallel.",
  },
  {
    text: "The northern population is larger than ______ of the southern population.",
    answer: "that",
    wrong: ["those", "them", "it"],
    why: "*That* stands in for the singular *population*, keeping the comparison between comparable things.",
  },
  {
    text: "Her second novel sold more copies than ______ first.",
    answer: "her",
    wrong: ["hers", "she's", "her's"],
    why: "The possessive determiner *her* precedes the noun *first*; *hers* stands alone and takes no noun.",
  },
  {
    text: "The results from the two labs differ from ______ by less than one percent.",
    answer: "each other",
    wrong: ["themselves", "one another's", "each others"],
    why: "*Each other* is the standard reciprocal pronoun for two parties, and no possessive is needed here.",
  },
  {
    text: "Between the two of us, ______ finished the transcription first.",
    answer: "she",
    wrong: ["her", "hers", "herself"],
    why: "The pronoun is the subject of *finished*, so the subjective form *she* is required.",
  },
  {
    text: "The committee thanked the volunteers and ______ for staying past midnight.",
    answer: "me",
    wrong: ["I", "myself", "mine"],
    why: "The pronoun is part of the compound object of *thanked*, so the objective form *me* is required.",
  },
  {
    text: "This year's harvest was smaller than ______ , though the quality was better.",
    answer: "last year's",
    wrong: ["last year", "last years", "last years'"],
    why: "The comparison is between two harvests, so the possessive *last year's* stands for *last year's harvest*.",
  },
];

/* ------------------------------------------------- apostrophes (easy) */

const APOSTROPHE_SEEDS: Seed[] = [
  {
    text: "The building's copper roof has weathered to a green that ______ hard to reproduce in paint.",
    answer: "is",
    wrong: ["its", "it's being", "are"],
    why: "The relative clause needs the verb *is*; *its* is a possessive and cannot serve as a verb.",
  },
  {
    text: "______ remarkable how little the design changed between 1930 and 1975.",
    answer: "It's",
    wrong: ["Its", "Its'", "It is'"],
    why: "The sentence needs the contraction of *it is*, spelled *it's*.",
  },
  {
    text: "The orchestra returned to ______ home hall after three seasons on tour.",
    answer: "its",
    wrong: ["it's", "its'", "their's"],
    why: "The possessive form of *it* is *its*, with no apostrophe.",
  },
  {
    text: "The ______ nests are built almost entirely from spider silk and lichen.",
    answer: "hummingbird's",
    wrong: ["hummingbirds", "hummingbirds'", "hummingbirds's"],
    why: "The nests belong to a single hummingbird, so the singular possessive *hummingbird's* is correct.",
  },
  {
    text: "Several ______ signatures appear at the bottom of the 1848 petition.",
    answer: "delegates'",
    wrong: ["delegate's", "delegates", "delegates's"],
    why: "*Several* makes the noun plural, and the signatures belong to them, so the plural possessive is required.",
  },
  {
    text: "______ going to need a longer exposure to capture the fainter stars.",
    answer: "You're",
    wrong: ["Your", "Yours", "You'r"],
    why: "The sentence needs the contraction of *you are*, spelled *you're*.",
  },
  {
    text: "The ______ decision to publish the raw data was unusual for the time.",
    answer: "editors'",
    wrong: ["editor's", "editors", "editors's"],
    why: "The plural possessive *editors'* is required when more than one editor made the decision together.",
  },
  {
    text: "The mural survived because ______ was covered by a false wall for sixty years.",
    answer: "it",
    wrong: ["its", "it's", "its'"],
    why: "The clause needs the subject pronoun *it*, not a possessive or a contraction.",
  },
  {
    text: "The ______ of the region adopted the new glaze within a single generation.",
    answer: "workshops",
    wrong: ["workshop's", "workshops'", "workshops's"],
    why: "The sentence needs a simple plural subject; nothing is possessed, so no apostrophe belongs here.",
  },
  {
    text: "Every one of the ______ instruments was tuned to the same reference pitch.",
    answer: "ensemble's",
    wrong: ["ensembles", "ensembles'", "ensembles's"],
    why: "The instruments belong to one ensemble, so the singular possessive *ensemble's* is correct.",
  },
];

export const CONVENTIONS_TEMPLATES_2: Template[] = [
  template("rw-sec2-verb", "Form, structure, and sense", ["Subject-verb agreement", "Verb forms"], "easy", VERB_SEEDS),
  template("rw-sec2-list", "Boundaries", ["Commas in a series", "Punctuating lists"], "easy", LIST_SEEDS),
  template("rw-sec2-intro", "Boundaries", ["Introductory elements", "Comma after an introductory phrase"], "easy", INTRO_SEEDS),
  template("rw-sec2-clarity", "Form, structure, and sense", ["Pronoun case", "Logical comparison"], "medium", CLARITY_SEEDS),
  template("rw-sec2-apostrophe", "Form, structure, and sense", ["Apostrophes", "Possessives and contractions"], "easy", APOSTROPHE_SEEDS),
];
