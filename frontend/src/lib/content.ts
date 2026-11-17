/**
 * The lessons in the reader's language, read through the shared package
 * (`useContent`), English for any a language lacks.
 */

import { useMemo } from "react";
import { useContent } from "@tollbooth-dpyc/web/react";
import english from "../content/en/index.ts";
import { CONTENT } from "../i18n/index.ts";
import { libraryIn, type Library, type LessonsText } from "./lessons.ts";

/** Everything one language's `src/content/<code>/` folder supplies. */
export type LanguageContent = {
  lessons: LessonsText;
};

/** The lessons, glossary and bookshelf. */
export function useLessons(): Library {
  const text = useContent<LessonsText>(CONTENT, "lessons") ?? english.lessons;
  return useMemo(() => libraryIn(text), [text]);
}
