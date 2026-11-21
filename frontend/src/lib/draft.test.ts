import { test } from "node:test";
import assert from "node:assert/strict";
import { asksWhen, gradeRowsOf, milestoneRowsOf, openPointsOf, proposalsOf, withAnswers, type Draft } from "./draft.ts";
import { dayFrom } from "./when.ts";

const NOW = Math.floor(new Date(2026, 10, 21, 9).getTime() / 1000);

const draft = (over: Partial<Draft["proposed"]> = {}): Draft => ({
  said: { title: "A table", brief: "A walnut table.", deliverables: ["A table"], needed_by: null },
  proposed: { grades: [{ name: "Accepted", amount: 4000, sats: 5_000_000, criteria: "As agreed" },
    { name: "Not accepted", amount: 0, sats: 0, criteria: "" }], ...over },
  questions: ["What size?"],
  assumptions: ["“96” is not in what you wrote; check it."],
  currency: "USD",
});

test("proposed grades become rubric rows in sats", () => {
  assert.deepEqual(gradeRowsOf(draft().proposed.grades), [
    { name: "Accepted", sats: "5000000", criteria: "As agreed" },
    { name: "Not accepted", sats: "0", criteria: "" },
  ]);
});

test("a proposed milestone is dated its days from now", () => {
  assert.deepEqual(milestoneRowsOf([{ name: "Top glued", pct: 30, after_days: 30 }], NOW),
    [{ name: "Top glued", day: dayFrom(NOW, 30), pct: "30" }]);
});

test("every question and assumption is a point to settle, questions first", () => {
  assert.deepEqual(openPointsOf(draft()).map((p) => p.kind), ["question", "assumption"]);
});

test("only the proposals a draft carries are offered", () => {
  assert.deepEqual(proposalsOf(draft()), ["grades"]);
  assert.deepEqual(proposalsOf(draft({ deposit_pct: 0, milestones: [], deemed_days: 14, ip_option: "assign" })),
    ["grades", "deposit", "deemed", "ip"]);
  assert.deepEqual(proposalsOf(draft({ grades: [], deposit_pct: null, ip_option: null })), []);
});

test("answers become the brief's last section, rewritten whole", () => {
  const once = withAnswers("A walnut table.", [{ point: "What size?", answer: "6 ft by 3 ft" }], "Details");
  assert.equal(once, "A walnut table.\n\n### Details\n\n- What size? **6 ft by 3 ft**\n");
  const edited = once.replace("A walnut table.", "A walnut dining table.");
  assert.equal(withAnswers(edited, [{ point: "What size?", answer: "7 ft" }, { point: "Finish?", answer: "" }], "Details"),
    "A walnut dining table.\n\n### Details\n\n- What size? **7 ft**\n");
  assert.equal(withAnswers(once, [], "Details"), "A walnut table.");
});

test("only a question that begins with When asks for the due date", () => {
  assert.ok(asksWhen("When do you need it?"));
  assert.ok(asksWhen("when should it be done?"));
  assert.ok(!asksWhen("Whenever is fine?"));
  assert.ok(!asksWhen("Do you need it delivered, and when?"));
});
