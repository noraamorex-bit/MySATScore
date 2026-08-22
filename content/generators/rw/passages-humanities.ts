/**
 * Literature, arts, and humanities passages. Literary-text sets follow the
 * Digital SAT's practice of using short excerpts — original here, in period
 * register — and asking about function, structure, and inference rather than
 * plot recall.
 */
import type { PassageSeed } from "./passage-kit";

export const HUMANITIES_PASSAGES: PassageSeed[] = [
  {
    slug: "lighthouse-keeper",
    title: "from a novel",
    paragraphs: [
      "The lamp wanted winding at ten, at two, and at six, and in the seven years Mairead had kept it she had never once been late. She did not think of this as diligence. Diligence implied a choice made repeatedly, and she had made the choice only once, on the first night, when she had understood that the light did not care whether she was tired. After that there was only the winding.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence", "Characterization"],
        difficulty: "hard",
        prompt: "Which choice best describes the function of the third sentence in the text?",
        answer:
          "It explains why Mairead does not regard her own consistency as a virtue.",
        wrong: [
          "It reveals that Mairead resents the demands the lighthouse makes on her.",
          "It establishes that Mairead has considered abandoning her post more than once.",
          "It contrasts Mairead's routine with that of the keeper who preceded her.",
        ],
        why: "The sentence defines diligence as repeated choosing and denies that Mairead does that — which explains the preceding sentence's claim that she doesn't think of her record as diligence.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference", "Characterization"],
        difficulty: "hard",
        prompt: "Based on the text, what is most strongly suggested about Mairead's relationship to her work?",
        answer:
          "She has settled it as a single early decision rather than renewing it each day.",
        wrong: [
          "She performs it reluctantly and expects to leave the lighthouse soon.",
          "She takes considerable pride in never having been late in seven years.",
          "She finds the schedule physically demanding but emotionally rewarding.",
        ],
        why: "The text says she made the choice once, on the first night, and that afterward 'there was only the winding' — a settled commitment, not a nightly decision, and explicitly not pride.",
      },
    ],
  },
  {
    slug: "quilt-archive",
    title: "from a short story",
    paragraphs: [
      "The quilt had come to the museum in a cardboard box with no accession number and a note in pencil: *belonged to my grandmother, who did not sign things.* Ivy spread it on the table under the raking light. Nine blocks, and in the eighth, where the pattern should have repeated, a single square turned ninety degrees. Not a mistake — the seams were as clean as any other. Someone had wanted a way back into the pattern from outside it.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence"],
        difficulty: "hard",
        prompt: "Which choice best describes the function of the last sentence in the text?",
        answer:
          "It supplies Ivy's interpretation of the irregularity she has just noticed.",
        wrong: [
          "It records the explanation given in the penciled note that accompanied the quilt.",
          "It reveals that the quilt was assembled by more than one maker.",
          "It concedes that the turned square may have been an error after all.",
        ],
        why: "The preceding sentence rules out error; the last sentence offers what the turned square meant to whoever sewed it — Ivy's reading of the evidence, not the note's content or a concession.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Detail identification"],
        difficulty: "medium",
        prompt: "According to the text, what convinces Ivy that the turned square was intentional?",
        answer: "The seams around it are as carefully made as those elsewhere in the quilt.",
        wrong: [
          "The penciled note explains that the grandmother varied her patterns deliberately.",
          "The turned square appears in each of the quilt's nine blocks.",
          "The museum's records list the quilt as a documented example of the practice.",
        ],
        why: "The text says 'Not a mistake — the seams were as clean as any other,' giving the workmanship as the evidence. The other options contradict the passage.",
      },
    ],
  },
  {
    slug: "cassatt-print",
    paragraphs: [
      "In 1890 Mary Cassatt saw an exhibition of Japanese woodblock prints in Paris and spent the following year producing ten color prints of her own. She abandoned the tonal modeling of her oil paintings for flat areas of color bounded by line, and she cut the compositions off at the edges as the Japanese prints did, so that a figure might be halved by the frame. Critics at the time read the series as an exercise in imitation. Art historian Beatriz Solano argues instead that Cassatt used the borrowed vocabulary to depict a subject — a woman alone with her own attention — that the European tradition had no established way of showing.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Solano contends that Cassatt adopted Japanese printmaking conventions to represent subject matter European painting had not addressed.",
        wrong: [
          "Cassatt's color prints were more technically accomplished than the Japanese prints that inspired them.",
          "Critics in 1890 correctly identified Cassatt's prints as derivative works of little originality.",
          "Cassatt gave up oil painting entirely after encountering Japanese woodblock prints in Paris.",
        ],
        why: "The passage sets the contemporary verdict (imitation) against Solano's reading (borrowed means, new subject). The other choices misreport the text.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Words in Context",
        skills: ["Words in context"],
        difficulty: "medium",
        prompt: 'As used in the text, what does the word "vocabulary" most nearly mean?',
        answer: "A set of visual conventions",
        wrong: ["A list of technical terms", "A range of available pigments", "A group of recurring subjects"],
        why: "The word refers to what Cassatt borrowed from the prints — flat color, contour line, cropped composition. Those are formal conventions, not terms, pigments, or subjects.",
      },
    ],
  },
  {
    slug: "dickinson-punctuation",
    paragraphs: [
      "Emily Dickinson's manuscripts are full of dashes of varying length and angle, and her earliest editors replaced nearly all of them with conventional commas and periods. The 1955 variorum edition restored the dashes, and readers accustomed to the smoothed versions found the poems newly difficult. Scholar Nadia Reyes observes that the dashes do not merely punctuate: they refuse to specify how clauses relate, so a line can be read as cause, contrast, or apposition, and the reader must hold all three at once.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Purpose of the text"],
        difficulty: "medium",
        prompt: "What is the main purpose of the text?",
        answer:
          "To explain what was lost when Dickinson's dashes were regularized and why their restoration matters.",
        wrong: [
          "To argue that the 1955 variorum edition contains numerous transcription errors.",
          "To trace changes in punctuation conventions in American poetry after 1860.",
          "To compare Reyes's reading of Dickinson with that of Dickinson's earliest editors.",
        ],
        why: "The passage moves from the editorial substitution, to the restoration, to what the dashes do — an account of what regularization removed. It does not attack the variorum, survey punctuation history, or stage a comparison of readings.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, why did readers find the restored poems 'newly difficult'?",
        answer:
          "The dashes leave the relationships between clauses unsettled, whereas conventional punctuation had fixed them.",
        wrong: [
          "The variorum edition printed the poems in an order different from earlier editions.",
          "The dashes vary in length and angle, making the manuscripts hard to transcribe.",
          "Readers had memorized the smoothed versions and resisted any change to them.",
        ],
        why: "Reyes's point is that the dashes refuse to specify relations, forcing readers to hold several readings at once — that is the source of the difficulty.",
      },
    ],
  },
  {
    slug: "gospel-quartet",
    paragraphs: [
      "Before amplification, gospel quartets sang in a formation that put the lead singer at the center and the bass at the outer edge, angled inward. The arrangement was acoustic, not decorative: it let the bass line reach the back of a hall without covering the lead. When groups began recording in the 1940s, engineers placed a single microphone where the audience would have been, and the formation survived intact on record. It survived on stage too, long after individual microphones made it unnecessary — a case of a practical solution outliving the problem it solved.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Overall structure"],
        difficulty: "medium",
        prompt: "Which choice best describes the overall structure of the text?",
        answer:
          "It explains the practical origin of a convention and then observes that the convention persisted after its purpose lapsed.",
        wrong: [
          "It contrasts live gospel performance with recorded gospel performance and prefers the former.",
          "It traces the invention of the microphone and its effect on American popular music.",
          "It argues that gospel quartets should return to singing without individual microphones.",
        ],
        why: "The passage gives the acoustic rationale, then notes the formation outlasted the need for it. No preference, invention history, or recommendation appears.",
      },
    ],
  },
  {
    slug: "translator-note",
    paragraphs: [
      "Text 1",
      "A translator's first obligation is to the reader who cannot reach the original. That reader deserves a text that moves in English as the original moved in its own language, and achieving that sometimes means departing from the words on the page. A translation that reproduces every idiom literally produces a document, not a poem.",
      "Text 2",
      "The reader of a translation is entitled to know what the author wrote, not what the translator would have written in the author's place. Where an idiom has no English equivalent, the honest course is to render it plainly and let the strangeness stand. Smoothing it away substitutes the translator's ear for the author's, and the reader is never told the exchange has taken place.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Cross-Text Connections",
        skills: ["Cross-text connections", "Comparing arguments"],
        difficulty: "hard",
        prompt:
          "Based on the texts, how would the author of Text 2 most likely respond to the claim in the last sentence of Text 1?",
        answer:
          "By arguing that preserving the original's strangeness serves the reader better than producing a fluent English poem does.",
        wrong: [
          "By agreeing that literal translation is inadequate but denying that any translation can succeed.",
          "By conceding that idioms without English equivalents should be rendered freely.",
          "By noting that most readers of translations also have access to the original text.",
        ],
        why: "Text 2's position is that plain rendering, strangeness intact, is the honest course, and that smoothing substitutes the translator's ear — a direct answer to Text 1's 'document, not a poem' complaint.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Cross-Text Connections",
        skills: ["Cross-text connections"],
        difficulty: "medium",
        prompt: "Which choice best describes the relationship between the two texts?",
        answer:
          "Both identify the reader's interests as decisive but disagree about what those interests require.",
        wrong: [
          "Both reject literal translation, though for different reasons.",
          "Text 2 provides historical background for the principle asserted in Text 1.",
          "Text 1 makes a general claim that Text 2 illustrates with a specific case.",
        ],
        why: "Each text grounds its rule in what the reader deserves or is entitled to, then draws opposite conclusions. Text 2 does not reject literal translation, supply background, or illustrate Text 1.",
      },
    ],
  },
  {
    slug: "museum-repatriation",
    paragraphs: [
      "Text 1",
      "An encyclopedic museum makes an argument by juxtaposition: a visitor who can walk from Benin bronzes to Cycladic figures to Song ceramics in a single afternoon learns something about human making that no single national collection can teach. Dispersing such collections would not correct a historical wrong so much as destroy a distinct kind of knowledge.",
      "Text 2",
      "The juxtaposition argument assumes that the objects' current location is the only place the comparison can occur. Digital imaging, loan agreements, and traveling exhibitions all reproduce it without requiring that objects removed under duress stay where they were taken. The question is not whether comparison is valuable but whether it requires permanent possession.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Cross-Text Connections",
        skills: ["Cross-text connections", "Evaluating arguments"],
        difficulty: "hard",
        prompt: "Based on the texts, the author of Text 2 would most likely characterize the argument in Text 1 as",
        answer:
          "valid in what it values but mistaken in assuming that value requires permanent ownership.",
        wrong: [
          "correct that dispersal would destroy knowledge but wrong about which knowledge is at stake.",
          "based on a factual error about where the objects in question originated.",
          "persuasive to museum professionals but unpersuasive to the general public.",
        ],
        why: "Text 2 explicitly grants the value of comparison and disputes only the inference that comparison requires permanent possession.",
      },
    ],
  },
  {
    slug: "field-recording",
    title: "from a memoir",
    paragraphs: [
      "I had carried the recorder four kilometers up the valley for a bird I never heard. What the tape held instead, when I played it back that winter, was the valley itself: meltwater under stone, a rope bridge working in the wind, and at eleven minutes a woman singing somewhere below me, three phrases, then nothing. I had been standing there and had heard none of it. The machine was not more sensitive than I was. It was only less busy.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence"],
        difficulty: "hard",
        prompt: "Which choice best describes the function of the final two sentences in the text?",
        answer:
          "They locate the difference between the narrator and the recorder in attention rather than in capability.",
        wrong: [
          "They explain a technical limitation of the recording equipment the narrator used.",
          "They express the narrator's regret at having failed to locate the bird.",
          "They suggest that the narrator's hearing had been damaged by the wind in the valley.",
        ],
        why: "'Not more sensitive... only less busy' explicitly denies a difference in capability and names a difference in attention.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "The narrator discovers, on replaying a recording, how much of a place had been present without being noticed.",
        wrong: [
          "The narrator's search for a particular bird ends in an unexpected success.",
          "The narrator concludes that recording equipment captures sound more accurately than human hearing.",
          "The narrator regrets having carried heavy equipment so far for so little result.",
        ],
        why: "The passage turns on the surprise of hearing on tape what the narrator stood in the middle of and missed. It explicitly denies the equipment-superiority reading.",
      },
    ],
  },
  {
    slug: "sonnet-form",
    paragraphs: [
      "The sonnet arrived in English as a fourteen-line argument: eight lines to set a problem, six to turn it. Poets who kept the count but abandoned the turn found that the form still exerted pressure — readers arriving at line nine expect something to give way, and a poem that refuses can make the refusal its subject. Critic Halim Bourgiba notes that this is why the sonnet has survived so many announcements of its death: what is inherited is less a shape than an expectation, and an expectation can be disappointed productively.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, why does Bourgiba consider the sonnet durable?",
        answer:
          "Because the reader's expectation of a turn remains available to poets even when they decline to supply one.",
        wrong: [
          "Because the fourteen-line count is easier to memorize than other traditional forms.",
          "Because contemporary poets have returned to the strict eight-and-six division.",
          "Because critics have repeatedly defended the form against attempts to abandon it.",
        ],
        why: "Bourgiba's point is that the inheritance is an expectation, and disappointing it is itself productive — so the form survives its own violation.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Words in Context",
        skills: ["Words in context"],
        difficulty: "hard",
        prompt: 'As used in the text, what does the word "pressure" most nearly mean?',
        answer: "An influence on how a poem is read",
        wrong: ["A demand made by editors and publishers", "A physical constraint on line length", "A source of anxiety for the poet"],
        why: "The pressure is exerted on readers, who arrive at line nine expecting a turn. It is an interpretive influence, not an editorial demand, a physical limit, or the poet's anxiety.",
      },
    ],
  },
  {
    slug: "jazz-transcription",
    paragraphs: [
      "For most of the twentieth century, jazz improvisation was taught by ear: a student learned a solo from a record by slowing it down and playing along. Published transcriptions changed that, and they changed something else as well. A transcription must assign every note a duration on a grid, and much of what makes a phrase recognizable — the fraction of a beat by which a note arrives early or late — has no notation. Pianist Curtis Yeung says students who learn from the page often play the right notes in the wrong time, and cannot hear the difference until someone plays both for them.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Written transcriptions make jazz solos widely available but cannot record the rhythmic nuance that gives them their character.",
        wrong: [
          "Learning jazz solos by ear is a slower method than learning them from published transcriptions.",
          "Published transcriptions of jazz solos frequently contain errors in pitch and duration.",
          "Yeung argues that students should not use published transcriptions under any circumstances.",
        ],
        why: "The passage's core claim is the notational gap — micro-timing has no notation — and Yeung's observation illustrates the consequence. The other choices misstate or overstate the text.",
      },
    ],
  },
  {
    slug: "vernacular-architecture",
    paragraphs: [
      "The wind-catchers of Yazd are towers open on one or more faces, built to draw air down into the rooms below. Which faces are open is not a matter of style: it depends on the prevailing wind, and in Yazd, where the wind is reliable from one direction, the towers are typically open on a single side. In Hyderabad Sindh, where the wind reverses seasonally, they open on two. Architectural historian Yara Demir uses the pair to argue that vernacular building should be read as a record of local measurement rather than as untutored tradition.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence"],
        difficulty: "medium",
        prompt: "Which choice best describes the function of the Hyderabad Sindh example in the text?",
        answer:
          "It provides a contrasting case showing that tower design tracks local wind conditions.",
        wrong: [
          "It identifies an exception that Demir's argument cannot account for.",
          "It establishes that wind-catchers originated in Sindh rather than in Yazd.",
          "It illustrates a decorative convention shared across the two regions.",
        ],
        why: "Two-sided towers where wind reverses, one-sided where it does not, is exactly the variation Demir's argument needs — a supporting contrast, not an exception or an origin claim.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, what does Demir's argument most directly challenge?",
        answer: "The view that vernacular building reflects inherited custom rather than local knowledge.",
        wrong: [
          "The view that wind-catchers are an effective means of cooling interior spaces.",
          "The claim that prevailing winds in Yazd blow reliably from a single direction.",
          "The assumption that architectural historians should study non-monumental buildings.",
        ],
        why: "Demir opposes 'a record of local measurement' to 'untutored tradition,' so the target is the idea that vernacular form is mere inherited custom.",
      },
    ],
  },
  {
    slug: "novel-opening",
    title: "from a novel",
    paragraphs: [
      "My grandmother kept two clocks in the front room, one four minutes fast and one exactly right, and consulted only the fast one. When I asked her why she kept the other she said that a person ought to know how much she was lying by. For years I took this as a joke about punctuality. I understand now that she was telling me the whole of her method, and that she had assumed I would need it.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference", "Characterization"],
        difficulty: "hard",
        prompt: "Based on the text, what does the narrator now understand about the grandmother's remark?",
        answer:
          "That it described a general habit of deliberate, measured self-deception rather than a quirk about time.",
        wrong: [
          "That the grandmother had been chronically late and was embarrassed about it.",
          "That the grandmother distrusted the accuracy of both clocks in the front room.",
          "That the grandmother intended the remark as a joke and the narrator misread it.",
        ],
        why: "'The whole of her method' generalizes beyond clocks, and 'she had assumed I would need it' presents the remark as instruction, not a joke about lateness.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Overall structure"],
        difficulty: "medium",
        prompt: "Which choice best describes the overall structure of the text?",
        answer:
          "It recounts a childhood exchange and then revises the narrator's earlier interpretation of it.",
        wrong: [
          "It describes a family conflict and traces its resolution over several years.",
          "It presents two competing accounts of an event and declines to choose between them.",
          "It introduces a character through the recollections of several different relatives.",
        ],
        why: "The passage gives the anecdote, the old reading ('for years I took this as a joke'), and the new one ('I understand now') — a revision of interpretation.",
      },
    ],
  },
  {
    slug: "griot-memory",
    paragraphs: [
      "A griot's repertoire may run to thousands of lines of genealogy, and performances of the same lineage decades apart can agree closely on names and sequence. Anthropologist Ibrahim Sy cautions against treating this as evidence that the tradition is fixed. What is stable, he argues, is the armature — the order of generations and the fixed epithets that attach to particular names — while the elaborations around it are composed for the occasion and for the patron present. A performance is therefore neither recitation nor invention, and describing it as either misses what the performer is doing.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "hard",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Griot performances combine a stable underlying framework with material composed anew for each occasion.",
        wrong: [
          "Griot performances of the same lineage decades apart rarely agree on names or sequence.",
          "Sy has demonstrated that griot repertoires are memorized word for word and passed on unchanged.",
          "Written genealogies are more reliable historical sources than griot performances are.",
        ],
        why: "Sy distinguishes a stable armature from occasion-specific elaboration and rejects both 'recitation' and 'invention' as descriptions — which is what the correct choice states.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Words in Context",
        skills: ["Words in context"],
        difficulty: "hard",
        prompt: 'As used in the text, what does the word "armature" most nearly mean?',
        answer: "An underlying framework that supports what is built around it",
        wrong: ["A protective covering", "A formal introduction", "A list of names to be memorized"],
        why: "The text glosses the term itself: the order of generations and fixed epithets, around which elaborations are composed. That is a supporting structure.",
      },
    ],
  },
  {
    slug: "photography-truth",
    paragraphs: [
      "Text 1",
      "The documentary photograph's authority rests on the fact that the camera was there. Whatever the photographer chose to include or exclude, the light that struck the film came from the scene itself, and no amount of framing can make an event happen that did not. This is a modest guarantee, but it is the one photography alone can offer.",
      "Text 2",
      "The claim that the camera was there guarantees remarkably little. A photographer who arrives ten minutes after an event, arranges what remains, and photographs it truthfully records only the arrangement. The presence of light from a real scene certifies the surface and nothing beneath it, which is why captions do so much more work in documentary photography than its defenders like to admit.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Cross-Text Connections",
        skills: ["Cross-text connections"],
        difficulty: "hard",
        prompt: "Based on the texts, how do the two authors differ in their assessment of photographic evidence?",
        answer:
          "Text 1 treats the camera's presence as a limited but genuine guarantee, while Text 2 argues that it certifies too little to be useful on its own.",
        wrong: [
          "Text 1 holds that framing is irrelevant to meaning, while Text 2 holds that framing determines meaning entirely.",
          "Text 1 defends staged photography, while Text 2 argues that staging should be disclosed in captions.",
          "Both agree that photographs are unreliable, but they disagree about whether captions can remedy this.",
        ],
        why: "Text 1 calls the guarantee 'modest' but real; Text 2 says it 'guarantees remarkably little' and certifies only the surface. That is the axis of disagreement.",
      },
    ],
  },
  {
    slug: "restoration-ethics",
    paragraphs: [
      "When the Sistine ceiling was cleaned between 1980 and 1994, the removal of centuries of soot and animal glue revealed colors so much brighter than expected that some art historians argued the conservators had stripped a final layer applied by Michelangelo himself. Chemical analysis of the removed material found no pigment binder consistent with a deliberate glaze. The dispute has nonetheless outlived the evidence, in part because the cleaned ceiling contradicts a long tradition of copies and reproductions made from the darkened surface.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Evaluating evidence"],
        difficulty: "hard",
        prompt:
          "Which choice best explains why, according to the text, the dispute persisted after the chemical analysis?",
        answer:
          "Generations of copies made from the darkened ceiling had established an expectation the cleaned version violated.",
        wrong: [
          "The chemical analysis was performed on only a small portion of the removed material.",
          "Art historians disagreed about whether soot and animal glue could be distinguished chemically.",
          "The conservators declined to publish their findings until the cleaning was complete.",
        ],
        why: "The last sentence gives the reason explicitly: the cleaned ceiling contradicts the tradition of reproductions made from the darkened surface. The other options invent details.",
      },
    ],
  },
  {
    slug: "epic-formula",
    paragraphs: [
      "Milman Parry noticed that Homeric epithets are not distributed by meaning but by meter: *swift-footed Achilles* appears where the line needs those syllables, and a different epithet appears where it does not. He proposed that the phrases were building blocks for oral composition in performance rather than choices made for characterization. To test the idea he went to Yugoslavia in the 1930s and recorded singers who composed long narrative poems without writing, finding that they used formulas the same way.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Overall structure"],
        difficulty: "medium",
        prompt: "Which choice best describes the overall structure of the text?",
        answer:
          "It reports an observation, states the hypothesis drawn from it, and describes how the hypothesis was tested.",
        wrong: [
          "It presents two competing theories of Homeric composition and endorses the older one.",
          "It summarizes a scholarly consensus and identifies evidence that has since undermined it.",
          "It describes a research trip and then explains the theory that motivated it.",
        ],
        why: "The three moves are the metrical observation, Parry's proposal, and the Yugoslav fieldwork as a test. The order is observation → hypothesis → test, not trip → theory.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Supporting a claim"],
        difficulty: "hard",
        prompt: "How does the fieldwork described in the last sentence support Parry's proposal?",
        answer:
          "It shows that poets composing orally in performance do rely on metrically convenient formulas.",
        wrong: [
          "It demonstrates that Homeric epithets were originally composed in a language other than Greek.",
          "It establishes that the singers Parry recorded had memorized portions of the Homeric epics.",
          "It proves that written composition produces more varied vocabulary than oral composition.",
        ],
        why: "The Yugoslav singers are a living case of oral composition using formulas the same way, which is what Parry's hypothesis predicts.",
      },
    ],
  },
  {
    slug: "public-sculpture",
    paragraphs: [
      "Maya Lin's design for the Vietnam Veterans Memorial was chosen from 1,421 anonymous submissions and immediately attacked: it had no figures, no flag, and it went into the ground rather than up. A compromise added a realistic bronze statue and a flagpole at some distance from the wall. Four decades on, visitors overwhelmingly describe the wall itself as the memorial and treat the statue as a separate object nearby — an outcome that suggests the original design's refusals were doing more work than its critics allowed.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, what does visitors' response to the memorial suggest about the 1981 controversy?",
        answer:
          "The features critics wanted added turned out not to be what visitors found meaningful.",
        wrong: [
          "The compromise additions have been removed from the memorial site.",
          "Visitors today are unaware that the statue and flagpole were later additions.",
          "Anonymous design competitions produce better results than commissioned work.",
        ],
        why: "Visitors treat the wall as the memorial and the added statue as separate, so the added figurative elements are not what carries meaning — the point the last clause makes.",
      },
    ],
  },
  {
    slug: "letter-fragment",
    title: "from a letter, 1889",
    paragraphs: [
      "You ask whether I have finished the second panel. I have not, and I begin to think I shall not, though I work at it daily. The difficulty is not the drawing. It is that the room I painted it for has since been divided, and the wall that was to hold it is now two walls with a door between. I could paint a picture that fits neither, or I could paint two pictures that are not the one I meant. I confess I sit before it most mornings doing nothing at all.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas", "Detail identification"],
        difficulty: "medium",
        prompt: "Which choice best describes what is preventing the writer from finishing the panel?",
        answer: "The space the work was designed for no longer exists in its original form.",
        wrong: [
          "The writer has lost confidence in his ability to draw the figures accurately.",
          "The person who commissioned the panel has withdrawn the commission.",
          "The writer cannot obtain the materials required to complete the second panel.",
        ],
        why: "The letter says explicitly that the difficulty 'is not the drawing' and describes the wall's division into two walls with a door. Nothing concerns skill, commission, or materials.",
      },
    ],
  },
  {
    slug: "silent-film-score",
    paragraphs: [
      "Silent films were never silent: a house pianist improvised, or a small orchestra played from a cue sheet listing published pieces by mood and duration. Because the same film was accompanied differently in every city, and because cue sheets survive far more often than the improvisations do, modern restorations tend to reproduce the orchestral version and quietly retire the pianist's. Film historian Josip Marek notes that this preserves the version that was written down rather than the version most audiences actually heard.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence"],
        difficulty: "hard",
        prompt: "Which choice best describes the function of the last sentence in the text?",
        answer:
          "It identifies a consequence of the survival pattern described in the preceding sentence.",
        wrong: [
          "It proposes a method for reconstructing improvised piano accompaniments.",
          "It corrects a factual error commonly made about silent film exhibition.",
          "It explains why cue sheets were preferred by theater owners.",
        ],
        why: "Marek's sentence draws out what follows from cue sheets surviving and improvisations not: restorations preserve the documented version, not the common one.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "medium",
        prompt: "Based on the text, why do modern restorations favor orchestral accompaniment?",
        answer: "Because written cue sheets survive while improvised performances did not.",
        wrong: [
          "Because audiences at the time preferred orchestras to house pianists.",
          "Because orchestral accompaniment was the only kind used in large cities.",
          "Because Marek has recommended orchestral versions for historical accuracy.",
        ],
        why: "The passage attributes the choice to the survival of documentation, and Marek's remark is a criticism of the result, not a recommendation.",
      },
    ],
  },
  {
    slug: "recipe-history",
    paragraphs: [
      "A handwritten recipe book kept by a household in Bristol between 1740 and 1790 lists sugar in twenty-eight receipts, and the quantities rise sharply after 1765. Food historian Deborah Mensah reads the book as a domestic record of a commodity chain: the sugar that appears in a cake in Bristol was cut in the Caribbean, and the household's growing use of it tracks the falling price that plantation expansion produced. Read this way, she argues, an ordinary kitchen document becomes a source for economic history without ceasing to be a source for how people ate.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Mensah shows that a household recipe book can document both culinary practice and the economics of the sugar trade.",
        wrong: [
          "Mensah argues that recipe books are more reliable than commercial records for tracing sugar prices.",
          "The Bristol household reduced its sugar consumption after plantation expansion raised prices.",
          "Recipe books written before 1765 rarely mention sugar in any quantity.",
        ],
        why: "The final sentence states the dual value explicitly. The other options reverse the price relationship or make claims the text does not support.",
      },
    ],
  },
];
