/**
 * What is known about a Cashu escrow mint, and the owner's rule for a shortlist.
 *
 * Task Booth reports facts from three sources, each with when it was seen: the
 * mint's own word, cashumints.space, and the Round Robin Auditor. It also
 * reports the Operator's own live lock test there. It judges nothing; this file
 * does, by the owner's rule:
 *
 *   - the mint claims every NUT an escrow needs (7, 8, 11, 12, 20);
 *   - 99% uptime or better over 30 days;
 *   - three months or more on the auditor with no failed swap. When the
 *     auditor cannot be reached, a mint still qualifies, marked so;
 *   - and no failed live lock test.
 *
 * Review counts are shown, never stars.
 */

export const LEAST_UPTIME = 0.99;
export const CLEAN_DAYS = 90;
const DAY = 86_400;

interface Seen {
  source: string;
  observed_at: number;
  unreachable?: string;
}

export interface MintFacts {
  url: string;
  mint: Seen & {
    name?: string;
    version?: string;
    icon_url?: string;
    nuts?: string[];
    missing_escrow_nuts?: string[];
    description?: string;
    description_long?: string;
    motd?: string;
    pubkey?: string;
    tos_url?: string;
    contact?: { method: string; info: string }[];
  };
  cashumints: Seen & {
    listed?: boolean;
    page_url?: string;
    status?: string;
    uptime_30d?: number | null;
    first_seen?: number | null;
    reviews?: number;
    latest_review_at?: number | null;
    icon_url?: string;
  };
  auditor: Seen & {
    tracked?: boolean;
    swaps?: number;
    failed?: number;
    failed_90d?: number;
    tracked_since?: number | null;
    clean_since?: number | null;
    last_failure_at?: number | null;
    last_error?: string;
  };
  live_test: (MintTest & { verdict: Verdict }) | null;
}

export type Verdict = "passed" | "failed" | "unfinished";

export interface MintTestItem {
  npub: string;
  what: "fund" | "proposal" | "collect";
  sign_digest: string;
  most: number;
  parts: {
    kind: "mint_quote" | "swap" | "melt";
    inputs: { amount: number; secret: string; C: string }[];
    outputs: { amount: number; B_: string }[];
    quote: string;
  };
}

export interface MintTest {
  test_id: string;
  mint: string;
  sats: number;
  state: "invoiced" | "funded" | "spent" | "done" | "stopped";
  started_at: number;
  finished_at?: number;
  checks: Record<string, string>;
  returned_sats?: number;
  change_sats?: number;
  invoice?: string;
  expires_at?: number;
  stopped?: string;
  verdict?: Verdict;
  sign?: MintTestItem[];
}

/** Why a mint is short of the rule, or a note beside a mint that meets it. Each is an i18n key's tail. */
export type Mark =
  | "mintNotReached" | "missingNuts" | "uptimeUnknown" | "uptimeLow" | "auditorNotReached" | "notAudited"
  | "auditFailing" | "auditShort" | "testFailed" | "testPassed";

export interface Judged {
  meets: boolean;
  /** What keeps it off the shortlist; empty when it meets the rule. */
  short: Mark[];
  /** Notes beside it either way: the auditor not reached, a passed test. */
  notes: Mark[];
  /** Days since the auditor's clean run began, when known. */
  cleanDays: number | null;
}

/** The owner's rule, applied to one mint's facts at `now` (Unix seconds). */
export function judge(f: MintFacts, now: number): Judged {
  const short: Mark[] = [];
  const notes: Mark[] = [];
  if (f.mint.unreachable) short.push("mintNotReached");
  else if (f.mint.missing_escrow_nuts?.length) short.push("missingNuts");

  const up = f.cashumints.uptime_30d;
  if (f.cashumints.unreachable || !f.cashumints.listed || typeof up !== "number") short.push("uptimeUnknown");
  else if (up < LEAST_UPTIME) short.push("uptimeLow");

  const a = f.auditor;
  const cleanDays = a.clean_since ? Math.floor((now - a.clean_since) / DAY) : null;
  if (a.unreachable) notes.push("auditorNotReached");
  else if (!a.tracked || !a.swaps) short.push("notAudited");
  else if (cleanDays === null) short.push("auditFailing");
  else if (cleanDays < CLEAN_DAYS) short.push("auditShort");

  if (f.live_test?.verdict === "failed") short.push("testFailed");
  else if (f.live_test?.verdict === "passed") notes.push("testPassed");
  return { meets: short.length === 0, short, notes, cleanDays };
}

/** Mints that meet the rule first, then the longest clean record, then the best uptime. */
export function ranked(all: MintFacts[], now: number): { facts: MintFacts; judged: Judged }[] {
  return all
    .map((facts) => ({ facts, judged: judge(facts, now) }))
    .sort((x, y) =>
      Number(y.judged.meets) - Number(x.judged.meets)
      || (y.judged.cleanDays ?? -1) - (x.judged.cleanDays ?? -1)
      || (y.facts.cashumints.uptime_30d ?? 0) - (x.facts.cashumints.uptime_30d ?? 0)
      || x.facts.url.localeCompare(y.facts.url));
}

/** A mint's display name: its own, else its host. */
export function mintName(f: Pick<MintFacts, "url" | "mint">): string {
  return f.mint.name || hostOf(f.url);
}

export function hostOf(url: string): string {
  try {
    const u = new URL(url);
    return u.host + (u.pathname === "/" ? "" : u.pathname);
  } catch {
    return url;
  }
}

/** The icon to show: the mint's own https icon, else cashumints.space's copy. */
export const mintIcon = (f: MintFacts): string => f.mint.icon_url || f.cashumints.icon_url || "";

/** An uptime fraction as a percent with one decimal: 0.995 → "99.5%". */
export const percent = (fraction: number): string => `${(Math.floor(fraction * 1000) / 10).toFixed(1)}%`;

/** The offered list with one mint added or taken away, as the property stores it. */
export function withMint(offered: string[], url: string, on: boolean): string[] {
  const rest = offered.filter((m) => m !== url);
  return on ? [...rest, url] : rest;
}

/** Mints whose name or address holds `query`, ignoring case; all of them for an empty query. */
export function matching<T extends { facts: Pick<MintFacts, "url" | "mint"> }>(rows: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(({ facts }) => facts.url.toLowerCase().includes(q) || (facts.mint.name ?? "").toLowerCase().includes(q));
}

/** One page of `rows`: `page` counts from 0 and is held inside the rows there are. */
export function pageOf<T>(rows: T[], page: number, size: number): { rows: T[]; page: number; pages: number; from: number; to: number } {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const at = Math.min(Math.max(0, page), pages - 1);
  const slice = rows.slice(at * size, at * size + size);
  return { rows: slice, page: at, pages, from: slice.length ? at * size + 1 : 0, to: at * size + slice.length };
}
