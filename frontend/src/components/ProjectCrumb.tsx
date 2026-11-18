/** Where a commission is filed, as a link to its Project, for the people of its Organization. */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { getProject, type Project } from "../lib/orgs";
import type { Task } from "../lib/tasks";
import { projectHref } from "./Person";

export default function ProjectCrumb({ task }: { task: Task }) {
  const [project, setProject] = useState<Project | null>(null);
  const mine = task.your_roles.includes("member") || task.your_roles.includes("purchaser");

  useEffect(() => {
    if (task.project_id && mine) getProject(task.project_id).then(setProject, () => setProject(null));
  }, [task.project_id, mine]);

  if (!project) return null;
  return (
    <Link to={projectHref(project)} className="crumb">
      <FolderOpen size={15} aria-hidden />{project.name}
    </Link>
  );
}
