/**
 * A commission's brief as the client wrote it, in Markdown: headings, bold and
 * italic, lists and checklists, links, quotes, tables and code blocks.
 *
 * Nothing in it can run. Raw HTML is never drawn, links open in a new tab and
 * only to http(s) or mailto, and a picture shows only from an https address,
 * so no script, no `javascript:` link and no data blob reaches the page.
 */

import Markdown, { defaultUrlTransform, type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

const SAFE_LINK = /^(https?:|mailto:)/i;

/** Only addresses a brief would mean: web pages and email. Anything else becomes no link. */
function safeUrl(url: string): string {
  const kept = defaultUrlTransform(url);
  return SAFE_LINK.test(kept) ? kept : "";
}

const COMPONENTS: Components = {
  a: ({ href, children }) => (href
    ? <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="ent">{children}</a>
    : <span>{children}</span>),
  img: ({ src, alt }) => (typeof src === "string" && src.startsWith("https://")
    ? <img src={src} alt={alt ?? ""} loading="lazy" referrerPolicy="no-referrer" />
    : <span className="muted">{alt}</span>),
};

export default function MarkdownText({ text }: { text: string }) {
  return (
    <div className="markdown">
      <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} skipHtml urlTransform={safeUrl} components={COMPONENTS}>
        {text}
      </Markdown>
    </div>
  );
}
