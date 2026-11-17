import { test } from "node:test";
import assert from "node:assert/strict";
import { aheadPct, fiatOf, owedAfter, paidAhead, shareOf, withinCap } from "./money.ts";

test("a share of the top grade rounds down, as Task Booth fixes it", () => {
  assert.equal(shareOf(1_000, 10), 100);
  assert.equal(shareOf(999, 10), 99);
  assert.equal(shareOf(1_000, 0), 0);
  assert.equal(shareOf(0, 40), 0);
});

test("only what the professional confirmed counts as paid ahead", () => {
  const deposit = { sats: 100, paid_at: 1 };
  assert.equal(paidAhead(deposit, [{ sats: 400, paid_at: 2 }, { sats: 300 }]), 500);
  assert.equal(paidAhead(null, [{ sats: 400 }]), 0);
});

test("the Rothbard commission: deposit 9%, a 45% milestone, then the grade", () => {
  const top = 1_100_000;
  const deposit = { sats: shareOf(top, 9), paid_at: 1 };
  const milestone = { sats: shareOf(top, 45), paid_at: 2 };
  assert.equal(deposit.sats, 99_000);
  assert.equal(milestone.sats, 495_000);
  const ahead = paidAhead(deposit, [milestone]);
  assert.equal(owedAfter(top, ahead), 506_000);
  // Judged an abomination at half: less than was paid ahead, so nothing more, and nothing back.
  assert.equal(owedAfter(550_000, ahead), 0);
});

test("the deposit and milestones together stop at 90% of the top grade", () => {
  assert.equal(aheadPct(10, [40, 20]), 70);
  assert.ok(withinCap(10, [40, 40]));
  assert.ok(!withinCap(10, [40, 41]));
});

test("sats are worth their share of a bitcoin's price", () => {
  assert.equal(fiatOf(100_000_000, 90_000), 90_000);
  assert.equal(fiatOf(1_000, 100_000), 1);
});
