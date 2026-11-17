import { test } from "node:test";
import assert from "node:assert/strict";
import { translate } from "@tollbooth-dpyc/web";
import { registerCommission, say, WORDS, type Translate } from "../i18n/index.ts";
import { byReward, rubricFrom, starterRows, topSats , lateFrom } from "./rubric.ts";

await registerCommission();
const t: Translate = (key, vars) => translate(key, vars, WORDS);
const STARTER_ROWS = starterRows(t);

test("the starter rows make a rubric worth 1000 sats at most", () => {
  const made = rubricFrom(STARTER_ROWS);
  assert.ok("rubric" in made);
  assert.equal(topSats(made.rubric), 1000);
  assert.deepEqual(made.rubric.grades.map((g) => g.sats), [1000, 500, 0]);
  assert.deepEqual(made.rubric.grades.map((g) => g.name), ["Accepted", "Accepted with changes", "Not accepted"]);
});

test("blank rows are dropped, and a form of only blank rows is refused", () => {
  const made = rubricFrom([{ name: "Done", sats: "250", criteria: "" }, { name: " ", sats: "", criteria: "x" }]);
  assert.ok("rubric" in made);
  assert.equal(made.rubric.grades.length, 1);
  assert.deepEqual(rubricFrom([{ name: "", sats: "", criteria: "" }]), { problem: { key: "rubric.needOne" } });
});

test("sats must be a whole number that is not negative", () => {
  for (const sats of ["-5", "1.5", "lots", "1e3", ""]) {
    const made = rubricFrom([{ name: "Done", sats, criteria: "" }]);
    assert.ok("problem" in made, sats);
  }
});

test("two grades cannot share a name, whatever the capitals", () => {
  const made = rubricFrom([{ name: "Done", sats: "1", criteria: "" }, { name: "done", sats: "2", criteria: "" }]);
  assert.deepEqual(made, { problem: { key: "rubric.twoNamed", vars: { name: "done" } } });
  assert.equal("problem" in made && say(t, made.problem), 'Two grades are named "done".');
});

test("a grade worth more than the Operator allows is refused here first", () => {
  assert.ok("problem" in rubricFrom([{ name: "Done", sats: "100000001", criteria: "" }]));
  assert.ok("rubric" in rubricFrom([{ name: "Done", sats: "100000000", criteria: "" }]));
});

test("rewards read highest first without changing the rubric", () => {
  const grades = [{ name: "b", sats: 1, criteria: "" }, { name: "a", sats: 9, criteria: "" }];
  assert.deepEqual(byReward(grades).map((g) => g.name), ["a", "b"]);
  assert.equal(grades[0].name, "b");
});

test("the late choice is checked before it is sent", () => {
  assert.deepEqual(lateFrom("full", "abc"), { late: { kind: "full" } });
  assert.deepEqual(lateFrom("cancel", ""), { late: { kind: "cancel" } });
  assert.deepEqual(lateFrom("discount", " 15 "), { late: { kind: "discount", pct_per_day: 15 } });
  for (const bad of ["0", "101", "", "ten", "1.5", "-5"]) assert.ok("problem" in lateFrom("discount", bad), bad);
});
