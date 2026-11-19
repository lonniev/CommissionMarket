import { test } from "node:test";
import assert from "node:assert/strict";
import { arbiterDue, shelfOf } from "./arbiter.ts";

const base = {
  standing: "posted" as const, final: false, your_roles: ["arbiter", "tie_breaker"] as ("arbiter" | "tie_breaker")[],
  agreement: { purchaser_signed: true, performer_signed: false, arbiter_signed: false }, failure: null, escrow: null,
};
const signed = { ...base.agreement, arbiter_signed: true };

test("an arbiter not yet signed is asked to sign, until the work is delivered", () => {
  assert.equal(arbiterDue(base), "sign");
  assert.equal(shelfOf(base), "asked");
  assert.equal(arbiterDue({ ...base, standing: "claimed" }), "sign");
  assert.equal(arbiterDue({ ...base, agreement: signed }), null);
  assert.equal(shelfOf({ ...base, agreement: signed, standing: "claimed" }), "watching");
});

test("an appeal, a claim of cause and an escrow split wait on the arbiter's decision", () => {
  assert.equal(arbiterDue({ ...base, agreement: signed, standing: "appealed" }), "appeal");
  const failure = { at: 1, cause_ends: 2, without_cause: null, cause: { reasons: "No photos came", at: 1 } };
  assert.equal(arbiterDue({ ...base, agreement: signed, standing: "missed", final: true, failure }), "cause");
  assert.equal(arbiterDue({ ...base, agreement: signed, standing: "missed", final: true,
    failure: { ...failure, cause: { ...failure.cause, ruling: "rejected" as const } } }), null);
  const escrow = { state: "proposed" as const, mint: "m", sats: 1, parties: { purchaser: "", performer: "", arbiter: "" }, refund_at: 0,
    refund_open: false, proposal: { to_performer: 0, to_purchaser: 1, by: "purchaser" as const, at: 1, signed_by: ["purchaser" as const] } };
  assert.equal(arbiterDue({ ...base, agreement: signed, standing: "missed", final: true, escrow }), "escrow");
  assert.equal(shelfOf({ ...base, agreement: signed, standing: "missed", final: true, escrow }), "decide");
});

test("a finished job closes, unless its escrow is still to settle", () => {
  assert.equal(shelfOf({ ...base, agreement: signed, standing: "paid", final: true }), "closed");
  const funded = { state: "funded" as const, mint: "m", sats: 1, parties: { purchaser: "", performer: "", arbiter: "" }, refund_at: 0, refund_open: false };
  assert.equal(shelfOf({ ...base, agreement: signed, standing: "missed", final: true, escrow: funded }), "watching");
});

test("someone who is not the arbiter is asked nothing", () => {
  assert.equal(arbiterDue({ ...base, your_roles: ["tie_breaker"] }), null);
});
