import { test } from "node:test";
import assert from "node:assert/strict";
import { rankOf, standingIn } from "./reputation.ts";
import type { Reputation } from "./tasks.ts";

const verdicts = { verified: 0, concerns: 0, not_verified: 0 };
const nobody: Reputation = {
  npub: "npub1x",
  client: { commissions: 0, graded: 0, graded_in_time: 0, owed: 0, paid: 0, appeals_lost: 0 },
  artist: { commissions: 0, delivered: 0, on_time: 0, late: 0, failed_without_cause: 0, failed_with_cause: 0,
    appeals_won: 0, appeals_lost: 0, grade_pct: null, verdicts },
  arbiter: { named: 0, signed: 0, decided: 0, decided_in_time: 0 },
  inspector: { named: 0, signed: 0, opinions: 0, opinions_in_time: 0, verdicts },
};

test("ranks rise with how much went well, and how much was finished", () => {
  assert.equal(rankOf(2, 2), "new");
  assert.equal(rankOf(4, 2), "uneven");
  assert.equal(rankOf(4, 3), "proven");
  assert.equal(rankOf(9, 9), "proven");
  assert.equal(rankOf(10, 9), "trusted");
  assert.equal(rankOf(20, 19), "exemplary");
  assert.equal(rankOf(20, 18), "trusted");
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
