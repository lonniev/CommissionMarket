/** One Project: its brief, its budget against what its commissions committed and paid, its circle, its terms, and its commissions. */

import { tourTarget, useTour } from "@tollbooth-dpyc/web/react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Archive, ArchiveRestore, ArrowLeft, FolderInput, Pencil, Plus, RefreshCw } from "lucide-react";
import BudgetBar from "../components/BudgetBar";
import CommissionRow from "../components/CommissionRow";
import { orgHref, People } from "../components/Person";
import ProjectForm from "../components/ProjectForm";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { archiveProject, getProject, type Project as ProjectView } from "../lib/orgs";
import { fileTask, listTasks, type Task } from "../lib/tasks";
import { useProjectNames } from "../lib/useProjectNames";
import Word from "../components/Word";

function Defaults({ project }: { project: ProjectView }) {
  const t = useT();
  const d = project.defaults;
  const rows: [string, string][] = [
    [t("cover.ip"), t(`cover.ip.${d.ip_option ?? "assign"}`)],
    ...(d.deemed_acceptance_days ? [[t("cover.deemedDays"), String(d.deemed_acceptance_days)] as [string, string]] : []),
    ...(d.confidential ? [[t("cover.confidentialShort"), "✓"] as [string, string]] : []),
    [t("cover.thirdPartyShort"), d.third_party_allowed ? t("cover.allowed") : t("cover.notAllowed")],
    ...(d.governing_law ? [[t("cover.law"), d.governing_law] as [string, string]] : []),
    ...(d.venue ? [[t("cover.venue"), d.venue] as [string, string]] : []),
  ];
  return (
    <dl className="facts">
      {rows.map(([k, v]) => <div key={k} className="contents"><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  );
}

export default function Project() {
  const { orgId = "", projectId = "" } = useParams();
  const t = useT();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  useTour("project", { ready: !!project && !!tasks });
  /** Commissions you posted that are filed elsewhere, or nowhere: ones you may move here. */
  const [elsewhere, setElsewhere] = useState<Task[]>([]);
  const [moving, setMoving] = useState(false);
  const [problem, setProblem] = useState("");
  const [editing, setEditing] = useState(false);
  const now = Math.floor(Date.now() / 1000);

  const load = useCallback(async () => {
    setProblem("");
    try {
      const [p, all] = await Promise.all([getProject(projectId), listTasks()]);
      setProject(p);
      setTasks(all.filter((x) => x.project_id === projectId));
      setElsewhere(all.filter((x) => x.project_id !== projectId && x.your_roles.includes("purchaser")));
    } catch (e) {
      setProblem((e as Error).message);
    }
  }, [projectId]);
  useEffect(() => { void load(); }, [load]);

  async function archive(archived: boolean) {
    try {
      await archiveProject(orgId, projectId, archived);
      await load();
    } catch (e) {
      setProblem((e as Error).message);
    }
  }

  const names = useProjectNames(elsewhere);

  async function moveHere(task: Task) {
    if (!project) return;
    setProblem("");
    try {
      await fileTask(task.task_id, project.org_id, projectId);
      await load();
    } catch (e) {
      setProblem((e as Error).message);
    }
  }

  const owner = project?.your_place === "owner";
  return (
    <div className="page grid gap-3">
      <div className="toolbar">
        <Link to={orgHref(orgId)} className="btn btn-quiet"><ArrowLeft size={18} aria-hidden />{t("org.back")}</Link>
        <div className="toolbar-actions">
          <button type="button" className="icon-btn" onClick={() => void load()} aria-label={t("actions.lookAgain")} title={t("actions.lookAgain")}>
            <RefreshCw size={18} aria-hidden />
          </button>
          {owner && !editing && (
            <button type="button" className="icon-btn" onClick={() => setEditing(true)} aria-label={t("project.edit")} title={t("project.edit")}>
              <Pencil size={18} aria-hidden />
            </button>
          )}
          {project && !project.archived && (
            <Link to={`/commissions/new?project=${encodeURIComponent(projectId)}`} className="btn btn-go" {...tourTarget("project.post")}><Plus size={18} aria-hidden />{t("project.postHere")}</Link>
          )}
        </div>
      </div>
      {problem && <p className="card panel error">{problem}</p>}
      {!project && !problem && <div className="card panel"><Waiting heading={t("waiting.fetchingProject")} /></div>}
      {project && editing && (
        <ProjectForm orgId={orgId} editing={project} onSaved={() => { setEditing(false); void load(); }} onCancel={() => setEditing(false)} />
      )}
      {project && !editing && (
        <>
          <section className="card panel grid gap-2">
            <h1 className="page-title">{project.name} {project.archived && <span className="badge align-middle">{t("project.archived")}</span>}</h1>
            {project.brief && <p className="whitespace-pre-wrap">{project.brief}</p>}
            <div {...tourTarget("project.budget")}><BudgetBar budget={project.budget_sats} totals={project.totals} /></div>
          </section>
          <div className="two-up">
            <section className="card panel grid gap-2" {...tourTarget("project.circle")}>
              <h2 className="panel-title">{t("project.circle")} <Word of="audience" badge align="left" /></h2>
              {project.circle.length ? <People npubs={project.circle} /> : <p className="muted">{t("project.noCircle")}</p>}
            </section>
            <section className="card panel grid gap-2" {...tourTarget("project.defaults")}>
              <h2 className="panel-title">{t("project.defaults")} <Word of="project_defaults" badge align="left" /></h2>
              <Defaults project={project} />
              <p className="muted text-sm">{t("project.defaultsNote")}</p>
            </section>
          </div>
          <section className="card panel grid gap-2" {...tourTarget("project.commissions")}>
            <h2 className="panel-title">{t("nav.commissions")} <span className="muted num">({tasks?.length ?? 0})</span></h2>
            {tasks && !tasks.length && <p className="muted">{t("project.noCommissions")}</p>}
            {tasks && tasks.length > 0 && <ul className="row-list">{tasks.map((x) => <CommissionRow key={x.task_id} task={x} now={now} />)}</ul>}
            {!project.archived && elsewhere.length > 0 && !moving && (
              <div className="flex justify-end">
                <button type="button" className="chip" onClick={() => setMoving(true)} {...tourTarget("project.moveHere")}>
                  <FolderInput size={16} aria-hidden />{t("move.here")}
                </button>
              </div>
            )}
          </section>
          {!project.archived && moving && (
            <section className="card panel grid gap-2">
              <h2 className="panel-title">{t("move.hereTitle")} <span className="muted num">({elsewhere.length})</span></h2>
              <p className="muted text-sm">{t("move.says")}</p>
              <ul className="row-list">
                {elsewhere.map((x) => (
                  <CommissionRow key={x.task_id} task={x} now={now} project={names.get(x.project_id) ?? (x.project_id ? undefined : t("move.unfiled"))}
                    after={(
                      <div className="flex justify-end px-2 pb-3">
                        <button type="button" className="chip chip-accent" onClick={() => void moveHere(x)}>
                          <FolderInput size={16} aria-hidden />{t("move.moveHere")}
                        </button>
                      </div>
                    )} />
                ))}
              </ul>
              <div className="flex justify-end">
                <button type="button" className="btn btn-quiet" onClick={() => setMoving(false)}>{t("move.done")}</button>
              </div>
            </section>
          )}
          {owner && (
            <div className="flex justify-end">
              {project.archived ? (
                <button type="button" className="btn btn-quiet" onClick={() => void archive(false)}><ArchiveRestore size={18} aria-hidden />{t("project.reopen")}</button>
              ) : (
                <button type="button" className="btn btn-quiet" onClick={() => void archive(true)}><Archive size={18} aria-hidden />{t("project.archive")}</button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
