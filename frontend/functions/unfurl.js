/**
 * Cloudflare Pages Function: /unfurl?url=… → what a specification link names.
 *
 * A page in the browser may not read another site's HTML, so the preview asks
 * here. It answers only what a card shows: the page's title, description and
 * site name, or a file's type and size. It never returns the page itself.
 *
 * - Only https to a named public host is fetched (`reachable`), and every
 *   redirect is checked again, at most three of them.
 * - A page is read up to its head, at most 256 kB; a file is never read, only
 *   its headers.
 * - Six seconds, then it gives up. A day's caching keeps one link to one fetch.
 */

import { reachable, readHead } from "../src/lib/unfurl.ts";

const AGENT = "CommissionMarket-Preview/1.0 (+https://commissionmarket.tollbooth-dpyc.com)";
const HEAD_MAX = 256 * 1024;
const HOPS = 3;
const DAY = 86400;

const json = (body, status = 200, maxAge = DAY) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": `public, max-age=${maxAge}` },
  });

/** The first `max` bytes of a body, as text; the rest is left unread. */
async function firstBytes(body, max) {
  if (!body) return "";
  const reader = body.getReader();
  const chunks = [];
  let size = 0;
  while (size < max) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
    const tail = new TextDecoder().decode(value);
    if (/<\/head>|<body\b/i.test(tail)) break;
  }
  await reader.cancel().catch(() => {});
  const all = new Uint8Array(Math.min(size, max));
  let at = 0;
  for (const c of chunks) {
    const part = c.subarray(0, Math.max(0, all.length - at));
    all.set(part, at);
    at += part.length;
  }
  return new TextDecoder().decode(all);
}

async function look(start) {
  let url = start;
  for (let hop = 0; hop <= HOPS; hop += 1) {
    const r = await fetch(url.toString(), {
      redirect: "manual",
      headers: { "User-Agent": AGENT, Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5" },
      signal: AbortSignal.timeout(6000),
    });
    if (r.status >= 300 && r.status < 400 && r.headers.get("Location")) {
      await r.body?.cancel().catch(() => {});
      const next = reachable(new URL(r.headers.get("Location"), url).toString());
      if (!next) return { url: url.toString(), site: url.hostname, kind: "page", status: r.status };
      url = next;
      continue;
    }
    const base = { url: url.toString(), site: url.hostname };
    if (!r.ok) {
      await r.body?.cancel().catch(() => {});
      return { ...base, kind: "page", status: r.status };
    }
    const type = (r.headers.get("Content-Type") ?? "").toLowerCase();
    if (type.includes("html")) return { ...base, kind: "page", ...readHead(await firstBytes(r.body, HEAD_MAX)) };
    await r.body?.cancel().catch(() => {});
    const bytes = Number(r.headers.get("Content-Length"));
    return { ...base, kind: "file", ...(type ? { type: type.split(";")[0] } : {}), ...(bytes > 0 ? { bytes } : {}) };
  }
  return { url: url.toString(), site: url.hostname, kind: "page", status: 310 };
}

export async function onRequestGet({ request, waitUntil }) {
  const asked = new URL(request.url).searchParams.get("url") ?? "";
  const target = asked.length <= 2048 ? reachable(asked) : null;
  if (!target) return json({ error: "An https link to a public site, please." }, 400, 300);

  const cache = caches.default;
  const key = new Request(`https://unfurl.cache/${encodeURIComponent(target.toString())}`);
  const hit = await cache.match(key);
  if (hit) return hit;

  let answer;
  try {
    answer = await look(target);
  } catch {
    return json({ url: target.toString(), site: target.hostname, kind: "page", status: 504 }, 200, 300);
  }
  const res = json(answer, 200, answer.status ? 300 : DAY);
  waitUntil(cache.put(key, res.clone()));
  return res;
}
