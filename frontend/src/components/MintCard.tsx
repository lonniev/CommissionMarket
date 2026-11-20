/**
 * One Cashu mint and what is known of it: its escrow NUTs, uptime, the
 * auditor's record, how many reviews (never stars), and the Operator's live
 * lock test. Each line comes from a named source; hovering shows when it was seen.
 */

import type { ReactNode } from "react";
import { useState } from "react";
import { CircleAlert, CircleCheck, FlaskConical, MessageSquare, ShieldCheck, Signal } from "lucide-react";
import { useLanguageLocale } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import type { MessageKey } from "../i18n/en";
import { hostOf, judge, mintIcon, mintName, percent, type Judged, type MintFacts } from "../lib/mints";
import { isTestMint } from "../lib/tasks";

export default function MintCard({ facts, now, chosen, children, showShort = false }: {
  facts: MintFacts;
  now: number;
  /** Drawn as the chosen one, as in a picker. */
  chosen?: boolean;
  /** Buttons for this mint. */
  children?: ReactNode;
  /** List what keeps it off the shortlist; for the Operator. */
  showShort?: boolean;
}) {
  const t = useT();
  const locale = useLanguageLocale();
  const [iconFailed, setIconFailed] = useState(false);
  const judged: Judged = judge(facts, now);
  const day = (s: number) => new Date(s * 1000).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const seen = (s: { source: string; observed_at: number }) =>
    t("mints.seenAt", { source: s.source, when: new Date(s.observed_at * 1000).toLocaleString(locale) });
  const { mint, cashumints: cm, auditor: au, live_test: test } = facts;
  const icon = mintIcon(facts);

  return (
    <div className={chosen ? "mint-card mint-card-chosen" : "mint-card"}>
      <div className="mint-head">
        {icon && !iconFailed
          ? <img src={icon} alt="" width={32} height={32} className="mint-icon" onError={() => setIconFailed(true)} />
          : <span className="mint-icon mint-icon-blank" aria-hidden>🪙</span>}
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{mintName(facts)}</div>
          <div className="muted text-xs break-all">{hostOf(facts.url)}{isTestMint(facts.url) && ` · ${t("cover.testMint")}`}</div>
        </div>
        {judged.meets && <span className="badge badge-paid" title={t("mints.rule")}><CircleCheck size={14} aria-hidden />{t("mints.meets")}</span>}
      </div>

      <ul className="mint-facts">
        <li title={seen(mint)}>
          {mint.unreachable
            ? <><CircleAlert size={16} aria-hidden className="error" />{t("mints.mark.mintNotReached")}</>
            : mint.missing_escrow_nuts?.length
              ? <><CircleAlert size={16} aria-hidden className="error" />{t("mints.nutsMissing", { nuts: mint.missing_escrow_nuts.join(", ") })}</>
              : <><ShieldCheck size={16} aria-hidden className="ok" />{t("mints.nutsOk")}</>}
        </li>
        <li title={seen(cm)}>
          <Signal size={16} aria-hidden className={typeof cm.uptime_30d === "number" && cm.uptime_30d >= 0.99 ? "ok" : "muted"} />
          {typeof cm.uptime_30d === "number" ? t("mints.uptime", { pct: percent(cm.uptime_30d) }) : t("mints.mark.uptimeUnknown")}
        </li>
        <li title={seen(au)}>
          <ShieldCheck size={16} aria-hidden className={judged.cleanDays !== null && judged.cleanDays >= 90 ? "ok" : "muted"} />
          {au.unreachable
            ? t("mints.mark.auditorNotReached")
            : !au.tracked || !au.swaps
              ? t("mints.mark.notAudited")
              : judged.cleanDays === null
                ? t("mints.mark.auditFailing")
                : t("mints.cleanSince", { date: day(au.clean_since ?? now), swaps: au.swaps })}
        </li>
        {cm.listed && (
          <li title={seen(cm)}>
            <MessageSquare size={16} aria-hidden className="muted" />
            {cm.reviews && cm.latest_review_at
              ? t("mints.reviews", { count: cm.reviews, date: day(cm.latest_review_at) })
              : t("mints.noReviews")}
          </li>
        )}
        {test && test.verdict !== "unfinished" && (
          <li>
            <FlaskConical size={16} aria-hidden className={test.verdict === "passed" ? "ok" : "error"} />
            {t(test.verdict === "passed" ? "mints.testPassed" : "mints.testFailed", { date: day(test.finished_at ?? test.started_at) })}
          </li>
        )}
      </ul>

      {showShort && judged.short.length > 0 && (
        <p className="error text-sm">{judged.short.map((m) => t(`mints.mark.${m}` as MessageKey)).join(" ")}</p>
      )}
      {children && <div className="flex flex-wrap justify-end gap-2">{children}</div>}
    </div>
  );
}
