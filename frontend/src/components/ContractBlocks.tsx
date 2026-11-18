/**
 * A posted commission's terms in the same seven blocks as its form, read-only
 * and closed, so the contract reads one line a block and opens where a reader
 * wants to look.
 */

import { Fragment, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguageLocale } from "@tollbooth-dpyc/web/react";
import { say, useT } from "../i18n";
import { BLOCKS, summaryOf, type BlockId, type Shape } from "../lib/formBlocks";
import { byReward } from "../lib/rubric";
import type { Task } from "../lib/tasks";
import { lateRuleText } from "../lib/when";
import FormBlock from "./FormBlock";
import { People, Person } from "./Person";
import Sats from "./Sats";

export default function ContractBlocks({ task }: { task: Task }) {
  const t = useT();
  const locale = useLanguageLocale();
  const [open, setOpen] = useState<Set<BlockId>>(new Set());
  const c = task.cover;
  const graded = task.assessment;
  const day = (s: number) => new Date(s * 1000).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const top = Math.max(0, ...task.rubric.grades.map((g) => g.sats));

  const shape: Shape = {
    title: task.title, deliverables: c?.deliverables.length ?? 0, invited: task.audience.length, arbiter: c?.arbiter_npub ?? "",
    grades: task.rubric.grades.length, topSats: top, neededBy: day(task.needed_by), late: task.late.kind,
    depositPct: task.deposit_pct, milestones: task.milestones.length, escrowMint: c?.escrow ? c.escrow_mint : "",
    deemedGrade: c?.deemed_grade ?? "", deemedDays: c?.deemed_acceptance_days ?? 0, ip: c?.ip_option ?? "assign", law: c?.governing_law ?? "",
  };

  const body: Record<BlockId, ReactNode> = {
    spec: (
      <dl className="facts">
        {c && <><dt>{t("cover.deliverables")}</dt><dd><ul className="deliverables">{c.deliverables.map((d) => <li key={d}>{d}</li>)}</ul></dd></>}
        {c?.spec_url && <><dt>{t("cover.specUrl")}</dt><dd><a href={c.spec_url} target="_blank" rel="noopener noreferrer nofollow" className="ent">{c.spec_url}</a></dd></>}
        {c?.spec_hash && <><dt>{t("cover.specHash")}</dt><dd><code className="hash">{c.spec_hash}</code></dd></>}
      </dl>
    ),
    people: (
      <dl className="facts">
        <dt>{t("commission.client")}</dt><dd><Person npub={task.purchaser} /></dd>
        {task.performer
          ? <><dt>{t("commission.professional")}</dt><dd><Person npub={task.performer} /></dd></>
          : <><dt>{t("commission.whoMay")}</dt><dd><People npubs={task.audience} /></dd></>}
        {c?.arbiter_npub && <><dt>{t("cover.arbiter")}</dt><dd><Person npub={c.arbiter_npub} /></dd></>}
      </dl>
    ),
    grades: (
      <table className="ledger">
        <tbody>
          {byReward(task.rubric.grades).map((g) => (
            <tr key={g.name} className={graded?.grade === g.name ? "grade-given" : undefined}>
              <td className="font-medium">{g.name}</td>
              <td className="muted">{g.criteria}</td>
              <td className="text-right"><Sats sats={g.sats} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
    schedule: (
      <dl className="facts">
        <dt>{t("commission.neededBy")}</dt><dd>{day(task.needed_by)}</dd>
        <dt>{t("commission.ifLate")}</dt><dd>{say(t, lateRuleText(task.late))}</dd>
      </dl>
    ),
    payments: (
      <dl className="facts">
        <dt>{t("form.deposit")}</dt><dd>{task.deposit_pct}%</dd>
        {task.milestones.map((m) => <Fragment key={m.name}><dt>{m.name}</dt><dd>{m.pct}% · {day(m.due_at)}</dd></Fragment>)}
        <dt>{t("cover.escrowShort")}</dt>
        <dd>{c?.escrow ? t("cover.escrowFact", { mint: c.escrow_mint, days: c.refund_days }) : t("block.sum.noEscrow")}</dd>
      </dl>
    ),
    conclusion: (
      <>
        <dl className="facts">
          <dt>{t("cover.deemedGrade")}</dt>
          <dd>{c?.deemed_grade ? t("cover.deemedAfter", { grade: c.deemed_grade, days: c.deemed_acceptance_days }) : t("cover.noDeemed")}</dd>
        </dl>
        <p className="muted text-sm">{t("block.conclusionRules")} <Link to="/terms?version=v1#t-4-6" className="ent">§4.6</Link></p>
      </>
    ),
    legal: c ? (
      <dl className="facts">
        <dt>{t("cover.ip")}</dt><dd>{t(`cover.ip.${c.ip_option}`)}{c.ip_custom_text && ` · ${c.ip_custom_text}`}</dd>
        {c.confidential && <><dt>{t("cover.confidentialShort")}</dt><dd>✓</dd></>}
        {c.client_is_consumer && <><dt>{t("cover.consumerShort")}</dt><dd>✓</dd></>}
        <dt>{t("cover.thirdPartyShort")}</dt><dd>{c.third_party_allowed ? t("cover.allowed") : t("cover.notAllowed")}</dd>
        {c.governing_law && <><dt>{t("cover.law")}</dt><dd>{c.governing_law}</dd></>}
        {c.venue && <><dt>{t("cover.venue")}</dt><dd>{c.venue}</dd></>}
        <dt>{t("nav.terms")}</dt>
        <dd><Link to={`/terms?version=${encodeURIComponent(c.terms_version)}`} className="ent">{c.terms_version}</Link> · <code className="hash">{c.terms_hash.slice(0, 12)}…</code></dd>
      </dl>
    ) : null,
  };

  const shown = BLOCKS.filter((id) => c || (id !== "conclusion" && id !== "legal"));
  return (
    <section className="card panel">
      <h2 className="panel-title mb-1">{t("block.contract")}</h2>
      {shown.map((id) => (
        <FormBlock key={id} id={id} summary={summaryOf(id, shape)} open={open.has(id)}
          onToggle={(on) => setOpen((o) => { const n = new Set(o); if (on) n.add(id); else n.delete(id); return n; })}>
          {body[id]}
        </FormBlock>
      ))}
    </section>
  );
}
