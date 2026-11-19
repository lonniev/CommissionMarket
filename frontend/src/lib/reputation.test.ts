import { test } from "node:test";
import assert from "node:assert/strict";
import { rankOf, standingIn } from "./reputation.ts";
import type { Reputation } from "./tasks.ts";

const verdicts = { verified: 0, concerns: 0, not_verified: 0 };
const ranks = { rank_min_finished: 3, rank_proven_pct: 75, rank_trusted_pct: 90, rank_trusted_finished: 10,
  rank_exemplary_pct: 95, rank_exemplary_finished: 20 };
const nobody: Reputation = {
  npub: "npub1x",
  client: { commissions: 0, graded: 0, graded_in_time: 0, owed: 0, paid: 0, appeals_lost: 0 },
  artist: { commissions: 0, delivered: 0, on_time: 0, late: 0, failed_without_cause: 0, failed_with_cause: 0,
    appeals_won: 0, appeals_lost: 0, grade_pct: null, verdicts },
  arbiter: { named: 0, signed: 0, decided: 0, decided_in_time: 0 },
  inspector: { named: 0, signed: 0, opinions: 0, opinions_in_time: 0, verdicts },
  ranks,
};

test("ranks rise with how much went well, and how much was finished", () => {
  assert.equal(rankOf(2, 2, ranks), "new");
  assert.equal(rankOf(4, 2, ranks), "uneven");
  assert.equal(rankOf(4, 3, ranks), "proven");
  assert.equal(rankOf(9, 9, ranks), "proven");
  assert.equal(rankOf(10, 9, ranks), "trusted");
  assert.equal(rankOf(20, 19, ranks), "exemplary");
  assert.equal(rankOf(20, 18, ranks), "trusted");
});

test("the operator's thresholds move where each rank begins", () => {
  const strict = { ...ranks, rank_min_finished: 5, rank_proven_pct: 90 };
  assert.equal(rankOf(4, 4, strict), "new");
  assert.equal(rankOf(5, 4, strict), "uneven");
  assert.equal(rankOf(5, 5, strict), "proven");
});

test("a role never held has no rank", () => {
  for (const role of ["client", "artist", "arbiter", "inspector"] as const) {
    assert.equal(standingIn(nobody, role).rank, "none");
  }
});

test("an artist's failure without cause and a lost appeal count against them", () => {
  const artist = { ...nobody.artist, commissions: 5, delivered: 4, on_time: 4, failed_without_cause: 1, appeals_lost: 1 };
  assert.deepEqual(standingIn({ ...nobody, artist }, "artist"), { rank: "uneven", finished: 5, good: 3 });
});

test("a client is judged on grading in time and paying", () => {
  const client = { commissions: 3, graded: 3, graded_in_time: 3, owed: 3, paid: 3, appeals_lost: 0 };
  assert.deepEqual(standingIn({ ...nobody, client }, "client"), { rank: "proven", finished: 6, good: 6 });
});
