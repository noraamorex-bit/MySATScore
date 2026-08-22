/**
 * Information and Ideas passages.
 *
 * The blueprint calls for seven Information and Ideas questions per module —
 * twenty-one across a full form — which makes this the deepest well the bank
 * needs. These sets skew shorter and more direct than the passages in the other
 * files, matching the easier end of the real test's range so the standard
 * second module has material to draw on.
 */
import type { PassageSeed } from "./passage-kit";

export const IDEAS_PASSAGES: PassageSeed[] = [
  {
    slug: "bee-dance",
    paragraphs: [
      "A honeybee returning from a good nectar source performs a looping figure-eight on the vertical face of the comb. The angle of the straight run relative to vertical encodes the direction of the food relative to the sun, and the duration of that run encodes the distance. Bees that watch the dance fly out and search in the indicated direction, and the farther the dance says the food is, the farther they travel before beginning to search.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "easy",
        prompt: "Which choice best states the main idea of the text?",
        answer: "A honeybee's dance communicates both the direction and the distance of a food source.",
        wrong: [
          "Honeybees perform a figure-eight dance whenever they return to the hive.",
          "Bees that watch a dance always find the food source described in it.",
          "The angle of a bee's dance changes as the sun moves across the sky.",
        ],
        why: "The passage assigns direction to the angle and distance to the duration, and shows that watchers act on both. The other choices overstate or narrow the claim.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Supporting a claim"],
        difficulty: "medium",
        prompt: "Which detail from the text most directly supports the claim that other bees use the distance information?",
        answer: "The farther the dance indicates, the farther watching bees fly before starting to search.",
        wrong: [
          "The dance is performed on the vertical face of the comb.",
          "The angle of the straight run is measured relative to vertical.",
          "The dance takes the shape of a looping figure-eight.",
        ],
        why: "Only the flight-distance detail shows the watchers responding to the distance component. The others describe the dance itself.",
      },
    ],
  },
  {
    slug: "roman-roads",
    paragraphs: [
      "Roman military roads were built in layers: a foundation of large stones, then gravel bound with lime, then a surface of fitted paving blocks laid with a slight crown so water ran off to the ditches on either side. The layers matter less than the drainage. Roads elsewhere in the ancient world used similar materials but were laid flat, and where the water could not run off, freeze-and-thaw cycles broke the surface apart within a few decades.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas", "Detail identification"],
        difficulty: "easy",
        prompt: "Which choice best states the main idea of the text?",
        answer: "The durability of Roman roads owed more to their drainage than to the materials used in them.",
        wrong: [
          "Roman roads were built from materials unavailable elsewhere in the ancient world.",
          "Roman roads were constructed in three distinct layers of stone and gravel.",
          "Freeze-and-thaw cycles destroyed most ancient roads within a few decades.",
        ],
        why: "The text explicitly says the layers matter less than the drainage, and contrasts crowned Roman roads with flat ones built of similar materials.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "medium",
        prompt: "Based on the text, why did the slight crown of a Roman road matter?",
        answer: "It let water drain to the sides instead of standing on the surface and freezing.",
        wrong: [
          "It made the road easier for wheeled vehicles to travel along.",
          "It allowed the paving blocks to be fitted together more tightly.",
          "It reduced the amount of gravel needed in the middle layer.",
        ],
        why: "The passage links the crown directly to runoff, and standing water to freeze-and-thaw damage.",
      },
    ],
  },
  {
    slug: "penicillin-scale",
    paragraphs: [
      "Alexander Fleming's 1928 observation that a *Penicillium* mould killed staphylococci is the famous part of the story, but Fleming could never produce the compound in usable quantity and abandoned the work by 1931. A decade later Howard Florey and Ernst Chain purified enough to treat a single patient, and even then they recovered penicillin from his urine to keep the treatment going. Mass production came only after American fermentation engineers moved the process into deep tanks, using a mould strain found on a cantaloupe in an Illinois market.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer: "Turning penicillin into a usable drug required production advances well beyond Fleming's original discovery.",
        wrong: [
          "Fleming's 1928 observation was the single decisive step in developing penicillin.",
          "Florey and Chain discovered penicillin independently of Fleming's earlier work.",
          "Penicillin could not be produced in quantity until a new antibiotic was found.",
        ],
        why: "The passage moves from Fleming's abandoned work, to a single patient's treatment, to deep-tank fermentation — a story about production, not discovery.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Evaluating evidence"],
        difficulty: "hard",
        prompt: "Which detail most vividly conveys how scarce purified penicillin was in the early 1940s?",
        answer: "Florey and Chain recovered the drug from their patient's urine in order to continue treatment.",
        wrong: [
          "Fleming abandoned his work on the mould by 1931.",
          "The production strain was found on a cantaloupe in an Illinois market.",
          "Fleming's original observation concerned staphylococci.",
        ],
        why: "Reclaiming the drug from a patient's urine is the detail that shows how little there was. The others concern discovery or the later production strain.",
      },
    ],
  },
  {
    slug: "library-alexandria",
    paragraphs: [
      "The Library of Alexandria is usually described as having been destroyed in a single catastrophe, most often a fire during Caesar's siege in 48 BCE. Ancient sources, however, describe scholars working there for centuries afterward. Historians now generally hold that the library declined gradually: royal patronage lapsed, salaries went unpaid, scholars left for rival institutions in Pergamon and Rhodes, and the collection dispersed over three hundred years.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "easy",
        prompt: "Which choice best states the main idea of the text?",
        answer: "The library's end was a slow decline rather than a single destructive event.",
        wrong: [
          "Caesar's siege in 48 BCE destroyed the entire collection of the library.",
          "The library's scholars deliberately dispersed the collection to rival institutions.",
          "Ancient sources agree that the library was destroyed by fire.",
        ],
        why: "The passage sets the popular single-catastrophe story against evidence of continued work and a three-hundred-year dispersal.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Supporting a claim"],
        difficulty: "medium",
        prompt: "Which detail from the text most directly undermines the single-catastrophe account?",
        answer: "Ancient sources describe scholars working at the library for centuries after 48 BCE.",
        wrong: [
          "Royal patronage for the library eventually lapsed.",
          "Rival institutions existed in Pergamon and Rhodes.",
          "The collection dispersed over the course of three hundred years.",
        ],
        why: "Continued scholarly activity after the supposed destruction is the fact that contradicts it directly; the others explain the gradual decline rather than refuting the fire.",
      },
    ],
  },
  {
    slug: "sourdough-culture",
    paragraphs: [
      "A sourdough starter is a stable community of wild yeasts and lactic acid bacteria. Bakers often assume the community comes from the air, but studies that sequenced starters from dozens of bakeries found that the dominant organisms match those on the grain itself and on the baker's hands, not those floating nearby. A starter fed with the same flour in two different cities converges on a similar community within weeks.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer: "The microbes in a sourdough starter come mainly from the flour and the baker rather than from the surrounding air.",
        wrong: [
          "Sourdough starters in different cities never develop the same microbial community.",
          "Wild yeasts and lactic acid bacteria cannot survive outside a sourdough starter.",
          "Bakers who wash their hands produce more consistent sourdough starters.",
        ],
        why: "The sequencing result and the two-city convergence both point to flour and hands as the source, against the airborne assumption.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, what does the two-city convergence most strongly suggest?",
        answer: "The flour a starter is fed matters more to its microbial makeup than its location does.",
        wrong: [
          "Starters kept in different cities are indistinguishable in flavour.",
          "Airborne yeasts are absent from most commercial bakeries.",
          "A starter's community becomes fixed within the first few days.",
        ],
        why: "Same flour, different places, similar outcome isolates the flour as the determining factor. The other options assert things the text does not test.",
      },
    ],
  },
  {
    slug: "electric-eel",
    paragraphs: [
      "An electric eel generates its discharge with three organs made of stacked cells called electrocytes, each contributing a fraction of a volt. Because the cells are wired in series along the length of the animal, the voltages add: a large eel can deliver more than 600 volts. The current is brief and the eel's own vital organs sit in the front fifth of its body, insulated from the discharge by fatty tissue.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Detail identification"],
        difficulty: "easy",
        prompt: "According to the text, why can an electric eel produce such a high voltage?",
        answer: "Its electrocytes are arranged in series, so their small voltages add together.",
        wrong: [
          "Each of its electrocytes produces more than 600 volts on its own.",
          "Its three electric organs each generate an independent 200-volt discharge.",
          "Fatty tissue around its organs amplifies the current it produces.",
        ],
        why: "The passage states that the cells are wired in series and that the voltages add, which is what produces the total.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "medium",
        prompt: "Based on the text, why is the eel itself not harmed by its own discharge?",
        answer: "Its vital organs are concentrated at the front and are insulated by fatty tissue.",
        wrong: [
          "Its electrocytes discharge in alternating directions that cancel out.",
          "Its discharge travels only through the surrounding water, never its body.",
          "It produces high voltage but no measurable current.",
        ],
        why: "The last sentence gives both protective factors: location and insulation.",
      },
    ],
  },
  {
    slug: "tea-clipper",
    paragraphs: [
      "Tea clippers of the 1860s were built for one purpose: to reach London first with the season's new crop, which commanded a premium that fell sharply within days. Everything about them followed from that — narrow hulls that carried less cargo, enormous sail area that demanded large crews, and hulls sheathed in copper that had to be replaced every few years. When the Suez Canal opened in 1869, steamers could take a route sailing ships could not use, and the clippers were unprofitable within a decade.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer: "Tea clippers were designed around speed at almost any cost, and a change of route ended their advantage.",
        wrong: [
          "Tea clippers carried more cargo than any other sailing ship of the period.",
          "The opening of the Suez Canal made sailing ships obsolete for every trade.",
          "Copper sheathing was the most expensive part of maintaining a tea clipper.",
        ],
        why: "The passage explains the design trade-offs made for speed and then the route change that removed the payoff. The other options overstate or misreport details.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference", "Causal reasoning"],
        difficulty: "hard",
        prompt: "Based on the text, why did the Suez Canal make clippers unprofitable?",
        answer: "Steamers could use a shorter route closed to sailing ships, so the clippers could no longer arrive first.",
        wrong: [
          "The canal made copper sheathing unavailable to sailing ship owners.",
          "Steamers could carry more cargo than clippers for the first time.",
          "The premium paid for new-crop tea disappeared after 1869.",
        ],
        why: "The clippers' whole value was arriving first; a route they could not take removed exactly that.",
      },
    ],
  },
  {
    slug: "solar-cooker",
    paragraphs: [
      "A field trial distributed solar cookers to 400 households in two districts and tracked how often each household used one over six months.",
    ],
    data: {
      type: "table",
      title: "Reported use of the solar cooker, months 1 and 6",
      columns: ["Frequency of use", "Month 1 (households)", "Month 6 (households)"],
      rows: [
        ["Daily", "184", "61"],
        ["A few times a week", "121", "88"],
        ["A few times a month", "63", "104"],
        ["Not at all", "32", "147"],
      ],
      numericColumns: [1, 2],
    },
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Reading tables"],
        difficulty: "easy",
        prompt:
          "Which choice best describes data from the table that support the claim that use declined over the trial?",
        answer:
          "Daily use fell from 184 households to 61, while the number reporting no use rose from 32 to 147.",
        wrong: [
          "In month 1, more households used the cooker daily than a few times a week.",
          "In month 6, the largest single group used the cooker a few times a month.",
          "The trial distributed cookers to 400 households across two districts.",
        ],
        why: "A decline claim needs both ends of the change. The other options report a single month or the study design.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Interpreting data"],
        difficulty: "medium",
        prompt: "Based on the table, which statement about month 6 is accurate?",
        answer: "More households reported not using the cooker at all than reported using it daily.",
        wrong: [
          "More households used the cooker daily than a few times a month.",
          "Fewer households used the cooker a few times a week than daily.",
          "Every household reported using the cooker at least occasionally.",
        ],
        why: "In month 6, 147 households reported no use against 61 daily users — the only accurate comparison among the options.",
      },
    ],
  },
  {
    slug: "whale-fall",
    paragraphs: [
      "When a large whale dies and sinks, its carcass supports a succession of communities on the deep seafloor. Scavengers strip the soft tissue within months. Worms and crustaceans then colonize the enriched sediment for years. Finally, bacteria break down lipids in the bones, releasing sulphide that sustains chemosynthetic organisms — the same kind found at hydrothermal vents — for decades. A single skeleton can host more than two hundred species over the course of that sequence.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "easy",
        prompt: "Which choice best states the main idea of the text?",
        answer: "A sunken whale carcass supports a long sequence of distinct communities on the deep seafloor.",
        wrong: [
          "Chemosynthetic organisms are found only at hydrothermal vents.",
          "Scavengers consume an entire whale carcass within a few months.",
          "Whale bones contain more lipids than any other marine tissue.",
        ],
        why: "The passage describes three successive stages over decades and the total species count. The other choices contradict or overstate details.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "medium",
        prompt: "Based on the text, what connects a whale fall to a hydrothermal vent?",
        answer: "Both supply sulphide that supports chemosynthetic organisms.",
        wrong: [
          "Both occur only at depths below four thousand metres.",
          "Both are produced by the decay of large marine animals.",
          "Both support the same two hundred species.",
        ],
        why: "The text names sulphide from bone lipids as sustaining the same kind of organisms found at vents.",
      },
    ],
  },
  {
    slug: "school-garden",
    paragraphs: [
      "A district compared vegetable consumption among students at schools with and without a working garden programme, surveying the same students in September and again in May.",
    ],
    data: {
      type: "chart",
      chart: "bar",
      title: "Mean servings of vegetables reported per day",
      xLabel: "Group and time",
      yLabel: "Servings per day",
      categories: ["Garden, Sept", "Garden, May", "No garden, Sept", "No garden, May"],
      series: [{ label: "Servings", points: [{ x: 0, y: 1.6 }, { x: 1, y: 2.4 }, { x: 2, y: 1.7 }, { x: 3, y: 1.8 }] }],
    },
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Reading graphs", "Comparing groups"],
        difficulty: "medium",
        prompt:
          "Which choice best uses data from the graph to support the claim that the garden programme increased vegetable consumption?",
        answer:
          "Garden schools rose from 1.6 to 2.4 servings per day, while schools without a garden rose only from 1.7 to 1.8.",
        wrong: [
          "Garden schools reported 2.4 servings per day in May, the highest value shown.",
          "In September, schools without a garden reported slightly more servings than garden schools.",
          "Schools without a garden increased from 1.7 to 1.8 servings per day.",
        ],
        why: "The claim requires comparing the two groups' changes. A single value, a single baseline, or one group alone does not support it.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Limits of evidence"],
        difficulty: "hard",
        prompt: "Which conclusion is best supported by the graph?",
        answer:
          "The two groups started at similar levels, so the larger increase among garden schools is unlikely to be explained by a difference in starting point.",
        wrong: [
          "The garden programme caused every participating student to eat more vegetables.",
          "Students at schools without a garden ate fewer vegetables in May than in September.",
          "Garden schools reported more than twice as many servings as other schools in May.",
        ],
        why: "The near-identical September values are what the graph actually establishes. The other options claim universality, a decline that did not occur, or a ratio the numbers do not show.",
      },
    ],
  },
  {
    slug: "clock-longitude",
    paragraphs: [
      "Finding longitude at sea requires knowing the time at a reference port and the local time simultaneously; the difference gives the distance east or west. Local time is easy — the sun supplies it. The difficulty was carrying reference time across an ocean. Pendulum clocks were useless on a rolling deck, and John Harrison's solution was a spring-driven mechanism whose rate did not change with motion or temperature. His fourth timekeeper lost fewer than five seconds on a voyage to Jamaica in 1761.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas", "Detail identification"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "The longitude problem was solved by building a clock that kept accurate time at sea.",
        wrong: [
          "Determining local time at sea was the hardest part of finding longitude.",
          "Pendulum clocks were the most accurate timekeepers available in 1761.",
          "Harrison's timekeeper measured longitude directly without reference to time.",
        ],
        why: "The text says local time was easy and carrying reference time was the difficulty, then presents Harrison's clock as the answer.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Supporting a claim"],
        difficulty: "easy",
        prompt: "Which detail best demonstrates the accuracy of Harrison's fourth timekeeper?",
        answer: "It lost fewer than five seconds on a voyage to Jamaica in 1761.",
        wrong: [
          "It was driven by a spring rather than a pendulum.",
          "Its rate did not change with motion or temperature.",
          "It solved a problem that pendulum clocks could not.",
        ],
        why: "Only the Jamaica figure is a measurement of accuracy; the others describe the design or its significance.",
      },
    ],
  },
  {
    slug: "termite-mound",
    paragraphs: [
      "A termite mound is not a residence — the colony lives below it — but a ventilation structure. Air warmed by the colony rises through a central chimney, cools in thin surface channels near the mound's outer wall, and sinks back down. Because the exchange is driven by the daily temperature swing rather than by any active pumping, the mound moves air continuously without the colony expending energy on it.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "easy",
        prompt: "Which choice best states the main idea of the text?",
        answer: "A termite mound ventilates the colony below it using temperature differences rather than effort.",
        wrong: [
          "Termites live inside the mound and leave it only to forage.",
          "Termite mounds are built to protect the colony from predators.",
          "Termites actively pump air through the mound's central chimney.",
        ],
        why: "The passage denies that the mound is a residence, describes the convective circuit, and stresses that no energy is expended. The other options contradict it.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "medium",
        prompt: "Based on the text, what would most likely reduce the mound's ventilation?",
        answer: "A period with very little difference between daytime and nighttime temperatures",
        wrong: [
          "An increase in the number of termites in the colony",
          "A thickening of the mound's outer wall near the chimney",
          "A move of the colony deeper below the surface",
        ],
        why: "The exchange is driven by the daily temperature swing, so flattening that swing removes the driving force.",
      },
    ],
  },
  {
    slug: "photograph-restoration",
    paragraphs: [
      "Nineteenth-century albumen prints fade from the edges inward, because the egg-white binder yellows fastest where it meets air. Conservators once bleached faded prints to even out the tone, a treatment that removed the yellowing along with some of the image. Current practice is to leave the fading in place and record it, on the reasoning that a print's condition is part of what a viewer needs in order to interpret what they are seeing.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Conservation practice has shifted from correcting the fading of albumen prints to documenting it.",
        wrong: [
          "Bleaching is now the standard treatment for faded albumen prints.",
          "Albumen prints fade because they are exposed to too much light.",
          "Nineteenth-century photographers deliberately allowed their prints to yellow.",
        ],
        why: "The passage contrasts the old bleaching treatment with current practice and gives the reasoning behind the change.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, why do conservators now record the fading rather than remove it?",
        answer: "Because a print's physical condition carries information a viewer needs to interpret it.",
        wrong: [
          "Because bleaching is more expensive than photographic documentation.",
          "Because fading stops on its own once a print is stored in the dark.",
          "Because the yellowing is confined to areas outside the image.",
        ],
        why: "The final clause states the reasoning directly: condition is part of what a viewer needs.",
      },
    ],
  },
  {
    slug: "salt-marsh",
    paragraphs: [
      "A salt marsh keeps pace with rising sea level by trapping sediment: as water floods the marsh, plant stems slow the flow and particles settle out, building the surface upward. The process has a ceiling. If the water rises faster than sediment accumulates, the marsh floods for longer each tide, the plants weaken, less sediment is trapped, and the surface falls further behind — a feedback that turns marsh into open water within a few decades.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas", "Causal reasoning"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "A salt marsh can build upward with rising water only up to a point, beyond which the process reverses itself.",
        wrong: [
          "Salt marshes trap sediment more efficiently as sea level rises.",
          "Plant stems are the only factor determining how fast a marsh grows.",
          "Salt marshes become open water whenever sea level rises at all.",
        ],
        why: "The passage describes the sediment-trapping mechanism and then the self-reinforcing failure once it is outpaced.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, why is the failure described as a feedback?",
        answer: "Falling behind weakens the plants, which traps less sediment and makes the marsh fall further behind.",
        wrong: [
          "Rising sea level causes sediment to be carried away from the marsh entirely.",
          "The marsh alternates between building upward and eroding on a tidal cycle.",
          "Sediment accumulation speeds up as the marsh surface gets lower.",
        ],
        why: "The passage traces a loop in which the consequence worsens the cause; that is what makes it a feedback.",
      },
    ],
  },
  {
    slug: "map-projection-choice",
    paragraphs: [
      "A survey asked 900 adults to estimate the land area of Greenland relative to Africa after viewing one of three maps.",
    ],
    data: {
      type: "table",
      title: "Median estimate of Greenland's area as a share of Africa's",
      columns: ["Map shown", "Participants", "Median estimate", "Actual"],
      rows: [
        ["Mercator projection", "300", "80%", "7%"],
        ["Equal-area projection", "300", "22%", "7%"],
        ["Globe", "300", "14%", "7%"],
      ],
      numericColumns: [1, 2, 3],
    },
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Reading tables"],
        difficulty: "easy",
        prompt:
          "Which choice best uses data from the table to support the claim that the map shown affected participants' estimates?",
        answer:
          "The median estimate was 80% among those shown a Mercator map but 14% among those shown a globe.",
        wrong: [
          "Each of the three groups contained 300 participants.",
          "Greenland's actual area is about 7% of Africa's.",
          "Participants shown a globe gave a median estimate of 14%.",
        ],
        why: "Support for the claim requires contrasting groups. Equal group sizes, the true value, and one group's figure alone do not show an effect.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Interpreting data"],
        difficulty: "medium",
        prompt: "Based on the table, which statement is best supported?",
        answer: "Every group overestimated Greenland's relative size, but the Mercator group overestimated it most.",
        wrong: [
          "Only the group shown the Mercator projection overestimated Greenland's size.",
          "The group shown a globe estimated Greenland's area accurately.",
          "The equal-area projection produced a lower estimate than the globe did.",
        ],
        why: "All three medians (80%, 22%, 14%) exceed the actual 7%, and the Mercator figure is the largest.",
      },
    ],
  },
  {
    slug: "medieval-glass",
    paragraphs: [
      "Medieval window glass is often thicker at the bottom of a pane than at the top, and a persistent explanation holds that glass is a slow-flowing liquid that has sagged over the centuries. Measurements of the flow rate rule this out: at room temperature, the glass would need far longer than the age of the universe to sag measurably. The uneven thickness comes instead from the crown method of manufacture, which produced discs thicker toward the rim, and from glaziers who sensibly installed the heavy edge downward.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Uneven medieval window panes result from how they were made and installed, not from glass flowing over time.",
        wrong: [
          "Glass flows slowly enough that medieval panes have sagged only slightly.",
          "The crown method of manufacture produced panes of perfectly even thickness.",
          "Medieval glaziers installed panes without regard to their thickness.",
        ],
        why: "The passage rejects the flow explanation on measurement grounds and supplies manufacture plus installation as the actual cause.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Evaluating evidence"],
        difficulty: "hard",
        prompt: "Which detail from the text most directly refutes the slow-flow explanation?",
        answer:
          "Measured flow rates imply the glass would need longer than the age of the universe to sag noticeably.",
        wrong: [
          "The crown method produced discs that were thicker toward the rim.",
          "Glaziers installed the heavier edge of a pane downward.",
          "Medieval panes are often thicker at the bottom than at the top.",
        ],
        why: "The flow-rate measurement is what rules the explanation out; the manufacturing details explain the observation instead.",
      },
    ],
  },
  {
    slug: "crow-tools",
    paragraphs: [
      "New Caledonian crows make hooked tools by stripping a forked twig and trimming one arm to a point. Birds raised in captivity with no opportunity to watch an adult still produce recognizable hooks, which suggests the basic behaviour is not learned by imitation. The refinements are another matter: wild birds' hooks are more sharply curved and more effective, and the shape of a hook varies systematically between valleys, in a way that captive-raised birds never reproduce.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "hard",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Hook-making in these crows appears to be innate in outline but shaped by local learning in its details.",
        wrong: [
          "Captive-raised crows make hooks that are indistinguishable from wild birds' hooks.",
          "New Caledonian crows learn hook-making entirely by watching adults.",
          "The shape of a crow's hook has no effect on how well the tool works.",
        ],
        why: "The captive result argues against pure imitation, while the valley-to-valley variation the captives never reproduce argues for a learned component.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Evaluating evidence"],
        difficulty: "hard",
        prompt: "Which finding, if true, would most strengthen the claim that hook refinements are learned locally?",
        answer:
          "A young crow moved between valleys before fledging produces hooks in the style of its adoptive valley.",
        wrong: [
          "Captive-raised crows produce hooks with less sharply curved tips than wild birds.",
          "Hook shape varies systematically between valleys across the species' range.",
          "Crows that use more sharply curved hooks extract prey more quickly.",
        ],
        why: "Transferring a bird and seeing the local style follow the location, not the parentage, tests the learning claim directly. The others are already stated in the text or are about effectiveness.",
      },
    ],
  },
  {
    slug: "canal-lock",
    paragraphs: [
      "A canal lock raises a boat by trapping it in a chamber and letting water in from the higher reach. No pumps are involved: the water flows in under gravity, and the same volume flows out again on the way down. Each lockage therefore transfers a chamber's worth of water from the upper reach to the lower one, which is why a busy summit level with no natural inflow must be fed by a reservoir or a pumping station.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference", "Causal reasoning"],
        difficulty: "medium",
        prompt: "Based on the text, why does a busy summit level need a water supply?",
        answer: "Every boat passing through carries a chamber's worth of water down out of it.",
        wrong: [
          "The pumps used in each lock consume water as they operate.",
          "Water evaporates from the chamber while a boat is being raised.",
          "Boats travelling upward require more water than boats travelling downward.",
        ],
        why: "The passage states that each lockage transfers water downward and that no pumps are involved, which is exactly why the summit must be replenished.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Detail identification"],
        difficulty: "easy",
        prompt: "According to the text, what moves the water into the lock chamber?",
        answer: "Gravity, from the higher reach of the canal",
        wrong: [
          "A pumping station at the summit level",
          "The displacement caused by the boat entering",
          "A reservoir connected directly to the chamber",
        ],
        why: "The text says explicitly that no pumps are involved and the water flows in under gravity.",
      },
    ],
  },
  {
    slug: "fermat-margin",
    paragraphs: [
      "In about 1637, Pierre de Fermat wrote in the margin of a book that he had a proof that no three positive integers satisfy a certain equation for any exponent greater than two, and that the margin was too small to contain it. No proof was found among his papers. Andrew Wiles finally proved the statement in 1994, using techniques developed centuries after Fermat's death. Most mathematicians conclude that whatever Fermat had in mind was almost certainly mistaken.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "medium",
        prompt: "Based on the text, why do most mathematicians doubt Fermat had a valid proof?",
        answer:
          "The proof that eventually worked relies on mathematics that did not exist in Fermat's lifetime.",
        wrong: [
          "Fermat never claimed in writing that he had found a proof.",
          "Fermat's other marginal claims were later shown to be false.",
          "Wiles's proof showed that the statement itself is false.",
        ],
        why: "The passage pairs the centuries-later techniques with the mathematicians' conclusion; that is the basis for the doubt.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Detail identification"],
        difficulty: "easy",
        prompt: "According to the text, what happened to Fermat's claimed proof?",
        answer: "It was never found among his papers.",
        wrong: [
          "It was published shortly after his death.",
          "It was shown to contain an error by Wiles.",
          "It was written out in full in the book's margin.",
        ],
        why: "The text states plainly that no proof was found among his papers.",
      },
    ],
  },
  {
    slug: "vaquita-count",
    paragraphs: [
      "Acoustic monitors placed across the vaquita's range in the upper Gulf of California record the animals' echolocation clicks, which allows a population index to be estimated without sighting a single animal.",
    ],
    data: {
      type: "chart",
      chart: "line",
      title: "Acoustic detections per monitor per day",
      xLabel: "Year",
      yLabel: "Detections per monitor per day",
      series: [
        {
          label: "Detections",
          points: [
            { x: 2011, y: 5.4 }, { x: 2013, y: 3.9 }, { x: 2015, y: 1.8 },
            { x: 2017, y: 0.7 }, { x: 2019, y: 0.3 }, { x: 2021, y: 0.2 },
          ],
        },
      ],
    },
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Reading graphs"],
        difficulty: "easy",
        prompt: "Which statement about the data in the graph is accurate?",
        answer: "Detections fell in every interval shown between 2011 and 2021.",
        wrong: [
          "Detections rose between 2017 and 2019 before falling again.",
          "Detections were roughly constant between 2011 and 2015.",
          "Detections in 2021 were about half their 2015 level.",
        ],
        why: "Each successive value is lower than the one before it. 2021's 0.2 is about a ninth of 2015's 1.8, not half.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Limits of evidence"],
        difficulty: "hard",
        prompt: "Which conclusion is best supported by the text and the graph together?",
        answer:
          "The acoustic index indicates a steep decline, though it measures detections rather than counting individual animals.",
        wrong: [
          "Exactly 0.2 vaquitas remained in the upper Gulf of California in 2021.",
          "The decline stopped after 2019, when detections levelled off.",
          "Acoustic monitoring is less reliable than counting animals by sight.",
        ],
        why: "The text presents the metric as an index built from clicks, not a headcount, and the graph shows continued decline. Nothing supports a reliability comparison.",
      },
    ],
  },
  {
    slug: "poet-laureate",
    paragraphs: [
      "When Gwendolyn Brooks became Poet Laureate of Illinois in 1968, she used the position in a way none of her predecessors had: she funded poetry prizes for schoolchildren out of her own honorarium, ran workshops in Chicago prisons, and published younger poets through small Black-owned presses rather than the New York houses that had published her. The role carried no budget and few duties, which is precisely what let her redefine it.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Brooks turned a largely ceremonial position into an active programme of her own design.",
        wrong: [
          "Brooks was the first Poet Laureate of Illinois to receive an honorarium.",
          "Brooks stopped writing poetry after being appointed Poet Laureate.",
          "The position of Poet Laureate of Illinois carried extensive formal duties.",
        ],
        why: "The passage lists what she did with the role and closes by noting that its emptiness is what made the redefinition possible.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, why does the absence of a budget and duties matter?",
        answer: "It left Brooks free to define the role's activities herself.",
        wrong: [
          "It meant that Brooks received no recognition for her work.",
          "It prevented Brooks from publishing other poets during her tenure.",
          "It required Brooks to seek approval for each new programme.",
        ],
        why: "The last sentence says the lack of budget and duties is 'precisely what let her redefine it'.",
      },
    ],
  },
  {
    slug: "aspirin-willow",
    paragraphs: [
      "Willow bark has been used against fever and pain for at least two thousand years, and its active compound, salicin, was isolated in 1828. Salicin works but severely irritates the stomach lining. Felix Hoffmann's 1897 modification added an acetyl group, producing a compound that the body converts back to the active form only after absorption. The change did not make the drug more potent; it made it tolerable enough to take regularly.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Aspirin's advance over willow bark was in tolerability rather than in strength.",
        wrong: [
          "Hoffmann's modification made salicin substantially more potent.",
          "Willow bark was ineffective against fever until salicin was isolated.",
          "Salicin is converted to an acetyl compound inside the stomach.",
        ],
        why: "The final sentence states the point directly, and the passage frames stomach irritation as the problem being solved.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, why does delaying conversion until after absorption help?",
        answer: "The irritating active form is not present in the stomach in large amounts.",
        wrong: [
          "The acetyl group increases the amount of drug that reaches the bloodstream.",
          "Conversion after absorption makes the drug act more quickly.",
          "The modified compound remains active for a longer period.",
        ],
        why: "Salicin irritates the stomach lining; converting only after absorption keeps the irritant out of the stomach, which is what makes the drug tolerable.",
      },
    ],
  },
  {
    slug: "esperanto-speakers",
    paragraphs: [
      "Esperanto was published in 1887 as a language designed to be easy to learn, with a fully regular grammar and no irregular verbs. It has never become the international auxiliary language its author intended, but it did not disappear either: an estimated hundred thousand people speak it, a few thousand learned it from their parents, and it has an original literature of several hundred novels. Linguists find it interesting less as a proposal than as a case study in what happens when a designed language is actually used.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "easy",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Esperanto failed at its original purpose but survives as a living language worth studying.",
        wrong: [
          "Esperanto has become the international auxiliary language its author intended.",
          "Esperanto is no longer spoken outside of academic linguistics.",
          "Esperanto's regular grammar has made it the easiest language to learn.",
        ],
        why: "The passage concedes the failure, then gives evidence of continued use and explains why linguists attend to it.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Supporting a claim"],
        difficulty: "medium",
        prompt: "Which detail most strongly supports the claim that Esperanto is a living language rather than a curiosity?",
        answer: "A few thousand people learned it from their parents as a first language.",
        wrong: [
          "It was published in 1887 with a fully regular grammar.",
          "It has no irregular verbs of any kind.",
          "Linguists study it as a case study rather than as a proposal.",
        ],
        why: "Native transmission between generations is the standard mark of a living language; grammar design and scholarly interest are not.",
      },
    ],
  },
  {
    slug: "tuberculosis-sanatorium",
    paragraphs: [
      "Before antibiotics, tuberculosis treatment consisted largely of rest, fresh air, and good food in a sanatorium, often for a year or more. Recovery rates in sanatoria were better than for patients who stayed at home, and the difference was long taken as evidence that the regimen worked. Modern reanalysis points elsewhere: sanatoria admitted patients selectively, favouring those in earlier stages of disease, and isolating infectious patients from their families reduced transmission whether or not it helped the patient.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas", "Causal reasoning"],
        difficulty: "hard",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Better outcomes in sanatoria may have reflected who was admitted and the effect of isolation rather than the treatment itself.",
        wrong: [
          "Sanatorium treatment cured tuberculosis more effectively than antibiotics do.",
          "Patients who stayed at home recovered at the same rate as those in sanatoria.",
          "Sanatoria admitted only patients whose disease was already advanced.",
        ],
        why: "The reanalysis offers selective admission and reduced transmission as alternative explanations for the observed difference.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Evaluating evidence"],
        difficulty: "hard",
        prompt:
          "Which finding, if true, would most weaken the modern reanalysis?",
        answer:
          "Among patients matched for disease stage at admission, those treated in sanatoria still recovered more often than those treated at home.",
        wrong: [
          "Sanatoria were more common in wealthy regions than in poor ones.",
          "Tuberculosis transmission within households fell when a patient was admitted.",
          "Sanatorium stays commonly lasted more than a year.",
        ],
        why: "Matching on disease stage removes the selection explanation; if the advantage survives, the regimen itself is back in play. The other options support the reanalysis or are irrelevant.",
      },
    ],
  },
  {
    slug: "night-shift-light",
    paragraphs: [
      "Researchers tracked alertness scores for 120 night-shift workers under three lighting conditions, each used for two weeks in randomized order.",
    ],
    data: {
      type: "table",
      title: "Mean alertness score at 4 a.m. (higher is more alert)",
      columns: ["Lighting condition", "Mean score", "Standard deviation"],
      rows: [
        ["Standard warm lighting", "48", "9"],
        ["Bright blue-enriched lighting", "63", "8"],
        ["Bright blue-enriched, first 4 hours only", "61", "10"],
      ],
      numericColumns: [1, 2],
    },
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Reading tables", "Comparing groups"],
        difficulty: "medium",
        prompt:
          "A manager argues that blue-enriched lighting need only run for the first half of the shift. Which choice best uses the table to support that argument?",
        answer:
          "Limiting the blue-enriched lighting to the first four hours produced a mean of 61, close to the 63 achieved by running it all shift.",
        wrong: [
          "Standard warm lighting produced the lowest mean alertness score, at 48.",
          "The full-shift blue-enriched condition had the lowest standard deviation, at 8.",
          "All three conditions were tested for two weeks each in randomized order.",
        ],
        why: "The argument is that the shortened schedule is nearly as good, so the supporting data must compare 61 with 63. The other options do not bear on that comparison.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Interpreting data"],
        difficulty: "hard",
        prompt: "Which statement about the standard deviations in the table is best supported?",
        answer:
          "Scores in the shortened-lighting condition varied more between workers than scores in the other two conditions.",
        wrong: [
          "The shortened-lighting condition produced the highest mean alertness score.",
          "Standard warm lighting produced the most consistent scores across workers.",
          "The standard deviations show that the differences in means are not meaningful.",
        ],
        why: "A standard deviation of 10 is the largest of the three, indicating the widest spread. The warm-light condition's 9 is not the smallest, and spread alone says nothing about whether the mean differences matter.",
      },
    ],
  },
  {
    slug: "sea-level-tide-gauge",
    paragraphs: [
      "The longest continuous sea-level record in the world comes from a tide gauge in Amsterdam that has been read since 1700. Its value is not that it is precise — early readings were taken by eye against a marked post — but that it is long. A record of three centuries can distinguish a trend from the decade-to-decade variation that swamps any shorter series, which is why the Amsterdam data still appear in analyses that have far better instruments available.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer: "The Amsterdam record is valuable because of its length rather than its precision.",
        wrong: [
          "The Amsterdam tide gauge is the most precise instrument of its kind.",
          "Modern instruments have made the Amsterdam record obsolete.",
          "Decade-to-decade variation in sea level is larger than any long-term trend.",
        ],
        why: "The passage explicitly separates precision from length and explains why length is what matters here.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "medium",
        prompt: "Based on the text, why can a short but precise record be less useful than a long imprecise one?",
        answer:
          "Short records cannot separate a long-term trend from ordinary decade-to-decade swings.",
        wrong: [
          "Short records are usually taken by eye rather than by instrument.",
          "Precise instruments are more likely to fail over long periods.",
          "Long records are always more precise than short ones.",
        ],
        why: "The passage says a three-century record can distinguish a trend from variation that 'swamps any shorter series'.",
      },
    ],
  },
  {
    slug: "obsidian-trade",
    paragraphs: [
      "Obsidian from a single volcanic source carries a chemical fingerprint precise enough to identify it anywhere it is found. Tools made from obsidian quarried in central Anatolia turn up at sites more than eight hundred kilometres away, in levels dated to the ninth millennium BCE — long before any evidence of wheeled transport or pack animals in the region. Archaeologists take this as evidence not of long-distance travel by individuals but of exchange passing goods from settlement to settlement.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, why do archaeologists favour down-the-line exchange over long-distance travel?",
        answer:
          "The obsidian moved far earlier than any means of carrying goods over long distances is attested.",
        wrong: [
          "Obsidian is too heavy for an individual to carry any meaningful distance.",
          "The chemical fingerprint of obsidian degrades over long journeys.",
          "No settlements existed between central Anatolia and the distant sites.",
        ],
        why: "The passage pairs the eight-hundred-kilometre spread with the absence of wheeled transport or pack animals, which is what makes person-to-person relay the plausible reading.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Detail identification"],
        difficulty: "easy",
        prompt: "According to the text, what makes obsidian's origin identifiable?",
        answer: "Each volcanic source produces obsidian with a distinctive chemical composition.",
        wrong: [
          "Each source produces obsidian of a distinctive colour.",
          "Tools from each source were made in a distinctive shape.",
          "Obsidian can be radiocarbon dated to its date of quarrying.",
        ],
        why: "The first sentence names a chemical fingerprint precise enough to identify the source.",
      },
    ],
  },
];
