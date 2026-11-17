/**
 * Every payment a commission makes, in order: the deposit on claim, each
 * milestone on its date, and the graded award less what was paid ahead.
 *
 * Each payment is an invoice for exactly its sats, paid from the client's own
 * wallet straight to the professional's. The client asks for the invoice; a
 * professional without a Lightning address hands in their own; the
 * professional says when the sats arrived.
 */

import { useState } from "react";
import { CircleCheck, Clock, Zap } from "lucide-react";
import { Tx, useLanguageLocale } from "@tollbooth-dpyc/web/react";
import { useT, WORDS } from "../i18n";
import { formatSats } from "@tollbooth-dpyc/web";
import { paidAhead, shareOf } from "../lib/money";
import { waitsOnTheirRequest } from "../lib/problems";
import { topSats } from "../lib/rubric";
import { confirmArrived, invoiceFor, type Invoice, type Payment, type Task } from "../lib/tasks";
import HandIn from "./HandIn";
import InvoicePanel, { keptInvoice } from "./InvoicePanel";
import { Person } from "./Person";
import Sats from "./Sats";

interface Row {
  payment: Payment;
  label: string;
  sats: number;
  /** When it may be asked for; 0 for at once. */
  dueAt: number;
  paidAt: number | null;
  /** The invoice the commission keeps for it, if one is still fresh. */
  kept: Invoice | null;
  /** It can be invoiced and confirmed now, from where the commission stands. */
  open: boolean;
}

function PayRow({ task, row, now, onChanged }: { task: Task; row: Row; now: number; onChanged: (task: Task) => void }) {
  const t = useT();
  const locale = useLanguageLocale();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const client = task.your_roles.includes("purchaser");
  const professional = task.your_roles.includes("performer");
  const live = [invoice, row.kept].find((i) => i && i.expires_at > now) ?? null;
  const notYet = row.dueAt > now;
  const waitingOnThem = waitsOnTheirRequest(problem);

  async function act(what: () => Promise<void>) {
    setBusy(true);
    setProblem("");
    try {
      await what();
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const ask = () => act(async () => setInvoice(await invoiceFor(task.task_id, row.payment)));
  const arrived = () => act(async () => onChanged(await confirmArrived(task.task_id, row.payment)));

  return (
    <li className="pay-row">
      <div className="pay-head">
        <span className="font-medium">{row.label}</span>
        <Sats sats={row.sats} />
      </div>
      <p className="pay-state">
        {row.paidAt
          ? <><CircleCheck size={16} aria-hidden className="ok" />{t("money.arrived", { when: new Date(row.paidAt * 1000).toLocaleDateString(locale) })}</>
          : notYet
            ? <><Clock size={16} aria-hidden />{t("money.dueOn", { when: new Date(row.dueAt * 1000).toLocaleDateString(locale) })}</>
            : row.open ? <><Zap size={16} aria-hidden />{t("money.dueNow")}</> : <span className="muted">{t("money.afterClaim")}</span>}
      </p>

      {row.open && !row.paidAt && !notYet && (
        <div className="grid gap-2">
          {live && <InvoicePanel invoice={live} now={now} />}
          <div className="actions-row">
            {client && !live && (
              <button type="button" className="btn btn-money" disabled={busy} onClick={() => void ask()}>
                <Zap size={18} aria-hidden />{t("money.getInvoice")}
              </button>
            )}
            {professional && live && (
              <button type="button" className="btn btn-go" disabled={busy} onClick={() => void arrived()}>
                <CircleCheck size={18} aria-hidden />{t("money.itArrived")}
              </button>
            )}
          </div>
          {professional && !live && <HandIn taskId={task.task_id} payment={row.payment} sats={row.sats} onTaken={setInvoice} />}
          {waitingOnThem && task.performer && (
            <p className="muted text-right text-sm"><Tx ns={WORDS} k="money.waitsOnThem" components={{ person: <Person npub={task.performer} /> }} /></p>
          )}
          {problem && !waitingOnThem && <p className="error text-right">{problem}</p>}
        </div>
      )}
    </li>
  );
}

export default function MoneyPanel({ task, payout, now, onChanged }: {
  task: Task; payout: Invoice | null; now: number; onChanged: (task: Task) => void;
}) {
  const t = useT();
  const top = topSats(task.rubric);
  const claimed = !!task.performer;
  const working = task.standing === "claimed" || task.standing === "done";
  const rows: Row[] = [];

  if (task.deposit_pct > 0) {
    const d = task.deposit;
    rows.push({
      payment: { kind: "deposit" }, label: t("money.deposit", { pct: task.deposit_pct }),
      sats: d?.sats ?? shareOf(top, task.deposit_pct), dueAt: 0, paidAt: d?.paid_at ?? null,
      kept: d ? keptInvoice(d) : null, open: claimed && !!d && working,
    });
  }
  task.milestones.forEach((m, index) => rows.push({
    payment: { kind: "milestone", index }, label: t("money.milestone", { name: m.name, pct: m.pct }),
    sats: m.sats ?? shareOf(top, m.pct), dueAt: m.due_at, paidAt: m.paid_at ?? null,
    kept: keptInvoice(m), open: claimed && working,
  }));

  const graded = task.assessment;
  const ahead = graded?.paid_ahead_sats ?? paidAhead(task.deposit, task.milestones);
  if (graded) {
    rows.push({
      payment: { kind: "award" }, label: t("money.award", { grade: graded.grade }), sats: graded.sats, dueAt: 0,
      paidAt: task.paid_at ?? null, kept: payout, open: task.standing === "owed",
    });
  }

  if (!rows.length) return null;

  return (
    <section className="card panel grid gap-3">
      <h2 className="panel-title">{t("money.title")}</h2>
      <ul className="pay-list">
        {rows.map((row) => (
          <PayRow key={row.payment.kind === "milestone" ? `m${row.payment.index}` : row.payment.kind} task={task} row={row} now={now} onChanged={onChanged} />
        ))}
      </ul>
      {graded && (
        <dl className="facts text-sm">
          <dt>{t("money.earned")}</dt><dd><Sats sats={graded.earned_sats ?? graded.sats} /></dd>
          <dt>{t("money.paidAhead")}</dt><dd><Sats sats={ahead} /></dd>
          <dt>{t("money.owed")}</dt><dd><Sats sats={graded.sats} /></dd>
        </dl>
      )}
      {!graded && ahead > 0 && <p className="muted text-sm text-right">{t("money.aheadSoFar", { sats: formatSats(ahead) })}</p>}
    </section>
  );
}
