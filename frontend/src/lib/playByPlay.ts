/**
 * One portrait commissioned three times, ending three ways, told against the
 * Standard Terms. The words live in `src/content/<code>/playByPlay.ts`; this
 * is their shape and the little markup they use:
 *
 *   [[escrow]]            a key word, shown as the glossary names it, with a hover
 *   [[escrow|the escrow]] the same word, shown in other words
 *   §6.5                  a clause of the Standard Terms the story follows, linked
 */

/** The version of the Standard Terms the story is told under; its clauses are the ones cited. */
export const STORY_TERMS = "v1";

export interface Word { word: string; says: string; clause: string }

export interface Ending {
  key: string;
  emoji: string;
  title: string;
  tldr: string;
  /** One beat per phase, in phase order; each beat is a few sentences, one to a line. */
  beats: string[][];
  /** Who ends up with what. */
  tally: string[];
  /** What would have gone otherwise. */
  aside: string[];
}

/** The words on the timeline: lane names, labels, and the sentences under the slider ({n} is a number). */
export interface ClockText {
  title: string;
  caption: string;
  lanes: [string, string, string, string];
  deposit: string;
  milestone: string;
  painting: string;
  grace: string;
  delivered: string;
  grade: string;
  appeal: string;
  arbiter: string;
  locked: string;
  alone: string;
  exposed: string;
  deliveryDate: string;
  refund: string;
  day: string;
  slider: string;
  roomy: string;
  same: string;
  tight: string;
}

export interface PlayByPlayText {
  title: string;
  intro: string[];
  setupTitle: string;
  setup: string[];
  coverTitle: string;
  cover: [string, string][];
  clock: ClockText;
  phases: string[];
  tallyTitle: string;
  asideTitle: string;
  endings: Ending[];
  words: Record<string, Word>;
}

export type Piece =
  | { kind: "text"; text: string }
  | { kind: "word"; key: string; text: string }
  | { kind: "clause"; clause: string; text: string };

const MARKUP = /\[\[([a-zA-Z]+)(?:\|([^\]]+))?\]\]|§(\d+(?:\.\d+)?)/g;

/** A line cut into plain text, key words and clause references. A word the glossary lacks stays plain. */
export function storyPieces(line: string, words: Record<string, Word>): Piece[] {
  const pieces: Piece[] = [];
  let at = 0;
  for (const m of line.matchAll(MARKUP)) {
    if (m.index! > at) pieces.push({ kind: "text", text: line.slice(at, m.index) });
    if (m[3]) pieces.push({ kind: "clause", clause: m[3], text: `§${m[3]}` });
    else {
      const word = words[m[1]];
      const text = m[2] ?? word?.word ?? m[1];
      pieces.push(word ? { kind: "word", key: m[1], text } : { kind: "text", text });
    }
    at = m.index! + m[0].length;
  }
  if (at < line.length) pieces.push({ kind: "text", text: line.slice(at) });
  return pieces;
}

/** Every key word and clause a story's lines use, to check them against the glossary and the terms. */
export function storyRefs(text: PlayByPlayText): { words: string[]; clauses: string[] } {
  const lines = [
    ...text.intro, ...text.setup,
    ...text.endings.flatMap((e) => [e.tldr, ...e.beats.flat(), ...e.tally, ...e.aside]),
  ];
  const words = new Set<string>(), clauses = new Set<string>();
  for (const line of lines) {
    for (const m of line.matchAll(MARKUP)) {
      if (m[3]) clauses.add(m[3]);
      else words.add(m[1]);
    }
  }
  for (const w of Object.values(text.words)) clauses.add(w.clause);
  return { words: [...words].sort(), clauses: [...clauses].sort() };
}

/** Where a clause of the story's terms lives. */
export const clauseHref = (clause: string) => `/terms?version=${STORY_TERMS}#t-${clause.replace(".", "-")}`;
