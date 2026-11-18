/**
 * The arbiter and the escrow on a commission's cover page.
 *
 * Escrow holds the Balance at a Cashu mint the Operator offers, locked so any
 * two of client, professional and arbiter move it, and the client alone after
 * the refund date (terms 6). It needs an arbiter and a deemed grade, so a
 * silent party can never hold it hostage.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { leastRefundDays, MAX_REFUND_DAYS, type CoverRows } from "../lib/cover";
import { escrowMints, isTestMint } from "../lib/tasks";
import { useT } from "../i18n";

export default function EscrowFields({ cover, set }: {
  cover: CoverRows;
  set: <K extends keyof CoverRows>(key: K, value: CoverRows[K]) => void;
}) {
  const t = useT();
  const [mints, setMints] = useState<string[] | null>(null);
  const deemedDays = cover.deemedGrade ? Number(cover.deemedDays) || 0 : 0;
  const least = leastRefundDays(deemedDays);
  const ready = Boolean(cover.arbiter.trim() && cover.deemedGrade);

  useEffect(() => {
    let live = true;
    escrowMints().then((m) => live && setMints(m)).catch(() => live && setMints([]));
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (cover.escrow && !cover.mint && mints?.length) set("mint", mints[0]);
  }, [cover.escrow, cover.mint, mints, set]);

  function hold(on: boolean) {
    set("escrow", on);
    if (on && !cover.refundDays) set("refundDays", String(least));
  }

  return (
    <div className="grid gap-2">
      <label className="grid gap-1">
        <span className="label">{t("cover.arbiter")}</span>
        <input className="field font-mono text-sm" value={cover.arbiter} onChange={(e) => set("arbiter", e.target.value.trim())}
          placeholder="npub1…" autoCapitalize="none" spellCheck={false} />
      </label>
      <p className="muted text-sm">{t("cover.arbiterHelp")}</p>

      <label className="check">
        <input type="checkbox" checked={cover.escrow} disabled={!ready && !cover.escrow} onChange={(e) => hold(e.target.checked)} />
        <span>{t("cover.escrow")}</span>
      </label>
      <p className="muted text-sm">
        {ready || cover.escrow ? t("cover.escrowHelp") : t("cover.escrowNeeds")}{" "}
        <Link to="/terms?version=v1#t-6-1" className="ent">{t("cover.escrowTerms")}</Link>
      </p>

      {cover.escrow && (
        <div className="two-up">
          <label className="grid gap-1">
            <span className="label">{t("cover.mint")}</span>
            {mints && !mints.length
              ? <span className="error">{t("cover.noMints")}</span>
              : (
                <select className="field" value={cover.mint} onChange={(e) => set("mint", e.target.value)}>
                  {(mints ?? (cover.mint ? [cover.mint] : [])).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
            {cover.mint && isTestMint(cover.mint) && <span className="muted text-sm">{t("cover.testMint")}</span>}
          </label>
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
