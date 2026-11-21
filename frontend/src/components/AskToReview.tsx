/**
 * Ask someone to review this commission: a Nostr message from the signed-in
 * npub, with a link here. Anyone viewing may send it, to anyone, any time.
 *
 * The browser signs it (a session key or a NIP-07 extension) and sends it as a
 * NIP-17 DM (`sendDm`, in the web package). A sign-in by DM proof holds no key
 * here, so it is told how to get one instead.
 */

import { useState } from "react";
import { Send } from "lucide-react";
import { canSendDm, getStoredNpub, sendDm } from "@tollbooth-dpyc/web";
import { NpubChip, NpubField, tourTarget } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import { named } from "../lib/review";
import type { Task } from "../lib/tasks";
import { commissionHref } from "./Person";

const ELSE = "";

export default function AskToReview({ task }: { task: Task }) {
  const t = useT();
  const people = named(task, getStoredNpub());
  const [to, setTo] = useState(people[0]?.npub ?? ELSE);
  const [other, setOther] = useState("");
  const link = `${window.location.origin}${commissionHref(task.task_id)}`;
  const [body, setBody] = useState(() => t("review.body", { title: task.title, link }));
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");
  const [problem, setProblem] = useState("");

  async function send() {
    const npub = to === ELSE ? other : to;
    setSaid("");
    setProblem("");
    if (!npub) return setProblem(t("review.pickSomeone"));
    setBusy(true);
    try {
      const r = await sendDm({ to: npub, body: body.trim() });
      if (r.ok > 0) setSaid(t("review.sent", { ok: r.ok, total: r.total }));
      else setProblem(t("review.noRelay"));
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card panel grid gap-3" {...tourTarget("commission.askReview")}>
      <h2 className="panel-title">{t("review.title")}</h2>
      <p className="muted text-sm">{t("review.says")}</p>
      {!canSendDm() ? <p className="muted">{t("review.noSigner")}</p> : (
        <>
          <div className="grid gap-2" role="radiogroup" aria-label={t("review.to")}>
            {people.map((p) => (
              <label key={p.npub} className="review-pick">
                <input type="radio" name="review-to" checked={to === p.npub} onChange={() => setTo(p.npub)} />
                <span className="label">{t(p.role)}</span>
                <NpubChip npub={p.npub} />
              </label>
            ))}
            <label className="review-pick">
              <input type="radio" name="review-to" checked={to === ELSE} onChange={() => setTo(ELSE)} />
              <span className="label">{t("review.someoneElse")}</span>
            </label>
            {to === ELSE && (
              <NpubField value={other} onChange={setOther} label={t("review.someoneElse")}
                look={{ inputClassName: "field font-mono text-sm", buttonClassName: "chip" }} />
            )}
          </div>
          <label className="grid gap-1">
            <span className="label">{t("review.message")}</span>
            <textarea className="field" rows={3} value={body} maxLength={2000} onChange={(e) => setBody(e.target.value)} />
          </label>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {said && <span className="muted text-sm" role="status">{said}</span>}
            {problem && <span className="error text-sm" role="alert">{problem}</span>}
            <button type="button" className="btn btn-go" disabled={busy || !body.trim()} onClick={() => void send()}>
              <Send size={18} aria-hidden />{busy ? t("review.sending") : t("review.send")}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
