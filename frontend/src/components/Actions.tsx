/**
 * The next step a commission offers the signed-in person. A move that takes
 * something back asks for a second tap; one that needs words (a grade, a
 * reason) opens a small form in place. A move waiting on a signature says so.
 * Paying and confirming a payment live on the money panel.
 */

import { useState } from "react";
import { Check, Hand, MessageCircleQuestion, PenLine, ThumbsUp, Undo2, X, type LucideIcon } from "lucide-react";
import { formatSats } from "@tollbooth-dpyc/web";
import { useT } from "../i18n";
import { movesFor, waitsOnSignature, type Move } from "../lib/moves";
import { byReward } from "../lib/rubric";
import { appeal, assess, decideAppeal, isPlain, move, reject, type Task } from "../lib/tasks";

const ICON: Partial<Record<Move, LucideIcon>> = {
  claim: Hand, mark_done: Check, release: Undo2, withdraw: Undo2, grade: ThumbsUp, reject: X,
  accept: ThumbsUp, appeal: MessageCircleQuestion, decide: ThumbsUp,
};

/** Moves that undo something: they ask twice. */
const TAKES_BACK: Move[] = ["release", "withdraw"];
/** The money panel draws these. */
const MONEY: Move[] = ["pay", "confirm_paid"];

type Asking = "grade" | "decide" | "reject" | "appeal" | null;

export default function Actions({ task, onChanged }: { task: Task; onChanged: (task: Task) => void }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [asking, setAsking] = useState<Asking>(null);
  const [sure, setSure] = useState<Move | null>(null);
  const [reasons, setReasons] = useState("");
  const t = useT();

  const moves = movesFor(task).filter((m) => !MONEY.includes(m));
  if (!moves.length) return null;

  async function run(action: () => Promise<Task>) {
    setBusy(true);
    setProblem("");
    try {
      onChanged(await action());
      setAsking(null);
      setSure(null);
      setReasons("");
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function press(m: Move) {
    if (TAKES_BACK.includes(m) && sure !== m) return setSure(m);
    if (isPlain(m)) return void run(() => move(task.task_id, m));
    setAsking(m as Asking);
  }

  const gates = moves.map((m) => waitsOnSignature(task, m)).filter((g) => g !== null);

  return (
    <div className="actions">
      <div className="actions-row">
        {moves.map((m) => {
          const Icon = ICON[m] ?? Check;
          const gated = waitsOnSignature(task, m) !== null;
          const tone = TAKES_BACK.includes(m) || m === "reject" || m === "appeal" ? "btn btn-quiet" : "btn btn-go";
          return (
            <button key={m} type="button" className={tone} disabled={busy || gated} onClick={() => press(m)} onBlur={() => sure === m && setSure(null)}>
              <Icon size={18} aria-hidden />
              {sure === m ? t("actions.sure") : t(`actions.${m}`)}
            </button>
          );
        })}
      </div>
      {gates.map((g) => <p key={g} className="gate"><PenLine size={16} aria-hidden />{t(g)}</p>)}

      {asking && (
        <div className="ask">
          {(asking === "grade" || asking === "decide") && (
            <div className="grade-picks">
              {byReward(task.rubric.grades).map((g) => (
                <button key={g.name} type="button" className="btn btn-grade" disabled={busy}
                  onClick={() => void run(() => (asking === "grade" ? assess : decideAppeal)(task.task_id, g.name, reasons))}>
                  <span>{g.name}</span>
                  <span className="num">{t("sats.amount", { sats: formatSats(g.sats) })}</span>
                </button>
              ))}
            </div>
          )}
          <textarea className="field w-full" rows={3} maxLength={4000} value={reasons} onChange={(e) => setReasons(e.target.value)}
            placeholder={asking === "appeal" ? t("actions.appealPlaceholder") : t("actions.wordsPlaceholder")} aria-label={t("actions.words")} />
          <div className="actions-row">
            {asking === "reject" && (
              <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => void run(() => reject(task.task_id, reasons))}>
                <X size={18} aria-hidden />{t("actions.notDelivered")}
              </button>
            )}
            {asking === "appeal" && (
              <button type="button" className="btn btn-go" disabled={busy} onClick={() => void run(() => appeal(task.task_id, reasons))}>
                <MessageCircleQuestion size={18} aria-hidden />{t("actions.sendAppeal")}
              </button>
            )}
            <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => setAsking(null)}>{t("actions.cancel")}</button>
          </div>
        </div>
      )}
      {problem && <p className="error text-right">{problem}</p>}
    </div>
  );
}
