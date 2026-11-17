/** One commission as a row in a list: its title, standing, needed-by day, offer, Project and price. */

import { Link } from "react-router-dom";
import { CircleAlert, FileSignature, FolderOpen } from "lucide-react";
import { say, useT } from "../i18n";
import { laneOf } from "../lib/moves";
import { topSats } from "../lib/rubric";
import type { Task } from "../lib/tasks";
import { dueText } from "../lib/when";
import { commissionHref } from "./Person";
import Sats from "./Sats";
import StandingBadge from "./StandingBadge";

export default function CommissionRow({ task, now, project }: { task: Task; now: number; project?: string }) {
  const t = useT();
  const yours = laneOf(task) === "yours";
  return (
    <li>
      <Link to={commissionHref(task.task_id)} className={yours ? "row-card row-yours" : "row-card"}>
        <div className="grid gap-1 min-w-0">
          <span className="row-title">{task.title}</span>
          <span className="row-meta muted">
            <StandingBadge standing={task.standing} />
            <span>{t("list.due", { when: say(t, dueText(task.needed_by, now)) })}</span>
            {task.cover && (
              <span className="inline-flex items-center gap-1">
                <FileSignature size={14} aria-hidden />
                {task.agreement.purchaser_signed ? t("list.clientSigned") : t("list.clientNotSigned")}
              </span>
            )}
            {project && <span className="inline-flex items-center gap-1"><FolderOpen size={14} aria-hidden />{project}</span>}
            {yours && <span className="needs-you"><CircleAlert size={14} aria-hidden />{t("list.needsYou")}</span>}
          </span>
        </div>
        <Sats sats={topSats(task.rubric)} />
      </Link>
    </li>
  );
}
