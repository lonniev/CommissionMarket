import { test } from "node:test";
import assert from "node:assert/strict";
import { laneOf, mayEdit, movesFor, mySignatureDue, waitsOnSignature, type Stands } from "./moves.ts";

const unsigned = { purchaser_signed: false, performer_signed: false };
const at = (over: Partial<Stands>): Stands => ({ standing: "posted", final: false, your_roles: [], ...over });

test("each role sees its own next step", () => {
  assert.deepEqual(movesFor(at({ your_roles: ["audience"] })), ["claim"]);
  assert.deepEqual(movesFor(at({ your_roles: ["purchaser"] })), ["withdraw"]);
  assert.deepEqual(movesFor(at({ standing: "claimed", your_roles: ["performer"] })), ["mark_done", "release"]);
  assert.deepEqual(movesFor(at({ standing: "done", your_roles: ["assessor"] })), ["grade", "reject"]);
  assert.deepEqual(movesFor(at({ standing: "owed", your_roles: ["purchaser"] })), ["pay"]);
  assert.deepEqual(movesFor(at({ standing: "assessed", final: true, your_roles: ["performer"] })), []);
});

test("under a cover page, nobody claims before the client signs", () => {
  const open = at({ your_roles: ["audience"], cover: {}, agreement: unsigned });
  assert.equal(waitsOnSignature(open, "claim"), "gate.clientSignsFirst");
  assert.equal(waitsOnSignature({ ...open, agreement: { ...unsigned, purchaser_signed: true } }, "claim"), null);
});

test("the professional signs before delivering", () => {
  const working = at({ standing: "claimed", your_roles: ["performer"], cover: {}, agreement: { ...unsigned, purchaser_signed: true } });
  assert.equal(waitsOnSignature(working, "mark_done"), "gate.signBeforeDelivering");
  assert.equal(mySignatureDue(working), "performer");
  assert.equal(laneOf(working), "yours");
});

test("a commission without a cover page asks for no signature", () => {
  const plain = at({ your_roles: ["audience"] });
  assert.equal(waitsOnSignature(plain, "claim"), null);
  assert.equal(mySignatureDue(at({ your_roles: ["purchaser"] })), null);
});

test("the client's signature is due on their own open offer, and puts it in their lane", () => {
  const mine = at({ your_roles: ["purchaser"], cover: {}, agreement: unsigned });
  assert.equal(mySignatureDue(mine), "purchaser");
  assert.equal(mySignatureDue({ ...mine, agreement: { ...unsigned, purchaser_signed: true } }), null);
  assert.ok(mayEdit(mine));
  assert.ok(!mayEdit({ ...mine, standing: "claimed" }));
});

test("finished commissions leave every lane but the last", () => {
  assert.equal(laneOf(at({ standing: "paid", your_roles: ["purchaser"] })), "finished");
  assert.equal(laneOf(at({ standing: "done", your_roles: ["performer"] })), "waiting");
});

test("the arbiter and the escrow", async (t) => {
  const cover = { arbiter_npub: "npub1arbiter", escrow: true };
  const signed = { purchaser_signed: true, performer_signed: true, arbiter_signed: true };

  await t.test("asks a named arbiter for their signature while the offer is open", () => {
    const task = { standing: "claimed" as const, final: false, your_roles: ["arbiter" as const], cover, agreement: { ...signed, arbiter_signed: false } };
    assert.equal(mySignatureDue(task), "arbiter");
    assert.equal(mySignatureDue({ ...task, agreement: signed }), null);
  });

  await t.test("holds delivery until the arbiter has signed and the escrow is funded", () => {
    const task = { standing: "claimed" as const, final: false, your_roles: ["performer" as const], cover, agreement: { ...signed, arbiter_signed: false } };
    assert.equal(waitsOnSignature(task, "mark_done"), "gate.arbiterSignsFirst");
    assert.equal(waitsOnSignature({ ...task, agreement: signed }, "mark_done"), "gate.escrowFirst");
    assert.equal(waitsOnSignature({ ...task, agreement: signed, escrow: { state: "invoiced" } }, "mark_done"), "gate.escrowFirst");
    assert.equal(waitsOnSignature({ ...task, agreement: signed, escrow: { state: "funded" } }, "mark_done"), null);
  });
});
