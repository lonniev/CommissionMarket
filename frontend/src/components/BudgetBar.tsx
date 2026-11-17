/** A Project's budget as a bar: paid, then committed beyond what was paid, against the whole. */

import { budgetLeft, budgetShare, type Totals } from "../lib/orgs";
import { useT } from "../i18n";
import Sats from "./Sats";

export default function BudgetBar({ budget, totals, compact = false }: { budget: number; totals: Totals; compact?: boolean }) {
  const t = useT();
  const left = budgetLeft(budget, totals);
  const paid = Math.min(1, budgetShare(budget, totals.paid_sats));
  const committed = Math.min(1, budgetShare(budget, totals.committed_sats));
  return (
    <div className="grid gap-1.5">
      {budget > 0 && (
        <div className={left !== null && left < 0 ? "budget-bar budget-over" : "budget-bar"} role="img"
          aria-label={t("project.barLabel", { paid: totals.paid_sats, committed: totals.committed_sats, budget })}>
          <span className="budget-committed" style={{ width: `${committed * 100}%` }} />
          <span className="budget-paid" style={{ width: `${paid * 100}%` }} />
        </div>
      )}
      <dl className={compact ? "budget-facts budget-compact" : "budget-facts"}>
        <div><dt>{t("project.paid")}</dt><dd><Sats sats={totals.paid_sats} /></dd></div>
        <div><dt>{t("project.committed")}</dt><dd><Sats sats={totals.committed_sats} /></dd></div>
        {budget > 0 && <div><dt>{t("project.budget")}</dt><dd><Sats sats={budget} /></dd></div>}
        {left !== null && !compact && <div><dt>{left < 0 ? t("project.over") : t("project.left")}</dt><dd><Sats sats={Math.abs(left)} /></dd></div>}
      </dl>
    </div>
  );
}
