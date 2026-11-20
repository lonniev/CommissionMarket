/**
 * A specification link, previewed: what the link names, read from its page's
 * head, and whether the link holds one version of the document still.
 *
 * The reading happens in the Pages Function `functions/unfurl.js`, because a
 * page in the browser may not read another site's HTML. This file is the
 * part both sides share, kept pure so it is tested here:
 * - `reachable(url)` says whether the Function will fetch an address at all:
 *   https, on the default port, a named public host, no credentials;
 * - `readHead(html)` takes the title, description and site name from a page;
 * - `versionOf(url)` reads a change-controlled link (GitHub, GitLab,
 *   Bitbucket) for the commit, tag or branch it points into.
 */

/** What the Function answers for one link. */
export interface Preview {
  /** The address after redirects. */
  url: string;
  /** Its host name, as the card heads it. */
  site: string;
  /** A page has a title and a description; anything else is a file of `type`. */
  kind: "page" | "file";
  title?: string;
  description?: string;
  /** The media type, for a file: "application/pdf", "model/step"… */
  type?: string;
  /** The file's size, when the server says it. */
  bytes?: number;
  /** The HTTP status, when the link answered with something other than its content. */
  status?: number;
}

const TEXT_MAX = 300;

/** Whether an address is one the preview fetches: https to a named public host. */
export function reachable(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return null;
  const host = url.hostname.toLowerCase();
  if (!host.includes(".") || host.startsWith("[") || /^[\d.]+$/.test(host)) return null;
  if (/(^|\.)(localhost|local|internal|lan|home|arpa)$/.test(host)) return null;
  return url;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === "#") {
      const n = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : whole;
    }
    return ENTITIES[code.toLowerCase()] ?? whole;
  });
}

function tidy(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const flat = decode(text.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
  if (!flat) return undefined;
  return flat.length > TEXT_MAX ? `${flat.slice(0, TEXT_MAX - 1).trimEnd()}…` : flat;
}

/** The content of the first <meta> naming one of `names` (by property or name). */
function meta(head: string, names: string[]): string | undefined {
  for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = /\b(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    if (!key || !names.includes(key)) continue;
    const content = /\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i.exec(tag);
    const value = content?.[1] ?? content?.[2];
    if (value?.trim()) return value;
  }
  return undefined;
}

/** A page's title, description and site name, from its head. */
export function readHead(html: string): { title?: string; description?: string; siteName?: string } {
  const end = html.search(/<\/head>|<body\b/i);
  const head = end > 0 ? html.slice(0, end) : html;
  const title = tidy(meta(head, ["og:title", "twitter:title"]) ?? /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1]);
  const description = tidy(meta(head, ["og:description", "description", "twitter:description"]));
  const siteName = tidy(meta(head, ["og:site_name"]));
  return { ...(title ? { title } : {}), ...(description ? { description } : {}), ...(siteName ? { siteName } : {}) };
}

/** Which version of a change-controlled file a link names. */
export type Version =
  | { kind: "commit"; ref: string }
  | { kind: "tag"; ref: string }
  | { kind: "branch"; ref: string };

const FOREVER_BRANCHES = new Set(["main", "master", "trunk", "develop", "dev", "default", "head"]);

/**
 * The ref a GitHub, GitLab or Bitbucket file link points into, when it is one.
 * A 40-hex ref is a commit; a ref shaped like a version (v1.2, 2026-11-01,
 * release-3) is a tag; a well-known branch name is a branch. Anything else is
 * unknown, because a host's URL cannot tell a tag from a branch.
 */
export function versionOf(raw: string): Version | null {
  const url = reachable(raw);
  if (!url) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  let ref: string | undefined;
  if (host === "github.com" || host === "gitlab.com") {
    const at = parts.findIndex((p) => p === "blob" || p === "tree" || p === "raw" || p === "commit");
    if (at >= 0) ref = parts[at + 1];
  } else if (host === "raw.githubusercontent.com") {
    ref = parts[2];
  } else if (host === "bitbucket.org") {
    const at = parts.indexOf("src");
    if (at >= 0) ref = parts[at + 1];
  }
  if (!ref) return null;
  ref = decodeURIComponent(ref);
  if (/^[0-9a-f]{40}$/i.test(ref)) return { kind: "commit", ref: ref.slice(0, 7) };
  if (FOREVER_BRANCHES.has(ref.toLowerCase())) return { kind: "branch", ref };
  if (/^(v?\d+(\.\d+)*([-.][\w.]+)?|\d{4}-\d{2}-\d{2}|(release|rel)[-_/]?[\w.]+)$/i.test(ref)) return { kind: "tag", ref };
  return null;
}

/** "2.3 MB", for a file's size. */
export function sizeOf(bytes: number): string {
  const units = ["B", "kB", "MB", "GB"];
  let n = bytes;
  let u = 0;
  while (n >= 1000 && u < units.length - 1) {
    n /= 1000;
    u += 1;
  }
  return `${u === 0 || n >= 10 ? Math.round(n) : n.toFixed(1)} ${units[u]}`;
}

/** "PDF", "STEP", "ZIP": a short name for a media type, from the link's extension when the server is vague. */
export function typeName(type: string | undefined, url: string): string {
  const ext = /\.([a-z0-9]{2,5})$/i.exec(new URL(url).pathname)?.[1];
  const sub = type?.split(";")[0].split("/")[1]?.replace(/^(x-|vnd\.)/, "");
  if (ext && (!sub || sub === "octet-stream" || sub.length > 12)) return ext.toUpperCase();
  return (sub ?? ext ?? "file").toUpperCase();
}
