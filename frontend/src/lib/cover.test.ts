import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { aheadFrom, audienceFrom, blankCover, coverFrom, rowsOf } from "./cover.ts";
import { endOfDay } from "./when.ts";

const npub = () => nip19.npubEncode(getPublicKey(generateSecretKey()));

test("an audience is npubs, however they were pasted, each once", () => {
  const a = npub();
  const b = npub();
  const r = audienceFrom(`${a}\n${b}, ${a}`);
  assert.deepEqual("audience" in r && r.audience, [a, b]);
  assert.deepEqual(audienceFrom(""), { problem: { key: "form.needAudience" } });
  const bad = audienceFrom(`${a} nsec1notthis`);
  assert.ok("problem" in bad && bad.problem.key === "form.notAnNpub");
});

test("milestones fall due after today and by the needed-by day, soonest first", () => {
  const now = Math.floor(new Date(2026, 10, 17, 12).getTime() / 1000);
  const neededBy = endOfDay("2027-11-17")!;
  const r = aheadFrom("9", [
    { name: "Final study", day: "2027-09-01", pct: "20" },
    { name: "Half way", day: "2027-05-17", pct: "45" },
  ], neededBy, now);
  assert.ok("milestones" in r);
  assert.equal(r.deposit_pct, 9);
  assert.deepEqual(r.milestones.map((m) => m.name), ["Half way", "Final study"]);
  const late = aheadFrom("0", [{ name: "After", day: "2027-12-01", pct: "10" }], neededBy, now);
  assert.ok("problem" in late && late.problem.key === "form.milestoneBadDay");
});

test("the deposit and milestones together stop at 90%", () => {
  const now = Math.floor(new Date(2026, 10, 17, 12).getTime() / 1000);
  const r = aheadFrom("50", [{ name: "Draft", day: "2026-12-01", pct: "41" }], endOfDay("2027-01-01")!, now);
  assert.ok("problem" in r && r.problem.key === "form.aheadCap");
  assert.deepEqual(aheadFrom("", [], endOfDay("2027-01-01")!, now), { deposit_pct: 0, milestones: [] });
});

test("a cover page needs a deliverable, an https spec and a real sha256", () => {
  const grades = ["Accepted", "Not accepted"];
  const ok = coverFrom({ ...blankCover(), deliverables: "One painting\n\nFramed", deemedGrade: "Accepted" }, grades);
  assert.ok("cover" in ok);
  assert.deepEqual(ok.cover.deliverables, ["One painting", "Framed"]);
  assert.equal(ok.cover.deemed_acceptance_days, 14);
  const keyOf = (r: ReturnType<typeof coverFrom>) => ("problem" in r ? r.problem.key : "");
  assert.equal(keyOf(coverFrom(blankCover(), grades)), "form.needDeliverable");
  assert.equal(keyOf(coverFrom({ ...blankCover(), deliverables: "x", specUrl: "http://a" }, grades)), "form.badSpecUrl");
  assert.equal(keyOf(coverFrom({ ...blankCover(), deliverables: "x", specHash: "ab" }, grades)), "form.badSpecHash");
  assert.equal(keyOf(coverFrom({ ...blankCover(), deliverables: "x", deemedGrade: "Gone" }, grades)), "form.badDeemedGrade");
  assert.equal(keyOf(coverFrom({ ...blankCover(), deliverables: "x", ip: "custom" }, grades)), "form.needIpCustom");
});

test("a cover page reads back into the form unchanged", () => {
  const made = coverFrom({ ...blankCover(), deliverables: "A\nB", ip: "license", law: "Texas" }, ["Done"]);
  assert.ok("cover" in made);
  const again = coverFrom(rowsOf(made.cover), ["Done"]);
  assert.deepEqual(again, made);
});

test("escrow needs an arbiter, a deemed grade, a mint and a refund date past any appeal", () => {
  const grades = ["Good"];
  const base = { ...blankCover(), deliverables: "A portrait", deemedGrade: "Good", deemedDays: "7" };
  const arbiter = npub();
  const mint = "https://testnut.cashu.space";
  const held = (over: object) => coverFrom({ ...base, escrow: true, arbiter, mint, refundDays: "28", ...over }, grades);
  assert.deepEqual(coverFrom({ ...base, arbiter: "bob" }, grades), { problem: { key: "form.badArbiter" } });
  assert.deepEqual(held({ arbiter: "" }), { problem: { key: "form.escrowNeedsArbiter" } });
  assert.deepEqual(held({ deemedGrade: "" }), { problem: { key: "form.escrowNeedsDeemed" } });
  assert.deepEqual(held({ mint: "" }), { problem: { key: "form.escrowNeedsMint" } });
  assert.deepEqual(held({ refundDays: "27" }), { problem: { key: "form.badRefundDays", vars: { least: 28, most: 90 } } });
  const ok = held({});
  assert.ok("cover" in ok);
  assert.deepEqual(
    { a: ok.cover.arbiter_npub, e: ok.cover.escrow, m: ok.cover.escrow_mint, r: ok.cover.refund_days },
    { a: arbiter, e: true, m: mint, r: 28 },
  );
  assert.deepEqual(rowsOf({ ...ok.cover, terms_version: "v1", terms_hash: "" }).refundDays, "28");
  const plain = coverFrom({ ...base, arbiter, mint }, grades);
  assert.ok("cover" in plain && plain.cover.escrow === false && plain.cover.escrow_mint === "" && plain.cover.refund_days === 0);
});
