/**
 * A commission's money, as Task Booth counts it. Every figure is whole sats.
 *
 * The client pays ahead (a deposit on claim, then each milestone as it falls
 * due) and what was paid ahead comes off the graded award. Nothing paid ahead
 * is ever taken back: a grade worth less leaves nothing owed.
 */

/** The deposit and the milestones together ask for at most this share of the top grade. */
export const MAX_AHEAD_PCT = 90;
/** At most this many milestones. */
export const MAX_MILESTONES = 6;

/** `pct` of the top grade, rounded down, as Task Booth fixes it on claim. */
export const shareOf = (topSats: number, pct: number): number =>
  pct <= 0 || topSats <= 0 ? 0 : Math.floor((topSats * Math.min(pct, MAX_AHEAD_PCT)) / 100);

/** Something paid ahead: the deposit or one milestone, once a claim fixed its sats. */
export interface Ahead {
  sats?: number;
  paid_at?: number | null;
}

/** What the professional confirmed arrived before grading. */
export const paidAhead = (deposit: Ahead | null | undefined, milestones: Ahead[]): number =>
  [deposit ?? {}, ...milestones].reduce((sum, a) => sum + (a.paid_at ? a.sats ?? 0 : 0), 0);

/** What a grade still owes once what was paid ahead comes off it. Never below nothing. */
export const owedAfter = (earned: number, ahead: number): number => Math.max(0, earned - ahead);

/** The share of the top grade the deposit and milestones ask for together. */
export const aheadPct = (depositPct: number, milestonePcts: number[]): number =>
  depositPct + milestonePcts.reduce((sum, p) => sum + p, 0);

/** Whether that share leaves room for the grade to decide the rest. */
export const withinCap = (depositPct: number, milestonePcts: number[]): boolean =>
  aheadPct(depositPct, milestonePcts) <= MAX_AHEAD_PCT;

/** What `sats` is worth in a currency, given what one bitcoin costs in it. */
export const fiatOf = (sats: number, pricePerBitcoin: number): number => (sats / 100_000_000) * pricePerBitcoin;
