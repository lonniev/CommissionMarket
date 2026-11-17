import { test } from "node:test";
import assert from "node:assert/strict";
import { dayKey, grouped, matches, monthWeeks, shiftMonth, type Browsable } from "./browse.ts";

const job = (over: Partial<Browsable>): Browsable => ({
  task_id: "t", title: "A portrait", description: "", purchaser: "npub1client", performer: null, standing: "posted", needed_by: 100, ...over,
});
const name = (npub: string) => ({ npub1client: "the client", npub1painter: "the painter" })[npub] ?? npub;
const said = (s: string) => ({ posted: "Open", claimed: "In progress" })[s] ?? s;

test("every word searched for is found in the title, brief, people or standing", () => {
  const t = job({ title: "Paint a portrait of Murray Rothbard", description: "For the new Library", performer: "npub1painter", standing: "claimed" });
  assert.ok(matches(t, "", name, said));
  assert.ok(matches(t, "rothbard library", name, said));
  assert.ok(matches(t, "PAINTER progress", name, said));
  assert.ok(matches(t, "npub1client", name, said));
  assert.ok(!matches(t, "rothbard sculpture", name, said));
});

test("by due is one section, soonest first; by person and by state, a section each", () => {
  const a = job({ task_id: "a", needed_by: 300, performer: "npub1painter", standing: "claimed" });
  const b = job({ task_id: "b", needed_by: 100 });
  const c = job({ task_id: "c", needed_by: 200, standing: "claimed", performer: "npub1painter" });
  assert.deepEqual(grouped([a, b, c], "due", name).map((g) => g.rows.map((r) => r.task_id)), [["b", "c", "a"]]);
  assert.deepEqual(grouped([a, b, c], "person", name).map((g) => [g.key, g.rows.map((r) => r.task_id)]),
    [["npub1painter", ["c", "a"]], ["npub1client", ["b"]]].sort((x, y) => name(x[0] as string).localeCompare(name(y[0] as string))));
  assert.deepEqual(grouped([a, b, c], "state", said).map((g) => g.key), ["claimed", "posted"]);
  assert.deepEqual(grouped([], "due", name), []);
});

test("a month is whole weeks from Sunday, and months step across years", () => {
  const weeks = monthWeeks(2026, 10); // November 2026 starts on a Sunday
  assert.equal(weeks[0][0].key, "2026-11-01");
  assert.ok(weeks.every((w) => w.length === 7));
  assert.ok(weeks.flat().filter((d) => d.inMonth).length === 30);
  assert.deepEqual(shiftMonth(2026, 11, 1), { year: 2027, month: 0 });
  assert.deepEqual(shiftMonth(2026, 0, -1), { year: 2025, month: 11 });
  assert.equal(dayKey(new Date(2026, 10, 17, 12).getTime() / 1000), "2026-11-17");
});
