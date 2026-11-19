/**
 * Where a commission is filed, as a link to its Project, for the people of its Organization.
 * Its client may move it into another Project: its terms and signatures stand, and they may
 * differ from that Project's defaults, which only start new commissions.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderInput, FolderOpen } from "lucide-react";
import { useT } from "../i18n";
import { getProject, postableProjects, type OrgDetail, type Project, type ProjectSummary } from "../lib/orgs";
import { fileTask, type Task } from "../lib/tasks";
import { projectHref } from "./Person";

export default function ProjectCrumb({ task, onMoved }: { task: Task; onMoved: (task: Task) => void }) {
  const t = useT();
  const [project, setProject] = useState<Project | null>(null);
  const [choices, setChoices] = useState<{ org: OrgDetail; projects: ProjectSummary[] }[] | null>(null);
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const client = task.your_roles.includes("purchaser");
  const mine = task.your_roles.includes("member") || client;

  useEffect(() => {
    if (task.project_id && mine) getProject(task.project_id).then(setProject, () => setProject(null));
    else setProject(null);
  }, [task.project_id, mine]);

  async function open() {
    setProblem("");
    try {
      setChoices(await postableProjects());
    } catch (e) {
      setProblem((e as Error).message);
    }
  }

  async function move(value: string) {
    const [orgId, projectId] = value.split("/");
    if (!projectId) return;
    setBusy(true);
    setProblem("");
    try {
      onMoved(await fileTask(task.task_id, orgId, projectId));
      setChoices(null);
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!project && !client) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {project && (
        <Link to={projectHref(project)} className="crumb">
          <FolderOpen size={15} aria-hidden />{project.name}
        </Link>
      )}
      {client && !choices && (
        <button type="button" className="chip" onClick={() => void open()}>
          <FolderInput size={16} aria-hidden />{project ? t("move.another") : t("move.into")}
        </button>
      )}
      {client && choices && (
        <select className="field" disabled={busy} defaultValue="" aria-label={t("move.into")} onChange={(e) => void move(e.target.value)}>
          <option value="" disabled>{t("move.pick")}</option>
          {choices.filter((c) => c.projects.length).map(({ org, projects }) => (
            <optgroup key={org.org_id} label={org.name}>
              {projects.filter((p) => p.project_id !== task.project_id).map((p) => (
                <option key={p.project_id} value={`${org.org_id}/${p.project_id}`}>{p.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      )}
      {problem && <span className="error text-sm">{problem}</span>}
    </div>
  );
}
