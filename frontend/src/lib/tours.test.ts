import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { lintTours } from "@tollbooth-dpyc/web";
import { registerCommission } from "../i18n/index.ts";
import { BLOCKS } from "./formBlocks.ts";
import { OWN, SHOW_ME, tours } from "./tours.ts";

await registerCommission();

const src = new URL("..", import.meta.url).pathname;
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(name) && !name.includes(".test.") ? [path] : [];
  });
}
const code = sources(src).map((f) => readFileSync(f, "utf8")).join("\n");

test("every page that asks for a tour has one, in the network's voice", () => {
  const TOURS = tours();
  const asked = [...code.matchAll(/useTour\("([a-z]+)"/g)].map((m) => m[1]);
  for (const page of asked) assert.ok(TOURS[page], `${page} asks for a tour it has none of`);
  for (const page of Object.keys(OWN)) assert.ok(asked.includes(page) || code.includes(`"${page}"`), `${page}'s tour is never asked for`);
  assert.deepEqual(lintTours(TOURS), []);
  for (const { page } of SHOW_ME) assert.ok(TOURS[page], page);
});

test("every step points at a control the pages mark, and a folded block is opened first", () => {
  for (const [page, rows] of Object.entries(OWN)) {
    for (const [step, opts] of rows) {
      const name = `${page}.${step}`;
      const marked = code.includes(`tourTarget("${name}")`) || (page === "compose" && ["appeal", "ruling", "pay"].includes(step) && code.includes("tourTarget(`compose.${w}`)"));
      assert.ok(marked, `nothing on the page is marked ${name}`);
      if (opts?.before) assert.ok((BLOCKS as readonly string[]).includes(opts.before), name);
    }
  }
  const compose = tours().compose.steps;
  assert.ok(compose.length >= 24, "the new-commission tour walks every field group");
  for (const block of BLOCKS) assert.ok(compose.some((s) => s.before === `open:${block}`), `the tour never opens ${block}`);
  for (const step of ["payout", "currency", "language"]) assert.ok(code.includes(`tourTarget("profile.${step}")`), step);
});
