/**
 * A commission's terms, to post a new one or change one nobody has claimed:
 * the brief, who may claim it, by when, the grades, what is paid ahead, and
 * the cover page under the Standard Terms.
 */

import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { formatSats } from "@tollbooth-dpyc/web";
import { useAppShell } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import { aheadFrom, audienceFrom, coverFrom, IP_OPTIONS, rowsOf, type CoverRows, type MilestoneRow } from "../lib/cover";
import { aheadPct, MAX_AHEAD_PCT, MAX_MILESTONES, shareOf } from "../lib/money";
import { lateFrom, MAX_GRADES, rubricFrom, starterRows, type GradeRow, type LateKind } from "../lib/rubric";
import { editTask, postTask, type IpOption, type Task } from "../lib/tasks";
import { dayFrom, dayKeyOf, endOfDay } from "../lib/when";
import { commissionHref } from "./Person";
import Sats from "./Sats";

const LATE_KINDS: LateKind[] = ["full", "discount", "cancel"];
const satsOf = (text: string) => (/^\d+$/.test(text.trim()) ? Number(text.trim()) : 0);
const pctOf = (text: string) => (/^\d+$/.test(text.trim()) ? Number(text.trim()) : 0);

function Section({ title, help, children }: { title: string; help?: string; children: ReactNode }) {
  return (
    <fieldset className="form-section">
      <legend className="section-title">{title}</legend>
      {help && <p className="muted text-sm">{help}</p>}
      {children}
    </fieldset>
  );
}

export default function CommissionForm({ editing }: { editing?: Task }) {
  const { session } = useAppShell();
  const go = useNavigate();
  const t = useT();
  const now = Math.floor(Date.now() / 1000);

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [audience, setAudience] = useState((editing?.audience ?? []).join("\n"));
  const [due, setDue] = useState(editing && editing.needed_by > now ? dayKeyOf(editing.needed_by) : dayFrom(now, 30));
  const [rows, setRows] = useState<GradeRow[]>(() => editing
    ? editing.rubric.grades.map((g) => ({ name: g.name, sats: String(g.sats), criteria: g.criteria }))
    : starterRows(t));
  const [lateKind, setLateKind] = useState<LateKind>(editing?.late.kind ?? "full");
  const [latePct, setLatePct] = useState(editing?.late.kind === "discount" ? String(editing.late.pct_per_day) : "5");
  const [deposit, setDeposit] = useState(editing ? String(editing.deposit_pct || "") : "10");
  const [milestones, setMilestones] = useState<MilestoneRow[]>(
    () => (editing?.milestones ?? []).map((m) => ({ name: m.name, day: dayKeyOf(m.due_at), pct: String(m.pct) })),
  );
  const [cover, setCover] = useState<CoverRows>(() => rowsOf(editing?.cover ?? null));
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);

  const top = Math.max(0, ...rows.map((r) => satsOf(r.sats)));
  const ahead = aheadPct(pctOf(deposit), milestones.map((m) => pctOf(m.pct)));
  const gradeNames = rows.map((r) => r.name.trim()).filter(Boolean);
  const setRow = (i: number, change: Partial<GradeRow>) => setRows((list) => list.map((r, j) => (j === i ? { ...r, ...change } : r)));
  const setMilestone = (i: number, change: Partial<MilestoneRow>) =>
    setMilestones((list) => list.map((m, j) => (j === i ? { ...m, ...change } : m)));
  const setCoverField = <K extends keyof CoverRows>(key: K, value: CoverRows[K]) => setCover((c) => ({ ...c, [key]: value }));

  function addMe() {
    if (session.signedIn && !audience.includes(session.npub)) setAudience((a) => (a.trim() ? `${a.trim()}\n${session.npub}` : session.npub));
  }

  async function save() {
    setProblem("");
    if (!title.trim()) return setProblem(t("form.needTitle"));
    const who = audienceFrom(audience);
    if ("problem" in who) return setProblem(t(who.problem.key, who.problem.vars));
    const neededBy = endOfDay(due);
    if (neededBy === null || neededBy < now) return setProblem(t("form.needDay"));
    const made = rubricFrom(rows);
    if ("problem" in made) return setProblem(t(made.problem.key, made.problem.vars));
    const late = lateFrom(lateKind, latePct);
    if ("problem" in late) return setProblem(t(late.problem.key, late.problem.vars));
    const paid = aheadFrom(deposit, milestones, neededBy, now);
    if ("problem" in paid) return setProblem(t(paid.problem.key, paid.problem.vars));
    const page = coverFrom(cover, made.rubric.grades.map((g) => g.name));
    if ("problem" in page) return setProblem(t(page.problem.key, page.problem.vars));
    const terms = {
      title: title.trim(), description: description.trim(), rubric: made.rubric, audience: who.audience,
      needed_by: neededBy, late: late.late, deposit_pct: paid.deposit_pct, milestones: paid.milestones, cover: page.cover,
    };
    setBusy(true);
    try {
      const task = editing ? await editTask(editing.task_id, terms) : await postTask(terms);
      go(commissionHref(task.task_id));
    } catch (e) {
      setProblem((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <form className="card panel mx-auto grid max-w-3xl gap-6" onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <h1 className="page-title">{editing ? t("form.editTitle") : t("form.newTitle")}</h1>
        {editing?.agreement.purchaser_signed && <p className="gate">{t("form.editClearsSignature")}</p>}

        <Section title={t("form.brief")}>
          <label className="grid gap-1">
            <span className="label">{t("form.title")}</span>
            <input className="field" value={title} maxLength={190} onChange={(e) => setTitle(e.target.value)} placeholder={t("form.titlePlaceholder")} />
          </label>
          <label className="grid gap-1">
            <span className="label">{t("form.description")}</span>
            <textarea className="field" rows={8} maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder={t("form.descriptionPlaceholder")} />
            <span className="muted text-sm">{t("form.markdown")}</span>
          </label>
        </Section>

        <Section title={t("form.audience")} help={t("form.audienceHelp")}>
          <textarea className="field font-mono text-sm" rows={3} value={audience} onChange={(e) => setAudience(e.target.value)}
            placeholder="npub1…" aria-label={t("form.audience")} autoCapitalize="none" spellCheck={false} />
          <div className="flex justify-end">
            <button type="button" className="chip" onClick={addMe}><UserPlus size={16} aria-hidden />{t("form.addMe")}</button>
          </div>
        </Section>

        <Section title={t("form.grades")} help={t("form.gradesHelp")}>
          {rows.map((row, i) => (
            <div key={i} className="grade-card">
              <div className="grade-card-head">
                <input className="field" value={row.name} maxLength={60} onChange={(e) => setRow(i, { name: e.target.value })}
                  placeholder={t("form.gradeName")} aria-label={t("form.gradeNumber", { n: i + 1 })} />
                <input className="field num text-right sats-field" value={row.sats} inputMode="numeric" onChange={(e) => setRow(i, { sats: e.target.value })}
                  placeholder="sats" aria-label={t("form.gradeSats")} />
                <button type="button" className="icon-btn" onClick={() => setRows((list) => list.filter((_, j) => j !== i))}
                  aria-label={t("form.removeGrade")} title={t("form.removeGrade")}>
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
              <input className="field" value={row.criteria} maxLength={500} onChange={(e) => setRow(i, { criteria: e.target.value })}
                placeholder={t("form.gradeCriteria")} aria-label={t("form.gradeCriteria")} />
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="muted text-sm">{t("form.top")} <Sats sats={top} /></span>
            {rows.length < MAX_GRADES && (
              <button type="button" className="chip" onClick={() => setRows((list) => [...list, { name: "", sats: "", criteria: "" }])}>
                <Plus size={16} aria-hidden />{t("form.addGrade")}
              </button>
            )}
          </div>
        </Section>

        <Section title={t("form.when")}>
          <label className="grid gap-1 w-fit">
            <span className="label">{t("form.neededBy")}</span>
            <input type="date" className="field" value={due} min={dayFrom(now, 1)} onChange={(e) => setDue(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("late.title")}>
            <span className="label w-full">{t("late.title")}</span>
            {LATE_KINDS.map((k) => (
              <button key={k} type="button" className={lateKind === k ? "chip chip-on" : "chip"} aria-pressed={lateKind === k} onClick={() => setLateKind(k)}>
                {t(`late.pick.${k}`)}
              </button>
            ))}
          </div>
          {lateKind === "discount" && (
            <label className="inline-pct">
              <input className="field num text-right" inputMode="numeric" value={latePct} maxLength={3} onChange={(e) => setLatePct(e.target.value)} aria-label={t("late.pctLabel")} />
              <span>{t("late.pctAfter")}</span>
            </label>
          )}
          <p className="muted text-sm">{t(`late.pickHelp.${lateKind}`)}</p>
        </Section>

        <Section title={t("form.ahead")} help={t("form.aheadHelp", { max: MAX_AHEAD_PCT })}>
          <label className="inline-pct">
            <span className="label">{t("form.deposit")}</span>
            <input className="field num text-right" inputMode="numeric" value={deposit} maxLength={2} onChange={(e) => setDeposit(e.target.value)} aria-label={t("form.deposit")} />
            <span>%</span>
            <Sats sats={shareOf(top, pctOf(deposit))} />
          </label>
          {milestones.map((m, i) => (
            <div key={i} className="milestone-row">
              <input className="field" value={m.name} maxLength={60} onChange={(e) => setMilestone(i, { name: e.target.value })}
                placeholder={t("form.milestoneName")} aria-label={t("form.milestoneName")} />
              <input type="date" className="field" value={m.day} min={dayFrom(now, 1)} max={due} onChange={(e) => setMilestone(i, { day: e.target.value })}
                aria-label={t("form.milestoneDay")} />
              <span className="inline-pct">
                <input className="field num text-right" inputMode="numeric" value={m.pct} maxLength={2} onChange={(e) => setMilestone(i, { pct: e.target.value })}
                  aria-label={t("form.milestonePct")} />
                <span>%</span>
              </span>
              <Sats sats={shareOf(top, pctOf(m.pct))} />
              <button type="button" className="icon-btn" onClick={() => setMilestones((list) => list.filter((_, j) => j !== i))}
                aria-label={t("form.removeMilestone")} title={t("form.removeMilestone")}>
                <Trash2 size={16} aria-hidden />
              </button>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={ahead > MAX_AHEAD_PCT ? "error text-sm" : "muted text-sm"}>{t("form.aheadTotal", { pct: ahead, max: MAX_AHEAD_PCT })}</span>
            {milestones.length < MAX_MILESTONES && (
              <button type="button" className="chip" onClick={() => setMilestones((list) => [...list, { name: "", day: due, pct: "" }])}>
                <Plus size={16} aria-hidden />{t("form.addMilestone")}
              </button>
            )}
          </div>
        </Section>

        <Section title={t("cover.title")} help={t("cover.help")}>
          <label className="grid gap-1">
            <span className="label">{t("cover.deliverables")}</span>
            <textarea className="field" rows={3} value={cover.deliverables} onChange={(e) => setCoverField("deliverables", e.target.value)}
              placeholder={t("cover.deliverablesPlaceholder")} />
          </label>
          <div className="two-up">
            <label className="grid gap-1">
              <span className="label">{t("cover.specUrl")}</span>
              <input className="field" value={cover.specUrl} onChange={(e) => setCoverField("specUrl", e.target.value)} placeholder="https://…" inputMode="url" autoCapitalize="none" />
            </label>
            <label className="grid gap-1">
              <span className="label">{t("cover.specHash")}</span>
              <input className="field font-mono text-sm" value={cover.specHash} onChange={(e) => setCoverField("specHash", e.target.value)} placeholder="sha256" autoCapitalize="none" spellCheck={false} />
            </label>
          </div>
          <div className="two-up">
            <label className="grid gap-1">
              <span className="label">{t("cover.deemedGrade")}</span>
              <select className="field" value={cover.deemedGrade} onChange={(e) => setCoverField("deemedGrade", e.target.value)}>
                <option value="">{t("cover.noDeemed")}</option>
                {gradeNames.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            {cover.deemedGrade && (
              <label className="grid gap-1">
                <span className="label">{t("cover.deemedDays")}</span>
                <input className="field num text-right" inputMode="numeric" value={cover.deemedDays} maxLength={2} onChange={(e) => setCoverField("deemedDays", e.target.value)} />
              </label>
            )}
          </div>
          <p className="muted text-sm">{t("cover.deemedHelp")}</p>
          <div className="grid gap-2">
            <span className="label">{t("cover.ip")}</span>
            <div className="flex flex-wrap gap-2">
              {IP_OPTIONS.map((ip: IpOption) => (
                <button key={ip} type="button" className={cover.ip === ip ? "chip chip-on" : "chip"} aria-pressed={cover.ip === ip} onClick={() => setCoverField("ip", ip)}>
                  {t(`cover.ip.${ip}`)}
                </button>
              ))}
            </div>
            <p className="muted text-sm">{t(`cover.ipHelp.${cover.ip}`)}</p>
            {cover.ip === "custom" && (
              <textarea className="field" rows={3} value={cover.ipCustom} onChange={(e) => setCoverField("ipCustom", e.target.value)} placeholder={t("cover.ipCustom")} />
            )}
          </div>
          <div className="grid gap-1">
            {(["confidential", "consumer", "thirdParty"] as const).map((flag) => (
              <label key={flag} className="check">
                <input type="checkbox" checked={cover[flag]} onChange={(e) => setCoverField(flag, e.target.checked)} />
                <span>{t(`cover.${flag}`)}</span>
              </label>
            ))}
          </div>
          <div className="two-up">
            <label className="grid gap-1">
              <span className="label">{t("cover.law")}</span>
              <input className="field" value={cover.law} maxLength={200} onChange={(e) => setCoverField("law", e.target.value)} placeholder={t("cover.lawPlaceholder")} />
            </label>
            <label className="grid gap-1">
              <span className="label">{t("cover.venue")}</span>
              <input className="field" value={cover.venue} maxLength={200} onChange={(e) => setCoverField("venue", e.target.value)} placeholder={t("cover.venuePlaceholder")} />
            </label>
          </div>
          <p className="muted text-sm">{t("cover.underTerms")} <Link to="/terms" className="ent">{t("nav.terms")}</Link></p>
        </Section>

        {problem && <p className="error text-right">{problem}</p>}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="muted text-sm">{t("form.youSignNext", { sats: formatSats(top) })}</span>
          <Link to={editing ? commissionHref(editing.task_id) : "/commissions"} className="btn btn-quiet">{t("actions.cancel")}</Link>
          <button type="submit" className="btn btn-go" disabled={busy}>
            {editing ? (busy ? t("form.saving") : t("form.save")) : (busy ? t("form.posting") : t("form.post"))}
          </button>
        </div>
      </form>
    </div>
  );
}
