/**
 * Every commission you are part of that names an arbiter or an inspector, by your part in it:
 * those you arbitrate or inspect (with what each asks of you), those you posted, the work you
 * do, and those open to you. Each row names its arbiter and inspector and opens the
 * commission, where you sign, decide or give your opinion.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { CircleCheck, CircleDashed, RefreshCw, Scale, Search } from "lucide-react";
import { NpubChip } from "@tollbooth-dpyc/web/react";
import CommissionRow from "../components/CommissionRow";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { arbiterDue, arbiterOf, dueKey, inspectorDue, inspectorDueKey, inspectorOf, SHELVES, shelfOf } from "../lib/arbiter";
import { listTasks, type Task } from "../lib/tasks";

/** Who stands in one role on a commission, and whether they signed its offer. */
function WhoLine({ icon, label, npub, signed }: { icon: ReactNode; label: string; npub: string; signed: boolean }) {
  const t = useT();
  return (
    <div className="arbiter-line">
      {icon}
      <span className="muted">{label}</span>
      <NpubChip npub={npub} />
      {signed
        ? <span className="inline-flex items-center gap-1 text-sm"><CircleCheck size={14} aria-hidden className="ok" />{t("arbiter.signed")}</span>
        : <span className="inline-flex items-center gap-1 text-sm muted"><CircleDashed size={14} aria-hidden />{t("offer.notSigned")}</span>}
    </div>
  );
}

export default function Arbitration() {
  const t = useT();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [problem, setProblem] = useState("");
  const now = Math.floor(Date.now() / 1000);

  const load = useCallback(async () => {
    setProblem("");
    try {
      setTasks((await listTasks()).filter((x) => shelfOf(x) !== null));
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
              const asked = inspectorDue(task);
              const note = due ? t(dueKey(due)) : asked ? t(inspectorDueKey(asked)) : undefined;
              return (
                <CommissionRow key={task.task_id} task={task} now={now} note={note}
                  after={(
                    <>
                      {arbiterOf(task) && (
                        <WhoLine icon={<Scale size={16} aria-hidden className="muted" />} label={t("offer.arbiter")}
                          npub={arbiterOf(task)} signed={Boolean(task.agreement.arbiter_signed)} />
                      )}
                      {inspectorOf(task) && (
                        <WhoLine icon={<Search size={16} aria-hidden className="muted" />} label={t("offer.inspector")}
                          npub={inspectorOf(task)} signed={Boolean(task.agreement.inspector_signed)} />
                      )}
                    </>
                  )} />
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
