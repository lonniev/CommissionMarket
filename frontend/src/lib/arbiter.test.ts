import { test } from "node:test";
import assert from "node:assert/strict";
import { arbiterDue, shelfOf } from "./arbiter.ts";

type Role = "arbiter" | "tie_breaker" | "purchaser" | "performer" | "audience";
const cover = { arbiter_npub: "npub1arbiter" } as never;
const base = {
  standing: "posted" as const, final: false, your_roles: ["arbiter", "tie_breaker"] as Role[], cover,
  agreement: { purchaser_signed: true, performer_signed: false, arbiter_signed: false }, failure: null, escrow: null,
};
const signed = { ...base.agreement, arbiter_signed: true };
const escrowOf = (state: "funded" | "proposed") => ({
  state, mint: "m", sats: 1, parties: { purchaser: "", performer: "", arbiter: "" }, refund_at: 0, refund_open: false,
  ...(state === "proposed" ? { proposal: { to_performer: 0, to_purchaser: 1, by: "purchaser" as const, at: 1, signed_by: ["purchaser" as const] } } : {}),
});

test("an arbiter not yet signed is asked to sign, until the work is delivered", () => {
  assert.equal(arbiterDue(base), "sign");
  assert.equal(shelfOf(base), "asked");
  assert.equal(arbiterDue({ ...base, standing: "claimed" }), "sign");
  assert.equal(shelfOf({ ...base, agreement: signed, standing: "claimed" }), "arbitrating");
});

test("an appeal, a claim of cause and an escrow split wait on the arbiter's decision", () => {
  assert.equal(arbiterDue({ ...base, agreement: signed, standing: "appealed" }), "appeal");
  const failure = { at: 1, cause_ends: 2, without_cause: null, cause: { reasons: "No photos came", at: 1 } };
  assert.equal(arbiterDue({ ...base, agreement: signed, standing: "missed", final: true, failure }), "cause");
  assert.equal(arbiterDue({ ...base, agreement: signed, standing: "missed", final: true,
    failure: { ...failure, cause: { ...failure.cause, ruling: "rejected" as const } } }), null);
  assert.equal(shelfOf({ ...base, agreement: signed, standing: "missed", final: true, escrow: escrowOf("proposed") }), "decide");
});

test("clients, professionals and invitees see the commissions an arbiter watches over", () => {
  assert.equal(shelfOf({ ...base, your_roles: ["purchaser"] }), "client");
  assert.equal(shelfOf({ ...base, your_roles: ["performer"], standing: "claimed" }), "working");
  assert.equal(shelfOf({ ...base, your_roles: ["audience"] }), "open");
  assert.equal(arbiterDue({ ...base, your_roles: ["purchaser"] }), null);
});

test("a finished job closes, unless its escrow is still to settle; no arbiter, no shelf", () => {
  assert.equal(shelfOf({ ...base, your_roles: ["purchaser"], standing: "paid", final: true }), "closed");
  assert.equal(shelfOf({ ...base, your_roles: ["purchaser"], standing: "missed", final: true, escrow: escrowOf("funded") }), "client");
  assert.equal(shelfOf({ ...base, cover: null }), null);
  assert.equal(shelfOf({ ...base, cover: { arbiter_npub: "" } as never }), null);
});
