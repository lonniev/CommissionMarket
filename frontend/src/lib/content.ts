/**
 * The lessons, glossary and quotations in the reader's language, read through the shared package
 * (`useContent`), English for any a language lacks.
 */

import { useMemo } from "react";
import { useContent } from "@tollbooth-dpyc/web/react";
import english from "../content/en/index.ts";
import { CONTENT } from "../i18n/index.ts";
import { glossaryIn, type Glossary, type GlossaryText } from "./glossary.ts";
import { libraryIn, type Library, type LessonsText } from "./lessons.ts";
import type { PlayByPlayText } from "./playByPlay.ts";
import type { QuoteText } from "./quotes.ts";

/** Everything one language's `src/content/<code>/` folder supplies. */
export type LanguageContent = {
  lessons: LessonsText;
  /** The words the site uses, and what they mean. */
  glossary: GlossaryText;
  /** Read while a page waits on Task Booth. */
  quotes: QuoteText[];
  /** Read while mints are found: trust, banks, hoarding, safety. */
  trustQuotes: QuoteText[];
  /** English always has it; a language without it shows the English. */
  playByPlay?: PlayByPlayText;
};

/** The lessons and bookshelf. */
export function useLessons(): Library {
  const text = useContent<LessonsText>(CONTENT, "lessons") ?? english.lessons;
  return useMemo(() => libraryIn(text), [text]);
}

/** One portrait, three endings, in the reader's language or else English. */
export function usePlayByPlay(): PlayByPlayText {
  return useContent<PlayByPlayText>(CONTENT, "playByPlay") ?? english.playByPlay!;
}

/** The quotations for a wait. */
export const useQuotes = (): QuoteText[] => useContent<QuoteText[]>(CONTENT, "quotes") ?? english.quotes;

/** The quotations for finding mints: trust, banks, hoarding, safety. */
export const useTrustQuotes = (): QuoteText[] =>
  useContent<QuoteText[]>(CONTENT, "trustQuotes") ?? english.trustQuotes;

/** The site's words and what they mean, in the reader's language. */
export function useGlossary(): Glossary {
  const text = useContent<GlossaryText>(CONTENT, "glossary") ?? english.glossary;
  return useMemo(() => glossaryIn(text), [text]);
}
