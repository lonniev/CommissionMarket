/**
 * The words CommissionMarket uses, and what they mean: one source for the
 * Glossary page and every word defined in place (`components/Word`).
 *
 * This is the site's vocabulary. The contract itself, the Standard Terms, is a
 * separate page; a definition here points a reader to it and never stands in
 * for it.
 *
 * This file holds what is the same in every language: each word's key, group
 * and governing clause, in reading order. The words are per language, in
 * `src/content/<language>/glossary.ts`.
 */

export type GlossaryGroup = "people" | "agreement" | "schedule" | "money" | "identity" | "standing" | "filing";

export const GLOSSARY_GROUPS: readonly GlossaryGroup[] = ["people", "agreement", "schedule", "money", "identity", "standing", "filing"];

export const GLOSSARY_KEYS = [
  ["client", "people"],
  ["professional", "people"],
  ["arbiter", "people", "8.3"],
  ["tie_breaker", "people", "4.8"],
  ["inspector", "people", "8.7"],
  ["audience", "people"],

  ["offer", "agreement", "2.3"],
  ["claim", "agreement", "2.2"],
  ["cover_page", "agreement", "2.7"],
  ["standard_terms", "agreement", "18.1"],
  ["deliverable", "agreement", "3.1"],
  ["spec_link", "agreement", "2.1"],
  ["spec_hash", "agreement", "2.5"],
  ["grade", "agreement", "4.3"],
  ["rubric", "agreement", "4.2"],
  ["ip_terms", "agreement", "9.1"],
  ["governing_law", "agreement", "15.2"],

  ["needed_by", "schedule", "4.1"],
  ["late_terms", "schedule", "4.10"],
  ["failure_point", "schedule", "14.7"],
  ["deemed_acceptance", "schedule", "4.5"],
  ["appeal_window", "schedule", "4.6"],
  ["ruling_time", "schedule", "4.7"],
  ["payment_window", "schedule", "7.2"],

  ["deposit", "money", "5.3"],
  ["milestone", "money", "5.4"],
  ["paid_ahead", "money", "5.5"],
  ["balance", "money", "5.7"],
  ["escrow", "money", "6.5"],
  ["mint", "money", "6.15"],
  ["mint_rule", "money"],
  ["refund_after", "money", "6.6"],
  ["sat", "money", "5.1"],
  ["bitcoin", "money"],
  ["lightning", "money"],
  ["invoice", "money", "7.1"],
  ["lightning_address", "money", "6.12"],
  ["api_sats", "money"],

  ["npub", "identity"],
  ["nsec", "identity"],
  ["signature", "identity", "2.5"],
  ["sha256", "identity"],

  ["reputation", "standing"],
  ["rank", "standing"],
  ["claim_of_cause", "standing", "14.8"],

  ["organization", "filing"],
  ["project", "filing"],
  ["project_defaults", "filing"],
] as const satisfies ReadonlyArray<readonly [key: string, group: GlossaryGroup, clause?: string]>;

export type GlossaryKey = (typeof GLOSSARY_KEYS)[number][0];

/** One word in one language. */
export interface WordText {
  term: string;
  /** Other names a reader may search by. */
  aka?: string[];
  /** One or two sentences, as plain prose. */
  said: string;
}

/** Everything the glossary says in one language. */
export interface GlossaryText {
  groups: Record<GlossaryGroup, string>;
  words: Record<GlossaryKey, WordText>;
}

export interface Entry extends WordText {
  key: GlossaryKey;
  group: GlossaryGroup;
  /** The clause of the Standard Terms that governs it, when one does. */
  clause?: string;
}

export interface Glossary {
  entries: Entry[];
  groups: { id: GlossaryGroup; title: string }[];
  define: (key: string) => Entry | undefined;
  search: (query: string) => Entry[];
}

/** The glossary as a page shows it: this file's order with one language's words. */
export function glossaryIn(text: GlossaryText): Glossary {
  const entries: Entry[] = GLOSSARY_KEYS.map((row) => {
    const [key, group] = row;
    const clause = row.length > 2 ? (row as readonly [string, string, string])[2] : undefined;
    return { key, group, ...(clause ? { clause } : {}), ...text.words[key] };
  });
  const byKey = new Map<string, Entry>(entries.map((e) => [e.key, e]));
  return {
    entries,
    groups: GLOSSARY_GROUPS.map((id) => ({ id, title: text.groups[id] })),
    define: (key) => byKey.get(key),
    search(query) {
      const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) return entries;
      return entries.filter((e) => {
        const hay = [e.term, ...(e.aka ?? []), e.said].join(" ").toLowerCase();
        return words.every((w) => hay.includes(w));
      });
    },
  };
}
