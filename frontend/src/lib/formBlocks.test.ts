import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BLOCKS, blockOf, summaryOf, type Shape } from "./formBlocks.ts";

const shape: Shape = {
  title: "A portrait of Murray Rothbard", deliverables: 2, invited: 3, arbiter: "npub1pmywygyld7vprgda3v8sd3lxnzuq",
  grades: 4, topSats: 100000, neededBy: "30 Dec", late: "discount", depositPct: 20, milestones: 1,
  escrowMint: "https://testnut.cashu.space", deemedGrade: "Good", deemedDays: 7, ip: "assign", law: "Vermont",
};

test("every problem the form can raise opens the block that holds it", () => {
  const raised = new Set<string>();
  for (const f of ["cover.ts", "rubric.ts", "money.ts"]) {
    for (const m of readFileSync(new URL(`./${f}`, import.meta.url), "utf8").matchAll(/key: "([a-zA-Z.]+)"/g)) raised.add(m[1]);
  }
  raised.add("form.needTitle");
  raised.add("form.needDay");
  const fallThrough = [...raised].filter((k) => blockOf(k) === "spec" && !/^form\.(needTitle|needDeliverable|deliverables|deliverable|badSpec)/.test(k));
  assert.deepEqual(fallThrough, []);
  assert.equal(blockOf("form.escrowNeedsArbiter"), "people");
  assert.equal(blockOf("form.escrowNeedsDeemed"), "conclusion");
  assert.equal(blockOf("form.badRefundDays"), "payments");
  assert.equal(blockOf("rubric.needOne"), "grades");
  assert.equal(blockOf("late.needPct"), "schedule");
  assert.equal(blockOf("form.needIpCustom"), "legal");
});

test("each block says what it holds in one line", () => {
  const said = Object.fromEntries(BLOCKS.map((id) => [id, summaryOf(id, shape).map((s) => s.key)]));
  assert.deepEqual(said, {
    spec: ["block.sum.title", "block.sum.deliverables"],
    people: ["block.sum.invited", "block.sum.arbiter"],
    grades: ["block.sum.grades"],
    schedule: ["block.sum.neededBy", "late.pick.discount"],
    payments: ["block.sum.deposit", "block.sum.milestones", "block.sum.escrowAt"],
    conclusion: ["block.sum.fallback"],
    legal: ["cover.ip.assign", "block.sum.law"],
  });
  assert.deepEqual(summaryOf("payments", shape)[2].vars, { mint: "testnut.cashu.space" });
});

test("a block with nothing set says so", () => {
  const bare: Shape = { ...shape, title: " ", arbiter: "", depositPct: 0, milestones: 0, escrowMint: "", deemedGrade: "", law: "" };
  assert.equal(summaryOf("spec", bare)[0].key, "block.sum.untitled");
  assert.equal(summaryOf("people", bare)[1].key, "block.sum.noArbiter");
  assert.deepEqual(summaryOf("payments", bare).map((s) => s.key), ["block.sum.noEscrow"]);
  assert.equal(summaryOf("conclusion", bare)[0].key, "block.sum.noFallback");
  assert.deepEqual(summaryOf("legal", bare).map((s) => s.key), ["cover.ip.assign"]);
});
