/**
 * The Operator's choice of escrow mints: the ones offered, each with its
 * facts, and a search of the mints that claim every escrow NUT, best first.
 * Clients choose only from the offered ones (terms 6.14). Drawn for the
 * Operator alone.
 */

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, Search } from "lucide-react";
import { isOperator, sessionStatus } from "@tollbooth-dpyc/web";
import { tourTarget, useAppShell, useLanguageLocale } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import { filtered, matching, pageOf, ranked, regionsOf, withMint, type MintFacts } from "../lib/mints";

/** Cards on one page of the search: three rows of three on a wide screen. */
const PAGE = 9;
import { findMints, mintFacts, offerMints } from "../lib/tasks";
import MintCard from "./MintCard";
import MintTest from "./MintTest";

export default function EscrowMints() {
  const t = useT();
  const { session } = useAppShell();
  const [mine, setMine] = useState(false);
  const [offered, setOffered] = useState<MintFacts[] | null>(null);
  const [found, setFound] = useState<MintFacts[] | null>(null);
  const locale = useLanguageLocale();
  const [onlyMeets, setOnlyMeets] = useState(true);
  const [onlyEstablished, setOnlyEstablished] = useState(false);
  const [onlyFresh, setOnlyFresh] = useState(false);
  const [region, setRegion] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [testing, setTesting] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const now = Math.floor(Date.now() / 1000);

  // Gate first, as the package's operator panel does: a patron asks for nothing of the Operator's.
  useEffect(() => {
    let live = true;
    sessionStatus().then((s) => live && setMine(isOperator(session.npub, s))).catch(() => undefined);
    return () => { live = false; };
  }, [session.npub]);

  const load = useCallback(async () => {
    try {
      setOffered((await mintFacts()).mints);
    } catch (e) {
      setProblem((e as Error).message);
    }
  }, []);

  useEffect(() => { if (mine) void load(); }, [mine, load]);

  async function find() {
    setBusy(true);
    setProblem("");
    try {
      setFound((await findMints()).mints);
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function offer(url: string, on: boolean) {
    setBusy(true);
    setProblem("");
    try {
      await offerMints(withMint((offered ?? []).map((f) => f.url), url, on));
      await load();
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!mine) return null;
  const offeredUrls = new Set((offered ?? []).map((f) => f.url));
  const candidates = found
    ? matching(filtered(ranked(found, now).filter((r) => !offeredUrls.has(r.facts.url)),
        { meets: onlyMeets, established: onlyEstablished, fresh: onlyFresh, region }, now), query)
    : [];
  const regions = found ? regionsOf(found) : [];
  const countryName = (code: string) => {
    try { return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code; } catch { return code; }
  };
  const check = (on: boolean, set: (v: boolean) => void, label: string) => (
    <label className="check text-sm">
      <input type="checkbox" checked={on} onChange={(e) => { set(e.target.checked); setPage(0); }} />
      <span>{label}</span>
    </label>
  );
  const shown = pageOf(candidates, page, PAGE);

  const test = (url: string) => testing === url
    ? <div className="mint-test-box"><MintTest mint={url} now={now} onDone={() => void load()} /></div>
    : null;

  return (
    <section className="card panel grid gap-3 account-wide" {...tourTarget("profile.mints")}>
      <h2 className="panel-title">{t("mints.panel.title")}</h2>
      <p className="muted text-sm">{t("mints.panel.says")}</p>
      <p className="muted text-sm">{t("mints.rule")} <Link to="/glossary#w-mint_rule" className="ent">{t("mints.ruleLink")}</Link></p>

      {offered && !offered.length && <p className="muted">{t("mints.none")}</p>}
      <div className="mint-grid">
        {(offered ?? []).map((f) => (
          <div key={f.url} className="grid gap-2">
            <MintCard facts={f} now={now} showShort>
              <button type="button" className="chip" disabled={busy} onClick={() => setTesting(testing === f.url ? "" : f.url)}>
                {t("mints.test.open")}
              </button>
              <button type="button" className="chip" disabled={busy} onClick={() => void offer(f.url, false)}>
                <Minus size={16} aria-hidden />{t("mints.remove")}
              </button>
            </MintCard>
            {test(f.url)}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {found && (
          <>
            <input className="field min-w-0 flex-1" type="search" value={query} placeholder={t("mints.search")}
              aria-label={t("mints.search")} onChange={(e) => { setQuery(e.target.value); setPage(0); }} />
            <select className="field" value={region} aria-label={t("mints.region")}
              onChange={(e) => { setRegion(e.target.value); setPage(0); }}>
              <option value="">{t("mints.anyRegion")}</option>
              {regions.map((c) => <option key={c} value={c}>{countryName(c)}</option>)}
            </select>
            {check(onlyMeets, setOnlyMeets, t("mints.onlyMeets"))}
            {check(onlyEstablished, setOnlyEstablished, t("mints.onlyEstablished"))}
            {check(onlyFresh, setOnlyFresh, t("mints.onlyFresh"))}
          </>
        )}
        <button type="button" className="btn btn-go" disabled={busy} onClick={() => void find()}>
          <Search size={18} aria-hidden />{busy && !found ? t("mints.finding") : t("mints.find")}
        </button>
      </div>
      {found && !candidates.length && <p className="muted text-right">{t("mints.noneFound")}</p>}
      <div className="mint-grid">
        {shown.rows.map(({ facts }) => (
          <div key={facts.url} className="grid gap-2">
            <MintCard facts={facts} now={now} showShort>
              <button type="button" className="chip" disabled={busy} onClick={() => setTesting(testing === facts.url ? "" : facts.url)}>
                {t("mints.test.open")}
              </button>
              <button type="button" className="chip chip-accent" disabled={busy} onClick={() => void offer(facts.url, true)}>
                <Plus size={16} aria-hidden />{t("mints.add")}
              </button>
            </MintCard>
            {test(facts.url)}
          </div>
        ))}
      </div>
      {shown.pages > 1 && (
        <nav className="flex flex-wrap items-center justify-end gap-2" aria-label={t("mints.pages")}>
          <span className="muted text-sm">{t("mints.page", { from: shown.from, to: shown.to, count: candidates.length })}</span>
          <button type="button" className="chip" disabled={shown.page === 0} onClick={() => setPage(shown.page - 1)}
            aria-label={t("mints.prev")}><ChevronLeft size={16} aria-hidden /></button>
          <button type="button" className="chip" disabled={shown.page >= shown.pages - 1} onClick={() => setPage(shown.page + 1)}
            aria-label={t("mints.next")}><ChevronRight size={16} aria-hidden /></button>
        </nav>
      )}
      {problem && <p className="error text-right">{problem}</p>}
    </section>
  );
}
