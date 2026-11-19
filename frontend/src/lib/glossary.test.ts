import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import english from "../content/en/index.ts";
import { inV1 } from "./clauses.ts";
import { GLOSSARY_GROUPS, GLOSSARY_KEYS, glossaryIn } from "./glossary.ts";
import { LESSON_SHAPES } from "./lessons.ts";

const src = new URL("..", import.meta.url).pathname;
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "content" || name === "i18n" ? [] : sources(path);
    return /\.tsx?$/.test(name) && !name.includes(".test.") ? [path] : [];
  });
}
const KEYS = new Set<string>(GLOSSARY_KEYS.map(([k]) => k));

test("every word a page defines in place is in the glossary", () => {
  const used = new Set<string>();
  for (const file of sources(src)) {
    for (const m of readFileSync(file, "utf8").matchAll(/<Word of="([a-z_]+)"/g)) used.add(m[1]);
  }
  assert.ok(used.size >= 10, `only ${used.size} words are defined in place`);
  for (const key of used) assert.ok(KEYS.has(key), `<Word of="${key}"> has no glossary entry`);
  for (const shape of LESSON_SHAPES) for (const w of shape.words) assert.ok(KEYS.has(w), `${shape.slug}: ${w}`);
});

test("each word sits in a group the page shows, once, under a clause the Standard Terms has", () => {
  assert.equal(KEYS.size, GLOSSARY_KEYS.length, "a key is listed twice");
  for (const row of GLOSSARY_KEYS) {
    assert.ok(GLOSSARY_GROUPS.includes(row[1]), row[0]);
    if (row.length > 2) assert.ok(inV1((row as readonly string[])[2]), `${row[0]}: §${(row as readonly string[])[2]}`);
  }
});

test("the search finds a word by its name, another name, or its meaning, and every word for nothing typed", () => {
  const g = glossaryIn(english.glossary);
  assert.equal(g.search("").length, GLOSSARY_KEYS.length);
  assert.ok(g.search("escrow").some((e) => e.key === "escrow"));
  assert.ok(g.search("artist").some((e) => e.key === "professional"), "by another name");
  assert.ok(g.search("hostage").some((e) => e.key === "deemed_acceptance"), "by its meaning");
  assert.deepEqual(g.search("zzzz"), []);
  assert.equal(g.define("deposit")?.clause, "5.3");
  assert.equal(g.define("nope"), undefined);
});
