/**
 * A person is their npub. The page shows its ends, marks you as you, and
 * copies the whole npub on a tap so it can be pasted into an audience.
 */

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useAppShell } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";

export const commissionHref = (taskId: string) => `/commissions/${encodeURIComponent(taskId)}`;

export const shortNpub = (npub: string) => (npub.length > 20 ? `${npub.slice(0, 10)}…${npub.slice(-6)}` : npub);

export function Person({ npub }: { npub: string }) {
  const { session } = useAppShell();
  const t = useT();
  const [copied, setCopied] = useState(false);
  const me = session.signedIn && session.npub === npub;

  async function copy() {
    try {
      await navigator.clipboard?.writeText(npub);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Nothing to do: the npub is still on screen in its title.
    }
  }

  return (
    <button type="button" className="person" title={npub} onClick={() => void copy()} aria-label={t("person.copy", { npub })}>
      <span className="font-mono">{me ? t("person.you") : shortNpub(npub)}</span>
      {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden className="muted" />}
    </button>
  );
}

export function People({ npubs }: { npubs: string[] }) {
  return <span className="people">{npubs.map((n) => <Person key={n} npub={n} />)}</span>;
}
