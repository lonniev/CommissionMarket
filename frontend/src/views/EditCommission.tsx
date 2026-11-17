/** Change a commission nobody has claimed yet. */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CommissionForm from "../components/CommissionForm";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { getTask, type Task } from "../lib/tasks";

export default function EditCommission() {
  const { taskId = "" } = useParams();
  const t = useT();
  const [task, setTask] = useState<Task | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    let live = true;
    getTask(taskId).then((r) => live && setTask(r.task)).catch((e) => live && setProblem((e as Error).message));
    return () => { live = false; };
  }, [taskId]);

  if (!task) {
    return <div className="page"><div className="card panel">{problem ? <p className="error">{problem}</p> : <Waiting heading={t("waiting.fetchingOne")} />}</div></div>;
  }
  return <CommissionForm editing={task} />;
}
