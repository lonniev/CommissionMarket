import { test } from "node:test";
import assert from "node:assert/strict";
import { datesOf, fill, STORY_CLOCK } from "./timeline.ts";

test("the story's clock gives the arbiter a week before the refund date", () => {
  const d = datesOf(STORY_CLOCK);
  assert.deepEqual([d.deliveryDate, d.graded, d.appealed, d.late, d.refund], [30, 37, 44, 38, 51]);
  assert.equal(d.arbiterDays, 7);
});

test("a short refund date lets the client act before the appeal is settled", () => {
  assert.equal(datesOf({ ...STORY_CLOCK, refundDays: 14 }).arbiterDays, 0);
  const d = datesOf({ ...STORY_CLOCK, refundDays: 5 });
  assert.equal(d.refund, 35);
  assert.equal(d.arbiterDays, -9);
  assert.ok(d.end > d.appealed);
});

test("a phrase takes its number", () => {
  assert.equal(fill("day {n}", 51), "day 51");
});
