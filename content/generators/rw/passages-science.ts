/**
 * Science and social-science passages for Information and Ideas and Craft and
 * Structure. Passage lengths, question stems, and answer patterns follow the
 * Digital SAT's short-passage format: one passage per question set, 50–140
 * words, four choices, no line references.
 */
import type { PassageSeed } from "./passage-kit";

export const SCIENCE_PASSAGES: PassageSeed[] = [
  {
    slug: "octopus-arms",
    paragraphs: [
      "An octopus has roughly five hundred million neurons, but fewer than a third of them sit in its central brain. The rest are distributed through its eight arms, each of which contains a dense ring of nerve cells running its full length. Researchers have shown that a severed arm will still reach toward and grasp a food item, and that an intact animal solving a maze often lets one arm explore a branch while the others work elsewhere. Neurobiologist Tamar Weiss argues that this arrangement means an octopus does not so much control its arms as negotiate with them.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas", "Summarizing"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Because most of an octopus's neurons lie outside its central brain, its arms act with a substantial degree of independence.",
        wrong: [
          "An octopus has more neurons in total than most invertebrates of comparable size.",
          "A severed octopus arm can perform any behavior an attached arm can perform.",
          "Weiss's research has overturned the long-held view that octopuses can solve mazes.",
        ],
        why: "The text's through-line is that the octopus's neurons are distributed into the arms and that the arms therefore act semi-independently — which is exactly what Weiss's 'negotiate' remark captures.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence", "Purpose"],
        difficulty: "hard",
        prompt: "Which choice best describes the function of the final sentence in the text as a whole?",
        answer:
          "It offers an interpretation that captures the implication of the evidence presented earlier in the text.",
        wrong: [
          "It introduces an objection that the preceding evidence was designed to answer.",
          "It concedes a limitation of the experiments described in the previous sentence.",
          "It proposes a new experiment that would test the claims made earlier in the text.",
        ],
        why: "The last sentence does not raise an objection, concede a limit, or propose an experiment; it restates what the neuron distribution and behavioral findings imply, in a memorable formulation.",
      },
    ],
  },
  {
    slug: "perovskite-cells",
    paragraphs: [
      "Perovskite solar cells convert sunlight to electricity as efficiently as the silicon cells that dominate the market, and they can be printed from solution rather than grown as crystals, which makes them far cheaper to manufacture. Their weakness is durability: humidity and heat degrade the perovskite layer within months, while silicon panels are warranted for twenty-five years. A team led by materials scientist Deepa Iyer recently encapsulated perovskite cells in a two-micrometer glass barrier and reported no measurable efficiency loss after a year of accelerated weathering.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas", "Detail identification"],
        difficulty: "easy",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Perovskite cells are cheap and efficient but historically short-lived, and Iyer's team has demonstrated a possible remedy for that weakness.",
        wrong: [
          "Perovskite cells have replaced silicon cells in most commercial solar installations.",
          "Silicon solar cells are less efficient than perovskite cells but far easier to manufacture.",
          "Iyer's team has shown that humidity, not heat, is the primary cause of perovskite degradation.",
        ],
        why: "The text sets up an advantage (cheap, efficient), names the offsetting weakness (durability), and closes with a result addressing it. The other choices contradict the text or overstate what it says.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Evaluating evidence", "Supporting a claim"],
        difficulty: "hard",
        prompt:
          "A researcher claims that Iyer's encapsulation approach could allow perovskite cells to compete with silicon in rooftop installations. Which finding, if true, would most directly support that claim?",
        answer:
          "Encapsulated perovskite cells installed on rooftops retained more than 90 percent of their initial efficiency after ten years of field exposure.",
        wrong: [
          "Unencapsulated perovskite cells degrade more slowly in dry climates than in humid ones.",
          "The two-micrometer glass barrier adds less than one percent to the manufacturing cost of a cell.",
          "Perovskite cells match silicon cells in efficiency under standard laboratory illumination.",
        ],
        why: "The claim is about competing with silicon, whose selling point is a twenty-five-year life. Only long-term field durability speaks to that. Cost and laboratory efficiency were already established in the text and do not address the durability gap.",
      },
    ],
  },
  {
    slug: "kelp-urchin",
    paragraphs: [
      "Along parts of the northern California coast, kelp forests collapsed after 2013 and were replaced by 'urchin barrens' — stretches of seafloor grazed bare by purple sea urchins. Because urchins can survive for years in a starved state, the barrens persist even when almost no kelp remains to eat. Divers removing urchins by hand have restored small patches, but the effort does not scale. Ecologist Marcus Deane notes that sea otters, which once controlled urchin numbers, have not returned to the region, and argues that without a resident predator any cleared patch will ______",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Logical completion", "Inference"],
        difficulty: "medium",
        prompt: "Which choice most logically completes the text?",
        answer: "be recolonized by urchins from the surrounding barrens.",
        wrong: [
          "support a more diverse kelp community than existed before 2013.",
          "attract sea otters back to the northern California coast.",
          "remain free of urchins as long as kelp continues to grow there.",
        ],
        why: "The text establishes that urchins persist in surrounding barrens and that no predator controls them, so a cleared patch has nothing to keep urchins out. The other options assert outcomes the text gives no basis for.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Overall structure"],
        difficulty: "medium",
        prompt: "Which choice best describes the overall structure of the text?",
        answer:
          "It describes an ecological change, explains why the change is self-sustaining, and identifies what a durable remedy would require.",
        wrong: [
          "It presents two competing explanations for an ecological change and endorses one of them.",
          "It recounts the history of a restoration program and evaluates its cost-effectiveness.",
          "It defines a technical term and then traces its adoption by working ecologists.",
        ],
        why: "The passage moves from the collapse, to why barrens persist, to what hand-removal cannot fix and what a predator would supply. No competing explanations are weighed and no program history is given.",
      },
    ],
  },
  {
    slug: "tardigrade-dry",
    paragraphs: [
      "Tardigrades can lose nearly all their body water and remain viable for years in a glassy, metabolically inert state called anhydrobiosis. For decades researchers assumed the sugar trehalose was responsible, since it protects yeast and brine shrimp from desiccation the same way. But most tardigrade species accumulate almost no trehalose. In 2017 a group found instead a family of intrinsically disordered proteins, unique to tardigrades, that vitrify as the animal dries, immobilizing cell contents in a glassy matrix. Expressing these proteins in bacteria conferred desiccation tolerance on cells that had none.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Tardigrade desiccation tolerance depends on a distinctive family of proteins rather than on the sugar long assumed to be responsible.",
        wrong: [
          "Trehalose protects yeast and brine shrimp from drying but is toxic to tardigrades.",
          "Bacteria are more resistant to desiccation than tardigrades once they are genetically modified.",
          "Anhydrobiosis has been observed in tardigrades, yeast, and brine shrimp using the same mechanism.",
        ],
        why: "The passage sets up an assumption (trehalose), reports evidence against it, and identifies the actual mechanism. The other choices contradict the text or invent claims it does not make.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence"],
        difficulty: "hard",
        prompt: "Which choice best describes the function of the last sentence in the text?",
        answer:
          "It presents experimental evidence that the proteins are sufficient to produce the effect described.",
        wrong: [
          "It qualifies the finding by noting that it has been observed only in bacteria.",
          "It explains why trehalose was originally thought to be responsible for anhydrobiosis.",
          "It identifies a practical application that motivated the 2017 study.",
        ],
        why: "Conferring tolerance on cells that previously lacked it shows the proteins are enough on their own — a sufficiency test, not a qualification, a historical explanation, or an application.",
      },
    ],
  },
  {
    slug: "birdsong-dialect",
    paragraphs: [
      "White-crowned sparrows learn their songs during a narrow window in their first summer, and populations separated by as little as a few kilometers can sing recognizably different dialects. Biologist Nia Okonkwo recorded the same three territories for twenty-two consecutive years and found that a dialect boundary that had run along a creek in 1998 had shifted nearly two kilometers uphill by 2020. Housing construction had removed the scrub on the lower slope during that period, and the birds that had held those territories did not return.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference", "Causal reasoning"],
        difficulty: "hard",
        prompt: "Based on the text, which statement about the dialect boundary is best supported?",
        answer:
          "Its position depends on where singing birds hold territories, so habitat loss can move it.",
        wrong: [
          "It shifts uphill by a predictable distance each decade regardless of local conditions.",
          "It is determined genetically and therefore cannot change within a single generation.",
          "It was created by the creek, which acted as a physical barrier to the birds' movement.",
        ],
        why: "The text links the boundary's shift to the removal of scrub and the loss of the birds holding those territories, which supports a habitat-dependent boundary. Nothing supports a fixed rate, a genetic basis, or the creek as a barrier.",
      },
    ],
  },
  {
    slug: "concrete-carbon",
    paragraphs: [
      "Manufacturing cement releases carbon dioxide twice over: once when limestone is heated and decomposes chemically, and again from the fuel used to reach the required 1,450 degrees Celsius. Switching kilns to electricity addresses only the second source. Several firms are therefore testing calcium silicate binders that cure by absorbing carbon dioxide rather than releasing it, though these binders set more slowly and cannot yet be used in structural applications where early strength matters.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Detail identification"],
        difficulty: "medium",
        prompt: "Based on the text, why would electrifying cement kilns be an incomplete solution?",
        answer:
          "It would eliminate fuel emissions but not the carbon dioxide released by the chemical decomposition of limestone.",
        wrong: [
          "It would require temperatures higher than 1,450 degrees Celsius to be effective.",
          "Electric kilns cure calcium silicate binders too slowly for structural use.",
          "It would increase the total energy required to produce a given quantity of cement.",
        ],
        why: "The passage identifies two emission sources and says electrification addresses only the fuel one, leaving the chemical release untouched. The other options confuse details from different parts of the text.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Purpose of the text"],
        difficulty: "medium",
        prompt: "What is the main purpose of the text?",
        answer:
          "To explain why reducing emissions from cement is harder than switching energy sources, and to describe one alternative being tested.",
        wrong: [
          "To argue that calcium silicate binders should replace conventional cement immediately.",
          "To compare the cost of electric kilns with the cost of conventional fuel-fired kilns.",
          "To describe the chemical process by which limestone decomposes at high temperature.",
        ],
        why: "The text explains the two-source problem, notes the limit of electrification, and introduces binders with a caveat — it does not advocate immediate replacement or compare costs.",
      },
    ],
  },
  {
    slug: "sleep-memory",
    paragraphs: [
      "During slow-wave sleep, the hippocampus replays sequences of neural activity recorded during the preceding day, compressed roughly twentyfold. Researchers have long treated this replay as the mechanism by which memories are transferred to the cortex for long-term storage. A recent study complicates that picture: when replay was selectively disrupted in rats, performance on a spatial task the following day was unaffected, but performance a week later collapsed. The authors suggest replay may matter less for forming memories than for ______",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Logical completion"],
        difficulty: "hard",
        prompt: "Which choice most logically completes the text?",
        answer: "stabilizing them so they survive over longer intervals.",
        wrong: [
          "compressing them so they occupy less space in the cortex.",
          "retrieving them quickly during the day on which they were formed.",
          "preventing them from interfering with memories formed the following day.",
        ],
        why: "Disrupting replay left next-day performance intact but destroyed week-later performance, which points to a role in long-term maintenance rather than initial formation or same-day retrieval.",
      },
    ],
  },
  {
    slug: "plastic-enzyme",
    paragraphs: [
      "In 2016 researchers isolated a bacterium from sediment outside a bottle-recycling plant that could use polyethylene terephthalate as its sole carbon source. Its key enzyme, PETase, breaks the polymer into monomers that the cell then metabolizes. Wild PETase works slowly and only on the amorphous regions of the plastic, leaving crystalline regions untouched — which matters, because bottles are deliberately crystallized to make them rigid. Engineered variants now degrade a bottle's worth of PET in hours, but only after the plastic has been melted and rapidly cooled to reduce its crystallinity.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Evaluating claims"],
        difficulty: "hard",
        prompt:
          "Which finding, if true, would most weaken the claim that engineered PETase makes bottle recycling substantially more energy-efficient?",
        answer:
          "The melting and rapid cooling required before enzymatic treatment consumes more energy than conventional mechanical recycling of the same bottles.",
        wrong: [
          "Wild PETase degrades amorphous PET more slowly than the engineered variants do.",
          "The bacterium was originally isolated from sediment rather than from a laboratory culture.",
          "Some engineered PETase variants lose activity when stored above 40 degrees Celsius.",
        ],
        why: "The text says the enzyme works only after an energy-intensive pretreatment. A finding that this pretreatment costs more energy than the alternative undercuts the efficiency claim directly; the other options are irrelevant to energy accounting.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Words in Context",
        skills: ["Words in context"],
        difficulty: "medium",
        prompt: 'As used in the text, what does the phrase "sole carbon source" most nearly mean?',
        answer: "The only substance from which the bacterium obtains carbon",
        wrong: [
          "The substance the bacterium metabolizes most rapidly",
          "The only substance the bacterium can break down enzymatically",
          "The substance from which the bacterium derives most of its energy",
        ],
        why: "*Sole* means only, and *carbon source* names where an organism gets carbon. The distractors substitute 'fastest', 'only thing it can break down', or 'energy' for that precise meaning.",
      },
    ],
  },
  {
    slug: "mars-dust",
    paragraphs: [
      "Global dust storms on Mars can shroud the planet for months, and they are the reason NASA's Opportunity rover fell silent in 2018: its solar panels could no longer collect enough light. Curiosity, powered by a radioisotope generator, continued operating through the same storm. Mission planners now treat the choice of power source as a constraint on where a rover can be sent as well as how long it can last, since the highest-latitude sites receive too little sunlight to support solar operation even in clear conditions.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Detail identification", "Central ideas"],
        difficulty: "easy",
        prompt: "Based on the text, what advantage does a radioisotope generator give a Mars rover?",
        answer: "It allows the rover to keep operating when sunlight is scarce or blocked.",
        wrong: [
          "It allows the rover to travel farther in a single day than a solar-powered rover.",
          "It protects the rover's instruments from dust accumulation during global storms.",
          "It enables the rover to transmit data during periods when Earth is out of view.",
        ],
        why: "The contrast between Opportunity and Curiosity is entirely about power availability during a storm. Nothing in the text concerns travel speed, dust protection, or transmission windows.",
      },
    ],
  },
  {
    slug: "gut-microbiome",
    paragraphs: [
      "Mice raised in sterile isolators develop abnormally: their intestinal walls are thin, their immune cells are sparse, and they are unusually susceptible to infection. Transferring a conventional mouse's gut bacteria into such an animal restores normal development, but only if the transfer occurs within the first few weeks of life. Immunologist Farrah Adeyemi describes this window as evidence that the microbiome is not merely a passenger but a participant in building the immune system — one whose contribution cannot be supplied later.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Gut bacteria shape immune development during a limited early period, after which their absence cannot be corrected.",
        wrong: [
          "Mice raised in sterile isolators are more resistant to infection than conventionally raised mice.",
          "Transferring gut bacteria between mice restores normal development at any point in the animal's life.",
          "The microbiome influences intestinal structure but has no effect on immune cell populations.",
        ],
        why: "The passage's two facts are the abnormality of germ-free mice and the time-limited effectiveness of transfer; Adeyemi's remark generalizes both. The other choices reverse or contradict the text.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence"],
        difficulty: "hard",
        prompt: "Which choice best describes the function of the final sentence in the text?",
        answer:
          "It draws a general conclusion from the experimental results reported in the preceding sentences.",
        wrong: [
          "It raises a methodological objection to the transfer experiments described earlier.",
          "It provides a specific example illustrating the general claim made at the start of the text.",
          "It contrasts Adeyemi's interpretation with a competing account of the same evidence.",
        ],
        why: "Adeyemi's sentence generalizes from the two results — it does not object, exemplify, or introduce a rival view.",
      },
    ],
  },
  {
    slug: "quantum-clock",
    paragraphs: [
      "An optical lattice clock keeps time by counting oscillations of light absorbed by strontium atoms held in a grid of laser beams. The best such clocks would lose less than a second over the age of the universe. Their precision is now high enough that raising one by a single centimeter measurably speeds it up, because gravitational time dilation depends on height. Geodesists have begun proposing clock networks as instruments for measuring the shape of Earth's gravitational field, a use their designers did not have in mind.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Overall structure", "Purpose"],
        difficulty: "medium",
        prompt: "Which choice best describes the overall structure of the text?",
        answer:
          "It explains how a device works, establishes how precise it is, and notes an unanticipated application of that precision.",
        wrong: [
          "It compares two competing timekeeping technologies and argues for the superiority of one.",
          "It traces the historical development of atomic timekeeping from its origins to the present.",
          "It identifies a limitation of optical lattice clocks and describes efforts to overcome it.",
        ],
        why: "The three moves are mechanism, precision, and a new use. No comparison, history, or limitation appears.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, why could a network of optical lattice clocks measure Earth's gravitational field?",
        answer:
          "Because clock rate varies with gravitational potential, differences between clocks reveal differences in that potential.",
        wrong: [
          "Because strontium atoms are more sensitive to gravity than the atoms used in other clocks.",
          "Because laser beams bend measurably in the presence of a strong gravitational field.",
          "Because a clock's precision improves as it is moved farther from Earth's surface.",
        ],
        why: "The text states that height changes a clock's rate through gravitational time dilation; comparing clocks therefore maps the field. The distractors invent mechanisms the text does not describe.",
      },
    ],
  },
  {
    slug: "seed-dispersal",
    paragraphs: [
      "Many large-fruited trees in Central American forests evolved alongside megafauna — ground sloths, gomphotheres, and horses — that swallowed their fruit whole and deposited the seeds kilometers away. Those animals disappeared roughly twelve thousand years ago, and the trees' present-day seed shadows are correspondingly small: most seeds fall within a few meters of the parent. Ecologist Rubén Salas points out that several of these species survive today mainly where cattle and horses reintroduced by Europeans have taken up the dispersal role, which suggests the trees are ______",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Logical completion", "Inference"],
        difficulty: "hard",
        prompt: "Which choice most logically completes the text?",
        answer: "dependent on large animal dispersers rather than merely adapted to them.",
        wrong: [
          "capable of dispersing their seeds effectively without any animal assistance.",
          "less common now than they were before the megafauna became extinct.",
          "producing smaller fruit than their ancestors did twelve thousand years ago.",
        ],
        why: "The trees persist specifically where substitute large dispersers exist, which indicates a requirement rather than an optional adaptation. The other options are either contradicted by the text or unsupported by it.",
      },
    ],
  },
  {
    slug: "auroral-radio",
    paragraphs: [
      "Radio operators in high-latitude regions have long known that shortwave signals fade during auroral displays. The cause is the same energetic particle precipitation that produces the aurora itself: it ionizes the lower ionosphere, which absorbs rather than reflects radio waves in the shortwave band. Airlines flying polar routes therefore reroute during large geomagnetic storms, not because the aircraft are endangered but because ______",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Logical completion"],
        difficulty: "medium",
        prompt: "Which choice most logically completes the text?",
        answer: "shortwave communication with ground stations becomes unreliable along those routes.",
        wrong: [
          "auroral displays make visual navigation more difficult for flight crews.",
          "the ionosphere reflects shortwave signals back toward the aircraft.",
          "energetic particles interfere directly with the aircraft's electrical systems.",
        ],
        why: "The passage explains that precipitation causes absorption of shortwave signals and explicitly rules out danger to the aircraft, leaving communication as the reason to reroute.",
      },
    ],
  },
  {
    slug: "salamander-regen",
    paragraphs: [
      "An axolotl that loses a limb regrows it complete with bone, muscle, nerve, and skin, and it can do so repeatedly. Cells near the wound revert to a less specialized state, form a mass called a blastema, and then rebuild the missing structure in the correct proportions. What determines those proportions is the blastema's positional memory: cells retain a record of where along the limb they originally sat. Grafting a blastema from a wrist onto a shoulder stump produces a hand attached directly to the shoulder, not a complete arm.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Detail identification"],
        difficulty: "medium",
        prompt: "What does the grafting experiment described in the last sentence demonstrate?",
        answer:
          "Blastema cells regenerate the structures appropriate to their original position rather than to their new one.",
        wrong: [
          "Blastema cells lose all record of their original position once they revert to a less specialized state.",
          "A blastema cannot form unless it is located at the site of the original injury.",
          "Axolotls can regenerate a limb only a limited number of times before the process fails.",
        ],
        why: "A wrist blastema on a shoulder makes a hand, not an arm — evidence that the cells build according to remembered position, which is the passage's definition of positional memory.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Words in Context",
        skills: ["Words in context"],
        difficulty: "medium",
        prompt: 'As used in the text, what does the word "revert" most nearly mean?',
        answer: "Return to an earlier condition",
        wrong: ["Divide more rapidly", "Migrate toward the wound", "Change into a different tissue type"],
        why: "The text says cells revert to a *less specialized* state — a return to an earlier, more general condition, not division, migration, or transformation into another tissue.",
      },
    ],
  },
  {
    slug: "river-meander",
    paragraphs: [
      "A river flowing across a flat plain does not stay straight. Any slight bend sends the fastest water to the outer bank, where it erodes sediment, while slower water on the inner bank deposits it. The bend therefore deepens, and the process repeats, until loops grow so pronounced that the river cuts across the neck of one and abandons it as an oxbow lake. Geomorphologists describe meandering as the flat-plain river's equilibrium state rather than a departure from one.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence"],
        difficulty: "hard",
        prompt: "Which choice best describes the function of the last sentence in the text?",
        answer:
          "It reframes the process just described as normal rather than as a deviation from an expected form.",
        wrong: [
          "It summarizes the physical forces responsible for erosion on the outer bank.",
          "It introduces a disagreement among geomorphologists about how meanders form.",
          "It identifies an exception to the pattern described in the preceding sentences.",
        ],
        why: "The final sentence's contrast is between 'equilibrium state' and 'departure from one' — it recasts meandering as the norm, rather than summarizing forces, reporting a dispute, or noting an exception.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Detail identification"],
        difficulty: "easy",
        prompt: "According to the text, what causes a river bend to become more pronounced over time?",
        answer:
          "Faster water erodes the outer bank while slower water deposits sediment on the inner bank.",
        wrong: [
          "Sediment accumulates on the outer bank and is removed from the inner bank.",
          "The river cuts across the neck of the loop and abandons the bend.",
          "Water flows more slowly through a bend than through a straight channel.",
        ],
        why: "The second sentence states the erosion–deposition pairing directly; the other options reverse it or describe the later cutoff step.",
      },
    ],
  },
  {
    slug: "antibiotic-soil",
    paragraphs: [
      "Fewer than one percent of soil bacteria will grow in a standard laboratory culture, which is why the discovery of new antibiotics slowed after the 1960s: the accessible organisms had already been screened. The iChip changes the arithmetic. It is a plastic block of tiny chambers, each seeded with a single bacterial cell and then buried back in the soil the sample came from, where nutrients and signaling molecules diffuse in through semipermeable membranes. Roughly half of the organisms isolated this way grow, and one of them yielded teixobactin, the first structurally novel antibiotic class described in nearly thirty years.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "By letting soil bacteria grow in their native environment, the iChip has made previously unculturable organisms available as a source of new antibiotics.",
        wrong: [
          "Teixobactin is more effective than any antibiotic discovered before the 1960s.",
          "Soil bacteria produce antibiotics only when they are grown in standard laboratory culture.",
          "The slowdown in antibiotic discovery after the 1960s was caused by a decline in research funding.",
        ],
        why: "The passage identifies the bottleneck (unculturable organisms), the device that removes it, and the payoff. The other choices are unsupported or contradict the text.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Supporting a claim"],
        difficulty: "hard",
        prompt:
          "Which detail from the text most directly explains why the iChip succeeds where standard culture fails?",
        answer:
          "Its chambers are buried in the original soil, so nutrients and signaling molecules reach the cells through semipermeable membranes.",
        wrong: [
          "Each of its chambers is seeded with only a single bacterial cell.",
          "It is made of plastic and can be manufactured with many chambers at once.",
          "It produced teixobactin, the first new structural class of antibiotic in thirty years.",
        ],
        why: "The explanatory detail is the restoration of the native chemical environment. Single-cell seeding and the material are incidental, and teixobactin is a result rather than an explanation.",
      },
    ],
  },
  {
    slug: "wildfire-smoke",
    paragraphs: [
      "Smoke from large wildfires can reach the stratosphere, where it persists for months rather than the days it would last in the lower atmosphere. The 2019–2020 Australian fires injected enough black carbon to warm the stratosphere measurably over the Southern Hemisphere and to reduce the ozone column at midlatitudes. Atmospheric chemist Lena Farkas notes that models used to project ozone recovery were built when stratospheric aerosol loading was assumed to come almost entirely from volcanic eruptions.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, what does Farkas's observation most strongly suggest?",
        answer:
          "Existing projections of ozone recovery may need revision to account for wildfire smoke.",
        wrong: [
          "Volcanic eruptions contribute less stratospheric aerosol than wildfires do.",
          "Black carbon from wildfires cools rather than warms the stratosphere.",
          "The 2019–2020 Australian fires were the first to inject smoke into the stratosphere.",
        ],
        why: "If the models assumed a volcanic-only aerosol source and fires now supply a significant one, the models' assumptions are incomplete. The other choices assert comparisons or firsts the text does not make.",
      },
    ],
  },
  {
    slug: "language-acquisition",
    paragraphs: [
      "Children acquiring a first language routinely produce forms they have never heard, such as *goed* for *went*. Far from errors of memory, these overregularizations appear only after a child has already used the correct irregular form for months. The pattern suggests the child has extracted a rule — add *-ed* for the past tense — and is applying it across the board before learning which verbs are exempt. Linguist Sandra Oyelaran calls the phase a window onto grammar formation, since it reveals a rule the child could not have heard anyone use.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas", "Inference"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Children's incorrect past-tense forms reveal that they are constructing grammatical rules rather than only imitating what they hear.",
        wrong: [
          "Children who say *goed* have failed to memorize the irregular verb forms of their language.",
          "Overregularization occurs before children have learned any correct irregular past-tense forms.",
          "Oyelaran has shown that children learn irregular verbs faster than regular ones.",
        ],
        why: "The passage stresses that the correct form comes first and that the error reflects an extracted rule, which is evidence of rule-building rather than imitation or memory failure.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Words in Context",
        skills: ["Words in context"],
        difficulty: "hard",
        prompt: 'As used in the text, what does the word "exempt" most nearly mean?',
        answer: "Not governed by the rule",
        wrong: ["Rarely used in speech", "Difficult to pronounce", "Borrowed from another language"],
        why: "The verbs in question are the irregulars — those the *-ed* rule does not apply to. *Exempt* means free from an otherwise applicable rule.",
      },
    ],
  },
  {
    slug: "urban-birdsong",
    paragraphs: [
      "Great tits in cities sing at a higher minimum frequency than great tits in nearby woodland. The usual explanation is masking: low-frequency traffic noise drowns out the lower notes, so birds that shift upward are heard. But a study in eleven European cities found that the shift persists in urban parks that are quiet by day, and that captive-raised urban birds sing high even when they have never heard traffic. The authors argue that the difference may be ______",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Logical completion", "Inference"],
        difficulty: "hard",
        prompt: "Which choice most logically completes the text?",
        answer:
          "at least partly inherited rather than a direct response to noise each bird experiences.",
        wrong: [
          "caused by traffic noise even in parks where daytime noise levels are low.",
          "an artifact of the way song frequency was measured in the eleven cities.",
          "evidence that urban birds have poorer low-frequency hearing than woodland birds.",
        ],
        why: "Birds raised without ever hearing traffic still sing high, which rules out direct response and points toward an inherited difference. The other options ignore or contradict that result.",
      },
    ],
  },
  {
    slug: "carbon-dating-bomb",
    paragraphs: [
      "Atmospheric nuclear testing between 1955 and 1963 nearly doubled the concentration of carbon-14 in the atmosphere. After the test ban the level fell steadily as the excess mixed into the oceans and biosphere, producing a curve so steep and so well documented that a tissue sample's carbon-14 content dates its formation to within about a year. Forensic scientists use the 'bomb curve' to establish when an unidentified person was born; art authenticators use it to determine whether a canvas was woven before or after 1955.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Purpose of the text"],
        difficulty: "medium",
        prompt: "What is the main purpose of the text?",
        answer:
          "To explain how a side effect of nuclear testing became a precise dating tool with practical applications.",
        wrong: [
          "To argue that atmospheric nuclear testing should be resumed for scientific purposes.",
          "To compare the accuracy of bomb-curve dating with that of conventional radiocarbon dating.",
          "To describe the process by which carbon-14 is produced in the upper atmosphere.",
        ],
        why: "The text traces cause (testing), effect (the curve), and use (forensics, authentication). It makes no argument for resuming testing, offers no accuracy comparison, and does not explain carbon-14 production.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "medium",
        prompt: "Based on the text, why can bomb-curve dating distinguish a canvas woven in 1950 from one woven in 1960?",
        answer:
          "Fibers grown after testing began carry elevated carbon-14 levels that fibers grown earlier do not.",
        wrong: [
          "Carbon-14 decays quickly enough that a decade of decay is easily measured.",
          "Canvas woven before 1955 contains no carbon-14 at all.",
          "The bomb curve records annual changes in the manufacturing of artists' materials.",
        ],
        why: "The distinguishing signal is the post-1955 excess. Carbon-14's half-life is far too long for a decade of decay to matter, and pre-1955 material still contains natural carbon-14.",
      },
    ],
  },
];
