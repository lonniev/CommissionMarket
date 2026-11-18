/**
 * The offer both parties sign: the commission's terms as one plain statement,
 * its sha256, and who has signed it.
 *
 * A person signs by replying to a Nostr DM from Task Booth; their signed reply
 * is the signature. The DM's nonce is kept for this browser tab, so a reload
 * between asking and replying loses nothing.
 */

import { useCallback, useEffect, useState } from "react";
import { CircleCheck, CircleDashed, FileSignature, Send } from "lucide-react";
import { Tx, useLanguageLocale } from "@tollbooth-dpyc/web/react";
import { useT, WORDS } from "../i18n";
import { mySignatureDue } from "../lib/moves";
import { offerTerms, receiveSignature, requestSignature, type Offer, type Task } from "../lib/tasks";
import { Person } from "./Person";

const keyOf = (taskId: string) => `commission:signing:${taskId}`;

interface Asked {
  nonce: string;
  statement_hash: string;
}

function keptAsk(taskId: string): Asked | null {
  try {
    const kept = sessionStorage.getItem(keyOf(taskId));
    return kept ? (JSON.parse(kept) as Asked) : null;
  } catch {
    return null;
  }
}

function keepAsk(taskId: string, asked: Asked | null) {
  try {
    if (asked) sessionStorage.setItem(keyOf(taskId), JSON.stringify(asked));
    else sessionStorage.removeItem(keyOf(taskId));
  } catch {
    // Without storage the ask lives as long as this page does.
  }
}

export default function OfferPanel({ task, onChanged }: { task: Task; onChanged: (task: Task) => void }) {
  const t = useT();
  const locale = useLanguageLocale();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [asked, setAsked] = useState<Asked | null>(() => keptAsk(task.task_id));
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const due = mySignatureDue(task);
  const { purchaser_signed, performer_signed, arbiter_signed } = task.agreement;
  const arbiter = task.cover?.arbiter_npub ?? "";

  const load = useCallback(async () => {
    try {
      setOffer(await offerTerms(task.task_id));
    } catch (e) {
      setProblem((e as Error).message);
    }
  }, [task.task_id]);

  useEffect(() => { void load(); }, [load, purchaser_signed, performer_signed, arbiter_signed]);

  async function ask() {
    setBusy(true);
    setProblem("");
    try {
      const r = await requestSignature(task.task_id);
      const kept = { nonce: r.nonce, statement_hash: r.statement_hash };
      keepAsk(task.task_id, kept);
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
      const signed = await receiveSignature(task.task_id, asked.nonce, asked.statement_hash);
      keepAsk(task.task_id, null);
      setAsked(null);
      onChanged(signed);
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    keepAsk(task.task_id, null);
    setAsked(null);
  }

  const when = (s: number) => new Date(s * 1000).toLocaleString(locale);
  const sig = offer?.signatures;
  const stale = asked && offer && asked.statement_hash !== offer.statement_hash;

  return (
    <section className="card panel grid gap-3">
      <h2 className="panel-title flex items-center gap-2"><FileSignature size={18} aria-hidden />{t("offer.title")}</h2>
      <p className="muted text-sm">{t("offer.says")}</p>

      <ul className="signers">
        <li>
          {purchaser_signed ? <CircleCheck size={18} aria-hidden className="ok" /> : <CircleDashed size={18} aria-hidden className="muted" />}
          <span>{t("offer.client")}</span>
          <Person npub={task.purchaser} />
          <span className="muted text-sm">{sig?.purchaser ? t("offer.signedAt", { when: when(sig.purchaser.signed_at) }) : t("offer.notSigned")}</span>
        </li>
        <li>
          {performer_signed ? <CircleCheck size={18} aria-hidden className="ok" /> : <CircleDashed size={18} aria-hidden className="muted" />}
          <span>{t("offer.professional")}</span>
          {task.performer ? <Person npub={task.performer} /> : <span className="muted">{t("offer.notClaimed")}</span>}
          <span className="muted text-sm">{sig?.performer ? t("offer.signedAt", { when: when(sig.performer.signed_at) }) : task.performer ? t("offer.notSigned") : ""}</span>
        </li>
        {arbiter && (
          <li>
            {arbiter_signed ? <CircleCheck size={18} aria-hidden className="ok" /> : <CircleDashed size={18} aria-hidden className="muted" />}
            <span>{t("offer.arbiter")}</span>
            <Person npub={arbiter} />
            <span className="muted text-sm">{sig?.arbiter ? t("offer.signedAt", { when: when(sig.arbiter.signed_at) }) : t("offer.notSigned")}</span>
          </li>
        )}
      </ul>

      {offer && (
        <details className="statement">
          <summary className="cursor-pointer">{t("offer.read")}</summary>
          <pre className="statement-text">{offer.statement}</pre>
          <p className="text-sm"><span className="muted">sha256 </span><code className="hash">{offer.statement_hash}</code></p>
        </details>
      )}

      {due && !asked && (
        <div className="grid gap-2">
          <p>{due === "purchaser" ? t("offer.youSignFirst") : due === "arbiter" ? t("offer.youSignAsArbiter") : t("offer.youSignToDeliver")}</p>
          <div className="actions-row">
            <button type="button" className="btn btn-go" disabled={busy} onClick={() => void ask()}>
              <Send size={18} aria-hidden />{t("offer.sendDm")}
            </button>
          </div>
        </div>
      )}

      {due && asked && (
        <div className="ask">
          <ol className="how-steps">
            <li>{t("offer.step.open")}</li>
            <li><Tx ns={WORDS} k="offer.step.check" components={{ hash: <code className="hash">{asked.statement_hash.slice(0, 12)}…</code> }} /></li>
            <li>{t("offer.step.reply")}</li>
          </ol>
          {stale && <p className="error">{t("offer.changed")}</p>}
          <div className="actions-row">
            <button type="button" className="btn btn-quiet" disabled={busy} onClick={startOver}>{t("offer.again")}</button>
            <button type="button" className="btn btn-go" disabled={busy || !!stale} onClick={() => void collect()}>{t("offer.replied")}</button>
          </div>
        </div>
      )}

      {problem && <p className="error text-right">{problem}</p>}
    </section>
  );
}
