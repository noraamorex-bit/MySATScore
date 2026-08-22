/** Every template in the bank, in one list. */
import type { Template } from "./types";
import { ALGEBRA_TEMPLATES } from "./math/algebra";
import { ADVANCED_TEMPLATES } from "./math/advanced";
import { PSDA_TEMPLATES } from "./math/psda";
import { GEOMETRY_TEMPLATES } from "./math/geometry";
import { CONVENTIONS_TEMPLATES } from "./rw/conventions";
import { CONVENTIONS_TEMPLATES_2 } from "./rw/conventions-2";
import { EXPRESSION_TEMPLATES } from "./rw/expression";
import { EXPRESSION_TEMPLATES_2 } from "./rw/expression-2";
import { VOCAB_TEMPLATE } from "./rw/vocab";
import { passageTemplates } from "./rw/passage-kit";
import { SCIENCE_PASSAGES } from "./rw/passages-science";
import { HUMANITIES_PASSAGES } from "./rw/passages-humanities";
import { HISTORY_PASSAGES } from "./rw/passages-history";
import { IDEAS_PASSAGES } from "./rw/passages-ideas";

export const ALL_TEMPLATES: Template[] = [
  ...ALGEBRA_TEMPLATES,
  ...ADVANCED_TEMPLATES,
  ...PSDA_TEMPLATES,
  ...GEOMETRY_TEMPLATES,
  ...CONVENTIONS_TEMPLATES,
  ...CONVENTIONS_TEMPLATES_2,
  ...EXPRESSION_TEMPLATES,
  ...EXPRESSION_TEMPLATES_2,
  VOCAB_TEMPLATE,
  ...passageTemplates("rw-sci", SCIENCE_PASSAGES),
  ...passageTemplates("rw-hum", HUMANITIES_PASSAGES),
  ...passageTemplates("rw-hist", HISTORY_PASSAGES),
  ...passageTemplates("rw-idea", IDEAS_PASSAGES),
];
