import { test } from "node:test";
import assert from "node:assert/strict";
import { isCommission } from "./tasks.ts";

test("a commission is a task under a cover page; a chore without one stays in ChipIn", () => {
  assert.equal(isCommission({ cover: null }), false);
  assert.equal(isCommission({ cover: { deliverables: ["A portrait"] } as never }), true);
});
