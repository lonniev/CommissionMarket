import { test } from "node:test";
import assert from "node:assert/strict";
import { eventsByDay, eventsOf } from "./calendar.ts";
import type { Task } from "./tasks.ts";

const at = (y: number, m: number, d: number) => Math.floor(new Date(y, m - 1, d, 12).getTime() / 1000);

const portrait = (over: Partial<Task>): Task => ({
  task_id: "rothbard", title: "Paint a portrait of Murray Rothbard for the new Library", description: "",
  rubric: [], purchaser: "npub1client", performer: "npub1painter", audience: ["npub1painter"], assessors: [], tie_breaker: "",
  standing: "claimed", final: false, your_roles: ["purchaser"], needed_by: at(2027, 3, 1), every_days: 0,
  created_at: at(2026, 11, 17), claimed_at: at(2026, 11, 20), late: { kind: "full" }, days_late: 0,
  deposit_pct: 10, deposit: { pct: 10, sats: 10_000, paid_at: at(2026, 11, 21) },
  milestones: [
    { name: "Sketch approved", due_at: at(2026, 12, 15), pct: 20, sats: 20_000, paid_at: at(2026, 12, 14) },
    { name: "Underpainting", due_at: at(2027, 1, 31), pct: 30, sats: 30_000 },
  ],
  cover: null, agreement: { purchaser_signed: true, performer_signed: true },
  ...over,
} as Task);

test("a commission in progress shows what happened and what falls due", () => {
  const kinds = eventsOf([portrait({})]).map((e) => [e.kind, e.milestone ?? ""]);
  assert.deepEqual(kinds, [
    ["posted", ""], ["claimed", ""], ["deposit", ""], ["milestonePaid", "Sketch approved"], ["milestoneDue", "Underpainting"], ["due", ""],
  ]);
});

test("a graded commission marks deemed acceptance, and nothing falls due once it is over", () => {
  const done = portrait({
    standing: "paid", final: true, accomplished_at: at(2027, 2, 20), paid_at: at(2027, 3, 10),
    assessment: { grade: "Accepted", sats: 40_000, assessor: "npub1client", reasons: "", at: at(2027, 3, 8), deemed: true },
  });
  const kinds = eventsOf([done]).map((e) => e.kind);
  assert.ok(kinds.includes("deemed") && !kinds.includes("graded"));
  assert.ok(!kinds.includes("milestoneDue"), "an unpaid milestone of a finished commission is not due");
  assert.ok(kinds.includes("due"), "the needed-by day stays on the month");
  assert.equal(eventsOf([portrait({ standing: "withdrawn" })]).filter((e) => e.kind === "due" || e.kind === "milestoneDue").length, 0);
  assert.equal(eventsOf([portrait({ days_late: 2 })]).at(-1)?.kind, "late");
  assert.equal(eventsOf([portrait({ standing: "missed" })]).at(-1)?.kind, "missed");
});

test("events are laid on their local days", () => {
  const days = eventsByDay(eventsOf([portrait({})]));
  assert.deepEqual(days.get("2026-11-17")?.map((e) => e.kind), ["posted"]);
  assert.equal(days.get("2027-03-01")?.[0].kind, "due");
});
