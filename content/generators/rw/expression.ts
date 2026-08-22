/**
 * Expression of Ideas templates (~20% of Reading and Writing): transitions and
 * rhetorical synthesis.
 *
 * Transitions items give a short passage with a blank between two ideas and ask
 * for the logical connector. Rhetorical synthesis items give a student's
 * research notes and a stated goal, and ask which sentence uses the notes to
 * meet that goal.
 */
import { Rng } from "../rng";
import { ORIGINAL, type ItemBody, type Template } from "../types";
import { buildChoices } from "../util";

const base = { subject: "rw", domain: "expression-of-ideas", source: ORIGINAL } as const;

interface TransitionSeed {
  paragraphs: string[];
  answer: string;
  wrong: [string, string, string];
  why: string;
  difficulty?: "easy" | "medium" | "hard";
}

const TRANSITION_SEEDS: TransitionSeed[] = [
  {
    paragraphs: [
      "Coral reefs occupy less than one percent of the ocean floor. ______ they shelter roughly a quarter of all marine species, a concentration unmatched anywhere else in the sea.",
    ],
    answer: "Nevertheless,",
    wrong: ["Similarly,", "For example,", "Consequently,"],
    why: "The two sentences set a very small area against a very large share of species. *Nevertheless* marks that contrast; the other options signal similarity, illustration, or result.",
  },
  {
    paragraphs: [
      "The alloy's grain structure changes permanently once it is heated past 480 degrees Celsius. ______ manufacturers who anneal the sheets must monitor furnace temperature to within a few degrees.",
    ],
    answer: "Therefore,",
    wrong: ["However,", "In contrast,", "Meanwhile,"],
    why: "The second sentence states a consequence of the fact in the first. *Therefore* signals that causal relationship.",
    difficulty: "easy",
  },
  {
    paragraphs: [
      "Bowerbirds are known for the elaborate structures males build to attract mates. ______ the great bowerbird arranges stones and bones by size so that the display appears uniform from the female's vantage point.",
    ],
    answer: "For instance,",
    wrong: ["Nonetheless,", "In conclusion,", "By contrast,"],
    why: "The second sentence gives a specific case of the general claim in the first, which calls for an illustrative transition.",
    difficulty: "easy",
  },
  {
    paragraphs: [
      "Early radio astronomers assumed that the hiss detected by their antennas came from atmospheric interference. ______ Karl Jansky traced it to a fixed point in the constellation Sagittarius.",
    ],
    answer: "In fact,",
    wrong: ["Likewise,", "Accordingly,", "Afterward,"],
    why: "The second sentence corrects the assumption stated in the first. *In fact* introduces a correction or clarification.",
  },
  {
    paragraphs: [
      "The archive holds more than sixty thousand glass plate negatives. ______ fewer than two thousand have ever been printed.",
    ],
    answer: "Yet",
    wrong: ["Thus", "Moreover", "Likewise"],
    why: "A very large holding is set against a very small number printed. *Yet* marks that contrast; the alternatives signal result or addition.",
    difficulty: "easy",
  },
  {
    paragraphs: [
      "Reintroducing wolves changed where elk chose to graze. ______ willow and aspen began to recover along stream banks that had been browsed bare for decades.",
    ],
    answer: "As a result,",
    wrong: ["Nevertheless,", "For example,", "In other words,"],
    why: "The vegetation recovery follows from the change in grazing behavior, so a resultative transition is required.",
    difficulty: "easy",
  },
  {
    paragraphs: [
      "The composer left no performance markings in the manuscript. ______ conductors must decide questions of tempo and dynamics from the musical structure alone.",
    ],
    answer: "Consequently,",
    wrong: ["Nevertheless,", "Similarly,", "Specifically,"],
    why: "The absence of markings causes the interpretive burden described in the second sentence.",
  },
  {
    paragraphs: [
      "Most models predicted that the ice shelf would thin gradually from below. ______ satellite altimetry showed that meltwater pooling on the surface was driving fractures downward.",
    ],
    answer: "Instead,",
    wrong: ["Additionally,", "Therefore,", "For instance,"],
    why: "What was observed replaces what was predicted, which calls for *instead* rather than an additive or causal connector.",
  },
  {
    paragraphs: [
      "Lacquer resists water, acid, and most solvents. ______ it degrades quickly under sustained ultraviolet light, which is why lacquered objects are displayed under filtered illumination.",
    ],
    answer: "However,",
    wrong: ["Likewise,", "In addition,", "As a result,"],
    why: "A list of strengths is followed by a weakness, so a contrastive transition is required.",
    difficulty: "easy",
  },
  {
    paragraphs: [
      "Hummingbirds can enter torpor overnight, dropping their body temperature by more than twenty degrees. ______ some bats and small rodents suspend thermoregulation to survive cold nights on limited reserves.",
    ],
    answer: "Similarly,",
    wrong: ["However,", "Consequently,", "In short,"],
    why: "The second sentence describes a parallel strategy in other animals, so a comparative transition is appropriate.",
  },
  {
    paragraphs: [
      "The survey collected responses from 12,000 households across nine provinces. ______ its findings cannot be generalized to rural districts, which were sampled at only a tenth of the urban rate.",
    ],
    answer: "Still,",
    wrong: ["Hence,", "Furthermore,", "That is,"],
    why: "A strength of the survey is set against a limitation. *Still* concedes the first point while introducing the qualification.",
  },
  {
    paragraphs: [
      "Ferns reproduce by releasing spores rather than seeds. ______ they can colonize bare rock faces where soil has not yet formed.",
    ],
    answer: "For this reason,",
    wrong: ["Nevertheless,", "In contrast,", "Previously,"],
    why: "The second sentence gives a consequence of the reproductive strategy described in the first.",
  },
  {
    paragraphs: [
      "The manuscript's ink contains iron gall, which was in use across Europe by the twelfth century. ______ the parchment was prepared using a technique documented only in northern Italy.",
    ],
    answer: "Meanwhile,",
    wrong: ["Therefore,", "In summary,", "For example,"],
    why: "The two sentences present separate, coexisting pieces of evidence rather than a cause, a summary, or an illustration.",
    difficulty: "hard",
  },
  {
    paragraphs: [
      "Standard economic models treat commuting time as a pure cost. ______ surveys consistently find that workers report a preferred commute of roughly fifteen minutes rather than none at all.",
    ],
    answer: "In reality,",
    wrong: ["Similarly,", "Accordingly,", "In addition,"],
    why: "The evidence in the second sentence contradicts the model described in the first, calling for a corrective transition.",
    difficulty: "hard",
  },
  {
    paragraphs: [
      "The first edition sold fewer than four hundred copies. ______ the second, issued with an introduction by a well-known critic, went through six printings in two years.",
    ],
    answer: "By contrast,",
    wrong: ["Consequently,", "Likewise,", "In particular,"],
    why: "The two editions' fortunes are opposed, so a contrastive transition is needed.",
    difficulty: "easy",
  },
  {
    paragraphs: [
      "Enzymes accelerate reactions by lowering the activation energy required. ______ they are not consumed in the process, so a single molecule can catalyze millions of reactions.",
    ],
    answer: "Moreover,",
    wrong: ["Nevertheless,", "For example,", "Otherwise,"],
    why: "The second sentence adds a further property of enzymes rather than contrasting with or illustrating the first.",
  },
  {
    paragraphs: [
      "Excavation at the site stopped in 1974 when funding lapsed. ______ the trenches were backfilled and the field returned to pasture.",
    ],
    answer: "Subsequently,",
    wrong: ["Nonetheless,", "For instance,", "Conversely,"],
    why: "The second sentence describes what happened next in time, so a sequential transition is correct.",
    difficulty: "easy",
  },
  {
    paragraphs: [
      "The bridge was designed to flex under load, which is why its deck visibly rises and falls as traffic crosses. ______ the motion is a sign that the structure is working as intended, not a sign of failure.",
    ],
    answer: "In other words,",
    wrong: ["However,", "Previously,", "In addition,"],
    why: "The second sentence restates the first in clearer terms, which calls for a clarifying transition.",
  },
  {
    paragraphs: [
      "Tree rings record annual growth, and their widths track rainfall closely in arid regions. ______ in the tropics, where growth is continuous, rings may be absent altogether.",
    ],
    answer: "In contrast,",
    wrong: ["Therefore,", "Similarly,", "Indeed,"],
    why: "Tropical trees behave oppositely to the arid-region case, so a contrastive transition is required.",
  },
  {
    paragraphs: [
      "Only three of the sixteen frescoes were completed before the workshop disbanded. ______ those three established a compositional formula that painters in the region reused for the next fifty years.",
    ],
    answer: "Even so,",
    wrong: ["Therefore,", "Likewise,", "For example,"],
    why: "A small number is conceded, and the sentence then asserts their outsized influence, which calls for a concessive transition.",
    difficulty: "hard",
  },
  {
    paragraphs: [
      "Hydrogen burns without producing carbon dioxide. ______ most hydrogen produced today is derived from natural gas in a process that releases substantial carbon dioxide.",
    ],
    answer: "At present, though,",
    wrong: ["As a result,", "Similarly,", "In summary,"],
    why: "The clean-burning property is qualified by how hydrogen is currently made, so the transition must signal contrast.",
    difficulty: "hard",
  },
  {
    paragraphs: [
      "Sea otters eat enormous quantities of sea urchins. ______ where otters have returned, urchin barrens have given way to dense kelp forests.",
    ],
    answer: "Accordingly,",
    wrong: ["Nevertheless,", "For example,", "Conversely,"],
    why: "The kelp recovery follows from the otters' feeding, so a resultative transition is correct.",
  },
  {
    paragraphs: [
      "The poet published nothing between 1931 and 1948. ______ notebooks recovered after her death show that she wrote almost daily throughout those years.",
    ],
    answer: "Nonetheless,",
    wrong: ["Consequently,", "Furthermore,", "That is,"],
    why: "Silence in print is set against constant private writing, which calls for a contrastive transition.",
  },
  {
    paragraphs: [
      "The compound proved stable at room temperature and easy to synthesize in a single step. ______ it was licensed for industrial use within eighteen months of its first description.",
    ],
    answer: "Thus,",
    wrong: ["However,", "Likewise,", "In particular,"],
    why: "Licensing follows from the advantages listed, so a resultative transition is required.",
    difficulty: "easy",
  },
  {
    paragraphs: [
      "Most of the mission's instruments were designed for a two-year survey. ______ the spectrometer was built to a ten-year specification because replacing it in orbit would be impossible.",
    ],
    answer: "The spectrometer, however,",
    wrong: ["The spectrometer, therefore,", "The spectrometer, similarly,", "The spectrometer, for example,"],
    why: "One instrument is singled out as an exception to the general design standard, so a contrastive transition is needed.",
    difficulty: "hard",
  },
  {
    paragraphs: [
      "Written records of the eruption survive in three languages. ______ the ash layer itself provides a date accurate to within a single growing season.",
    ],
    answer: "Independently,",
    wrong: ["Therefore,", "In short,", "For example,"],
    why: "The physical evidence is a separate line of evidence rather than a consequence, summary, or illustration of the written records.",
    difficulty: "hard",
  },
  {
    paragraphs: [
      "The museum's conservation lab treats about four hundred objects a year. ______ it advises regional institutions that lack conservation staff of their own.",
    ],
    answer: "In addition,",
    wrong: ["Instead,", "As a result,", "Nevertheless,"],
    why: "The second sentence adds another activity to the first rather than replacing or explaining it.",
    difficulty: "easy",
  },
  {
    paragraphs: [
      "Migrating songbirds orient using the Earth's magnetic field. ______ experiments in which the field is artificially rotated cause captive birds to reorient by the same angle.",
    ],
    answer: "Indeed,",
    wrong: ["Nevertheless,", "In contrast,", "Beforehand,"],
    why: "The experimental result confirms and strengthens the claim in the first sentence, which calls for an intensifying transition.",
  },
  {
    paragraphs: [
      "The treaty fixed the boundary at the river's main channel. ______ the channel had already shifted more than a kilometer east by the time the surveyors arrived.",
    ],
    answer: "Unfortunately,",
    wrong: ["Consequently,", "Similarly,", "In brief,"],
    why: "The second sentence introduces a complication that frustrates the first, so a contrastive or evaluative transition is required.",
  },
  {
    paragraphs: [
      "Aluminum was once more valuable than silver because separating it from ore required enormous amounts of energy. ______ the Hall-Héroult process cut the cost by more than ninety percent within a decade.",
    ],
    answer: "Then, in 1886,",
    wrong: ["Similarly, in 1886,", "Therefore, in 1886,", "For example, in 1886,"],
    why: "The second sentence marks a turning point in a chronological account, so a sequential transition is correct.",
  },
];

interface SynthesisSeed {
  topic: string;
  bullets: string[];
  goal: string;
  answer: string;
  wrong: [string, string, string];
  why: string;
  difficulty?: "easy" | "medium" | "hard";
}

const SYNTHESIS_SEEDS: SynthesisSeed[] = [
  {
    topic: "the Antikythera mechanism",
    bullets: [
      "The Antikythera mechanism is a geared bronze device recovered from a Roman-era shipwreck in 1901.",
      "It has at least 30 interlocking bronze gears.",
      "It modeled the positions of the sun and moon and predicted eclipses.",
      "No comparably complex geared device is known from the next thousand years.",
    ],
    goal: "emphasize how unusual the mechanism is in the history of technology",
    answer:
      "Although the Antikythera mechanism used at least 30 interlocking gears to model the sun and moon and predict eclipses, no comparably complex geared device is known from the following thousand years.",
    wrong: [
      "The Antikythera mechanism, a geared bronze device, was recovered from a Roman-era shipwreck in 1901.",
      "The Antikythera mechanism has at least 30 interlocking bronze gears, which allowed it to model the positions of the sun and the moon.",
      "Because it predicted eclipses, the Antikythera mechanism was recovered from a Roman-era shipwreck in 1901.",
    ],
    why: "The goal is to stress how *unusual* the device is. Only the correct choice pairs its sophistication with the thousand-year gap that follows it; the others report facts without establishing that contrast.",
  },
  {
    topic: "urban heat islands",
    bullets: [
      "Dark paving absorbs more solar radiation than vegetated ground.",
      "City centers can be 4 to 7 degrees Celsius warmer than surrounding countryside at night.",
      "Researcher Priya Raman measured surface temperatures across 40 city blocks.",
      "Blocks with more than 30% tree canopy were on average 3 degrees cooler.",
    ],
    goal: "present Raman's finding to an audience already familiar with urban heat islands",
    answer:
      "Measuring surface temperatures across 40 city blocks, Raman found that blocks with more than 30% tree canopy were on average 3 degrees cooler.",
    wrong: [
      "City centers can be 4 to 7 degrees Celsius warmer at night than the countryside that surrounds them.",
      "Dark paving absorbs more solar radiation than vegetated ground, which is why cities are warmer than the countryside.",
      "Raman, who measured surface temperatures across 40 city blocks, is a researcher studying urban heat islands.",
    ],
    why: "An audience that already knows about urban heat islands needs the new result, not the background. Only the correct choice reports Raman's method and finding.",
  },
  {
    topic: "the painter Hilma af Klint",
    bullets: [
      "Hilma af Klint painted large abstract works beginning in 1906.",
      "Kandinsky's first abstract painting is usually dated to 1911.",
      "Af Klint instructed that her abstract work not be shown until 20 years after her death.",
      "Her paintings were first widely exhibited in 1986.",
    ],
    goal: "explain why af Klint's role in the history of abstraction was long overlooked",
    answer:
      "Although af Klint began painting abstract works in 1906, five years before Kandinsky's first abstract painting, she instructed that hers not be shown until 20 years after her death, and they were not widely exhibited until 1986.",
    wrong: [
      "Hilma af Klint began painting large abstract works in 1906, and her paintings were first widely exhibited in 1986.",
      "Kandinsky's first abstract painting is usually dated to 1911, five years after af Klint began working abstractly.",
      "Af Klint instructed that her abstract work not be shown until 20 years after her death.",
    ],
    why: "The goal asks *why* she was overlooked. Only the correct choice connects her priority over Kandinsky to the instruction that delayed exhibition of her work.",
  },
  {
    topic: "mangrove carbon storage",
    bullets: [
      "Mangroves grow in the intertidal zone of tropical coastlines.",
      "Mangrove soils store carbon for centuries because they are waterlogged and low in oxygen.",
      "Per hectare, mangroves store roughly three to five times the carbon of tropical upland forest.",
      "Roughly a third of the world's mangrove area was lost between 1980 and 2020.",
    ],
    goal: "make a case for prioritizing mangrove conservation",
    answer:
      "Mangroves store roughly three to five times as much carbon per hectare as tropical upland forest, yet about a third of the world's mangrove area was lost between 1980 and 2020.",
    wrong: [
      "Mangroves grow in the intertidal zone of tropical coastlines, where their soils are waterlogged and low in oxygen.",
      "Because mangrove soils are waterlogged and low in oxygen, they store carbon for centuries.",
      "About a third of the world's mangrove area was lost between 1980 and 2020, and mangroves grow along tropical coastlines.",
    ],
    why: "A case for conservation needs both the value of the resource and the threat to it. Only the correct choice states the carbon advantage and the loss together.",
  },
  {
    topic: "the Voynich manuscript",
    bullets: [
      "The Voynich manuscript is written in an undeciphered script.",
      "Radiocarbon dating places its parchment between 1404 and 1438.",
      "Statistical analyses show its word frequencies resemble those of natural languages.",
      "No proposed decipherment has been accepted by specialists.",
    ],
    goal: "specify what analysis of the manuscript's text has established",
    answer:
      "Statistical analyses have shown that word frequencies in the Voynich manuscript resemble those of natural languages, though no proposed decipherment has been accepted by specialists.",
    wrong: [
      "The Voynich manuscript is written in an undeciphered script on parchment dated between 1404 and 1438.",
      "Radiocarbon dating places the Voynich manuscript's parchment between 1404 and 1438.",
      "No proposed decipherment of the Voynich manuscript has been accepted by specialists.",
    ],
    why: "The goal concerns analysis of the *text*. Only the correct choice reports the statistical finding; the others report the dating of the material or the state of decipherment alone.",
    difficulty: "hard",
  },
  {
    topic: "the Tunguska event",
    bullets: [
      "In 1908 an explosion flattened roughly 2,000 square kilometers of Siberian forest.",
      "No impact crater has ever been found at the site.",
      "The leading explanation is an airburst of a stony asteroid several tens of meters across.",
      "Trees at the epicenter were left standing but stripped of branches.",
    ],
    goal: "present evidence supporting the airburst explanation",
    answer:
      "No impact crater has been found at Tunguska, and trees at the epicenter were left standing but stripped of branches — a pattern consistent with an explosion in the air rather than a ground impact.",
    wrong: [
      "In 1908 an explosion flattened roughly 2,000 square kilometers of forest in Siberia.",
      "The leading explanation for the Tunguska event is an airburst of a stony asteroid several tens of meters across.",
      "Trees at the epicenter of the Tunguska event were left standing but stripped of their branches.",
    ],
    why: "The goal is to present *evidence for* the explanation. Only the correct choice assembles the two observations and states how they support an airburst.",
    difficulty: "hard",
  },
  {
    topic: "the writer Zora Neale Hurston's fieldwork",
    bullets: [
      "Hurston trained in anthropology under Franz Boas at Barnard College.",
      "Between 1927 and 1932 she collected folklore in Florida, Alabama, Haiti, and Jamaica.",
      "She published *Mules and Men* in 1935.",
      "*Mules and Men* presents collected tales within a narrative of her own travels.",
    ],
    goal: "describe what distinguishes Mules and Men from a conventional folklore collection",
    answer:
      "Rather than presenting her material as a bare catalogue, Hurston framed the tales she collected between 1927 and 1932 within a narrative of her own travels.",
    wrong: [
      "Hurston, who trained in anthropology under Franz Boas at Barnard College, published *Mules and Men* in 1935.",
      "Between 1927 and 1932, Hurston collected folklore in Florida, Alabama, Haiti, and Jamaica.",
      "*Mules and Men*, published in 1935, is a collection of folklore Hurston gathered in the American South and the Caribbean.",
    ],
    why: "What distinguishes the book is its narrative framing. Only the correct choice names that feature and contrasts it with a conventional collection.",
  },
  {
    topic: "desert varnish",
    bullets: [
      "Desert varnish is a dark coating that forms on exposed rock in arid regions.",
      "It is composed largely of clay minerals with manganese and iron oxides.",
      "It accumulates at roughly one micrometer per thousand years.",
      "Petroglyphs are often made by chipping through the varnish to lighter rock beneath.",
    ],
    goal: "explain why desert varnish is useful to archaeologists",
    answer:
      "Because desert varnish accumulates at roughly one micrometer per thousand years, the varnish that has re-formed inside a petroglyph chipped through it can help archaeologists estimate the carving's age.",
    wrong: [
      "Desert varnish is a dark coating composed largely of clay minerals with manganese and iron oxides.",
      "Petroglyphs are often made by chipping through desert varnish to the lighter rock beneath.",
      "Desert varnish forms on exposed rock in arid regions and accumulates very slowly.",
    ],
    why: "The goal is to explain the archaeological usefulness. Only the correct choice links the slow, measurable accumulation rate to dating petroglyphs.",
    difficulty: "hard",
  },
  {
    topic: "the Green Bank Telescope's quiet zone",
    bullets: [
      "The Green Bank Telescope in West Virginia detects extremely faint radio signals.",
      "It sits inside the National Radio Quiet Zone, a 34,000-square-kilometer area.",
      "Within 16 kilometers of the telescope, gasoline engines and microwave ovens are restricted.",
      "Signals the telescope studies are billions of times fainter than a mobile phone transmission.",
    ],
    goal: "explain why such strict restrictions surround the telescope",
    answer:
      "Because the signals the Green Bank Telescope studies are billions of times fainter than a mobile phone transmission, everyday sources of interference such as gasoline engines and microwave ovens are restricted within 16 kilometers of it.",
    wrong: [
      "The Green Bank Telescope sits inside the National Radio Quiet Zone, an area of 34,000 square kilometers.",
      "Within 16 kilometers of the Green Bank Telescope, gasoline engines and microwave ovens are restricted.",
      "The Green Bank Telescope, located in West Virginia, detects extremely faint radio signals.",
    ],
    why: "The goal asks *why* the restrictions exist. Only the correct choice supplies the causal link between signal faintness and the restrictions.",
  },
  {
    topic: "seed banks",
    bullets: [
      "The Svalbard Global Seed Vault opened in 2008 inside a mountain on a Norwegian island.",
      "It holds duplicate samples of seeds from more than 1,700 gene banks worldwide.",
      "Permafrost keeps the vault cold even without power.",
      "In 2015 the vault made its first withdrawal, restoring samples lost from a gene bank in Aleppo.",
    ],
    goal: "illustrate the vault's purpose with a concrete example",
    answer:
      "The vault's purpose became concrete in 2015, when it made its first withdrawal to restore samples lost from a gene bank in Aleppo.",
    wrong: [
      "The Svalbard Global Seed Vault, which opened in 2008, is built inside a mountain on a Norwegian island.",
      "Permafrost keeps the Svalbard Global Seed Vault cold even in the absence of power.",
      "The vault holds duplicate samples of seeds from more than 1,700 gene banks around the world.",
    ],
    why: "A concrete example of the purpose is the Aleppo withdrawal. The other choices describe the vault's construction or holdings without illustrating what it is for.",
    difficulty: "easy",
  },
  {
    topic: "the physicist Chien-Shiung Wu",
    bullets: [
      "In 1956 theorists Lee and Yang proposed that parity might not be conserved in weak interactions.",
      "Chien-Shiung Wu designed and ran the experiment that tested the proposal.",
      "Her cobalt-60 experiment showed that parity is indeed violated.",
      "Lee and Yang received the 1957 Nobel Prize in Physics; Wu did not.",
    ],
    goal: "emphasize the significance of Wu's experimental contribution",
    answer:
      "It was Wu who designed and carried out the cobalt-60 experiment demonstrating that parity is violated, confirming a proposal for which Lee and Yang, but not Wu, received the 1957 Nobel Prize.",
    wrong: [
      "In 1956, Lee and Yang proposed that parity might not be conserved in weak interactions.",
      "Chien-Shiung Wu's cobalt-60 experiment showed that parity is violated in weak interactions.",
      "Lee and Yang received the 1957 Nobel Prize in Physics for their proposal about parity.",
    ],
    why: "The goal is to emphasize Wu's contribution. Only the correct choice both credits her with the decisive experiment and notes the recognition she did not receive.",
  },
  {
    topic: "lichens",
    bullets: [
      "A lichen is a partnership between a fungus and an alga or cyanobacterium.",
      "Lichens grow on bare rock, tree bark, and soil.",
      "Many lichen species absorb pollutants directly from the air and cannot excrete them.",
      "Lichen surveys are used to map air quality in cities across Europe.",
    ],
    goal: "explain how lichens are used as environmental indicators",
    answer:
      "Because many lichens absorb airborne pollutants directly and cannot excrete them, surveys of lichen species are used to map air quality in cities across Europe.",
    wrong: [
      "A lichen is a partnership between a fungus and either an alga or a cyanobacterium.",
      "Lichens grow on bare rock, on tree bark, and on soil across a wide range of climates.",
      "Lichen surveys are used to map air quality in cities across Europe.",
    ],
    why: "The goal asks *how* lichens serve as indicators. Only the correct choice supplies the mechanism — direct absorption without excretion — alongside the application.",
    difficulty: "easy",
  },
  {
    topic: "the Nabta Playa stone circle",
    bullets: [
      "Nabta Playa is an archaeological site in the Nubian Desert of southern Egypt.",
      "A small stone circle there has been dated to roughly 4800 BCE.",
      "Several of its stones align with the position of sunrise at the summer solstice.",
      "The summer solstice coincided with the arrival of seasonal rains in the region.",
    ],
    goal: "explain the practical importance the alignment may have had",
    answer:
      "Because the summer solstice coincided with the arrival of the seasonal rains, the stones at Nabta Playa that align with solstice sunrise may have served as a practical calendar for a people dependent on that water.",
    wrong: [
      "Nabta Playa, in the Nubian Desert of southern Egypt, contains a stone circle dated to roughly 4800 BCE.",
      "Several stones at Nabta Playa align with the position of sunrise at the summer solstice.",
      "The stone circle at Nabta Playa has been dated to roughly 4800 BCE, making it very old.",
    ],
    why: "The goal is the *practical* importance. Only the correct choice ties the solstice alignment to the arrival of the rains.",
    difficulty: "hard",
  },
  {
    topic: "cochlear implants and pitch",
    bullets: [
      "A cochlear implant converts sound into electrical pulses delivered to the auditory nerve.",
      "Most implants use between 12 and 22 electrode channels.",
      "A healthy cochlea distinguishes thousands of frequency positions.",
      "Implant users typically understand speech well but report difficulty with melody.",
    ],
    goal: "explain why implant users find melody harder than speech",
    answer:
      "Because most implants deliver sound through only 12 to 22 channels where a healthy cochlea distinguishes thousands of frequency positions, users generally follow speech well but struggle with melody, which depends on fine pitch differences.",
    wrong: [
      "A cochlear implant converts sound into electrical pulses that are delivered to the auditory nerve.",
      "Most cochlear implants use between 12 and 22 electrode channels.",
      "Cochlear implant users typically understand speech well but report difficulty with melody.",
    ],
    why: "The goal asks for an explanation. Only the correct choice connects the coarse channel count to the fine pitch resolution melody requires.",
    difficulty: "hard",
  },
  {
    topic: "Roman concrete",
    bullets: [
      "Roman marine concrete mixed volcanic ash with lime and seawater.",
      "Modern Portland cement degrades in seawater over decades.",
      "Roman harbor structures at Baiae remain intact after two thousand years.",
      "Seawater reacts with the volcanic ash to grow interlocking crystals inside the concrete.",
    ],
    goal: "explain the mechanism behind Roman concrete's durability in seawater",
    answer:
      "Seawater reacts with the volcanic ash in Roman marine concrete to grow interlocking crystals inside the material, which is why harbor structures at Baiae remain intact after two thousand years.",
    wrong: [
      "Roman marine concrete was made by mixing volcanic ash with lime and seawater.",
      "Modern Portland cement degrades in seawater over the course of a few decades.",
      "Roman harbor structures at Baiae have remained intact for roughly two thousand years.",
    ],
    why: "The goal asks for the *mechanism*. Only the correct choice describes the crystal growth and links it to the observed durability.",
  },
  {
    topic: "the Voyager Golden Record",
    bullets: [
      "Two identical gold-plated copper records were attached to the Voyager spacecraft in 1977.",
      "Each carries 115 images, greetings in 55 languages, and 90 minutes of music.",
      "The records are encoded as analog signals with pictorial playback instructions etched on the cover.",
      "Both spacecraft have now passed beyond the heliopause.",
    ],
    goal: "emphasize the difficulty of designing a message for an unknown recipient",
    answer:
      "Because the intended audience is entirely unknown, the Voyager records carry pictorial playback instructions etched directly on their covers alongside the 115 images, 55 greetings, and 90 minutes of music they encode.",
    wrong: [
      "Two identical gold-plated copper records were attached to the Voyager spacecraft in 1977.",
      "Each Voyager record carries 115 images, greetings in 55 languages, and 90 minutes of music.",
      "Both Voyager spacecraft have now travelled beyond the heliopause.",
    ],
    why: "The goal concerns the design problem. Only the correct choice presents the etched instructions as a response to an unknown recipient.",
  },
];

export const EXPRESSION_TEMPLATES: Template[] = [
  {
    ...base,
    id: "rw-eoi-transition",
    subdomain: "Transitions",
    skills: ["Logical transitions", "Relationships between ideas"],
    difficulty: "medium",
    variants: TRANSITION_SEEDS.length,
    build(rng: Rng, index: number): ItemBody {
      const seed = TRANSITION_SEEDS[index % TRANSITION_SEEDS.length];
      const { choices, correct } = buildChoices(rng, seed.answer, seed.wrong, { sortNumeric: false });
      return {
        stimulus: { type: "passage", paragraphs: seed.paragraphs },
        prompt: "Which choice completes the text with the most logical transition?",
        answerFormat: "multiple-choice",
        choices,
        correct,
        explanation: seed.why,
        difficulty: seed.difficulty,
      };
    },
  },
  {
    ...base,
    id: "rw-eoi-synthesis",
    subdomain: "Rhetorical synthesis",
    skills: ["Rhetorical synthesis", "Using evidence to meet a goal"],
    difficulty: "hard",
    variants: SYNTHESIS_SEEDS.length,
    build(rng: Rng, index: number): ItemBody {
      const seed = SYNTHESIS_SEEDS[index % SYNTHESIS_SEEDS.length];
      const { choices, correct } = buildChoices(rng, seed.answer, seed.wrong, { sortNumeric: false });
      return {
        stimulus: {
          type: "passage",
          title: `Student notes on ${seed.topic}`,
          paragraphs: ["While researching a topic, a student has taken the following notes."],
          bullets: seed.bullets,
        },
        prompt: `The student wants to ${seed.goal}. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
        answerFormat: "multiple-choice",
        choices,
        correct,
        explanation: seed.why,
        difficulty: seed.difficulty,
      };
    },
  },
];
