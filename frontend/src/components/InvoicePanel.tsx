/**
 * An invoice to pay: a link any wallet opens, a code to scan from another
 * device, and the text to copy. It is Task Booth's invoice, shown unchanged.
 */

import { useState } from "react";
import { Check, Copy, Zap } from "lucide-react";
import { InvoiceQr } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import type { Invoice } from "../lib/tasks";
import Sats from "./Sats";

export default function InvoicePanel({ invoice, now }: { invoice: Invoice; now: number }) {
  const [copied, setCopied] = useState(false);
  const t = useT();
  const minutes = Math.max(0, Math.floor((invoice.expires_at - now) / 60));

  async function copy() {
    await navigator.clipboard?.writeText(invoice.invoice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="invoice">
      <Sats sats={invoice.sats} big />
      <div className="flex flex-wrap justify-end gap-2">
        <a href={invoice.lightning_uri} className="btn btn-money"><Zap size={18} aria-hidden />{t("invoice.open")}</a>
        <button type="button" className="btn btn-quiet" onClick={() => void copy()}>
          {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
          {copied ? t("actions.copied") : t("invoice.copy")}
        </button>
      </div>
      <InvoiceQr bolt11={invoice.invoice} size={220} className="invoice-qr" />
      <p className="invoice-text">{invoice.invoice}</p>
      <p className="muted text-sm">{minutes > 0 ? t("invoice.goodFor", { minutes }) : t("invoice.expired")}</p>
    </div>
  );
}

/** An invoice the commission keeps for a payment ahead, as the panel shows one. */
export const keptInvoice = (kept: { sats?: number; invoice?: string; expires_at?: number; paid_at?: number | null }): Invoice | null =>
  kept.invoice && kept.expires_at
    ? {
        sats: kept.sats ?? 0, invoice: kept.invoice, lightning_uri: `lightning:${kept.invoice}`,
        payment_hash: "", expires_at: kept.expires_at, paid_at: kept.paid_at ?? null,
      }
    : null;
