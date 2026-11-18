import { test } from "node:test";
import assert from "node:assert/strict";
import { translate } from "@tollbooth-dpyc/web";
import { registerCommission, say, WORDS, type Translate } from "../i18n/index.ts";
import { dayFrom, dueText as dueSaid, endOfDay, lateRuleText, lateText as lateTextSaid } from "./when.ts";

// As a page says them, in English.
await registerCommission();
const t: Translate = (key, vars) => translate(key, vars, WORDS);
const dueText = (neededBy: number, now: number) => say(t, dueSaid(neededBy, now));

const noon = (y: number, m: number, d: number) => Math.floor(new Date(y, m - 1, d, 12).getTime() / 1000);

test("due times read as days from today", () => {
  const now = noon(2026, 11, 15);
  assert.equal(dueText(endOfDay("2026-11-15")!, now), "today");
  assert.equal(dueText(endOfDay("2026-11-16")!, now), "tomorrow");
  assert.equal(dueText(endOfDay("2026-11-18")!, now), "in 3 days");
  assert.equal(dueText(endOfDay("2026-11-14")!, now), "yesterday");
  assert.equal(dueText(endOfDay("2026-11-11")!, now), "4 days ago");
});

test("a commission due late tonight is still due today early this morning", () => {
  const early = Math.floor(new Date(2026, 10, 15, 0, 5).getTime() / 1000);
  assert.equal(dueText(endOfDay("2026-11-15")!, early), "today");
});

test("the end of a day is its last second, and a day that does not exist is refused", () => {
  const end = new Date(endOfDay("2026-11-15")! * 1000);
  assert.deepEqual([end.getDate(), end.getHours(), end.getMinutes(), end.getSeconds()], [15, 23, 59, 59]);
  assert.equal(endOfDay("2026-02-30"), null);
  assert.equal(endOfDay("tomorrow"), null);
});

test("a date field's day crosses a month end", () => {
  assert.equal(dayFrom(noon(2026, 11, 29), 2), "2026-12-01");
  assert.equal(dayFrom(noon(2026, 11, 15), 0), "2026-11-15");
});

test("what is said is a message and its numbers, so any language can say it", () => {
  const now = noon(2026, 11, 15);
  assert.deepEqual(dueSaid(endOfDay("2026-11-18")!, now), { key: "due.inDays", vars: { days: 3 } });
  assert.deepEqual(dueSaid(endOfDay("2026-11-11")!, now), { key: "due.daysAgo", vars: { days: 4 } });
});

test("lateness is said in days, and on time says nothing", () => {
  assert.equal(lateTextSaid(0), null);
  assert.deepEqual(lateTextSaid(1), { key: "late.days", vars: { count: 1 } });
  assert.equal(say(t, lateTextSaid(1)), "1 day late");
  assert.equal(say(t, lateTextSaid(3)), "3 days late");
});

test("a commission says what lateness costs", () => {
  const rule = (r: Parameters<typeof lateRuleText>[0]) => lateRuleText(r).map((x) => say(t, x)).join(" ");
  assert.equal(rule({ kind: "full" }), "Late work is paid in full.");
  assert.equal(rule({ kind: "discount", pct_per_day: 10 }), "Each day late takes 10% off.");
  assert.equal(rule({ kind: "cancel" }), "Cancelled if not delivered by the needed-by day.");
  assert.equal(rule(undefined), "Late work is paid in full.");
  assert.equal(rule({ kind: "steps", steps: [{ after_hours: 0, pct_off: 10 }, { after_hours: 72, pct_off: 25 }, { after_hours: 100, pct_off: 50 }] }),
    "10% off once late. 25% off after 3 days late. 50% off after 100 hours late.");
});
