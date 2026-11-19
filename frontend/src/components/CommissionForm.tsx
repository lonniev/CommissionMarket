/**
 * A commission's terms, to post a new one or change one nobody has claimed:
 * the brief, who may claim it, by when, the grades, what is paid ahead, and
 * the cover page under the Standard Terms.
 */

import { lazy, Suspense, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FolderOpen, Maximize2, Plus, Trash2 } from "lucide-react";
import { formatSats } from "@tollbooth-dpyc/web";
import { NpubField, NpubListField, useAppShell } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import { BLOCKS, blockOf, summaryOf, type BlockId, type Shape } from "../lib/formBlocks";
import { aheadFrom, audienceFrom, blankCover, coverFrom, failHoursOf, MAX_AUDIENCE, rowsOf, type CoverRows, type MilestoneRow } from "../lib/cover";
import { aheadPct, MAX_AHEAD_PCT, MAX_MILESTONES, shareOf } from "../lib/money";
import { lateFrom, MAX_GRADES, rubricFrom, starterRows, type GradeRow, type LateKind } from "../lib/rubric";
import { MAX_LATE_STEPS, starterSteps, stepRowsOf, type StepRow, type Unit } from "../lib/late";
import { budgetLeft, coverFromDefaults, type Project } from "../lib/orgs";
import { editTask, postTask, type Task } from "../lib/tasks";
import { dayFrom, dayKeyOf, endOfDay } from "../lib/when";
import { commissionHref, projectHref } from "./Person";
import Sats from "./Sats";
import EscrowFields from "./EscrowFields";
import FormBlock, { blockAnchor } from "./FormBlock";
import TermsFields from "./TermsFields";

const MarkdownEditor = lazy(() => import("@tollbooth-dpyc/web/markdown").then((m) => ({ default: m.MarkdownEditor })));
const BRIEF_MAX = 4000;

const LATE_KINDS: LateKind[] = ["full", "discount", "steps", "cancel"];
const UNITS: Unit[] = ["hours", "days"];
const satsOf = (text: string) => (/^\d+$/.test(text.trim()) ? Number(text.trim()) : 0);
const pctOf = (text: string) => (/^\d+$/.test(text.trim()) ? Number(text.trim()) : 0);

/** Where a new commission is filed, and what its Project suggests it starts from. */
export interface Filing {
  project: Project;
}

export default function CommissionForm({ editing, filing }: { editing?: Task; filing?: Filing }) {
  const { session } = useAppShell();
  const go = useNavigate();
  const t = useT();
  const now = Math.floor(Date.now() / 1000);

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [big, setBig] = useState(false);
  const [audience, setAudience] = useState<string[]>(() => [...(editing?.audience ?? filing?.project.circle ?? [])]);
  const [due, setDue] = useState(editing && editing.needed_by > now ? dayKeyOf(editing.needed_by) : dayFrom(now, 30));
  const [rows, setRows] = useState<GradeRow[]>(() => editing
    ? editing.rubric.grades.map((g) => ({ name: g.name, sats: String(g.sats), criteria: g.criteria }))
    : starterRows(t));
  const [lateKind, setLateKind] = useState<LateKind>(editing?.late.kind ?? "full");
  const [latePct, setLatePct] = useState(editing?.late.kind === "discount" ? String(editing.late.pct_per_day) : "5");
  const [steps, setSteps] = useState<StepRow[]>(() => (editing?.late.kind === "steps" ? stepRowsOf(editing.late.steps) : starterSteps()));
  const setStep = (i: number, change: Partial<StepRow>) => setSteps((list) => list.map((s, j) => (j === i ? { ...s, ...change } : s)));
  const [deposit, setDeposit] = useState(editing ? String(editing.deposit_pct || "") : "10");
  const [milestones, setMilestones] = useState<MilestoneRow[]>(
    () => (editing?.milestones ?? []).map((m) => ({ name: m.name, day: dayKeyOf(m.due_at), pct: String(m.pct) })),
  );
  const [cover, setCover] = useState<CoverRows>(() => (editing || !filing ? rowsOf(editing?.cover ?? null)
    : coverFromDefaults(blankCover(), filing.project.defaults)));
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<Set<BlockId>>(() => new Set(editing ? [] : ["spec"]));
  const toggle = (id: BlockId, on: boolean) => setOpen((o) => {
    const next = new Set(o);
    if (on) next.add(id);
    else next.delete(id);
    return next;
  });
  /** Open a block and bring it into view. */
  function show(id: BlockId) {
    toggle(id, true);
    requestAnimationFrame(() => document.getElementById(blockAnchor(id))?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  /** Say what to fix, and open the block that holds it. */
  function refuse(key: string, text: string) {
    setProblem(text);
    show(blockOf(key));
  }

  const top = Math.max(0, ...rows.map((r) => satsOf(r.sats)));
  const ahead = aheadPct(pctOf(deposit), milestones.map((m) => pctOf(m.pct)));
  const gradeNames = rows.map((r) => r.name.trim()).filter(Boolean);
  const setRow = (i: number, change: Partial<GradeRow>) => setRows((list) => list.map((r, j) => (j === i ? { ...r, ...change } : r)));
  const setMilestone = (i: number, change: Partial<MilestoneRow>) =>
    setMilestones((list) => list.map((m, j) => (j === i ? { ...m, ...change } : m)));
  const setCoverField = <K extends keyof CoverRows>(key: K, value: CoverRows[K]) => setCover((c) => ({ ...c, [key]: value }));

  async function save() {
    setProblem("");
    if (!title.trim()) return refuse("form.needTitle", t("form.needTitle"));
    const who = audienceFrom(audience.join("\n"));
    if ("problem" in who) return refuse(who.problem.key, t(who.problem.key, who.problem.vars));
    const neededBy = endOfDay(due);
    if (neededBy === null || neededBy < now) return refuse("form.needDay", t("form.needDay"));
    const made = rubricFrom(rows);
    if ("problem" in made) return refuse(made.problem.key, t(made.problem.key, made.problem.vars));
    const late = lateFrom(lateKind, latePct, steps);
    if ("problem" in late) return refuse(late.problem.key, t(late.problem.key, late.problem.vars));
    const paid = aheadFrom(deposit, milestones, neededBy, now);
    if ("problem" in paid) return refuse(paid.problem.key, t(paid.problem.key, paid.problem.vars));
    const page = coverFrom(cover, made.rubric.grades.map((g) => g.name), late.late.kind === "steps" ? late.late.steps : []);
    if ("problem" in page) return refuse(page.problem.key, t(page.problem.key, page.problem.vars));
    const terms = {
      title: title.trim(), description: description.trim(), rubric: made.rubric, audience: who.audience,
      needed_by: neededBy, late: late.late, deposit_pct: paid.deposit_pct, milestones: paid.milestones, cover: page.cover,
    };
    setBusy(true);
    try {
      const task = editing ? await editTask(editing.task_id, terms)
        : await postTask(filing ? { ...terms, org_id: filing.project.org_id, project_id: filing.project.project_id } : terms);
      go(commissionHref(task.task_id));
    } catch (e) {
      setProblem((e as Error).message);
      setBusy(false);
    }
  }

  const shape: Shape = {
    title, deliverables: cover.deliverables.split("\n").filter((d) => d.trim()).length, invited: audience.length,
    arbiter: cover.arbiter, grades: gradeNames.length, topSats: top,
    neededBy: due ? new Date(`${due}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "—",
    late: lateKind, failHours: failHoursOf(cover), depositPct: pctOf(deposit), milestones: milestones.length,
    escrowMint: cover.escrow ? cover.mint : "", deemedGrade: cover.deemedGrade,
    deemedDays: Number(cover.deemedDays) || 0, ip: cover.ip, law: cover.law,
  };
  const HELP: Partial<Record<BlockId, string>> = {
    grades: t("form.gradesHelp"),
    payments: t("form.aheadHelp", { max: MAX_AHEAD_PCT }),
    legal: t("cover.help"),
  };
  const body: Record<BlockId, ReactNode> = {
    spec: (
      <>
          <label className="grid gap-1">
            <span className="label">{t("form.title")}</span>
            <input className="field" value={title} maxLength={190} onChange={(e) => setTitle(e.target.value)} placeholder={t("form.titlePlaceholder")} />
          </label>
          <div className="grid gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="brief" className="label">{t("form.description")}</label>
              <button type="button" className="chip" onClick={() => setBig(true)}><Maximize2 size={16} aria-hidden />{t("form.bigEditor")}</button>
            </div>
            <textarea id="brief" className="field" rows={8} maxLength={BRIEF_MAX} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder={t("form.descriptionPlaceholder")} />
            <span className="muted text-sm">{t("form.markdown")}</span>
            {big && (
              <Suspense fallback={null}>
                <MarkdownEditor value={description} maxLength={BRIEF_MAX} title={t("form.brief")} label={t("form.description")}
                  placeholder={t("form.descriptionPlaceholder")} onDone={(text) => { setDescription(text); setBig(false); }} />
              </Suspense>
            )}
          </div>
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
      </>
    ),
    people: (
      <>
          <div className="grid gap-1">
            <span className="label">{t("form.audience")}</span>
            <NpubListField value={audience} onChange={setAudience} label={t("form.audience")} max={MAX_AUDIENCE}
              ownNpub={session.signedIn ? session.npub : undefined} look={{ inputClassName: "field font-mono text-sm", buttonClassName: "chip" }} />
            <span className="muted text-sm">{t("form.audienceHelp")}</span>
          </div>
          <div className="grid gap-1">
            <span className="label">{t("cover.arbiter")}</span>
            <NpubField value={cover.arbiter} onChange={(n) => setCoverField("arbiter", n)} label={t("cover.arbiter")}
              look={{ inputClassName: "field font-mono text-sm", buttonClassName: "chip" }} />
            <span className="muted text-sm">{t("cover.arbiterHelp")}</span>
          </div>
      </>
    ),
    grades: (
      <>
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
      </>
    ),
    schedule: (
      <>
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
          {lateKind === "steps" && (
            <div className="grid gap-2">
              {steps.map((s, i) => (
                <div key={i} className="step-row">
                  <span>{t("late.stepMore")}</span>
                  <input className="field num text-right" inputMode="numeric" value={s.after} maxLength={4} onChange={(e) => setStep(i, { after: e.target.value })}
                    aria-label={t("late.stepAfter")} />
                  <select className="field" value={s.unit} onChange={(e) => setStep(i, { unit: e.target.value as Unit })} aria-label={t("late.unitLabel")}>
                    {UNITS.map((u) => <option key={u} value={u}>{t(`late.unit.${u}`)}</option>)}
                  </select>
                  <span>{t("late.stepLate")}</span>
                  <input className="field num text-right" inputMode="numeric" value={s.pct} maxLength={3} onChange={(e) => setStep(i, { pct: e.target.value })}
                    aria-label={t("late.stepPct")} />
                  <span>{t("late.stepOff")}</span>
                  {steps.length > 1 && (
                    <button type="button" className="icon-btn" onClick={() => setSteps((list) => list.filter((_, j) => j !== i))}
                      aria-label={t("late.removeStep")} title={t("late.removeStep")}>
                      <Trash2 size={16} aria-hidden />
                    </button>
                  )}
                </div>
              ))}
              {steps.length < MAX_LATE_STEPS && (
                <button type="button" className="chip w-fit" onClick={() => setSteps((list) => [...list, { after: "", unit: list[list.length - 1]?.unit ?? "days", pct: "" }])}>
                  <Plus size={16} aria-hidden />{t("late.addStep")}
                </button>
              )}
            </div>
          )}
          <p className="muted text-sm">{t(`late.pickHelp.${lateKind}`)}</p>
          <div className="step-row">
            <span className="label">{t("late.fail")}</span>
            <input className="field num text-right" inputMode="numeric" value={cover.failAfter} maxLength={4}
              onChange={(e) => setCoverField("failAfter", e.target.value)} aria-label={t("late.fail")} />
            <select className="field" value={cover.failUnit} onChange={(e) => setCoverField("failUnit", e.target.value as Unit)} aria-label={t("late.unitLabel")}>
              {UNITS.map((u) => <option key={u} value={u}>{t(`late.unit.${u}`)}</option>)}
            </select>
            <span>{t("late.failLate")}</span>
          </div>
          <p className="muted text-sm">{t("late.failHelp")} <Link to="/terms?version=v1#t-14-7" className="ent">§14</Link></p>
      </>
    ),
    payments: (
      <>
          <label className="inline-pct">
            <span className="label">{t("form.deposit")}</span>
            <input className="field num text-right" inputMode="numeric" value={deposit} maxLength={2} onChange={(e) => setDeposit(e.target.value)} aria-label={t("form.deposit")} />
            <span>%</span>
            <span className="muted">× {t("sats.amount", { sats: formatSats(top) })} =</span>
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
              <span className="muted">× {t("sats.amount", { sats: formatSats(top) })} =</span>
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
          <EscrowFields cover={cover} set={setCoverField} onOpen={show} />
      </>
    ),
    conclusion: (
      <>
          <div className="two-up">
            <label className="grid gap-1">
              <span className="label">{t("cover.deemedGrade")}</span>
              <select className="field" value={cover.deemedGrade} onChange={(e) => setCoverField("deemedGrade", e.target.value)}>
                <option value="">{t("cover.noDeemed")}</option>
                {gradeNames.map((g) => <option key={g} value={g}>{t("cover.countAs", { grade: g })}</option>)}
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
          <p className="muted text-sm">{t("block.conclusionRules")} <Link to="/terms?version=v1#t-4-6" className="ent">§4.6</Link></p>
      </>
    ),
    legal: (
      <>
          <TermsFields cover={cover} set={setCoverField} />
          <p className="muted text-sm">{t("cover.underTerms")} <Link to="/terms" className="ent">{t("nav.terms")}</Link></p>
      </>
    ),
  };

  return (
    <div className="page">
      <form className="card panel grid gap-6" onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <h1 className="page-title">{editing ? t("form.editTitle") : t("form.newTitle")}</h1>
        {editing?.agreement.purchaser_signed && <p className="gate">{t("form.editClearsSignature")}</p>}
        {filing && (
          <p className="filing">
            <FolderOpen size={16} aria-hidden />
            <span>{t("form.filedIn")} <Link to={projectHref(filing.project)} className="ent">{filing.project.name}</Link></span>
            {budgetLeft(filing.project.budget_sats, filing.project.totals) !== null && (
              <span className="muted">· {t("form.budgetLeft")} <Sats sats={budgetLeft(filing.project.budget_sats, filing.project.totals) ?? 0} /></span>
            )}
          </p>
        )}

        {BLOCKS.map((id) => (
          <FormBlock key={id} id={id} summary={summaryOf(id, shape)} open={open.has(id)} onToggle={(on) => toggle(id, on)}
            help={HELP[id]}>
            {body[id]}
          </FormBlock>
        ))}

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
