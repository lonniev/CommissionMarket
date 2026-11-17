/** One Project: its brief, its budget against what its commissions committed and paid, its circle, its terms, and its commissions. */

import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Archive, ArchiveRestore, ArrowLeft, Pencil, Plus, RefreshCw } from "lucide-react";
import BudgetBar from "../components/BudgetBar";
import CommissionRow from "../components/CommissionRow";
import { orgHref, People } from "../components/Person";
import ProjectForm from "../components/ProjectForm";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { archiveProject, getProject, type Project as ProjectView } from "../lib/orgs";
import { listTasks, type Task } from "../lib/tasks";

function Defaults({ project }: { project: ProjectView }) {
  const t = useT();
  const d = project.defaults;
  const rows: [string, string][] = [
    [t("cover.ip"), t(`cover.ip.${d.ip_option ?? "assign"}`)],
    ...(d.deemed_acceptance_days ? [[t("cover.deemedDays"), String(d.deemed_acceptance_days)] as [string, string]] : []),
    ...(d.confidential ? [[t("cover.confidentialShort"), "✓"] as [string, string]] : []),
    ...(d.client_is_consumer ? [[t("cover.consumerShort"), "✓"] as [string, string]] : []),
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
  const [problem, setProblem] = useState("");
  const [editing, setEditing] = useState(false);
  const now = Math.floor(Date.now() / 1000);

  const load = useCallback(async () => {
    setProblem("");
    try {
      const [p, all] = await Promise.all([getProject(projectId), listTasks()]);
      setProject(p);
      setTasks(all.filter((x) => x.project_id === projectId));
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
            <Link to={`/commissions/new?project=${encodeURIComponent(projectId)}`} className="btn btn-go"><Plus size={18} aria-hidden />{t("project.postHere")}</Link>
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
            <BudgetBar budget={project.budget_sats} totals={project.totals} />
          </section>
          <div className="two-up">
            <section className="card panel grid gap-2">
              <h2 className="panel-title">{t("project.circle")}</h2>
              {project.circle.length ? <People npubs={project.circle} /> : <p className="muted">{t("project.noCircle")}</p>}
            </section>
            <section className="card panel grid gap-2">
              <h2 className="panel-title">{t("project.defaults")}</h2>
              <Defaults project={project} />
            </section>
          </div>
          <section className="card panel grid gap-2">
            <h2 className="panel-title">{t("nav.commissions")} <span className="muted num">({tasks?.length ?? 0})</span></h2>
            {tasks && !tasks.length && <p className="muted">{t("project.noCommissions")}</p>}
            {tasks && tasks.length > 0 && <ul className="row-list">{tasks.map((x) => <CommissionRow key={x.task_id} task={x} now={now} />)}</ul>}
          </section>
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
