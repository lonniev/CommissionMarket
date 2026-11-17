/**
 * How a professional without a Lightning address is paid: they ask their own
 * wallet to receive exactly this amount, copy the request, and paste it here.
 */

import { useState } from "react";
import { ClipboardPaste, Send } from "lucide-react";
import { formatSats } from "@tollbooth-dpyc/web";
import { useT } from "../i18n";
import { looksLikeInvoice } from "../lib/problems";
import { invoiceFor, type Invoice, type Payment } from "../lib/tasks";

export default function HandIn({ taskId, payment, sats, onTaken }: {
  taskId: string; payment: Payment; sats: number; onTaken: (invoice: Invoice) => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const t = useT();

  async function send(invoice: string) {
    if (!looksLikeInvoice(invoice)) return setProblem(t("request.notRequest"));
    setBusy(true);
    setProblem("");
    try {
      onTaken(await invoiceFor(taskId, payment, invoice.trim()));
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function paste() {
    try {
      const copied = await navigator.clipboard.readText();
      setText(copied);
      await send(copied);
    } catch {
      setProblem(t("request.pasteBelow"));
    }
  }

  return (
    <div className="grid gap-2">
      <p className="muted text-sm">{t("request.howTo", { sats: formatSats(sats) })}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => void paste()}>
          <ClipboardPaste size={18} aria-hidden />{t("request.paste")}
        </button>
        <input className="field min-w-0 flex-1" value={text} onChange={(e) => setText(e.target.value)}
          placeholder="lnbc…" aria-label={t("request.fromWallet")} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
        <button type="button" className="icon-btn" disabled={busy || !text.trim()} onClick={() => void send(text)}
          aria-label={t("request.send")} title={t("request.send")}>
          <Send size={18} aria-hidden />
        </button>
      </div>
      {problem && <p className="error text-right">{problem}</p>}
    </div>
  );
}
