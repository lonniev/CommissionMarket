/**
 * A mint's address, and where every fact about it came from.
 *
 * As with the spec link: a mouse resting on the address opens the panel, and on
 * a tablet the eye beside it does. It closes on a press elsewhere, on Escape,
 * or when the mouse leaves. The panel shows each source in turn: what the mint
 * says of itself, what cashumints.space has seen, the Round Robin Auditor's
 * record and this Operator's lock test. Each one says when it was seen.
 */

import { useEffect, useRef, useState, type PointerEvent as Pointer, type ReactNode } from "react";
import { Eye } from "lucide-react";
import { useLanguageLocale } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import { hostOf, type MintFacts } from "../lib/mints";

function Source({ title, seen, children }: { title: string; seen?: string; children: ReactNode }) {
  return (
    <div className="prov-source">
      <div className="prov-head"><strong>{title}</strong>{seen && <span className="muted text-xs">{seen}</span>}</div>
      {children}
    </div>
  );
}

function Panel({ facts }: { facts: MintFacts }) {
  const t = useT();
  const locale = useLanguageLocale();
  const day = (s: number) => new Date(s * 1000).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const seen = (s: { observed_at: number }) => t("mints.prov.seen", { when: new Date(s.observed_at * 1000).toLocaleString(locale) });
  const { mint: m, cashumints: cm, auditor: au, live_test: test } = facts;

  return (
    <>
      <a href={`${facts.url}/v1/info`} target="_blank" rel="noopener noreferrer nofollow" className="ent break-all">{facts.url}</a>

      <Source title={t("mints.prov.mint")} seen={seen(m)}>
        {m.unreachable ? <span className="muted">{t("mints.mark.mintNotReached")}</span> : (
          <>
            {(m.name || m.version) && <span>{[m.name, m.version].filter(Boolean).join(" · ")}</span>}
            {m.description && <span className="muted">{m.description}</span>}
            {m.description_long && <span className="muted">{m.description_long}</span>}
            {m.motd && <span className="muted">“{m.motd}”</span>}
            {m.nuts && <span className="text-xs">NUT {m.nuts.join(", ")}</span>}
            {m.pubkey && <span className="text-xs break-all">{t("mints.prov.pubkey")}: <code>{m.pubkey}</code></span>}
            {m.contact?.map((c) => <span key={`${c.method}${c.info}`} className="text-xs break-all">{c.method}: {c.info}</span>)}
            {m.tos_url && <a href={m.tos_url} target="_blank" rel="noopener noreferrer nofollow" className="ent text-sm">{t("mints.prov.terms")}</a>}
          </>
        )}
      </Source>

      <Source title="cashumints.space" seen={seen(cm)}>
        {cm.unreachable ? <span className="muted">{t("mints.mark.uptimeUnknown")}</span>
          : !cm.listed ? <span className="muted">{t("mints.prov.notListed")}</span> : (
            <>
              {cm.first_seen && <span>{t("mints.prov.firstSeen", { date: day(cm.first_seen) })}</span>}
              {cm.page_url && <a href={cm.page_url} target="_blank" rel="noopener noreferrer nofollow" className="ent text-sm">{t("mints.prov.page")}</a>}
            </>
          )}
      </Source>

      <Source title={t("mints.prov.auditor")} seen={seen(au)}>
        {au.unreachable ? <span className="muted">{t("mints.mark.auditorNotReached")}</span>
          : !au.tracked || !au.swaps ? <span className="muted">{t("mints.mark.notAudited")}</span> : (
            <>
              <span>{t("mints.prov.tracked", { date: day(au.tracked_since ?? au.observed_at), swaps: au.swaps, failed: au.failed ?? 0 })}</span>
              {au.last_failure_at && <span className="muted">{t("mints.prov.lastFailure", { date: day(au.last_failure_at), error: au.last_error || "—" })}</span>}
            </>
          )}
      </Source>

      {facts.node && (
        <Source title={t("mints.prov.node")} seen={seen(facts.node)}>
          {facts.node.unreachable ? <span className="muted">{t("mints.prov.noNode")}</span> : (
            <>
              {facts.node.pubkey && (
                <a href={`https://mempool.space/lightning/node/${facts.node.pubkey}`} target="_blank" rel="noopener noreferrer nofollow"
                  className="ent text-xs break-all">{facts.node.alias || facts.node.pubkey}</a>
              )}
              {!facts.node.announced && <span className="muted">{t("mints.nodeUnannounced")}</span>}
              {facts.node.first_seen && <span>{t("mints.prov.firstSeen", { date: day(facts.node.first_seen) })}</span>}
              {facts.node.updated_at && <span>{t("mints.prov.announced", { date: day(facts.node.updated_at) })}</span>}
              {(facts.node.city || facts.node.country_name) && <span>{[facts.node.city, facts.node.country_name].filter(Boolean).join(", ")}</span>}
              {facts.node.org && <span className="muted text-sm">{facts.node.org}</span>}
            </>
          )}
        </Source>
      )}

      {facts.located && (
        <Source title={t("mints.prov.server")} seen={seen(facts.located)}>
          {facts.located.unreachable ? <span className="muted">{t("mints.prov.noServer")}</span> : (
            <>
              <span>{[facts.located.city, facts.located.region, facts.located.country].filter(Boolean).join(", ")}</span>
              {facts.located.org && <span className="muted text-sm">{facts.located.org}</span>}
              {facts.located.front && <span className="muted text-sm">{t("mints.prov.front")}</span>}
            </>
          )}
        </Source>
      )}

      {test && (
        <Source title={t("mints.prov.test")}>
          <span>{t(test.verdict === "passed" ? "mints.testPassed" : "mints.testFailed", { date: day(test.finished_at ?? test.started_at) })}</span>
        </Source>
      )}
    </>
  );
}

export default function MintProvenance({ facts }: { facts: MintFacts }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  // Near the right edge, the panel opens leftward so it stays on screen.
  const side = open && box.current && box.current.getBoundingClientRect().left + 400 > window.innerWidth ? "spec-right" : "spec-left";
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
    <span ref={box} className="spec-link prov-link" onPointerEnter={hover(true)} onPointerLeave={hover(false)}
      onClick={(e) => e.stopPropagation()}>
      <span className="muted text-xs break-all">{hostOf(facts.url)}</span>
      <button type="button" className="term-badge spec-eye" aria-expanded={open} aria-label={t("mints.prov.open")}
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}>
        <Eye size={13} aria-hidden />
      </button>
      {open && (
        <span role="tooltip" className={`term-panel spec-panel ${side} prov-panel`}>
          <Panel facts={facts} />
        </span>
      )}
    </span>
  );
}
