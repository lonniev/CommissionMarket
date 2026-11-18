import { test } from "node:test";
import assert from "node:assert/strict";
import { blankCover } from "./cover.ts";
import { budgetLeft, budgetShare, coverFromDefaults, defaultsFromCover, satsFrom } from "./orgs.ts";

test("a budget shows what is left after what was committed, and how full it is", () => {
  assert.equal(budgetLeft(500_000, { committed_sats: 100_000 }), 400_000);
  assert.equal(budgetLeft(0, { committed_sats: 100_000 }), null);
  assert.equal(budgetLeft(50_000, { committed_sats: 100_000 }), -50_000);
  assert.equal(budgetShare(500_000, 100_000), 0.2);
  assert.equal(budgetShare(0, 100_000), 0);
});

test("a Project's defaults start a new commission's cover page, and come back unchanged", () => {
  const defaults = { deemed_acceptance_days: 21, ip_option: "license" as const, confidential: true, governing_law: "Texas", venue: "Austin" };
  const rows = coverFromDefaults(blankCover(), defaults);
  assert.equal(rows.deemedDays, "21");
  assert.equal(rows.ip, "license");
  assert.equal(rows.confidential, true);
  assert.equal(rows.law, "Texas");
  assert.deepEqual(defaultsFromCover(rows, blankCover()), defaults);
  assert.deepEqual(defaultsFromCover(blankCover(), blankCover()), {});
  assert.deepEqual(coverFromDefaults(blankCover(), {}), blankCover());
});

test("sats are whole numbers", () => {
  assert.equal(satsFrom(" 500000 "), 500_000);
  assert.ok(Number.isNaN(satsFrom("5e5")));
  assert.ok(Number.isNaN(satsFrom("-1")));
});

test("a Project's arbiter is kept as a default and fills each new commission", () => {
  const arbiter = "npub1als8rt5rt8wjy5rse3ml67yehdchtxz3uclxv3qvqy8g4ldscrdql22drx";
  const d = defaultsFromCover({ ...blankCover(), arbiter }, blankCover());
  assert.equal(d.arbiter_npub, arbiter);
  assert.equal(coverFromDefaults(blankCover(), d).arbiter, arbiter);
  assert.equal(defaultsFromCover(blankCover(), blankCover()).arbiter_npub, undefined);
});
