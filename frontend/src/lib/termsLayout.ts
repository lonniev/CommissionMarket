/**
 * The Standard Terms laid out for reading. Task Booth keeps them as plain
 * lines: a title, then "N. Heading" and "N.M clause". This only finds that
 * shape; every word stays exactly as hashed.
 */

export interface Clause { number: string; text: string }
export interface Section { number: string; heading: string; clauses: Clause[] }
export interface TermsLayout { title: string; sections: Section[] }

const SECTION = /^(\d+)\. (.+)$/;
const CLAUSE = /^(\d+\.\d+) (.+)$/;

/** The sections and clauses, or null when the text has some other shape. */
export function layoutTerms(text: string): TermsLayout | null {
  const lines = text.split("\n");
  const title = lines[0]?.trim() ?? "";
  const sections: Section[] = [];
  for (const raw of lines.slice(1)) {
    const line = raw.trimEnd();
    if (!line) continue;
    const s = SECTION.exec(line);
    const c = CLAUSE.exec(line);
    const current = sections[sections.length - 1];
    if (s) sections.push({ number: s[1], heading: s[2], clauses: [] });
    else if (c && current && c[1].startsWith(`${current.number}.`)) current.clauses.push({ number: c[1], text: c[2] });
    else return null;
  }
  return sections.length ? { title, sections } : null;
}

export type Piece =
  | { kind: "text"; text: string }
  | { kind: "defined"; text: string }
  | { kind: "ref"; text: string; target: string };

const REFS = /\bsections? \d+(?:\.\d+)?(?:(?:, | and | or )\d+(?:\.\d+)?)*/g;
// A defined term is a quoted capitalised name ("Client"); a quoted "none" is just words.
const DEFINED = /"[A-Z][^"]*"/g;

/** A clause cut into plain words, defined terms ("Client") and section references. */
export function clausePieces(text: string): Piece[] {
  const pieces: Piece[] = [];
  const plain = (part: string) => {
    let at = 0;
    for (const m of part.matchAll(DEFINED)) {
      if (m.index! > at) pieces.push({ kind: "text", text: part.slice(at, m.index) });
      pieces.push({ kind: "defined", text: m[0] });
      at = m.index! + m[0].length;
    }
    if (at < part.length) pieces.push({ kind: "text", text: part.slice(at) });
  };
  let at = 0;
  for (const m of text.matchAll(REFS)) {
    plain(text.slice(at, m.index));
    let inner = 0;
    for (const n of m[0].matchAll(/\d+(?:\.\d+)?/g)) {
      if (n.index! > inner) pieces.push({ kind: "text", text: m[0].slice(inner, n.index) });
      pieces.push({ kind: "ref", text: n[0], target: anchorFor(n[0]) });
      inner = n.index! + n[0].length;
    }
    if (inner < m[0].length) pieces.push({ kind: "text", text: m[0].slice(inner) });
    at = m.index! + m[0].length;
  }
  plain(text.slice(at));
  return pieces;
}

/** The page anchor for a section ("6") or a clause ("6.16"). */
export const anchorFor = (number: string) => `t-${number.replace(".", "-")}`;
