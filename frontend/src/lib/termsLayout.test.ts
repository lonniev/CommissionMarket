import { test } from "node:test";
import assert from "node:assert/strict";
import { anchorFor, clausePieces, layoutTerms } from "./termsLayout.ts";

const TEXT = `Task Booth Standard Terms, version v1

1. Parties and roles
1.1 "Client" posts a job and pays for it.
1.2 "Worker" claims the job.

6. Escrow
6.16 If the mint fails, the Balance is owed under section 7.
`;

test("the title, sections and clauses come out in order, word for word", () => {
  const layout = layoutTerms(TEXT)!;
  assert.equal(layout.title, "Task Booth Standard Terms, version v1");
  assert.deepEqual(layout.sections.map((s) => [s.number, s.heading, s.clauses.length]), [["1", "Parties and roles", 2], ["6", "Escrow", 1]]);
  assert.deepEqual(layout.sections[0].clauses[0], { number: "1.1", text: "\"Client\" posts a job and pays for it." });
});

test("text of any other shape is left for the page to show as it is", () => {
  assert.equal(layoutTerms("Just a paragraph\n\nof prose."), null);
  assert.equal(layoutTerms("Title\n\n1. Scope\n2.1 a clause under the wrong section"), null);
  assert.equal(layoutTerms(""), null);
});

test("defined terms and section references are picked out, and nothing is lost", () => {
  const clause = "The \"Balance\" is owed under section 7, as sections 6.5 and 6.6 say.";
  const pieces = clausePieces(clause);
  assert.equal(pieces.map((p) => p.text).join(""), clause);
  assert.deepEqual(pieces.filter((p) => p.kind === "defined").map((p) => p.text), ["\"Balance\""]);
  assert.deepEqual(pieces.filter((p) => p.kind === "ref").map((p) => p.kind === "ref" && p.target), ["t-7", "t-6-5", "t-6-6"]);
});

test("a plain number or a quoted lowercase word stays plain text", () => {
  const pieces = clausePieces("At most 90 percent, within 7 days; blank means \"none\".");
  assert.ok(pieces.every((p) => p.kind === "text"));
  assert.equal(anchorFor("6.16"), "t-6-16");
});
