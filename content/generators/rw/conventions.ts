/**
 * Standard English Conventions templates (~26% of Reading and Writing).
 *
 * Each item follows the real test's format: a short passage with one blank,
 * asking which choice "conforms to the conventions of Standard English." The
 * passage contexts below are authored individually; the four choices for each
 * are derived from the grammar point under test, so every distractor
 * corresponds to a specific, nameable error rather than filler.
 */
import { Rng } from "../rng";
import { ORIGINAL, type ItemBody, type Template } from "../types";
import { buildChoices } from "../util";

const base = {
  subject: "rw",
  domain: "standard-english-conventions",
  source: ORIGINAL,
} as const;

const CONVENTIONS_PROMPT =
  "Which choice completes the text so that it conforms to the conventions of Standard English?";

interface BlankSeed {
  /** Passage text; `___` marks the blank. */
  text: string;
  /** The correct filler. */
  answer: string;
  /** Three incorrect fillers, each a distinct, nameable error. */
  wrong: [string, string, string];
  /** Why the answer is right, phrased as the test's own rationales are. */
  why: string;
}

/** Turns an authored blank-fill seed into a finished item body. */
function blankItem(rng: Rng, seed: BlankSeed, skills: string[]): ItemBody {
  const { choices, correct } = buildChoices(rng, seed.answer, seed.wrong, { sortNumeric: false });
  return {
    stimulus: { type: "passage", paragraphs: [seed.text.replace(/___/g, "______")] },
    prompt: CONVENTIONS_PROMPT,
    answerFormat: "multiple-choice",
    choices,
    correct,
    explanation: seed.why,
    skills,
  };
}

/** Builds one template from a list of authored seeds. */
function seedTemplate(
  id: string,
  subdomain: string,
  skills: string[],
  difficulty: "easy" | "medium" | "hard",
  seeds: BlankSeed[],
): Template {
  return {
    ...base,
    id,
    subdomain,
    skills,
    difficulty,
    variants: seeds.length,
    build(rng: Rng, index: number): ItemBody {
      return blankItem(rng, seeds[index % seeds.length], skills);
    },
  };
}

/* ------------------------------------------------ subject-verb agreement */

const SVA_SEEDS: BlankSeed[] = [
  {
    text: "The collection of meteorite fragments housed in the university's geology annex ___ from at least three separate impact events, according to isotopic dating.",
    answer: "derives",
    wrong: ["derive", "have derived", "are deriving"],
    why: "The subject of the verb is the singular noun *collection*, not the plural *fragments* inside the intervening prepositional phrase. A singular subject takes the singular verb *derives*.",
  },
  {
    text: "Among the artifacts recovered from the shipwreck ___ a set of brass navigational instruments still sealed in their original case.",
    answer: "was",
    wrong: ["were", "have been", "are"],
    why: "The sentence is inverted: the subject follows the verb. That subject is the singular noun *set*, so the singular verb *was* is required.",
  },
  {
    text: "Neither the lead engineer nor her two assistants ___ able to reproduce the anomalous reading that had appeared during the first trial.",
    answer: "were",
    wrong: ["was", "has been", "is"],
    why: "With *neither ... nor*, the verb agrees with the nearer subject. Here the nearer subject is the plural *assistants*, so the plural verb *were* is correct.",
  },
  {
    text: "Every one of the seventeen murals commissioned for the transit station ___ a scene drawn from the neighborhood's industrial past.",
    answer: "depicts",
    wrong: ["depict", "have depicted", "are depicting"],
    why: "*Every one* is singular, and the plural *murals* sits inside a prepositional phrase that cannot supply the subject. The singular verb *depicts* is required.",
  },
  {
    text: "The board of trustees, along with the two architects who submitted the winning proposal, ___ scheduled to review the revised plans in October.",
    answer: "is",
    wrong: ["are", "were", "have been"],
    why: "A phrase introduced by *along with* is not part of the subject. The subject remains the singular *board*, which takes the singular verb *is*.",
  },
  {
    text: "Data gathered by the buoy network over the past decade ___ that surface temperatures in the strait have risen more quickly than models predicted.",
    answer: "indicate",
    wrong: ["indicates", "has indicated", "is indicating"],
    why: "In scientific writing *data* is treated as a plural noun, so it takes the plural verb *indicate*.",
  },
  {
    text: "There ___ several competing explanations for why the pigment retained its intensity after four centuries beneath a layer of varnish.",
    answer: "are",
    wrong: ["is", "has been", "was"],
    why: "In a sentence beginning with *there*, the verb agrees with the subject that follows it — here the plural *explanations* — so *are* is correct.",
  },
  {
    text: "Each of the composers featured in the retrospective ___ worked in a genre considered marginal at the time of the recording.",
    answer: "has",
    wrong: ["have", "having", "are"],
    why: "*Each* is a singular pronoun; the plural *composers* appears only in the intervening prepositional phrase. The singular auxiliary *has* is required.",
  },
  {
    text: "The number of households relying on the community solar cooperative ___ nearly tripled since the program's pilot year.",
    answer: "has",
    wrong: ["have", "are having", "were"],
    why: "*The number of* is a singular expression, so it takes the singular auxiliary *has*. (*A number of*, by contrast, would be plural.)",
  },
  {
    text: "Mathematics, together with the statistical methods that grew out of it, ___ long provided ecologists with tools for describing population change.",
    answer: "has",
    wrong: ["have", "having", "were"],
    why: "*Mathematics* is singular despite its final *s*, and the *together with* phrase does not change the subject. The singular *has* is correct.",
  },
  {
    text: "Not one of the sensors installed along the ridge ___ recorded a tremor above the threshold set by the monitoring agency.",
    answer: "has",
    wrong: ["have", "having", "are"],
    why: "The subject is the singular *one*; *of the sensors* is a prepositional phrase. A singular subject takes the singular auxiliary *has*.",
  },
  {
    text: "Both the original manuscript and the printer's proof ___ annotations in a hand that scholars have yet to identify.",
    answer: "contain",
    wrong: ["contains", "has contained", "is containing"],
    why: "*Both ... and* joins two subjects into a compound plural subject, which takes the plural verb *contain*.",
  },
  {
    text: "The committee ___ divided over whether to preserve the facade or to rebuild the structure entirely.",
    answer: "is",
    wrong: ["are", "have been being", "were being"],
    why: "In American usage a collective noun such as *committee* is singular, so the singular verb *is* is correct.",
  },
  {
    text: "Three-quarters of the wetland restored during the first phase ___ already supporting nesting pairs that had not been recorded there in decades.",
    answer: "is",
    wrong: ["are", "have been", "were being"],
    why: "With a fraction, the verb agrees with the noun that follows *of*. Here that noun is the singular *wetland*, so *is* is correct.",
  },
  {
    text: "Whether the pigments were traded across the desert or produced locally ___ still a matter of active debate among archaeometrists.",
    answer: "is",
    wrong: ["are", "have been", "were"],
    why: "The subject is a noun clause beginning with *whether*, which functions as a singular unit and takes the singular verb *is*.",
  },
  {
    text: "The rings visible in a cross section of the trunk ___ a record of drought years reaching back to the middle of the nineteenth century.",
    answer: "provide",
    wrong: ["provides", "has provided", "is providing"],
    why: "The subject is the plural *rings*; *visible in a cross section of the trunk* is a modifier. A plural subject takes the plural verb *provide*.",
  },
];

/* ------------------------------------------------------------ verb tense */

const TENSE_SEEDS: BlankSeed[] = [
  {
    text: "By the time the survey team reached the summit in 1954, two earlier expeditions ___ already turned back at the same ridge.",
    answer: "had",
    wrong: ["have", "has", "will have"],
    why: "The earlier expeditions turned back *before* the 1954 arrival, and both events are in the past. The past perfect *had turned* marks the earlier of two past actions.",
  },
  {
    text: "Since the observatory opened in 2009, its wide-field camera ___ more than four thousand transient events.",
    answer: "has catalogued",
    wrong: ["catalogued", "had catalogued", "will catalogue"],
    why: "*Since* plus a past starting point describes an action continuing into the present, which calls for the present perfect *has catalogued*.",
  },
  {
    text: "Ellington rewrote the arrangement three times before the session, and by the final take the horn section ___ the new voicing without hesitation.",
    answer: "was playing",
    wrong: ["is playing", "has played", "will be playing"],
    why: "The whole sentence is set in the past, so the past progressive *was playing* correctly describes an action in progress at that past moment.",
  },
  {
    text: "Next spring, once the levee project is complete, the district ___ flood modeling for the lower watershed for a full decade.",
    answer: "will have been conducting",
    wrong: ["has been conducting", "had been conducting", "was conducting"],
    why: "The sentence looks ahead to a future point (*next spring*) and describes an activity continuing up to it, which calls for the future perfect progressive.",
  },
  {
    text: "Although researchers ___ the compound in 1978, its antifungal properties went unrecognized for another twenty years.",
    answer: "isolated",
    wrong: ["isolate", "have isolated", "will isolate"],
    why: "The date 1978 fixes a completed action in the past, so the simple past *isolated* is correct.",
  },
  {
    text: "Each winter, the glacier ___ several meters downslope before the summer melt slows its advance.",
    answer: "creeps",
    wrong: ["crept", "had crept", "will have crept"],
    why: "*Each winter* signals a habitual, recurring action, which English expresses with the simple present *creeps*.",
  },
  {
    text: "The letters that Wollstonecraft wrote from Scandinavia ___ a traveler increasingly skeptical of the commercial ambitions that had brought her north.",
    answer: "reveal",
    wrong: ["revealed", "had revealed", "will reveal"],
    why: "Discussing what a surviving text shows a present-day reader conventionally takes the present tense, so *reveal* is correct.",
  },
  {
    text: "Before the kiln was rebuilt, the workshop ___ its glazes at temperatures too low to vitrify the surface fully.",
    answer: "had been firing",
    wrong: ["has been firing", "is firing", "will be firing"],
    why: "The firing happened over a period *before* another past event, so the past perfect progressive *had been firing* is correct.",
  },
  {
    text: "If the funding is renewed, the field station ___ its seabird census through at least 2031.",
    answer: "will continue",
    wrong: ["continued", "had continued", "has continued"],
    why: "The sentence pairs a present-tense condition with a future result, so the future *will continue* is correct.",
  },
  {
    text: "For nearly a century after its publication, the treatise ___ largely ignored outside a small circle of instrument makers.",
    answer: "remained",
    wrong: ["remains", "has remained", "will remain"],
    why: "The phrase *for nearly a century after its publication* describes a completed span in the past, so the simple past *remained* is correct.",
  },
  {
    text: "The choreographer explained that she ___ the sequence after watching footage of shorebirds landing against a headwind.",
    answer: "had devised",
    wrong: ["devises", "will devise", "has devised"],
    why: "Within a past-tense report, an action that happened earlier still takes the past perfect *had devised*.",
  },
  {
    text: "Astronomers ___ the object for six more months before they can determine whether its orbit is genuinely hyperbolic.",
    answer: "will track",
    wrong: ["tracked", "had tracked", "have tracked"],
    why: "*Before they can determine* points forward from the present, so the future *will track* is correct.",
  },
  {
    text: "Whenever the tide falls below a meter, the exposed flats ___ thousands of migrating sandpipers within a few hours.",
    answer: "attract",
    wrong: ["attracted", "had attracted", "will have attracted"],
    why: "*Whenever* introduces a general, repeated condition, which takes the simple present *attract*.",
  },
  {
    text: "The archive ___ steadily since a private donor transferred her family's correspondence to the library in 2016.",
    answer: "has grown",
    wrong: ["grew", "had grown", "grows"],
    why: "The growth began at a specified past moment and continues now, which the present perfect *has grown* expresses.",
  },
];

/* ------------------------------------------------- pronouns and agreement */

const PRONOUN_SEEDS: BlankSeed[] = [
  {
    text: "Because the cooperative distributes surplus produce to member households, ___ storage costs are far lower than those of a comparable commercial farm.",
    answer: "its",
    wrong: ["it's", "their", "they're"],
    why: "The possessive pronoun *its* is needed to show that the storage costs belong to the singular *cooperative*. *It's* is the contraction of *it is*.",
  },
  {
    text: "The two research groups published ___ findings within a week of each other, and the overlap was immediately obvious.",
    answer: "their",
    wrong: ["its", "they're", "there"],
    why: "The antecedent *two research groups* is plural, so the plural possessive *their* is correct.",
  },
  {
    text: "The novelist to ___ the prize was awarded had published only one previous book, a slim collection of linked stories.",
    answer: "whom",
    wrong: ["who", "whose", "which"],
    why: "The pronoun is the object of the preposition *to*, so the objective form *whom* is required.",
  },
  {
    text: "The engineer ___ redesigned the intake valve later credited a colleague's offhand remark for the idea.",
    answer: "who",
    wrong: ["whom", "which", "whose"],
    why: "The pronoun is the subject of the verb *redesigned*, so the subjective form *who* is required.",
  },
  {
    text: "Neither of the manuscripts retains ___ original binding, though both survive otherwise intact.",
    answer: "its",
    wrong: ["their", "it's", "they're"],
    why: "*Neither* is singular, so the singular possessive *its* agrees with it.",
  },
  {
    text: "The committee released ___ recommendations only after every member had signed the summary document.",
    answer: "its",
    wrong: ["their", "it's", "they've"],
    why: "In American usage a collective noun such as *committee* is treated as singular, so the singular possessive *its* is correct.",
  },
  {
    text: "___ clear from the sediment record that the lake level fell sharply during the third millennium BCE.",
    answer: "It's",
    wrong: ["Its", "Their", "Theirs"],
    why: "The sentence needs the contraction of *it is*, which is spelled *it's* with an apostrophe.",
  },
  {
    text: "The curator and ___ spent three weeks reconciling the accession numbers with the original donor ledger.",
    answer: "I",
    wrong: ["me", "myself", "mine"],
    why: "The pronoun is part of the compound subject of *spent*, so the subjective form *I* is required.",
  },
  {
    text: "The grant was divided evenly between the ceramics studio and ___, an arrangement both directors had proposed.",
    answer: "me",
    wrong: ["I", "myself", "mine"],
    why: "The pronoun is an object of the preposition *between*, so the objective form *me* is required.",
  },
  {
    text: "Anyone hoping to reproduce the experiment should bring ___ own calibration standard, since the lab supplies only the housing.",
    answer: "their",
    wrong: ["its", "they're", "there"],
    why: "*Anyone* refers to a person, and *their* is the accepted gender-neutral singular possessive in current standard usage. *Its* would refer to a thing.",
  },
  {
    text: "The species ___ range once extended across the entire basin now survives in three isolated valleys.",
    answer: "whose",
    wrong: ["who's", "which", "that"],
    why: "The blank shows possession — the range belongs to the species — so the possessive relative pronoun *whose* is required.",
  },
  {
    text: "When the two archives merged, ___ cataloguing systems turned out to be incompatible in almost every respect.",
    answer: "their",
    wrong: ["its", "they're", "there"],
    why: "The antecedent *two archives* is plural, so the plural possessive *their* is correct.",
  },
];

/* -------------------------------------------- plurals and possessives */

const POSSESSIVE_SEEDS: BlankSeed[] = [
  {
    text: "The ___ notebooks, all seven of which survive, record daily measurements taken at the same hour for eleven years.",
    answer: "astronomer's",
    wrong: ["astronomers", "astronomers'", "astronomers's"],
    why: "The notebooks belong to a single astronomer, so the singular possessive *astronomer's* is correct.",
  },
  {
    text: "Several ___ objections were recorded in the minutes, but the proposal passed by a single vote.",
    answer: "members'",
    wrong: ["member's", "members", "members's"],
    why: "*Several* signals more than one member, and the objections belong to them, so the plural possessive *members'* is correct.",
  },
  {
    text: "The exhibition traces how the ___ of the region adapted glazing techniques borrowed from imported wares.",
    answer: "potters",
    wrong: ["potter's", "potters'", "potter"],
    why: "The sentence needs a simple plural noun as the subject of *adapted*; nothing is being possessed, so no apostrophe belongs here.",
  },
  {
    text: "Restoring the fresco required matching the ___ original palette, which had been mixed from locally quarried minerals.",
    answer: "artist's",
    wrong: ["artists", "artists'", "artists's"],
    why: "The palette belongs to one artist, so the singular possessive *artist's* is correct.",
  },
  {
    text: "The two ___ conclusions differed sharply, even though they had worked from the same set of core samples.",
    answer: "geologists'",
    wrong: ["geologist's", "geologists", "geologists's"],
    why: "*The two* makes the noun plural, and the conclusions belong to both, so the plural possessive *geologists'* is correct.",
  },
  {
    text: "By 1912 the ___ were producing more sheet glass than any other works in the country.",
    answer: "factories",
    wrong: ["factory's", "factories'", "factorys"],
    why: "The subject of *were producing* is a simple plural noun. *Factory* forms its plural as *factories*, with no apostrophe.",
  },
  {
    text: "The ___ migration route, mapped for the first time using lightweight geolocators, crosses two continents twice a year.",
    answer: "birds'",
    wrong: ["bird's", "birds", "birds's"],
    why: "The route belongs to the birds collectively, so the plural possessive *birds'* is correct.",
  },
  {
    text: "Each of the ___ was calibrated against the same reference weight before the trial began.",
    answer: "balances",
    wrong: ["balance's", "balances'", "balances's"],
    why: "*Each of the* is followed by a plain plural noun; nothing is possessed, so no apostrophe is used.",
  },
  {
    text: "The ___ decision to publish the raw spectra alongside the analysis was unusual for the period.",
    answer: "team's",
    wrong: ["teams", "teams'", "teams's"],
    why: "One team made the decision, so the singular possessive *team's* is correct.",
  },
  {
    text: "Visitors often overlook the ___ inscriptions, which run along the base rather than across the face of the stele.",
    answer: "monument's",
    wrong: ["monuments", "monuments'", "monuments's"],
    why: "The inscriptions belong to a single monument, so the singular possessive *monument's* is correct.",
  },
];

/* --------------------------------------------------- sentence boundaries */

const BOUNDARY_SEEDS: BlankSeed[] = [
  {
    text: "The alloy resists corrosion in salt spray far better than steel ___ considerably more expensive to produce at scale.",
    answer: "does, but it is also",
    wrong: ["does, it is also", "does it is also", "does; it is also,"],
    why: "Two independent clauses cannot be joined by a comma alone. A comma plus the coordinating conjunction *but* joins them correctly and marks the contrast.",
  },
  {
    text: "Rehearsals ran long into the evening ___ ensemble still had two movements left to mark.",
    answer: "; the",
    wrong: [", the", " the", ": the"],
    why: "A semicolon correctly joins two closely related independent clauses. A comma alone would create a comma splice, and no punctuation at all would create a run-on.",
  },
  {
    text: "The report identified a single cause for the outage ___ corroded connector in the substation's oldest relay cabinet.",
    answer: ": a",
    wrong: ["; a", ", and a", " a"],
    why: "A colon correctly introduces an element that explains or identifies what precedes it, and the material before the colon is a complete sentence.",
  },
  {
    text: "Because the sediment layers had been disturbed by burrowing animals ___ team could not date the deposit by stratigraphy alone.",
    answer: ", the",
    wrong: ["; the", ": the", " the"],
    why: "The opening *because* clause is subordinate, not independent. A comma is the correct punctuation between an introductory subordinate clause and the main clause.",
  },
  {
    text: "The pigment was expensive and difficult to grind ___ workshops across the region continued to use it for another century.",
    answer: "; nevertheless,",
    wrong: [", nevertheless,", " nevertheless,", ": nevertheless,"],
    why: "*Nevertheless* is a conjunctive adverb, not a coordinating conjunction, so it cannot join two independent clauses with only a comma. A semicolon is required.",
  },
  {
    text: "Only one instrument survived the fire ___ small chamber organ that had been stored offsite for repairs.",
    answer: ": a",
    wrong: ["; a", ", it was a", " a"],
    why: "A colon introduces the noun phrase that identifies *one instrument*, and a complete sentence precedes it.",
  },
  {
    text: "The tide gauge recorded the surge accurately ___ anemometer at the same station failed within the first hour of the storm.",
    answer: ", but the",
    wrong: [", the", " but, the", "; but, the"],
    why: "A comma plus *but* correctly joins two independent clauses and signals the contrast between them.",
  },
  {
    text: "After reviewing four decades of survey data ___ ecologists concluded that the decline had begun long before the highway was built.",
    answer: ", the",
    wrong: ["; the", ": the", " the"],
    why: "The introductory participial phrase must be set off from the main clause by a comma.",
  },
  {
    text: "Steam locomotives dominated the line until 1958 ___ diesel units had already replaced them on every branch route by then.",
    answer: ", though",
    wrong: [", ", " though,", "; though,"],
    why: "A comma followed by the subordinating conjunction *though* correctly attaches the second clause and marks the concession.",
  },
  {
    text: "The manuscript is undated ___ paleographers assign it to the second half of the twelfth century on the basis of its script.",
    answer: "; however,",
    wrong: [", however,", " however,", ": however,"],
    why: "Both halves are independent clauses joined by the conjunctive adverb *however*, which requires a semicolon before it rather than a comma.",
  },
  {
    text: "The kiln reached temperature more slowly than the schedule allowed ___ the firing was extended by six hours.",
    answer: ", so",
    wrong: [", ", "; so,", " so,"],
    why: "A comma plus the coordinating conjunction *so* joins two independent clauses and signals the causal relationship.",
  },
  {
    text: "Three teams submitted proposals ___ only one included a plan for maintaining the installation after the first winter.",
    answer: ", but",
    wrong: [", ", " but,", "; but,"],
    why: "A comma plus *but* correctly joins the two independent clauses and marks the contrast between them.",
  },
];

/* -------------------------------------------- supplementary elements */

const SUPPLEMENT_SEEDS: BlankSeed[] = [
  {
    text: "The pigment ultramarine, ground from lapis lazuli imported across thousands of kilometers ___ cost more by weight than gold in fifteenth-century Florence.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "The nonessential phrase *ground from lapis lazuli imported across thousands of kilometers* is already opened with a comma, so it must be closed with a matching comma.",
  },
  {
    text: "Rachel Carson's Silent Spring ___ first published in 1962, is often credited with prompting the first federal review of agricultural pesticides.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "The supplementary phrase closes with a comma, so it must also open with one. Punctuation enclosing a nonessential element has to match at both ends.",
  },
  {
    text: "The three founding members of the collective — Ito, Nkemelu, and Vasquez ___ each contributed a panel to the finished mural.",
    answer: "—",
    wrong: [",", ";", "(no punctuation)"],
    why: "A dash opens the supplementary list, so a dash must close it. Mixing a dash with a comma is not acceptable.",
  },
  {
    text: "The observatory's original mirror, which cracked during a temperature swing in 1971 ___ was replaced with a segmented design a decade later.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "The nonessential relative clause opens with a comma and must be closed with a matching comma before the main verb resumes.",
  },
  {
    text: "Two of the recordings — both made on portable equipment in a single afternoon ___ have become the most widely cited in the entire archive.",
    answer: "—",
    wrong: [",", ";", "(no punctuation)"],
    why: "Dashes setting off a supplementary phrase must be used as a matched pair, so the phrase opened with a dash has to close with one.",
  },
  {
    text: "The novel's narrator ___ an unnamed clerk in a provincial land office, never once describes his own face.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "The appositive renaming *narrator* is closed by a comma, so it must be opened by a comma as well.",
  },
  {
    text: "The company ___ that patented the process in 1934 still holds the rights to the original formulation.",
    answer: "(no punctuation)",
    wrong: [",", ";", ":"],
    why: "*That patented the process in 1934* is an essential clause identifying which company is meant. Essential modifiers are not set off by punctuation.",
  },
  {
    text: "Kintsugi ___ the Japanese practice of repairing broken ceramics with lacquer and powdered gold, treats the break as part of the object's history.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "The appositive defining *kintsugi* is closed with a comma, so it must be opened with a matching comma.",
  },
  {
    text: "Several of the earliest photographs ___ taken before the process was patented, survive only as contact prints.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "The supplementary participial phrase closes with a comma and therefore requires an opening comma to match.",
  },
  {
    text: "The bridge's designer ___ who had never built anything larger than a footpath span, submitted the winning entry anonymously.",
    answer: ",",
    wrong: [";", ":", "(no punctuation)"],
    why: "The nonessential relative clause is closed with a comma, so a matching comma is required where it begins.",
  },
];

/* ------------------------------------------ modifier placement and logic */

const MODIFIER_SEEDS: BlankSeed[] = [
  {
    text: "Working through the night to stabilize the fresco, ___",
    answer: "the conservators applied a facing of tissue and adhesive to the flaking surface.",
    wrong: [
      "a facing of tissue and adhesive was applied to the flaking surface.",
      "the flaking surface received a facing of tissue and adhesive.",
      "there was a facing of tissue and adhesive applied to the flaking surface.",
    ],
    why: "The introductory phrase describes whoever was *working through the night*, so the subject of the main clause must name those people — the conservators. Any other subject leaves the modifier dangling.",
  },
  {
    text: "Having survived three centuries in a sealed crypt, ___",
    answer: "the textiles retained pigments that faded within days of exposure to daylight.",
    wrong: [
      "researchers found that the textiles retained pigments that faded quickly.",
      "it was clear that the textiles' pigments faded quickly once exposed.",
      "daylight caused the textiles' pigments to fade within days.",
    ],
    why: "The opening phrase describes what survived in the crypt. Only *the textiles* can logically follow it as the subject of the main clause.",
  },
  {
    text: "Trained as a structural engineer before turning to sculpture, ___",
    answer: "Ferreira designed armatures that let the finished pieces cantilever without visible support.",
    wrong: [
      "the armatures Ferreira designed let the pieces cantilever without visible support.",
      "it was Ferreira's armatures that allowed the cantilevered pieces to stand.",
      "there were armatures that let the finished pieces cantilever without support.",
    ],
    why: "The person trained as an engineer must be the subject of the main clause, so the sentence has to begin with *Ferreira*.",
  },
  {
    text: "Rebuilt twice after storm damage, ___",
    answer: "the lighthouse now rests on a foundation sunk nine meters into the bedrock.",
    wrong: [
      "engineers sank the lighthouse's new foundation nine meters into the bedrock.",
      "a foundation was sunk nine meters into the bedrock beneath the lighthouse.",
      "it was necessary to sink the foundation nine meters into the bedrock.",
    ],
    why: "What was *rebuilt twice* is the lighthouse, so the lighthouse must be the subject of the clause that follows.",
  },
  {
    text: "While analyzing the isotopic signature of the tooth enamel, ___",
    answer: "the team noticed a seasonal pattern no previous study had reported.",
    wrong: [
      "a seasonal pattern that no previous study had reported became apparent.",
      "there was a seasonal pattern that no previous study had reported.",
      "the seasonal pattern in the enamel had not been reported before.",
    ],
    why: "The introductory clause names an action, so the main clause must open with the people performing it — the team.",
  },
  {
    text: "Composed in exile and circulated only in manuscript, ___",
    answer: "the essays reached a readership of no more than a few hundred during the author's lifetime.",
    wrong: [
      "the author reached no more than a few hundred readers in her lifetime.",
      "few readers encountered the essays during the author's lifetime.",
      "it was rare for anyone to read the essays during the author's lifetime.",
    ],
    why: "What was *composed in exile and circulated only in manuscript* is the essays, so *the essays* must be the subject of the main clause.",
  },
  {
    text: "Long dismissed as a copy of an earlier altarpiece, ___",
    answer: "the panel is now attributed to a workshop active a full generation before that altarpiece was painted.",
    wrong: [
      "curators now attribute the panel to an earlier workshop.",
      "attribution of the panel has now shifted to an earlier workshop.",
      "there is now an attribution to a workshop active a generation earlier.",
    ],
    why: "The thing *long dismissed as a copy* is the panel, so the panel must be the subject that follows the modifier.",
  },
  {
    text: "Designed to operate for ninety days, ___",
    answer: "the rover continued transmitting usable data for more than fourteen years.",
    wrong: [
      "engineers were astonished that data kept arriving for fourteen years.",
      "usable data continued to arrive from the rover for fourteen years.",
      "it was surprising that the rover lasted more than fourteen years.",
    ],
    why: "What was *designed to operate for ninety days* is the rover, so the rover must be the subject of the main clause.",
  },
];

export const CONVENTIONS_TEMPLATES: Template[] = [
  seedTemplate("rw-sec-sva", "Form, structure, and sense", ["Subject-verb agreement"], "medium", SVA_SEEDS),
  seedTemplate("rw-sec-tense", "Form, structure, and sense", ["Verb tense and aspect"], "medium", TENSE_SEEDS),
  seedTemplate("rw-sec-pronoun", "Form, structure, and sense", ["Pronoun-antecedent agreement", "Pronoun case"], "medium", PRONOUN_SEEDS),
  seedTemplate("rw-sec-possessive", "Form, structure, and sense", ["Plural and possessive nouns"], "easy", POSSESSIVE_SEEDS),
  seedTemplate("rw-sec-boundary", "Boundaries", ["Sentence boundaries", "Coordination and subordination"], "medium", BOUNDARY_SEEDS),
  seedTemplate("rw-sec-supplement", "Boundaries", ["Supplementary elements", "Punctuating nonessential information"], "hard", SUPPLEMENT_SEEDS),
  seedTemplate("rw-sec-modifier", "Form, structure, and sense", ["Subject-modifier placement"], "hard", MODIFIER_SEEDS),
];
