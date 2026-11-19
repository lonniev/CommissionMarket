/**
 * The specification link, with a preview of what it names.
 *
 * A mouse resting on the link opens the preview; on a tablet, the eye beside
 * it does. Either way it closes on a press elsewhere, on Escape, or when the
 * mouse leaves. The preview says the site, the document's title and summary
 * (or a file's type and size), and which version a change-controlled link
 * holds: a commit or a tag stays as signed, a branch moves.
 */

import { useEffect, useRef, useState, type PointerEvent as Pointer } from "react";
import { Eye, FileText, GitCommitHorizontal, GitBranch, Tag } from "lucide-react";
import { useT } from "../i18n";
import { sizeOf, typeName, versionOf, type Preview } from "../lib/unfurl";

const seen = new Map<string, Promise<Preview | null>>();

function previewOf(url: string): Promise<Preview | null> {
  let p = seen.get(url);
  if (!p) {
    p = fetch(`/unfurl?url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Preview>) : null))
      .catch(() => null);
    seen.set(url, p);
  }
  return p;
}

/** Which version the link holds, as one line. */
export function VersionLine({ url }: { url: string }) {
  const t = useT();
  const v = versionOf(url);
  if (!v) return null;
  const Icon = v.kind === "commit" ? GitCommitHorizontal : v.kind === "tag" ? Tag : GitBranch;
  return (
    <span className={v.kind === "branch" ? "spec-version spec-moves" : "spec-version"}>
      <Icon size={14} aria-hidden /> {t(`preview.${v.kind}`, { ref: v.ref })}
    </span>
  );
}

function Card({ url }: { url: string }) {
  const t = useT();
  const [preview, setPreview] = useState<Preview | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    void previewOf(url).then((p) => live && setPreview(p));
    return () => { live = false; };
  }, [url]);

  const site = (() => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } })();
  return (
    <>
      <strong className="spec-site">{site}</strong>
      {preview === undefined && <span className="muted">{t("preview.looking")}</span>}
      {preview === null && <span className="muted">{t("preview.unreachable")}</span>}
      {preview?.status != null && <span className="muted">{preview.status === 504 ? t("preview.unreachable") : t("preview.answered", { status: preview.status })}</span>}
      {preview && preview.status == null && preview.kind === "page" && (
        <>
          {preview.title && <span className="spec-title">{preview.title}</span>}
          {preview.description && <span className="spec-desc">{preview.description}</span>}
          {!preview.title && !preview.description && <span className="muted">{t("preview.untitled")}</span>}
        </>
      )}
      {preview && preview.status == null && preview.kind === "file" && (
        <span className="spec-title"><FileText size={16} aria-hidden /> {t("preview.file", { type: typeName(preview.type, preview.url) })}
          {preview.bytes ? ` · ${sizeOf(preview.bytes)}` : ""}</span>
      )}
      <VersionLine url={preview?.url ?? url} />
    </>
  );
}

export default function SpecLink({ url, align = "left" }: { url: string; align?: "left" | "right" }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const hover = (on: boolean) => (e: Pointer) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(on), on ? 350 : 200);
  };

  return (
    <span ref={box} className="spec-link" onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
      <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="ent spec-url" onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>{url}</a>
      <button type="button" className="term-badge spec-eye" aria-expanded={open} aria-label={t("preview.open")}
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}>
        <Eye size={13} aria-hidden />
      </button>
      {open && (
        <span role="tooltip" className={`term-panel spec-panel spec-${align}`}>
          <Card url={url} />
        </span>
      )}
    </span>
  );
}
