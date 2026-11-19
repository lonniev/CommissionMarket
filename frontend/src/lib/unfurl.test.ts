import { test } from "node:test";
import assert from "node:assert/strict";
import { reachable, readHead, sizeOf, typeName, versionOf } from "./unfurl.ts";

test("only https to a named public host is fetched", () => {
  assert.ok(reachable("https://github.com/acme/spec/blob/v1.0/spec.pdf"));
  assert.ok(reachable("https://cad.onshape.com/documents/abc:443"));
  for (const bad of [
    "http://example.com/spec", "ftp://example.com/x", "https://user:pw@example.com/x", "https://example.com:8443/x",
    "https://localhost/x", "https://127.0.0.1/x", "https://[::1]/x", "https://printer.local/x", "https://intranet/x",
    "https://db.internal/x", "javascript:alert(1)", "not a url",
  ]) assert.equal(reachable(bad), null, bad);
});

test("a page's head gives its title, description and site", () => {
  const html = `<html><head><title>Fallback</title>
    <meta property="og:title" content="Bracket &amp; mount &#8212; rev C">
    <meta name='description' content='Requirements for the  wall bracket.'>
    <meta property="og:site_name" content="GitHub"></head><body><meta property="og:title" content="late"></body>`;
  assert.deepEqual(readHead(html), { title: "Bracket & mount — rev C", description: "Requirements for the wall bracket.", siteName: "GitHub" });
  assert.deepEqual(readHead("<title> Just <b>a</b> title </title>"), { title: "Just a title" });
  assert.deepEqual(readHead("<p>nothing</p>"), {});
  assert.equal(readHead(`<meta name="description" content="${"x".repeat(400)}">`).description?.length, 300);
});

test("a change-controlled link says which version it holds", () => {
  const sha = "0123456789abcdef0123456789abcdef01234567";
  assert.deepEqual(versionOf(`https://github.com/acme/bracket/blob/${sha}/spec.pdf`), { kind: "commit", ref: "0123456" });
  assert.deepEqual(versionOf("https://github.com/acme/bracket/blob/v1.2.0/spec.pdf"), { kind: "tag", ref: "v1.2.0" });
  assert.deepEqual(versionOf("https://gitlab.com/acme/bracket/-/blob/main/spec.md"), { kind: "branch", ref: "main" });
  assert.deepEqual(versionOf("https://raw.githubusercontent.com/acme/bracket/2026-11-01/spec.step"), { kind: "tag", ref: "2026-11-01" });
  assert.deepEqual(versionOf("https://bitbucket.org/acme/bracket/src/release-3/spec.pdf"), { kind: "tag", ref: "release-3" });
  assert.equal(versionOf("https://github.com/acme/bracket/blob/feature-x/spec.pdf"), null);
  assert.equal(versionOf("https://example.com/spec.pdf"), null);
});

test("a file's size and type read short", () => {
  assert.equal(sizeOf(512), "512 B");
  assert.equal(sizeOf(2_345_678), "2.3 MB");
  assert.equal(sizeOf(45_000), "45 kB");
  assert.equal(typeName("application/pdf", "https://x.com/a.pdf"), "PDF");
  assert.equal(typeName("application/octet-stream", "https://x.com/part.step"), "STEP");
  assert.equal(typeName(undefined, "https://x.com/model.stl"), "STL");
});
