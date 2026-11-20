/**
 * One language's lessons and quotations. The words on CommissionMarket's pages are in
 * `src/i18n/<code>.ts`.
 *
 * A new language is this folder copied with every string translated, plus its
 * words file, both added to `registerCommission` in `src/i18n/index.ts`.
 */

import type { LanguageContent } from "../../lib/content.ts";
import { glossary } from "./glossary.ts";
import { lessons } from "./lessons.ts";
import { quotes } from "./quotes.ts";
import { trustQuotes } from "./trustQuotes.ts";

const content: LanguageContent = { lessons, glossary, quotes, trustQuotes };

export default content;
