/** Every commission you can see: open to you, posted by you, or yours to deliver. */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleAlert, FileSignature, Plus, RefreshCw } from "lucide-react";
import { commissionHref } from "../components/Person";
import Sats from "../components/Sats";
import StandingBadge from "../components/StandingBadge";
import Waiting from "../components/Waiting";
import { say, useT } from "../i18n";
import type { MessageKey } from "../i18n/en";
import { isFinished, laneOf } from "../lib/moves";
import { topSats } from "../lib/rubric";
import { listTasks, type Task } from "../lib/tasks";
import { dueText } from "../lib/when";

type Tab = "open" | "posted" | "working" | "finished";

const TABS: { tab: Tab; label: MessageKey }[] = [
  { tab: "open", label: "list.open" },
  { tab: "posted", label: "list.posted" },
  { tab: "working", label: "list.working" },
  { tab: "finished", label: "list.finished" },
];

function inTab(task: Task, tab: Tab): boolean {
  if (tab === "finished") return isFinished(task);
  if (isFinished(task)) return false;
  if (tab === "posted") return task.your_roles.includes("purchaser");
  if (tab === "working") return task.your_roles.includes("performer");
  return task.your_roles.includes("audience") && !task.performer;
}

function Card({ task, now }: { task: Task; now: number }) {
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
            {yours && <span className="needs-you"><CircleAlert size={14} aria-hidden />{t("list.needsYou")}</span>}
          </span>
        </div>
        <Sats sats={topSats(task.rubric)} />
      </Link>
    </li>
  );
}

export default function Commissions() {
  const t = useT();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [problem, setProblem] = useState("");
  const [tab, setTab] = useState<Tab>("open");
  const now = Math.floor(Date.now() / 1000);

  const load = useCallback(async () => {
    setProblem("");
    try {
      setTasks(await listTasks());
    } catch (e) {
      setProblem((e as Error).message);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(
    () => Object.fromEntries(TABS.map(({ tab: k }) => [k, (tasks ?? []).filter((x) => inTab(x, k)).length])) as Record<Tab, number>,
    [tasks],
  );
  const shown = (tasks ?? []).filter((x) => inTab(x, tab));

  return (
    <div className="page grid gap-3">
      <div className="toolbar">
        <h1 className="page-title">{t("nav.commissions")}</h1>
        <div className="toolbar-actions">
          <button type="button" className="icon-btn" onClick={() => void load()} aria-label={t("actions.lookAgain")} title={t("actions.lookAgain")}>
            <RefreshCw size={18} aria-hidden />
          </button>
          <Link to="/commissions/new" className="btn btn-go"><Plus size={18} aria-hidden />{t("list.new")}</Link>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(({ tab: k, label }) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "chip chip-on" : "chip"} onClick={() => setTab(k)}>
            {t(label)} <span className="num muted">({counts[k] ?? 0})</span>
          </button>
        ))}
      </div>

      <section className="card panel">
        {problem && <p className="error">{problem}</p>}
        {!tasks && !problem && <Waiting heading={t("waiting.fetchingList")} />}
        {tasks && !shown.length && <p className="muted">{t(`list.empty.${tab}`)}</p>}
        {shown.length > 0 && <ul className="row-list">{shown.map((task) => <Card key={task.task_id} task={task} now={now} />)}</ul>}
      </section>
    </div>
  );
}
