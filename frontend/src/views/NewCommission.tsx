import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CommissionForm from "../components/CommissionForm";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { getProject, type Project } from "../lib/orgs";

/** A new commission; with `?project=`, filed in that Project and started from its circle and terms. */
export default function NewCommission() {
  const [params] = useSearchParams();
  const projectId = params.get("project") ?? "";
  const t = useT();
  const [project, setProject] = useState<Project | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    if (projectId) getProject(projectId).then(setProject, (e: Error) => setProblem(e.message));
  }, [projectId]);

  if (!projectId) return <CommissionForm />;
  if (problem) return <div className="page"><p className="card panel error">{problem}</p></div>;
  if (!project) return <div className="page"><div className="card panel"><Waiting heading={t("waiting.fetchingProject")} /></div></div>;
  return <CommissionForm filing={{ project }} />;
}
