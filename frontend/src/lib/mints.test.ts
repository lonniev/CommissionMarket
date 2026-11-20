import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { judge, matching, mintName, pageOf, percent, ranked, withMint, type MintFacts } from "./mints.ts";

const NOW = 1_800_000_000;
const DAY = 86_400;

function facts(over: Partial<{ [K in keyof MintFacts]: Partial<MintFacts[K]> }> = {}, url = "https://mint.example"): MintFacts {
  return {
    url,
    mint: { source: "mint", observed_at: NOW, name: "Example", nuts: ["7", "8", "11", "12", "20"], missing_escrow_nuts: [], ...over.mint },
    cashumints: { source: "cashumints.space", observed_at: NOW, listed: true, uptime_30d: 0.995, reviews: 4, ...over.cashumints },
    auditor: { source: "audit.8333.space", observed_at: NOW, tracked: true, swaps: 300, failed: 0, clean_since: NOW - 120 * DAY, ...over.auditor },
    live_test: (over.live_test as MintFacts["live_test"]) ?? null,
  };
}

describe("judge: the owner's rule", () => {
  it("a mint with every NUT, 99% uptime and three clean months meets it", () => {
    assert.deepEqual(judge(facts(), NOW), { meets: true, short: [], notes: [], cleanDays: 120 });
  });

  it("a missing escrow NUT keeps it off", () => {
    assert.deepEqual(judge(facts({ mint: { missing_escrow_nuts: ["11"] } }), NOW).short, ["missingNuts"]);
  });

  it("uptime under 99%, or not known, keeps it off", () => {
    assert.deepEqual(judge(facts({ cashumints: { uptime_30d: 0.98 } }), NOW).short, ["uptimeLow"]);
    assert.deepEqual(judge(facts({ cashumints: { unreachable: "HTTPStatusError" } }), NOW).short, ["uptimeUnknown"]);
    assert.deepEqual(judge(facts({ cashumints: { listed: false } }), NOW).short, ["uptimeUnknown"]);
  });

  it("an auditor that cannot be reached still lets it qualify, marked", () => {
    const j = judge(facts({ auditor: { unreachable: "HTTPStatusError", tracked: undefined, clean_since: undefined } }), NOW);
    assert.equal(j.meets, true);
    assert.deepEqual(j.notes, ["auditorNotReached"]);
  });

  it("a clean run under three months, a failing mint, or none audited keeps it off", () => {
    assert.deepEqual(judge(facts({ auditor: { clean_since: NOW - 89 * DAY } }), NOW).short, ["auditShort"]);
    assert.deepEqual(judge(facts({ auditor: { clean_since: null } }), NOW).short, ["auditFailing"]);
    assert.deepEqual(judge(facts({ auditor: { tracked: false } }), NOW).short, ["notAudited"]);
  });

  it("a failed live test keeps it off; a passed one is noted", () => {
    const failed = { verdict: "failed" } as MintFacts["live_test"];
    const passed = { verdict: "passed" } as MintFacts["live_test"];
    assert.deepEqual(judge(facts({ live_test: failed as never }), NOW).short, ["testFailed"]);
    assert.deepEqual(judge(facts({ live_test: passed as never }), NOW).notes, ["testPassed"]);
  });
});

describe("ranked", () => {
  it("puts mints that meet the rule first, then the longest clean run", () => {
    const order = ranked([
      facts({ cashumints: { uptime_30d: 0.5 } }, "https://slow.example"),
      facts({ auditor: { clean_since: NOW - 100 * DAY } }, "https://b.example"),
      facts({ auditor: { clean_since: NOW - 300 * DAY } }, "https://a.example"),
    ], NOW).map((r) => r.facts.url);
    assert.deepEqual(order, ["https://a.example", "https://b.example", "https://slow.example"]);
  });
});

describe("small helpers", () => {
  it("names a mint by its host when it gives no name", () => {
    assert.equal(mintName(facts({ mint: { name: "" } }, "https://mint.minibits.cash/Bitcoin")), "mint.minibits.cash/Bitcoin");
  });
  it("rounds uptime down, so 99.95% never shows as 100%", () => {
    assert.equal(percent(0.9995), "99.9%");
    assert.equal(percent(1), "100.0%");
  });
  it("adds or takes away one mint", () => {
    assert.deepEqual(withMint(["a", "b"], "c", true), ["a", "b", "c"]);
    assert.deepEqual(withMint(["a", "b"], "a", false), ["b"]);
    assert.deepEqual(withMint(["a"], "a", true), ["a"]);
  });
});

describe("finding among many", () => {
  const rows = ["https://a.example", "https://mint.minibits.cash/Bitcoin", "https://b.example"].map((u) => ({ facts: facts({ mint: { name: u.includes("minibits") ? "Minibits mint" : "" } }, u) }));
  it("matches a name or an address, ignoring case", () => {
    assert.deepEqual(matching(rows, "MINIBITS").map((r) => r.facts.url), ["https://mint.minibits.cash/Bitcoin"]);
    assert.deepEqual(matching(rows, "b.example").map((r) => r.facts.url), ["https://b.example"]);
    assert.equal(matching(rows, "  ").length, 3);
  });
  it("pages, holding the page inside the rows", () => {
    const all = Array.from({ length: 20 }, (_, i) => i);
    assert.deepEqual(pageOf(all, 0, 9), { rows: [0, 1, 2, 3, 4, 5, 6, 7, 8], page: 0, pages: 3, from: 1, to: 9 });
    assert.deepEqual(pageOf(all, 2, 9).rows, [18, 19]);
    assert.equal(pageOf(all, 7, 9).page, 2);
    assert.deepEqual(pageOf([], 0, 9), { rows: [], page: 0, pages: 1, from: 0, to: 0 });
  });
});
