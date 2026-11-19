/**
 * A person is their npub. The page shows its ends and marks you as you. The name opens
 * their reputation; the copy mark copies the whole npub so it can be pasted into an audience.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import { useAppShell } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";

export const commissionHref = (taskId: string) => `/commissions/${encodeURIComponent(taskId)}`;
export const orgHref = (orgId: string) => `/orgs/${encodeURIComponent(orgId)}`;
export const projectHref = (p: { org_id: string; project_id: string }) =>
  `${orgHref(p.org_id)}/projects/${encodeURIComponent(p.project_id)}`;

export const personHref = (npub: string) => `/people/${encodeURIComponent(npub)}`;

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
    <span className="person">
      <Link to={personHref(npub)} className="font-mono" title={npub}>{me ? t("person.you") : shortNpub(npub)}</Link>
      <button type="button" className="person-copy" onClick={() => void copy()} aria-label={t("person.copy", { npub })} title={t("person.copy", { npub })}>
        {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden className="muted" />}
      </button>
    </span>
  );
}

export function People({ npubs }: { npubs: string[] }) {
  return <span className="people">{npubs.map((n) => <Person key={n} npub={n} />)}</span>;
}
