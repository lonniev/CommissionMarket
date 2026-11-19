/**
 * A rank for each role an npub has held, from the counts Task Booth reports, against the
 * thresholds its operator set. Task Booth reports facts; this page judges them. Pure.
 */

import type { RankThresholds, Reputation } from "./tasks.ts";

export type RepRole = "client" | "artist" | "arbiter" | "inspector";

export const REP_ROLES: RepRole[] = ["client", "artist", "arbiter", "inspector"];

/** "none": never in this role. "new": too few finished to judge. */
export type Rank = "none" | "new" | "uneven" | "proven" | "trusted" | "exemplary";

export interface RoleStanding {
  rank: Rank;
  /** How many were finished in this role, and how many of those went well. */
  finished: number;
  good: number;
}

/** What counts as finished, and as going well, in each role. */
function counts(rep: Reputation, role: RepRole): { held: number; finished: number; good: number } {
  switch (role) {
    case "client": {
      const c = rep.client;
      // Each grade given and each award owed: graded in time, and paid.
      return { held: c.commissions, finished: c.graded + c.owed, good: c.graded_in_time + c.paid };
    }
    case "artist": {
      const a = rep.artist;
      // Delivered on time, without an appeal lost; a failure without cause counts against.
      return { held: a.commissions, finished: a.delivered + a.failed_without_cause, good: Math.max(0, a.on_time - a.appeals_lost) };
    }
    case "arbiter":
      return { held: rep.arbiter.named, finished: rep.arbiter.decided, good: rep.arbiter.decided_in_time };
    case "inspector":
      return { held: rep.inspector.named, finished: rep.inspector.opinions, good: rep.inspector.opinions_in_time };
  }
}

export function rankOf(finished: number, good: number, r: RankThresholds): Exclude<Rank, "none"> {
  if (finished < r.rank_min_finished) return "new";
  const pct = (100 * good) / finished;
  if (finished >= r.rank_exemplary_finished && pct >= r.rank_exemplary_pct) return "exemplary";
  if (finished >= r.rank_trusted_finished && pct >= r.rank_trusted_pct) return "trusted";
  if (pct >= r.rank_proven_pct) return "proven";
  return "uneven";
}

export function standingIn(rep: Reputation, role: RepRole): RoleStanding {
  const { held, finished, good } = counts(rep, role);
  return { rank: held ? rankOf(finished, good, rep.ranks) : "none", finished, good: Math.min(good, finished) };
}
