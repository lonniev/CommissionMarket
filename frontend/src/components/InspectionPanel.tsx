/**
 * The inspector's opinion of the delivered work (terms 8.6 to 8.10): advice everyone on the
 * commission sees, which grades nothing and moves no escrow.
 *
 * The inspector picks a verdict, says why, and signs by replying to a Nostr DM. The verdict
 * and reasons are kept with the DM's nonce for this browser tab, since the reply is
 * collected against exactly what was sent.
 */

import { useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { CircleCheck, CircleX, Search, Send, TriangleAlert } from "lucide-react";
import { Tx, useLanguageLocale } from "@tollbooth-dpyc/web/react";
import { useT, WORDS } from "../i18n";
import { inspectorDue } from "../lib/arbiter";
import { keepAsk, keptAsk, type Asked } from "../lib/keptAsk";
import { receiveInspection, requestInspection, VERDICTS, type Task, type Verdict } from "../lib/tasks";
import { Person } from "./Person";

const MAX_REASONS = 2000;
const DELIVERED = new Set(["done", "assessed", "appealed", "owed", "paid", "rejected"]);

const keyOf = (taskId: string) => `commission:inspecting:${taskId}`;

interface AskedOpinion extends Asked {
  verdict: Verdict;
  reasons: string;
}

const MARK = {
  verified: <CircleCheck size={20} aria-hidden className="ok" />,
  concerns: <TriangleAlert size={20} aria-hidden className="warn" />,
  not_verified: <CircleX size={20} aria-hidden className="error" />,
} satisfies Record<Verdict, ReactElement>;

export default function InspectionPanel({ task, onChanged }: { task: Task; onChanged: (task: Task) => void }) {
  const t = useT();
  const locale = useLanguageLocale();
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [reasons, setReasons] = useState("");
  const [asked, setAsked] = useState<AskedOpinion | null>(() => keptAsk(keyOf(task.task_id)) as AskedOpinion | null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const inspector = task.cover?.inspector_npub ?? "";
  const opinion = task.inspection;
  const due = inspectorDue(task) === "opinion";
  if (!inspector || (!opinion && !due && !DELIVERED.has(task.standing))) return null;

  async function ask() {
    if (!verdict || !reasons.trim()) return;
    setBusy(true);
    setProblem("");
    try {
      const said = reasons.trim();
      const r = await requestInspection(task.task_id, verdict, said);
      const kept = { nonce: r.nonce, statement_hash: r.statement_hash, verdict, reasons: said };
      keepAsk(keyOf(task.task_id), kept);
      setAsked(kept);
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function collect() {
    if (!asked) return;
    setBusy(true);
    setProblem("");
    try {
      const signed = await receiveInspection(task.task_id, asked.verdict, asked.reasons, asked.nonce, asked.statement_hash);
      keepAsk(keyOf(task.task_id), null);
      setAsked(null);
      onChanged(signed);
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    keepAsk(keyOf(task.task_id), null);
    setAsked(null);
  }

  return (
    <section className="card panel grid gap-3">
      <h2 className="panel-title flex items-center gap-2"><Search size={18} aria-hidden />{t("inspection.title")}</h2>

      {opinion && (
        <div className="grid gap-2">
          <p className="verdict-line">{MARK[opinion.verdict]}<strong>{t(`inspection.verdict.${opinion.verdict}`)}</strong></p>
          <blockquote className="quote">{opinion.reasons}</blockquote>
          <p className="muted text-sm flex flex-wrap items-center gap-2">
            {t("inspection.signedBy")} <Person npub={opinion.inspector} />
            {new Date(opinion.at * 1000).toLocaleString(locale)}
          </p>
        </div>
      )}

      {!opinion && !due && (
        <p className="muted flex flex-wrap items-center gap-2">{t("inspection.awaits")} <Person npub={inspector} /></p>
      )}

      {due && !asked && (
        <div className="grid gap-3">
          <p>{t("inspection.youGive")}</p>
          <div className="verdict-choices" role="radiogroup" aria-label={t("inspection.title")}>
            {VERDICTS.map((v) => (
              <button key={v} type="button" role="radio" aria-checked={verdict === v}
                className={`verdict-choice${verdict === v ? " chosen" : ""}`} onClick={() => setVerdict(v)}>
                {MARK[v]}<span>{t(`inspection.verdict.${v}`)}</span>
              </button>
            ))}
          </div>
          <label className="grid gap-1">
            <span className="label">{t("inspection.reasons")}</span>
            <textarea className="field" rows={4} maxLength={MAX_REASONS} value={reasons} onChange={(e) => setReasons(e.target.value)} />
          </label>
          <div className="actions-row">
            <button type="button" className="btn btn-go" disabled={busy || !verdict || !reasons.trim()} onClick={() => void ask()}>
              <Send size={18} aria-hidden />{t("offer.sendDm")}
            </button>
          </div>
        </div>
      )}

      {due && asked && (
        <div className="ask">
          <p className="verdict-line">{MARK[asked.verdict]}<strong>{t(`inspection.verdict.${asked.verdict}`)}</strong></p>
          <ol className="how-steps">
            <li>{t("offer.step.open")}</li>
            <li><Tx ns={WORDS} k="offer.step.check" components={{ hash: <code className="hash">{asked.statement_hash.slice(0, 12)}…</code> }} /></li>
            <li>{t("offer.step.reply")}</li>
          </ol>
          <div className="actions-row">
            <button type="button" className="btn btn-quiet" disabled={busy} onClick={startOver}>{t("offer.again")}</button>
            <button type="button" className="btn btn-go" disabled={busy} onClick={() => void collect()}>{t("offer.replied")}</button>
          </div>
        </div>
      )}

      <p className="muted text-sm">{t("inspection.advice")} <Link to="/terms?version=v1#t-8-6" className="ent">§8</Link></p>
      {problem && <p className="error text-right">{problem}</p>}
    </section>
  );
}
