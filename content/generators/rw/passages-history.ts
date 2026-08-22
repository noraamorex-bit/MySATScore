/**
 * History and social-studies passages, including the quantitative-evidence sets
 * that pair a short framing text with a table or graph, and paired-text sets for
 * Cross-Text Connections.
 */
import type { PassageSeed } from "./passage-kit";

export const HISTORY_PASSAGES: PassageSeed[] = [
  {
    slug: "suffrage-strategy",
    paragraphs: [
      "Text 1",
      "Winning the vote state by state was the only realistic path. Each western state that enfranchised women created a bloc of representatives in Congress with a direct interest in a federal amendment, and every such victory made the next one easier to argue for. A campaign aimed at Washington first would have spent decades lobbying legislators who owed women nothing.",
      "Text 2",
      "State campaigns consumed resources out of all proportion to what they returned. A single referendum could absorb two years of organizing and be lost by a margin no amount of persuasion could have closed, and a victory bound organizers to a state's particular politics rather than to a national argument. The amendment was won when the movement stopped treating forty-eight campaigns as a substitute for one.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Cross-Text Connections",
        skills: ["Cross-text connections", "Comparing arguments"],
        difficulty: "hard",
        prompt: "Based on the texts, how would the author of Text 2 most likely respond to Text 1's argument?",
        answer:
          "By arguing that state victories cost more in time and organizing than the congressional leverage they produced was worth.",
        wrong: [
          "By agreeing that state campaigns built congressional support but denying that support mattered.",
          "By claiming that western states were unrepresentative of the country as a whole.",
          "By asserting that no state referendum on suffrage was ever successful.",
        ],
        why: "Text 2's objection is explicitly one of cost and return — resources 'out of all proportion to what they returned' — not a denial that any state campaign succeeded.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Cross-Text Connections",
        skills: ["Cross-text connections"],
        difficulty: "medium",
        prompt: "Which choice best describes the relationship between the two texts?",
        answer: "They advance opposing assessments of the same campaign strategy.",
        wrong: [
          "Text 2 provides evidence for a claim that Text 1 leaves unsupported.",
          "Text 1 describes an event that Text 2 explains the causes of.",
          "They address different periods of the same political movement.",
        ],
        why: "Both texts evaluate the state-by-state strategy and reach opposite verdicts about its wisdom.",
      },
    ],
  },
  {
    slug: "erie-canal",
    paragraphs: [
      "When the Erie Canal opened in 1825, the cost of moving a ton of freight from Buffalo to New York City fell from roughly one hundred dollars to under ten, and the journey shortened from three weeks to about eight days. Wheat grown in the Ohio Valley could now reach the Atlantic more cheaply than wheat grown in central New York could reach it by road. Within two decades, farms in the older eastern counties had largely shifted from grain to dairy and market gardening, products that spoil and therefore command a premium near the city they serve.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas", "Causal reasoning"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "By making distant grain cheap in eastern markets, the canal pushed nearby farms toward perishable products that distance could not supply.",
        wrong: [
          "The Erie Canal reduced shipping costs but had little effect on where crops were grown.",
          "Farmers in the Ohio Valley abandoned grain production after the canal opened in 1825.",
          "Dairy and market gardening were more profitable than grain farming everywhere in New York.",
        ],
        why: "The passage links falling transport costs to eastern counties' shift toward perishables — goods whose value depends on being produced near the market.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, why did perishability make dairy and market gardening attractive to eastern farmers?",
        answer:
          "Distant producers could not deliver such goods in usable condition, so proximity to the city became an advantage.",
        wrong: [
          "Perishable goods required less land per unit of value than grain did.",
          "The canal was closed during the months when dairy production peaked.",
          "Grain prices in New York City fell below the cost of production everywhere in the state.",
        ],
        why: "The final clause says these products 'spoil and therefore command a premium near the city they serve' — proximity is the protected advantage.",
      },
    ],
  },
  {
    slug: "census-undercount",
    paragraphs: [
      "A researcher compared two methods for estimating the population of a rapidly growing district: a door-to-door enumeration and an administrative-records estimate built from utility hookups, school enrollments, and postal delivery points.",
    ],
    data: {
      type: "table",
      title: "Population estimates for four neighborhoods, 2022",
      columns: ["Neighborhood", "Door-to-door count", "Administrative estimate", "Difference"],
      rows: [
        ["Ridgeway", "8,420", "8,610", "+190"],
        ["Bellhaven", "12,105", "13,780", "+1,675"],
        ["Norcross", "5,940", "6,020", "+80"],
        ["Tallman Park", "9,330", "11,410", "+2,080"],
      ],
      numericColumns: [1, 2, 3],
    },
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Reading tables", "Quantitative evidence"],
        difficulty: "medium",
        prompt:
          "The researcher concludes that the door-to-door method missed substantially more residents in some neighborhoods than in others. Which choice best uses data from the table to support this conclusion?",
        answer:
          "In Tallman Park the administrative estimate exceeded the door-to-door count by 2,080 residents, while in Norcross it exceeded it by only 80.",
        wrong: [
          "Bellhaven had a larger door-to-door count than Ridgeway, at 12,105 compared with 8,420.",
          "The administrative estimate was higher than the door-to-door count in all four neighborhoods.",
          "Tallman Park had the second-largest door-to-door count of the four neighborhoods.",
        ],
        why: "The conclusion is about variation between neighborhoods, so the supporting data must contrast a large gap with a small one. The other options report figures that do not bear on how the gaps differ.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Reading tables", "Proportional reasoning"],
        difficulty: "hard",
        prompt:
          "Based on the table, in which neighborhood was the difference between the two estimates the largest as a percentage of the door-to-door count?",
        answer: "Tallman Park",
        wrong: ["Bellhaven", "Ridgeway", "Norcross"],
        why: "Tallman Park's gap of 2,080 on a base of 9,330 is about 22 percent, larger than Bellhaven's 1,675 on 12,105 (about 14 percent) and far larger than the other two.",
      },
    ],
  },
  {
    slug: "rail-strike-1877",
    paragraphs: [
      "The Great Railroad Strike of 1877 began when the Baltimore and Ohio cut wages for the third time in a year, and it spread along the rail network faster than any previous American labor action. Historians once explained the speed by pointing to shared grievances among railway workers. More recent accounts emphasize the network itself: telegraph lines ran beside the tracks, and news of a stoppage in one yard reached the next before company officials could organize a response. On this reading, the same infrastructure that made the railroads powerful made a strike against them contagious.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Overall structure"],
        difficulty: "medium",
        prompt: "Which choice best describes the overall structure of the text?",
        answer:
          "It describes an event, presents an older explanation of one of its features, and then presents a newer explanation.",
        wrong: [
          "It compares two labor actions and explains why one was more successful than the other.",
          "It defends a traditional historical interpretation against a recent challenge to it.",
          "It traces the development of the American telegraph network during the 1870s.",
        ],
        why: "The passage moves from the strike, to the shared-grievances account, to the network account — an older and a newer explanation of the same feature.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, what does the newer account suggest about the railroads' vulnerability?",
        answer:
          "It arose from the same connected infrastructure that gave the railroads their commercial advantage.",
        wrong: [
          "It stemmed primarily from the companies' repeated decisions to cut wages.",
          "It was greatest in yards located farthest from telegraph lines.",
          "It has been overstated by historians who focus on shared grievances.",
        ],
        why: "The last sentence makes the point directly: the infrastructure that made the railroads powerful also made a strike contagious.",
      },
    ],
  },
  {
    slug: "commons-fisheries",
    paragraphs: [
      "A study of 62 small-scale coastal fisheries recorded whether each community had locally enforced rules governing access, and whether the fishery's stock had increased or declined over a twenty-year period.",
    ],
    data: {
      type: "table",
      title: "Stock trend by presence of local access rules (62 fisheries)",
      columns: ["", "Stock increased", "Stock declined", "Total"],
      rows: [
        ["Local rules enforced", "24", "9", "33"],
        ["No local rules", "6", "23", "29"],
        ["Total", "30", "32", "62"],
      ],
      numericColumns: [1, 2, 3],
    },
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Two-way tables", "Quantitative evidence"],
        difficulty: "medium",
        prompt:
          "Which choice best describes data from the table that support the claim that locally enforced access rules are associated with healthier stocks?",
        answer:
          "Among fisheries with local rules, 24 of 33 stocks increased, compared with 6 of 29 among those without rules.",
        wrong: [
          "Of the 62 fisheries studied, 30 saw stocks increase and 32 saw stocks decline.",
          "More fisheries had locally enforced rules (33) than lacked them (29).",
          "Among fisheries whose stocks declined, 23 lacked locally enforced access rules.",
        ],
        why: "An association claim needs the rates compared across both groups. The overall totals and the group sizes say nothing about the relationship, and the last option gives only one cell without its base.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Interpreting data", "Limits of evidence"],
        difficulty: "hard",
        prompt: "Which conclusion about the data in the table is best supported?",
        answer:
          "The data show an association between local rules and stock increases but cannot by themselves establish that the rules caused the increases.",
        wrong: [
          "The data demonstrate that enforcing local access rules causes fish stocks to increase.",
          "The data show that fisheries without local rules always experience declining stocks.",
          "The data indicate that stock trends are unrelated to whether local rules are enforced.",
        ],
        why: "The study observed communities rather than assigning rules, so causation is not established; and 6 of 29 rule-free fisheries did increase, ruling out 'always'.",
      },
    ],
  },
  {
    slug: "public-libraries",
    paragraphs: [
      "The first tax-supported public library in the United States opened in Peterborough, New Hampshire, in 1833, but the model spread slowly until state legislatures began authorizing municipalities to levy library taxes in the 1850s. Andrew Carnegie's grants, which funded more than 1,600 American library buildings between 1883 and 1929, are often credited with creating the public library system. Historian Alma Ruiz points out that Carnegie's terms required a municipality to pledge annual operating funds equal to a tenth of the building grant, so his money reached only communities that had already accepted the tax principle.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas", "Evaluating claims"],
        difficulty: "hard",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Carnegie's grants extended a publicly funded library system that municipal tax commitments had already made possible.",
        wrong: [
          "Carnegie's grants were responsible for creating the American public library system.",
          "Most American municipalities refused Carnegie's grants because of the conditions attached.",
          "Tax-supported libraries were rare in the United States before 1929.",
        ],
        why: "Ruiz's point is that the matching requirement meant Carnegie funded only places already committed to library taxes — so he built on an existing system rather than creating it.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence"],
        difficulty: "medium",
        prompt: "Which choice best describes the function of the last sentence in the text?",
        answer:
          "It supplies a detail that qualifies the credit assigned to Carnegie in the preceding sentence.",
        wrong: [
          "It provides statistical support for the claim made in the preceding sentence.",
          "It introduces a second philanthropist whose contribution has been overlooked.",
          "It explains why library construction slowed sharply after 1929.",
        ],
        why: "The matching-funds condition complicates the 'Carnegie created the system' claim just stated — a qualification, not support or a new subject.",
      },
    ],
  },
  {
    slug: "monsoon-trade",
    paragraphs: [
      "Ships crossing the Arabian Sea before the age of steam did not choose their departure dates. The southwest monsoon carried vessels from the Horn of Africa and Arabia toward the Malabar Coast between June and September; the northeast monsoon carried them back between November and February. A merchant who missed the window waited half a year, which is why port cities on both coasts developed permanent resident communities of foreign traders rather than transient ones. Marriage, credit, and law in those cities were shaped by the calendar of the winds.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference", "Causal reasoning"],
        difficulty: "medium",
        prompt: "Based on the text, why did foreign traders settle permanently in Indian Ocean port cities?",
        answer:
          "The long wait between sailing seasons made extended residence more practical than repeated short visits.",
        wrong: [
          "Local rulers required foreign merchants to establish permanent households before trading.",
          "The monsoon winds made the return voyage far more dangerous than the outbound one.",
          "Foreign traders could obtain credit only from merchants who lived in the same city.",
        ],
        why: "The passage links the half-year wait directly to resident rather than transient communities. The other options add requirements or dangers the text never mentions.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence"],
        difficulty: "hard",
        prompt: "Which choice best describes the function of the final sentence in the text?",
        answer:
          "It extends the passage's argument from commerce to the social institutions of the port cities.",
        wrong: [
          "It summarizes the seasonal pattern of the monsoon winds described earlier.",
          "It qualifies the claim that merchants had no control over their departure dates.",
          "It introduces evidence that trade declined once steamships arrived.",
        ],
        why: "The sentence moves from trading practice to marriage, credit, and law — widening the claim rather than summarizing, qualifying, or introducing new evidence.",
      },
    ],
  },
  {
    slug: "voting-registration",
    paragraphs: [
      "Researchers tracked turnout in five municipalities that adopted same-day voter registration and five demographically comparable municipalities that did not.",
    ],
    data: {
      type: "chart",
      chart: "bar",
      title: "Turnout in local elections, before and after adoption",
      xLabel: "Municipality group",
      yLabel: "Turnout (percent of eligible voters)",
      categories: ["Adopters, before", "Adopters, after", "Comparison, before", "Comparison, after"],
      series: [{ label: "Turnout", points: [{ x: 0, y: 31 }, { x: 1, y: 42 }, { x: 2, y: 30 }, { x: 3, y: 33 }] }],
    },
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Reading graphs", "Comparing groups"],
        difficulty: "medium",
        prompt:
          "Which choice best describes data from the graph that support the claim that same-day registration increased turnout?",
        answer:
          "Turnout rose 11 percentage points among adopters but only 3 points among comparison municipalities.",
        wrong: [
          "Turnout among adopters after adoption was 42 percent, the highest value shown.",
          "Turnout in comparison municipalities rose from 30 percent to 33 percent.",
          "Before adoption, the two groups had turnout rates of 31 percent and 30 percent.",
        ],
        why: "Support for the claim requires comparing the *changes* in the two groups. The single highest value, the comparison group's change alone, and the baseline similarity each tell only part of the story.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Interpreting data"],
        difficulty: "hard",
        prompt: "Which statement about the comparison group is best supported by the graph?",
        answer:
          "Its small increase suggests that some of the adopters' gain may reflect a trend affecting both groups.",
        wrong: [
          "Its turnout declined over the period covered by the study.",
          "It began the period with substantially higher turnout than the adopters.",
          "Its turnout after the period exceeded that of the adopters.",
        ],
        why: "The comparison group rose from 30 to 33 percent without the policy, which is what makes it useful as a baseline — and it neither declined nor exceeded the adopters at any point.",
      },
    ],
  },
  {
    slug: "dust-bowl-policy",
    paragraphs: [
      "Federal responses to the Dust Bowl are usually described as soil conservation, but the Shelterbelt Project of 1934 was also an employment program: it planted more than two hundred million trees across a hundred-mile-wide strip from North Dakota to Texas, using labor that would otherwise have been idle. Agronomists at the time doubted that windbreaks could hold soil on the scale required, and the project was quietly folded into other agencies within a decade. Surviving shelterbelts, however, still measurably reduce wind speed on the plots they border.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "The Shelterbelt Project served purposes beyond soil conservation and left effects that outlasted the program itself.",
        wrong: [
          "Agronomists in the 1930s correctly predicted that shelterbelts would have no measurable effect.",
          "The Shelterbelt Project was the most successful of the federal responses to the Dust Bowl.",
          "Employment programs of the 1930s were more effective than conservation programs.",
        ],
        why: "The passage notes the employment purpose, the contemporary doubts and the program's absorption, and the lasting effect of surviving belts. The other choices contradict the last sentence or make comparisons the text avoids.",
      },
    ],
  },
  {
    slug: "urban-transit-fare",
    paragraphs: [
      "Text 1",
      "Eliminating transit fares removes the single largest barrier to ridership among low-income residents and abolishes the cost of collecting, enforcing, and disputing fares, which in many systems approaches what the fares themselves bring in. A system funded entirely from general revenue is also easier to plan, because its budget no longer rises and falls with ridership.",
      "Text 2",
      "Fare revenue is not merely income; it is a claim on the system. Riders who pay have standing to demand service, and transit agencies that depend on general appropriations compete each year with every other municipal priority. Where fares have been eliminated without a dedicated funding source, service frequency has more often fallen than risen.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Cross-Text Connections",
        skills: ["Cross-text connections"],
        difficulty: "hard",
        prompt: "Based on the texts, the author of Text 2 would most likely argue that Text 1 underestimates",
        answer: "the political value of a dedicated revenue stream to a transit system.",
        wrong: [
          "the administrative cost of collecting and enforcing transit fares.",
          "the effect of fares on ridership among low-income residents.",
          "the difficulty of planning a budget that depends on ridership.",
        ],
        why: "Text 2's argument is that fares give riders standing and shield the agency from annual competition for general funds — a political point Text 1 does not consider.",
      },
    ],
  },
  {
    slug: "printing-press-diffusion",
    paragraphs: [
      "Within fifty years of Gutenberg's press, printing had reached more than 250 European towns, and the pattern of adoption was not simply a matter of size or wealth. Towns on trade routes with existing scribal industries adopted earliest, because the same networks that had moved manuscripts could move printed sheets and the same customers already existed. Economic historian Nils Halvorsen argues that the press did not create a market for books so much as inherit one, and that where no scribal trade existed the press often arrived and failed.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Supporting a claim"],
        difficulty: "hard",
        prompt:
          "Which finding, if true, would most strongly support Halvorsen's argument?",
        answer:
          "Towns with no recorded manuscript trade before 1450 that acquired presses abandoned printing within a decade at more than twice the rate of towns with such a trade.",
        wrong: [
          "The number of European towns with presses continued to grow throughout the sixteenth century.",
          "Printed books were substantially cheaper to produce than manuscript copies of the same text.",
          "Gutenberg's earliest presses were located in towns of moderate rather than large population.",
        ],
        why: "Halvorsen claims presses succeeded where a scribal market already existed and failed where it did not. Differential failure rates by prior manuscript trade tests exactly that.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Words in Context",
        skills: ["Words in context"],
        difficulty: "medium",
        prompt: 'As used in the text, what does the word "inherit" most nearly mean?',
        answer: "Take over something that already existed",
        wrong: ["Receive as a legal bequest", "Gradually replace over time", "Expand beyond its original limits"],
        why: "The contrast is with 'create a market': the press took over a market that scribes had already built, rather than receiving a bequest or replacing anything gradually.",
      },
    ],
  },
  {
    slug: "wage-minimum-study",
    paragraphs: [
      "An analysis compared employment in fast-food restaurants in adjacent counties on either side of a state line, one year before and one year after one state raised its minimum wage.",
    ],
    data: {
      type: "table",
      title: "Full-time equivalent employees per restaurant",
      columns: ["County group", "Before", "After", "Change"],
      rows: [
        ["Wage increased", "20.4", "21.0", "+0.6"],
        ["No wage change", "23.3", "21.2", "−2.1"],
      ],
      numericColumns: [1, 2, 3],
    },
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Reading tables", "Comparing groups"],
        difficulty: "hard",
        prompt:
          "An economist claims the data do not support the prediction that raising the minimum wage reduced employment. Which choice best uses the table to support that claim?",
        answer:
          "Employment rose slightly where the wage increased and fell where it did not, the opposite of the predicted pattern.",
        wrong: [
          "Restaurants in the no-change counties employed more people than those in the increase counties before the change.",
          "Employment in the increase counties rose from 20.4 to 21.0 full-time equivalent employees.",
          "After the change, the two county groups employed nearly the same number of employees per restaurant.",
        ],
        why: "Refuting the prediction requires the contrast between the two groups' changes. The pre-period difference, the single group's rise, and the post-period similarity do not by themselves speak against the prediction.",
      },
    ],
  },
  {
    slug: "cahokia-decline",
    paragraphs: [
      "Cahokia, near present-day St. Louis, held perhaps fifteen thousand people around 1100 CE and was largely abandoned by 1350. Explanations have ranged from deforestation to flooding to political fragmentation. A recent study analyzed fecal stanols in sediment cores from a nearby lake, a proxy that tracks human population directly rather than inferring it from architecture. It found that population declined gradually over more than a century, without the abrupt drop that a single catastrophe would produce.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Evaluating evidence"],
        difficulty: "hard",
        prompt: "Which choice best describes how the stanol evidence bears on the proposed explanations?",
        answer:
          "It disfavors explanations that predict a sudden collapse, without identifying which gradual process was responsible.",
        wrong: [
          "It confirms that deforestation was the primary cause of Cahokia's decline.",
          "It shows that the population of Cahokia was substantially larger than architecture suggested.",
          "It establishes that political fragmentation preceded rather than followed the population decline.",
        ],
        why: "The finding is about the *shape* of the decline — gradual, not abrupt — which rules out catastrophe accounts but does not single out any remaining cause.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence"],
        difficulty: "medium",
        prompt: 'Which choice best describes the function of the phrase "rather than inferring it from architecture" in the text?',
        answer: "It indicates why the new proxy is treated as more direct evidence than earlier approaches.",
        wrong: [
          "It concedes that the stanol measurements are less precise than architectural surveys.",
          "It identifies the method used in the earlier studies that the new study replicates.",
          "It explains why sediment cores were taken from a lake rather than from the site itself.",
        ],
        why: "The phrase contrasts a direct population proxy with an inference from buildings, establishing the new method's advantage.",
      },
    ],
  },
  {
    slug: "labor-migration",
    paragraphs: [
      "Between 1916 and 1970, roughly six million Black Americans left the rural South for cities in the North, Midwest, and West. Contemporary accounts often described the movement as a flight from violence, and it was, but economist Rowan Achebe notes that the migration's timing tracks northern labor demand closely: departures surged when wartime production drew workers and slowed sharply during the Depression, when northern jobs vanished while southern conditions did not improve. Both accounts, Achebe argues, are needed, and neither alone predicts when people actually moved.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "hard",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Violence in the South explains why people left, but northern labor demand explains when, and both are required to account for the migration.",
        wrong: [
          "Achebe argues that economic opportunity, not violence, was the sole cause of the migration.",
          "The Great Migration slowed during the Depression because conditions in the South improved.",
          "Contemporary accounts of the migration were largely inaccurate about its causes.",
        ],
        why: "The last sentence states that both accounts are needed and neither alone predicts timing — and the text explicitly says southern conditions did *not* improve during the Depression.",
      },
    ],
  },
  {
    slug: "map-projection-politics",
    paragraphs: [
      "Every flat map of a round Earth distorts something. The Mercator projection preserves angles, which is why it served navigators for four centuries, but it inflates area with distance from the equator: Greenland appears roughly the size of Africa, which is fourteen times larger. Equal-area projections correct this at the cost of shape. Cartographer Ines Vogel warns that debates over which projection is 'honest' often assume a projection can be neutral, when the real question is which distortion a particular use can tolerate.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Purpose of the text"],
        difficulty: "medium",
        prompt: "What is the main purpose of the text?",
        answer:
          "To explain that map projections involve unavoidable trade-offs and to reframe how they should be judged.",
        wrong: [
          "To argue that equal-area projections should replace the Mercator projection in classrooms.",
          "To describe the navigational techniques that made the Mercator projection valuable.",
          "To trace the history of cartographic disputes from the sixteenth century to the present.",
        ],
        why: "The passage establishes the trade-off and closes with Vogel's reframing of the question. It does not advocate a particular projection or give a history.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Words in Context",
        skills: ["Words in context"],
        difficulty: "medium",
        prompt: 'As used in the text, what does the word "tolerate" most nearly mean?',
        answer: "Accept without being compromised",
        wrong: ["Endure with difficulty", "Fail to detect", "Deliberately conceal"],
        why: "Vogel's point is which distortion a use can accept without harm to its purpose, not which is endured painfully, missed, or hidden.",
      },
    ],
  },
  {
    slug: "school-start-time",
    paragraphs: [
      "A district delayed high school start times from 7:30 a.m. to 8:30 a.m. and tracked several outcomes across three school years.",
    ],
    data: {
      type: "table",
      title: "Outcomes before and after the schedule change",
      columns: ["Measure", "Year before", "Year 1 after", "Year 2 after"],
      rows: [
        ["Average nightly sleep (hours)", "6.8", "7.5", "7.6"],
        ["Tardy arrivals per 100 students", "14.2", "8.1", "7.9"],
        ["Average GPA", "2.81", "2.88", "2.90"],
        ["Students reporting daytime sleepiness (%)", "62", "44", "41"],
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
          "Which choice best describes data from the table that support the claim that the later start time increased how much students slept?",
        answer: "Average nightly sleep rose from 6.8 hours to 7.5 hours in the first year after the change.",
        wrong: [
          "Tardy arrivals per 100 students fell from 14.2 to 8.1 in the first year after the change.",
          "Average GPA rose from 2.81 to 2.90 over the two years after the change.",
          "The percentage of students reporting daytime sleepiness fell from 62 to 41.",
        ],
        why: "The claim is specifically about sleep duration, so the sleep row is the relevant evidence. Tardiness, GPA, and self-reported sleepiness measure other things.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Quantitative)",
        skills: ["Interpreting data", "Limits of evidence"],
        difficulty: "hard",
        prompt: "Which statement about the second year after the change is best supported by the table?",
        answer:
          "The improvements recorded in the first year were largely maintained rather than reversed.",
        wrong: [
          "Each measure improved by about as much in the second year as it had in the first.",
          "GPA was the only measure that continued to improve after the first year.",
          "Daytime sleepiness returned to roughly its level before the change.",
        ],
        why: "Every measure in year 2 is close to its year-1 value and better than the baseline, so the gains held; but the year-2 changes are far smaller than the year-1 changes, and sleepiness did not rebound.",
      },
    ],
  },
  {
    slug: "treaty-translation",
    paragraphs: [
      "The 1840 Treaty of Waitangi exists in an English text and a Māori text, and they do not say the same thing. The English text cedes sovereignty; the Māori text uses *kāwanatanga*, a transliteration of 'governance,' while reserving *rangatiratanga* — chieftainship or full authority — to the signatory chiefs. Roughly five hundred chiefs signed the Māori text and fewer than forty signed the English. Legal historian Whetu Marsden notes that the discrepancy is not a translator's error but a choice, and that the treaty's later history is largely a history of which text is treated as the agreement.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas", "Detail identification"],
        difficulty: "hard",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "The treaty's two versions promise different things, and which version counts as the agreement has shaped its subsequent history.",
        wrong: [
          "The Māori text of the treaty was translated inaccurately by an inexperienced interpreter.",
          "Most chiefs who signed the treaty were unable to read either of its two versions.",
          "The English text of the treaty was signed by more chiefs than the Māori text was.",
        ],
        why: "The passage details the divergence, notes it was a choice rather than an error, and closes with the point about which text is treated as the agreement. The signature counts run the opposite way from the third option.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a detail"],
        difficulty: "medium",
        prompt: "Which choice best describes the function of the sentence reporting the number of signatures on each text?",
        answer:
          "It establishes that the version most chiefs actually agreed to was the Māori one.",
        wrong: [
          "It shows that the two texts were signed at the same ceremony on the same day.",
          "It suggests that the chiefs were divided about whether to sign at all.",
          "It explains why the English text was drafted before the Māori text.",
        ],
        why: "Five hundred signatures on the Māori text against fewer than forty on the English establishes which document the signatories actually assented to — which matters for Marsden's closing point.",
      },
    ],
  },
  {
    slug: "green-revolution",
    paragraphs: [
      "Semidwarf wheat and rice varieties introduced across South Asia in the 1960s roughly doubled cereal yields within fifteen years. The varieties responded to nitrogen fertilizer without lodging — falling over under the weight of their own grain — which taller traditional varieties did. That responsiveness was also a dependency: yields on unfertilized plots were no better than those of the varieties they replaced, and in some soils were worse. Agricultural economist Pilar Ocampo argues that the technology's benefits were therefore distributed according to who could reliably buy inputs.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Inferences",
        skills: ["Inference"],
        difficulty: "hard",
        prompt: "Based on the text, which farmers would have benefited least from the new varieties?",
        answer: "Farmers who could not consistently afford nitrogen fertilizer.",
        wrong: [
          "Farmers whose fields were most exposed to wind and heavy rain.",
          "Farmers who had already been growing semidwarf varieties before the 1960s.",
          "Farmers who grew rice rather than wheat.",
        ],
        why: "The passage says unfertilized yields were no better and sometimes worse, and Ocampo ties benefits to input purchasing — so those unable to buy fertilizer gained least.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Words in Context",
        skills: ["Words in context"],
        difficulty: "hard",
        prompt: 'As used in the text, what does the word "dependency" most nearly mean?',
        answer: "A requirement without which the advantage disappears",
        wrong: ["A tendency to become physically weaker", "A relationship of political subordination", "A habit that is difficult to break"],
        why: "The sentence explains it directly: without fertilizer the varieties lose their yield advantage. The word names a precondition, not weakness, subordination, or habit.",
      },
    ],
  },
  {
    slug: "newspaper-serial",
    paragraphs: [
      "Nineteenth-century novels published in monthly parts were written while they were being read. Dickens revised later numbers of *Martin Chuzzlewit* after sales disappointed, sending the protagonist to America mid-book; Gaskell adjusted the pacing of *North and South* when her editor complained the installments ran long. Literary scholar Ines Baptista argues that reading such novels as finished objects conceals the fact that their shape records an ongoing negotiation among author, editor, and audience.",
    ],
    questions: [
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Purpose of the text"],
        difficulty: "medium",
        prompt: "What is the main purpose of the text?",
        answer:
          "To argue that serial novels were shaped in progress by pressures that finished editions hide.",
        wrong: [
          "To compare the commercial success of Dickens's novels with that of Gaskell's.",
          "To explain how monthly part publication reduced the cost of novels for readers.",
          "To criticize Dickens for altering his plot in response to disappointing sales.",
        ],
        why: "The two examples support Baptista's claim about ongoing negotiation, which the text presents approvingly rather than as criticism, comparison, or economics.",
      },
      {
        domain: "information-and-ideas",
        subdomain: "Command of Evidence (Textual)",
        skills: ["Supporting a claim"],
        difficulty: "medium",
        prompt: "Which detail from the text most directly supports Baptista's argument?",
        answer:
          "Dickens redirected the plot of *Martin Chuzzlewit* mid-publication after sales disappointed.",
        wrong: [
          "*North and South* and *Martin Chuzzlewit* were both published in monthly parts.",
          "Gaskell's editor read the installments of *North and South* before publication.",
          "Nineteenth-century novels were frequently reissued as single volumes.",
        ],
        why: "Baptista's claim is that reader and editor pressure shaped the text as it was written; the mid-book plot change in response to sales is the clearest instance of that.",
      },
    ],
  },
  {
    slug: "standard-time",
    paragraphs: [
      "Before 1883, American towns kept local solar time, and a traveler moving west adjusted a watch continuously. Railroads found this intolerable: a single line might publish schedules in six different local times, and a misread column could put two trains on one track. On November 18, 1883, the railroads simply adopted four standard zones and published new timetables. No federal law recognized the zones until 1918, thirty-five years later, by which point nearly every American city had already reset its clocks to match the railroads'.",
    ],
    questions: [
      {
        domain: "information-and-ideas",
        subdomain: "Central Ideas and Details",
        skills: ["Central ideas"],
        difficulty: "medium",
        prompt: "Which choice best states the main idea of the text?",
        answer:
          "Standard time zones in the United States were established by railroad companies and adopted widely long before any law required them.",
        wrong: [
          "Congress created American standard time zones in 1918 over the objections of the railroads.",
          "Local solar time proved more accurate than the standard zones the railroads introduced.",
          "American cities resisted the railroads' time zones until federal legislation compelled compliance.",
        ],
        why: "The passage shows private adoption in 1883, general compliance, and only belated federal recognition in 1918 — the opposite of the other three accounts.",
      },
      {
        domain: "craft-and-structure",
        subdomain: "Text Structure and Purpose",
        skills: ["Function of a sentence"],
        difficulty: "hard",
        prompt: "Which choice best describes the function of the final sentence in the text?",
        answer:
          "It emphasizes how far practice had outrun formal authority by noting the gap between the two dates.",
        wrong: [
          "It explains why the railroads chose four time zones rather than some other number.",
          "It identifies the legal mechanism by which the zones were originally established.",
          "It concedes that some American cities never adopted the standard zones.",
        ],
        why: "The sentence's force comes from the thirty-five-year gap and the note that cities had already complied — practice ahead of law.",
      },
    ],
  },
];
