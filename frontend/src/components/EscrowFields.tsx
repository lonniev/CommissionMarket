/**
 * The arbiter and the escrow on a commission's cover page.
 *
 * Escrow holds the Balance at a Cashu mint the Operator offers, locked so any
 * two of client, professional and arbiter move it, and the client alone after
 * the refund date (terms 6). It needs an arbiter and a deemed grade, so a
 * silent party can never hold it hostage.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { tourTarget } from "@tollbooth-dpyc/web/react";
import { leastRefundOf, MAX_REFUND_DAYS, type CoverRows } from "../lib/cover";
import { mintFacts } from "../lib/tasks";
import type { MintFacts } from "../lib/mints";
import MintCard from "./MintCard";
import { useT } from "../i18n";
import type { BlockId } from "../lib/formBlocks";

export default function EscrowFields({ cover, set, onOpen }: {
  cover: CoverRows;
  set: <K extends keyof CoverRows>(key: K, value: CoverRows[K]) => void;
  /** Open another block of the form, where something escrow needs is set. */
  onOpen: (block: BlockId) => void;
}) {
  const t = useT();
  const [facts, setFacts] = useState<MintFacts[] | null>(null);
  const mints = facts?.map((f) => f.url) ?? null;
  const now = Math.floor(Date.now() / 1000);
  const least = leastRefundOf(cover);

  useEffect(() => {
    let live = true;
    mintFacts().then((r) => live && setFacts(r.mints)).catch(() => live && setFacts([]));
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (cover.escrow && !cover.mint && facts?.length) set("mint", facts[0].url);
  }, [cover.escrow, cover.mint, facts, set]);

  // The refund date can never fall inside an appeal: as the deemed days grow, the floor does too.
  // Applied when escrow is ticked or the floor moves, never while the days are typed.
  const typed = useRef(cover.refundDays);
  typed.current = cover.refundDays;
  useEffect(() => {
    const days = Number(typed.current);
    if (cover.escrow && (!typed.current || (Number.isInteger(days) && days < least))) set("refundDays", String(least));
  }, [cover.escrow, least]);

  function hold(on: boolean) {
    set("escrow", on);
  }

  return (
    <div className="grid gap-2">
      <label className="check">
        <input type="checkbox" checked={cover.escrow} onChange={(e) => hold(e.target.checked)} />
        <span>{t("cover.escrow")}</span>
      </label>
      <p className="muted text-sm">
        {t("cover.escrowHelp")}{" "}
        <Link to="/terms?version=v1#t-6-1" className="ent">{t("cover.escrowTerms")}</Link>
      </p>
      {cover.escrow && !cover.arbiter.trim() && (
        <p className="error text-sm">
          {t("cover.escrowNeedsArbiter")}{" "}
          <button type="button" className="link-btn" onClick={() => onOpen("people")}>{t("block.people")}</button>
        </p>
      )}
      {cover.escrow && !cover.deemedGrade && (
        <p className="error text-sm">
          {t("cover.escrowNeedsFallback")}{" "}
          <button type="button" className="link-btn" onClick={() => onOpen("conclusion")}>{t("block.conclusion")}</button>
        </p>
      )}

      {cover.escrow && (
        <div className="grid gap-2">
          <div className="grid gap-1">
            <span className="label">{t("cover.mint")}</span>
            {mints && !mints.length
              ? <span className="error">{t("cover.noMints")}</span>
              : (
                <div className="mint-grid" role="radiogroup" aria-label={t("cover.mint")} {...tourTarget("compose.mint")}>
                  {(facts ?? []).map((f) => (
                    <button key={f.url} type="button" role="radio" aria-checked={cover.mint === f.url}
                      className="mint-pick" onClick={() => set("mint", f.url)}>
                      <MintCard facts={f} now={now} chosen={cover.mint === f.url} />
                    </button>
                  ))}
                </div>
              )}
            <p className="muted text-sm">
              {t("mints.pick.says")}{" "}
              <Link to="/glossary#mint" className="ent">{t("mints.pick.what")}</Link>
            </p>
          </div>
          <label className="grid gap-1">
            <span className="label">{t("cover.refundDays")}</span>
            <input className="field num text-right" inputMode="numeric" maxLength={2} value={cover.refundDays}
              onChange={(e) => set("refundDays", e.target.value)} />
            <span className="muted text-sm">{t("cover.refundHelp", { least, most: MAX_REFUND_DAYS })}</span>
          </label>
        </div>
      )}
    </div>
  );
}
