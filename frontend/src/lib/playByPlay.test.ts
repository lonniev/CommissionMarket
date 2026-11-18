import { test } from "node:test";
import assert from "node:assert/strict";
import english from "../content/en/index.ts";
import { clauseHref, storyPieces, storyRefs } from "./playByPlay.ts";

const story = english.playByPlay!;

// How many clauses each section of the Standard Terms v1 has: the story may cite only these.
const V1 = [6, 9, 3, 9, 10, 17, 3, 5, 7, 3, 4, 3, 3, 6, 3, 2, 5, 4];
const inV1 = (clause: string) => {
  const [s, c] = clause.split(".").map(Number);
  return s >= 1 && s <= V1.length && (c === undefined || (c >= 1 && c <= V1[s - 1]));
};

test("every ending has a beat for every phase, and something in each part", () => {
  assert.equal(story.endings.length, 3);
  for (const e of story.endings) {
    assert.equal(e.beats.length, story.phases.length, e.key);
    for (const beat of e.beats) assert.ok(beat.length && beat.every((l) => l.trim()), e.key);
    assert.ok(e.title && e.tldr && e.tally.length && e.aside.length, e.key);
  }
});

test("every key word is in the glossary, and every glossary word is used", () => {
  const { words } = storyRefs(story);
  assert.deepEqual(words, Object.keys(story.words).sort());
});

test("every clause the story cites exists in the Standard Terms v1", () => {
  for (const clause of storyRefs(story).clauses) assert.ok(inV1(clause), `§${clause}`);
});

test("the markup cuts a line into words, clauses and text, losing nothing", () => {
  const pieces = storyPieces("Rosa pays the [[deposit]] and the [[escrowed|Escrowed Amount]] (§5.2, §6.2).", story.words);
  assert.deepEqual(pieces.filter((p) => p.kind !== "text").map((p) => p.text), ["deposit", "Escrowed Amount", "§5.2", "§6.2"]);
  assert.equal(pieces.map((p) => p.text).join(""), "Rosa pays the deposit and the Escrowed Amount (§5.2, §6.2).");
  assert.deepEqual(storyPieces("an [[unknown]] word", story.words).map((p) => p.kind), ["text", "text", "text"]);
  assert.equal(clauseHref("6.16"), "/terms?version=v1#t-6-16");
});
