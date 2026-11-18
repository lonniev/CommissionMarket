/** A Project's brief, budget, circle and default terms, as its Organization's owner sets them. */

import { useState } from "react";
import { blankCover, type CoverRows, audienceFrom } from "../lib/cover";
import { defaultsFromCover, coverFromDefaults, saveProject, satsFrom, type Project } from "../lib/orgs";
import { useT } from "../i18n";
import TermsFields from "./TermsFields";

export default function ProjectForm({ orgId, editing, onSaved, onCancel }: {
  orgId: string;
  editing?: Project;
  onSaved: (projectId: string) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [name, setName] = useState(editing?.name ?? "");
  const [brief, setBrief] = useState(editing?.brief ?? "");
  const [budget, setBudget] = useState(editing?.budget_sats ? String(editing.budget_sats) : "");
  const [circle, setCircle] = useState((editing?.circle ?? []).join("\n"));
  const [cover, setCover] = useState<CoverRows>(() => coverFromDefaults(blankCover(), editing?.defaults ?? {}));
  const [days, setDays] = useState(editing?.defaults.deemed_acceptance_days ? String(editing.defaults.deemed_acceptance_days) : "");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const set = <K extends keyof CoverRows>(key: K, value: CoverRows[K]) => setCover((c) => ({ ...c, [key]: value }));

  async function save() {
    setProblem("");
    if (!name.trim()) return setProblem(t("project.needName"));
    const sats = budget.trim() ? satsFrom(budget) : 0;
    if (Number.isNaN(sats)) return setProblem(t("project.badBudget"));
    const people = circle.trim() ? audienceFrom(circle) : { audience: [] };
    if ("problem" in people) return setProblem(t(people.problem.key, people.problem.vars));
    const deemed = days.trim() ? satsFrom(days) : 0;
    if (Number.isNaN(deemed) || deemed > 60) return setProblem(t("form.badDeemedDays", { max: 60 }));
    const defaults = defaultsFromCover({ ...cover, deemedDays: deemed ? String(deemed) : blankCover().deemedDays }, blankCover());
    if (deemed) defaults.deemed_acceptance_days = deemed;
    setBusy(true);
    try {
      onSaved(await saveProject(orgId, { name: name.trim(), brief: brief.trim(), budget_sats: sats, circle: people.audience, defaults },
        editing?.project_id ?? ""));
    } catch (e) {
      setProblem((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <section className="card panel grid gap-3">
      <h2 className="panel-title">{editing ? t("project.edit") : t("project.new")}</h2>
      <label className="grid gap-1">
        <span className="label">{t("project.name")}</span>
        <input className="field" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder={t("project.namePlaceholder")} />
      </label>
      <label className="grid gap-1">
        <span className="label">{t("project.brief")}</span>
        <textarea className="field" rows={3} value={brief} maxLength={4000} onChange={(e) => setBrief(e.target.value)} placeholder={t("project.briefPlaceholder")} />
      </label>
      <label className="grid gap-1 w-fit">
        <span className="label">{t("project.budget")}</span>
        <input className="field num text-right" inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="500000" />
        <span className="muted text-sm">{t("project.budgetHelp")}</span>
      </label>
      <label className="grid gap-1">
        <span className="label">{t("project.circle")}</span>
        <textarea className="field font-mono text-sm" rows={3} value={circle} onChange={(e) => setCircle(e.target.value)} placeholder="npub1…"
          autoCapitalize="none" spellCheck={false} />
        <span className="muted text-sm">{t("project.circleHelp")}</span>
      </label>
      <fieldset className="form-section">
        <legend className="section-title">{t("project.defaults")}</legend>
        <p className="muted text-sm">{t("project.defaultsHelp")}</p>
        <TermsFields cover={cover} set={set} />
        <label className="grid gap-1 w-fit">
          <span className="label">{t("cover.deemedDays")}</span>
          <input className="field num text-right" inputMode="numeric" value={days} maxLength={2} onChange={(e) => setDays(e.target.value)} placeholder="14" />
        </label>
      </fieldset>
      {problem && <p className="error text-right">{problem}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className="btn btn-quiet" onClick={onCancel}>{t("actions.cancel")}</button>
        <button type="button" className="btn btn-go" disabled={busy} onClick={() => void save()}>{busy ? t("form.saving") : t("form.save")}</button>
      </div>
    </section>
  );
}
