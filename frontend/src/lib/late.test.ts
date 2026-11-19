import { test } from "node:test";
import assert from "node:assert/strict";
import { translate } from "@tollbooth-dpyc/web";
import { registerCommission, say, WORDS, type Translate } from "../i18n/index.ts";
import { failFrom, failSaid, failSummary, rowOf, starterSteps, stepRowsOf, stepsFrom } from "./late.ts";
import { lateFrom } from "./rubric.ts";
import { blankCover, coverFrom, failHoursOf, leastRefundDays } from "./cover.ts";

await registerCommission();
const t: Translate = (key, vars) => translate(key, vars, WORDS);
const keyOf = (r: object) => ("problem" in r ? (r as { problem: { key: string } }).problem.key : "");

test("late steps go to Task Booth in hours, rising in both hours and percent", () => {
  assert.deepEqual(stepsFrom(starterSteps()), { steps: [{ after_hours: 0, pct_off: 10 }, { after_hours: 72, pct_off: 25 }] });
  assert.deepEqual(stepsFrom([{ after: "5", unit: "hours", pct: "5" }]), { steps: [{ after_hours: 5, pct_off: 5 }] });
  assert.equal(keyOf(stepsFrom([])), "late.needSteps");
  assert.equal(keyOf(stepsFrom([{ after: "x", unit: "days", pct: "5" }])), "late.needSteps");
  assert.equal(keyOf(stepsFrom([{ after: "1", unit: "days", pct: "101" }])), "late.needSteps");
  assert.equal(keyOf(stepsFrom([{ after: "2", unit: "days", pct: "10" }, { after: "48", unit: "hours", pct: "20" }])), "late.stepsRise");
  assert.equal(keyOf(stepsFrom([{ after: "1", unit: "days", pct: "30" }, { after: "2", unit: "days", pct: "20" }])), "late.stepsRise");
  assert.equal(keyOf(stepsFrom(Array.from({ length: 7 }, (_, i) => ({ after: String(i), unit: "days" as const, pct: String(i + 1) })))), "late.stepsTooMany");
  assert.deepEqual(lateFrom("steps", "", starterSteps()), { late: { kind: "steps", steps: [{ after_hours: 0, pct_off: 10 }, { after_hours: 72, pct_off: 25 }] } });
});

test("hours read back as days when they are whole days", () => {
  assert.deepEqual(rowOf(72), { after: "3", unit: "days" });
  assert.deepEqual(rowOf(5), { after: "5", unit: "hours" });
  assert.deepEqual(stepRowsOf([{ after_hours: 24, pct_off: 10 }]), [{ after: "1", unit: "days", pct: "10" }]);
});

test("the failure point comes after the last step and within a year", () => {
  assert.deepEqual(failFrom("7", "days"), { hours: 168 });
  assert.deepEqual(failFrom("10", "hours"), { hours: 10 });
  assert.equal(keyOf(failFrom("0", "days")), "late.needFail");
  assert.equal(keyOf(failFrom("366", "days")), "late.needFail");
  assert.equal(keyOf(failFrom("3", "days", [{ after_hours: 72, pct_off: 25 }])), "late.failAfterSteps");
  assert.deepEqual(failFrom("73", "hours", [{ after_hours: 72, pct_off: 25 }]), { hours: 73 });
});

test("the cover page carries the failure point, and the refund floor counts from it", () => {
  const made = coverFrom({ ...blankCover(), deliverables: "One", failAfter: "10", failUnit: "hours" }, ["Done"]);
  assert.ok("cover" in made && made.cover.fail_after_hours === 10);
  assert.equal(keyOf(coverFrom({ ...blankCover(), deliverables: "One", failAfter: "1", failUnit: "days" }, ["Done"], [{ after_hours: 24, pct_off: 5 }])),
    "late.failAfterSteps");
  assert.equal(failHoursOf(blankCover()), 168);
  assert.equal(leastRefundDays(7, 168), 28);
  assert.equal(leastRefundDays(7, 10), 22);
});

test("the failure point is said in the unit it was set in", () => {
  assert.equal(say(t, failSaid(168)), "Failure to deliver after 7 days late.");
  assert.equal(say(t, failSaid(1)), "Failure to deliver after 1 hour late.");
  assert.equal(say(t, failSummary(48)), "fails after 2 days");
});
