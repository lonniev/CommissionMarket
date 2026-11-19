/** Every commission you can see: open to you, posted by you, or yours to deliver. */

import { tourTarget, useTour } from "@tollbooth-dpyc/web/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, FolderOpen, Plus, RefreshCw, Search, X } from "lucide-react";
import CommissionRow from "../components/CommissionRow";
import { Person, shortNpub } from "../components/Person";
import StandingBadge from "../components/StandingBadge";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import type { MessageKey } from "../i18n/en";
import { grouped, matches, type Order } from "../lib/browse";
import { isFinished, standingKey, type Standing } from "../lib/moves";
import { listTasks, type Task } from "../lib/tasks";
import { useProjectNames } from "../lib/useProjectNames";

type Tab = "open" | "posted" | "working" | "orgs" | "finished";

const TABS: { tab: Tab; label: MessageKey }[] = [
  { tab: "open", label: "list.open" },
  { tab: "posted", label: "list.posted" },
  { tab: "working", label: "list.working" },
  { tab: "orgs", label: "list.orgs" },
  { tab: "finished", label: "list.finished" },
];

const ORDERS: { order: Order; label: MessageKey }[] = [
  { order: "due", label: "browse.byDue" },
  { order: "person", label: "browse.byPerson" },
  { order: "state", label: "browse.byState" },
  { order: "project", label: "browse.byProject" },
];

/** Search and ordering appear once a tab holds enough commissions to need them. */
const BROWSE_FROM = 4;

function inTab(task: Task, tab: Tab): boolean {
  if (tab === "finished") return isFinished(task);
  if (isFinished(task)) return false;
  if (tab === "posted") return task.your_roles.includes("purchaser");
  if (tab === "working") return task.your_roles.includes("performer");
  // Filed in one of your Organizations, with no part of your own in it.
  if (tab === "orgs") return task.your_roles.length > 0 && task.your_roles.every((r) => r === "member");
  return task.your_roles.includes("audience") && !task.performer;
}

export default function Commissions() {
  const t = useT();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  useTour("commissions", { ready: !!tasks });
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
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order>("due");
  const inThisTab = (tasks ?? []).filter((x) => inTab(x, tab));
  const said = (s: Standing) => t(standingKey(s));
  const projectNames = useProjectNames(tasks);
  const [project, setProject] = useState("");
  const projectLabel = (id: string) => (id ? projectNames.get(id) ?? t("browse.otherProject") : t("browse.noProject"));
  const filedIn = [...new Set(inThisTab.map((x) => x.project_id).filter(Boolean))];
  const shown = inThisTab.filter((x) => matches(x, query, shortNpub, said) && (!project || x.project_id === project));
  const groups = grouped(shown, order, order === "person" ? shortNpub : order === "project" ? projectLabel : (k) => said(k as Standing));
  const list = (rows: Task[]) => <ul className="row-list">{rows.map((task) => <CommissionRow key={task.task_id} task={task} now={now} project={projectNames.get(task.project_id)} />)}</ul>;

  return (
    <div className="page grid gap-3">
      <div className="toolbar">
        <h1 className="page-title">{t("nav.commissions")}</h1>
        <div className="toolbar-actions">
          <button type="button" className="icon-btn" onClick={() => void load()} aria-label={t("actions.lookAgain")} title={t("actions.lookAgain")} {...tourTarget("commissions.refresh")}>
            <RefreshCw size={18} aria-hidden />
          </button>
          <Link to="/commissions/new" className="btn btn-go" {...tourTarget("commissions.new")}><Plus size={18} aria-hidden />{t("list.new")}</Link>
        </div>
      </div>

      <div className="tabs" role="tablist" {...tourTarget("commissions.tabs")}>
        {TABS.filter(({ tab: k }) => k !== "orgs" || counts.orgs > 0 || tab === "orgs").map(({ tab: k, label }) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "chip chip-on" : "chip"} onClick={() => setTab(k)}>
            {t(label)} <span className="num muted">({counts[k] ?? 0})</span>
          </button>
        ))}
      </div>

      {(inThisTab.length >= BROWSE_FROM || query || inThisTab.some((x) => x.project_id)) && (
        <div className="browse" {...tourTarget("commissions.browse")}>
          <label className="browse-search">
            <Search size={18} aria-hidden />
            <input className="field" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("browse.find")} aria-label={t("browse.find")} />
            {query && (
              <button type="button" className="icon-btn" onClick={() => setQuery("")} aria-label={t("browse.clear")} title={t("browse.clear")}><X size={18} aria-hidden /></button>
            )}
          </label>
          <div className="browse-picks">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("browse.order")}>
              {ORDERS.map((o) => (
                <button key={o.order} type="button" className={order === o.order ? "chip chip-on" : "chip"} aria-pressed={order === o.order} onClick={() => setOrder(o.order)}>
                  {t(o.label)}
                </button>
              ))}
            </div>
            <Link to="/calendar" className="chip"><CalendarDays size={16} aria-hidden />{t("nav.calendar")}</Link>
          </div>
          {filedIn.length > 0 && (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("browse.project")}>
              <button type="button" className={project === "" ? "chip chip-on" : "chip"} aria-pressed={project === ""} onClick={() => setProject("")}>
                {t("browse.allProjects")}
              </button>
              {filedIn.map((id) => (
                <button key={id} type="button" className={project === id ? "chip chip-on" : "chip"} aria-pressed={project === id} onClick={() => setProject(id)}>
                  <FolderOpen size={14} aria-hidden />{projectLabel(id)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <section className="card panel grid gap-3" {...tourTarget("commissions.list")}>
        {problem && <p className="error">{problem}</p>}
        {!tasks && !problem && <Waiting heading={t("waiting.fetchingList")} />}
        {tasks && !inThisTab.length && <p className="muted">{t(`list.empty.${tab}`)}</p>}
        {query && inThisTab.length > 0 && !shown.length && <p className="muted">{t("browse.noMatch", { query })}</p>}
        {order === "due" && shown.length > 0 && list(shown.sort((a, b) => a.needed_by - b.needed_by))}
        {order !== "due" && groups.map((g) => (
          <div key={g.key} className="grid gap-1">
            <h2 className="group-title">
              {order === "person" ? <Person npub={g.key} />
                : order === "project" ? <span className="inline-flex items-center gap-1.5"><FolderOpen size={16} aria-hidden />{projectLabel(g.key)}</span>
                : <StandingBadge standing={g.key as Standing} />}
              <span className="muted num">({g.rows.length})</span>
            </h2>
            {list(g.rows)}
          </div>
        ))}
      </section>
    </div>
  );
}
