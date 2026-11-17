/**
 * CommissionMarket's words in every language say what English says: the same keys, the
 * same `{{places}}` and the same `<tags/>`, held to it by the package's own
 * rule. Everything else about languages is the package's, and tested there.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { LANGUAGES, localeProblems, setLanguage, translate } from "@tollbooth-dpyc/web";
import english, { en } from "./en.ts";
import { registerCommission, say, WORDS } from "./index.ts";

const codes = LANGUAGES.map((l) => l.code).filter((c) => c !== "en");

for (const code of codes) {
  test(`${code}: every message is there, with English's {{places}} and <tags/>`, async () => {
    const locale = (await import(`./${code}.ts`)).default;
    assert.deepEqual(localeProblems(english, locale), []);
  });
}

test("every English message says something, and its key reads as dotted words", () => {
  const keys = Object.keys(en);
  assert.ok(keys.length > 150);
  for (const [key, text] of Object.entries(en)) {
    assert.match(key, /^[a-z][A-Za-z_]*(\.[A-Za-z_]+)+$/, key);
    assert.ok(text.trim().length > 0, key);
  }
});

test("no message keeps the old single-brace {place}", () => {
  for (const [key, text] of Object.entries(en)) assert.doesNotMatch(text, /(^|[^{])\{\w+\}(?!\})/, key);
});

test("CommissionMarket's words are said through the package, in the chosen language", async () => {
  await registerCommission();
  assert.equal(translate("due.inDays", { days: 3 }, WORDS), "in 3 days");
  await setLanguage("fr");
  const fr = (await import("./fr.ts")).default;
  assert.equal(translate("nav.commissions", undefined, WORDS), fr["nav.commissions"]);
  const t = (key: keyof typeof en, vars?: Record<string, string | number>) => translate(key, vars, WORDS);
  assert.equal(say(t, { key: "due.inDays", vars: { days: 2 } }), fr["due.inDays"].replace("{{days}}", "2"));
  assert.equal(say(t, null), "");
  await setLanguage("en");
});
