import assert from "node:assert/strict";
import { it } from "node:test";
import { named } from "./review.ts";
import type { Task } from "./tasks.ts";

const task = {
  purchaser: "npub1client", performer: null, audience: ["npub1pro", "npub1arb"], tie_breaker: "npub1tie",
  cover: { arbiter_npub: "npub1arb", inspector_npub: "" },
} as unknown as Task;

it("names each person once, under their first part, and never you", () => {
  assert.deepEqual(named(task, "npub1client"), [
    { npub: "npub1pro", role: "review.invited" },
    { npub: "npub1arb", role: "review.invited" },
    { npub: "npub1tie", role: "review.tieBreaker" },
  ]);
  assert.equal(named(task, "npub1other")[0].npub, "npub1client");
});
