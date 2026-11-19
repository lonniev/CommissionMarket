/**
 * Every commission that names you as its arbiter: those asking you to sign their offer, those
 * waiting on your decision, those you are watching, and those closed. Each row says what is
 * asked of you and opens the commission, where you sign, decide, or sign an escrow split.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import CommissionRow from "../components/CommissionRow";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { arbiterDue, dueKey, isArbiterOf, SHELVES, shelfOf } from "../lib/arbiter";
import { listTasks, type Task } from "../lib/tasks";

export default function Arbitration() {
  const t = useT();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [problem, setProblem] = useState("");
  const now = Math.floor(Date.now() / 1000);

  const load = useCallback(async () => {
    setProblem("");
    try {
      setTasks((await listTasks()).filter(isArbiterOf));
    } catch (e) {
      setProblem((e as Error).message);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const shelves = useMemo(() => SHELVES.map((shelf) => ({
    shelf,
    rows: (tasks ?? []).filter((x) => shelfOf(x) === shelf).sort((a, b) => a.needed_by - b.needed_by),
  })), [tasks]);

  return (
    <div className="page grid gap-3">
      <div className="toolbar">
        <h1 className="page-title">{t("nav.arbitration")}</h1>
        <div className="toolbar-actions">
          <button type="button" className="icon-btn" onClick={() => void load()} aria-label={t("actions.lookAgain")} title={t("actions.lookAgain")}>
            <RefreshCw size={18} aria-hidden />
          </button>
        </div>
      </div>
      <p className="muted">{t("arbiter.says")} <Link to="/terms?version=v1#t-8-1" className="ent">§8</Link></p>

      {problem && <p className="error">{problem}</p>}
      {!tasks && !problem && <Waiting heading={t("waiting.fetchingList")} />}
      {tasks && !tasks.length && <section className="card panel"><p className="muted">{t("arbiter.none")}</p></section>}

      {shelves.filter(({ rows }) => rows.length).map(({ shelf, rows }) => (
        <section key={shelf} className="card panel grid gap-3">
          <h2 className="panel-title">{t(`arbiter.shelf.${shelf}`)} <span className="num muted">({rows.length})</span></h2>
          <ul className="row-list">
            {rows.map((task) => {
              const due = arbiterDue(task);
              return <CommissionRow key={task.task_id} task={task} now={now} note={due ? t(dueKey(due)) : undefined} />;
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
