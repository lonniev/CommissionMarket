/**
 * One language's lessons. The words on CommissionMarket's pages are in
 * `src/i18n/<code>.ts`.
 *
 * A new language is this folder copied with every string translated, plus its
 * words file, both added to `registerCommission` in `src/i18n/index.ts`.
 */

import type { LanguageContent } from "../../lib/content.ts";
import { lessons } from "./lessons.ts";
import { playByPlay } from "./playByPlay.ts";

const content: LanguageContent = { lessons, playByPlay };

export default content;
