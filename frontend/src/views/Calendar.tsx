/** Your commissions on a month: when each was posted, claimed, paid ahead, delivered, graded and paid, and what falls due. */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import MonthCalendar, { kindKey } from "../components/MonthCalendar";
import { commissionHref, Person } from "../components/Person";
import StandingBadge from "../components/StandingBadge";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { EVENT_MARK, eventsOf, type CommissionEvent } from "../lib/calendar";
import { listTasks, type Task } from "../lib/tasks";

function Happening({ event }: { event: CommissionEvent }) {
  const t = useT();
  return (
    <li className="happening">
      <span className="happening-mark" aria-hidden>{EVENT_MARK[event.kind]}</span>
      <div className="grid gap-1 min-w-0">
        <Link to={commissionHref(event.task.task_id)} className="happening-title">{event.task.title}</Link>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{t(kindKey(event.kind))}{event.milestone && <>: {event.milestone}</>}</span>
          <Person npub={event.who} />
          <StandingBadge standing={event.task.standing} />
        </span>
      </div>
    </li>
  );
}

export default function Calendar() {
  const t = useT();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(true);
  const now = Math.floor(Date.now() / 1000);

  const load = useCallback(async () => {
    setLoading(true);
    setProblem("");
    try {
      setTasks(await listTasks());
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const events = useMemo(() => eventsOf(tasks ?? []), [tasks]);

  return (
    <div className="page grid gap-3">
      <div className="toolbar">
        <h1 className="page-title">{t("cal.title")}</h1>
        <div className="toolbar-actions">
          <button type="button" className="icon-btn" onClick={() => void load()} disabled={loading} aria-label={t("actions.lookAgain")} title={t("actions.lookAgain")}>
            <RefreshCw size={18} aria-hidden />
          </button>
        </div>
      </div>
      {problem && <p className="card panel error">{problem}</p>}
      {loading && !tasks && <div className="card panel"><Waiting heading={t("waiting.fetchingList")} /></div>}
      {tasks && (
        <MonthCalendar events={events} now={now} renderDay={(day) => (
          <ul className="happenings">{day.map((e, i) => <Happening key={`${e.task.task_id}-${e.kind}-${i}`} event={e} />)}</ul>
        )} />
      )}
    </div>
  );
}
