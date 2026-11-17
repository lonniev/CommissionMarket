/**
 * CommissionMarket's words, handed to the shared web package. The package does
 * all the translating (i18next): which language to start in, fetching a
 * language when chosen, falling back to English, the chooser. This site
 * supplies only the English and its translations.
 */

import { registerNamespace, type Vars } from "@tollbooth-dpyc/web";
import { useT as useWords } from "@tollbooth-dpyc/web/react";
import en, { type MessageKey } from "./en.ts";

/** CommissionMarket's words, for `useT` and `<Tx ns={WORDS} …/>`. */
export const WORDS = "commission";

/** Hand the English to the package, and say where each translation is fetched from. Once, before render. */
export function registerCommission(): Promise<unknown> {
  return registerNamespace(WORDS, en, {
    fr: () => import("./fr.ts"),
    es: () => import("./es.ts"),
    ja: () => import("./ja.ts"),
    zh: () => import("./zh.ts"),
    hi: () => import("./hi.ts"),
  });
}

export type Translate = (key: MessageKey, vars?: Vars) => string;

/** `t(key, vars?)` for CommissionMarket's words, in the reader's language. */
export const useT = (): Translate => useWords<MessageKey>(WORDS);

/** Something a pure function wants said: the message, and what fills its `{{places}}`. */
export interface Said {
  key: MessageKey;
  vars?: Vars;
}

/** What a pure function asked to have said, or nothing when it asked for nothing. */
export const say = (t: Translate, said: Said | null): string => (said ? t(said.key, said.vars) : "");
