/**
 * Draft a commission from a short idea, with Task Booth's `draft_task`.
 *
 * What the person said fills the form at once. Everything the AI suggests (grades,
 * a deposit, milestones, deemed acceptance, who owns the work) is a proposal they
 * apply by choice. Its questions and assumptions are points to settle: the form
 * keeps Post shut until each is ticked, so nobody signs terms they never chose.
 */

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { formatSats } from "@tollbooth-dpyc/web";
import { tourTarget } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import { draftCommission, draftFare, IDEA_MAX, openPointsOf, proposalsOf, type Draft } from "../lib/draft";
import { useFiat } from "../lib/FiatContext";

export type Proposal = ReturnType<typeof proposalsOf>[number];

export interface DraftAssistProps {
  /** Fill the form from what the person said. */
  onSaid: (said: Draft["said"]) => void;
  /** Apply one proposal to the form. */
  onApply: (which: Proposal, draft: Draft) => void;
  /** How many points are still unsettled; the form shuts Post while any are. */
  onOpenPoints: (count: number) => void;
}

export default function DraftAssist({ onSaid, onApply, onOpenPoints }: DraftAssistProps) {
  const t = useT();
  const { fiat } = useFiat();
  const [idea, setIdea] = useState("");
  const [fare, setFare] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [applied, setApplied] = useState<Set<Proposal>>(new Set());
  const [settled, setSettled] = useState<Set<number>>(new Set());

  useEffect(() => { void draftFare().then(setFare); }, []);
  const points = draft ? openPointsOf(draft) : [];
  useEffect(() => { onOpenPoints(points.length - settled.size); }, [points.length, settled, onOpenPoints]);

  async function go() {
    setProblem("");
    setBusy(true);
    try {
      const d = await draftCommission(idea.trim(), fiat);
      setDraft(d);
      setApplied(new Set());
      setSettled(new Set());
      onSaid(d.said);
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function apply(which: Proposal) {
    if (!draft) return;
    onApply(which, draft);
    setApplied((s) => new Set(s).add(which));
  }

  const toggle = (i: number) => setSettled((s) => {
    const next = new Set(s);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    return next;
  });

  const describe = (which: Proposal, d: Draft): string => {
    const p = d.proposed;
    switch (which) {
      case "grades": return t("draft.p.grades", { list: p.grades.map((g) => `${g.name} ${formatSats(g.sats)}`).join(" · ") });
      case "deposit": return t("draft.p.deposit", { pct: p.deposit_pct ?? 0 });
      case "milestones": return t("draft.p.milestones", { list: (p.milestones ?? []).map((m) => `${m.name} ${m.pct}%`).join(" · ") });
      case "deemed": return t("draft.p.deemed", { count: p.deemed_days ?? 0 });
      case "ip": return t("draft.p.ip", { ip: t(`cover.ip.${p.ip_option ?? "assign"}`) });
    }
  };

  return (
    <section className="draft-assist grid gap-3" {...tourTarget("compose.assist")}>
      <h2 className="flex items-center gap-2 font-semibold"><Sparkles size={18} aria-hidden /> {t("draft.title")}</h2>
      <p className="muted">{t("draft.says")}</p>
      <textarea className="field" rows={3} maxLength={IDEA_MAX} value={idea} onChange={(e) => setIdea(e.target.value)}
        placeholder={t("draft.placeholder")} aria-label={t("draft.title")} />
      <div className="flex flex-wrap items-center justify-end gap-2">
        {fare !== null && <span className="muted text-sm">{t("draft.fare", { sats: formatSats(fare) })}</span>}
        <button type="button" className="btn" disabled={busy || !idea.trim()} onClick={() => void go()}>
          {busy ? t("draft.drafting") : t("draft.go")}
        </button>
      </div>
      {problem && <p className="error text-right">{problem}</p>}

      {draft && (
        <>
          <p className="gate">{t("draft.filled")}</p>
          {proposalsOf(draft).length > 0 && (
            <div className="grid gap-2">
              <h3 className="label">{t("draft.proposedTitle")}</h3>
              <p className="muted text-sm">{t("draft.proposedSays")}</p>
              <ul className="grid gap-2">
                {proposalsOf(draft).map((which) => (
                  <li key={which} className="draft-row">
                    <span><span className="badge">{t("draft.proposed")}</span> {describe(which, draft)}</span>
                    <button type="button" className={applied.has(which) ? "chip chip-on" : "chip"} onClick={() => apply(which)}>
                      {applied.has(which) ? <><Check size={14} aria-hidden /> {t("draft.applied")}</> : t("draft.apply")}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {points.length > 0 && (
            <div className="grid gap-2">
              <h3 className="label">{t("draft.pointsTitle")}</h3>
              <p className="muted text-sm">{t("draft.pointsSays")}</p>
              <ul className="grid gap-2">
                {points.map((p, i) => (
                  <li key={i} className="draft-row">
                    <label className="flex items-start gap-2">
                      <input type="checkbox" checked={settled.has(i)} onChange={() => toggle(i)} />
                      <span><span className="badge">{t(p.kind === "question" ? "draft.question" : "draft.assumption")}</span> {p.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
