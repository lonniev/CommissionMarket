/**
 * An npub's reputation: how they did on commissions as client, professional, arbiter and
 * inspector. Task Booth reports the counts; the rank on each card is this page's reading of
 * them. Anyone may look, signed in or not.
 */

import { useParams } from "react-router-dom";
import { NpubChip } from "@tollbooth-dpyc/web/react";
import { ROLE_MARK } from "../components/RankLine";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import type { MessageKey } from "../i18n/en.ts";
import { isNpub } from "../lib/cover";
import { REP_ROLES, standingIn, type RepRole } from "../lib/reputation";
import { useReputation } from "../lib/useReputation";
import type { Reputation, VerdictCounts } from "../lib/tasks";

type Row = [MessageKey, number | string];

function rowsOf(rep: Reputation, role: RepRole, verdict: (v: VerdictCounts) => Row[]): Row[] {
  switch (role) {
    case "client": {
      const c = rep.client;
      return [["rep.count.commissions", c.commissions], ["rep.count.graded", c.graded], ["rep.count.gradedInTime", c.graded_in_time],
        ["rep.count.owed", c.owed], ["rep.count.paid", c.paid], ["rep.count.appealsLost", c.appeals_lost]];
    }
    case "artist": {
      const a = rep.artist;
      return [["rep.count.commissions", a.commissions], ["rep.count.delivered", a.delivered], ["rep.count.onTime", a.on_time],
        ["rep.count.late", a.late], ["rep.count.failedWithoutCause", a.failed_without_cause],
        ["rep.count.failedWithCause", a.failed_with_cause], ["rep.count.appealsWon", a.appeals_won],
        ["rep.count.appealsLost", a.appeals_lost], ["rep.count.gradePct", a.grade_pct === null ? "—" : `${a.grade_pct}%`],
        ...verdict(a.verdicts)];
    }
    case "arbiter": {
      const a = rep.arbiter;
      return [["rep.count.named", a.named], ["rep.count.signed", a.signed], ["rep.count.decided", a.decided],
        ["rep.count.decidedInTime", a.decided_in_time]];
    }
    case "inspector": {
      const i = rep.inspector;
      return [["rep.count.named", i.named], ["rep.count.signed", i.signed], ["rep.count.opinions", i.opinions],
        ["rep.count.opinionsInTime", i.opinions_in_time], ...verdict(i.verdicts)];
    }
  }
}

export default function PersonPage() {
  const t = useT();
  const { npub = "" } = useParams();
  const valid = isNpub(npub);
  const { rep, problem } = useReputation(valid ? npub : "");
  const verdict = (v: VerdictCounts): Row[] => [
    ["inspection.verdict.verified", v.verified], ["inspection.verdict.concerns", v.concerns],
    ["inspection.verdict.not_verified", v.not_verified],
  ];

  return (
    <div className="page grid gap-3">
      <div className="toolbar">
        <h1 className="page-title">{t("rep.title")}</h1>
      </div>
      {valid ? <NpubChip npub={npub} /> : <p className="error">{t("rep.notAnNpub")}</p>}
      <p className="muted">{t("rep.says")}</p>
      {problem && <p className="error">{problem}</p>}
      {valid && !rep && !problem && <Waiting heading={t("rep.fetching")} />}
      {rep && (
        <div className="rep-cards">
          {REP_ROLES.map((role) => {
            const { rank, finished, good } = standingIn(rep, role);
            return (
              <section key={role} className="card panel grid gap-3">
                <div className="rep-card-head">
                  <h2 className="panel-title"><span aria-hidden>{ROLE_MARK[role]}</span> {t(`rep.role.${role}`)}</h2>
                  <span className={`rank-badge rank-${rank}`}>{t(`rep.rank.${rank}`)}</span>
                </div>
                {rank === "none" ? <p className="muted">{t("rep.noneYet")}</p> : (
                  <>
                    <p className="muted text-sm">{t("rep.wentWell", { good, finished })}</p>
                    <dl className="rep-counts">
                      {rowsOf(rep, role, verdict).map(([key, value]) => (
                        <div key={key} className="contents"><dt>{t(key)}</dt><dd>{value}</dd></div>
                      ))}
                    </dl>
                  </>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
