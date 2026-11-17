/** One commission: its brief and terms, the offer and its signatures, the next step, the money, and its history. */

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlarmClock, ArrowLeft, Pencil, RefreshCw } from "lucide-react";
import { useLanguageLocale } from "@tollbooth-dpyc/web/react";
import Actions from "../components/Actions";
import MoneyPanel from "../components/MoneyPanel";
import OfferPanel from "../components/OfferPanel";
import { commissionHref, People, Person } from "../components/Person";
import Sats from "../components/Sats";
import StandingBadge from "../components/StandingBadge";
import Waiting from "../components/Waiting";
import { say, useT } from "../i18n";
import { isFinished, mayEdit } from "../lib/moves";
import { byReward } from "../lib/rubric";
import { getTask, taskHistory, type Invoice, type Task, type TaskEvent } from "../lib/tasks";
import { dueText, lateRuleText, lateText } from "../lib/when";

const MarkdownText = lazy(() => import("../components/MarkdownText"));

function History({ taskId }: { taskId: string }) {
  const t = useT();
  const locale = useLanguageLocale();
  const [events, setEvents] = useState<TaskEvent[] | null>(null);
  const [problem, setProblem] = useState("");

  async function open(isOpen: boolean) {
    if (!isOpen || events) return;
    try {
      setEvents(await taskHistory(taskId));
    } catch (e) {
      setProblem((e as Error).message);
    }
  }

  return (
    <details className="card panel" onToggle={(e) => void open(e.currentTarget.open)}>
      <summary className="panel-title cursor-pointer">{t("history.title")}</summary>
      {problem && <p className="error mt-2">{problem}</p>}
      {!events && !problem && <p className="muted mt-2">{t("history.fetching")}</p>}
      {events && (
        <ul className="mt-2">
          {events.map((e) => (
            <li key={e.seq} className="history-row">
              <span><Person npub={e.actor} /> · {e.action.replace(/_/g, " ")}{e.grade ? ` · ${e.grade}` : ""}{e.deemed ? ` · ${t("history.deemed")}` : ""}</span>
              <time className="muted num" dateTime={new Date(e.at * 1000).toISOString()}>{new Date(e.at * 1000).toLocaleString(locale)}</time>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

function CoverFacts({ task }: { task: Task }) {
  const t = useT();
  const c = task.cover;
  if (!c) return null;
  return (
    <section className="card panel grid gap-2">
      <h2 className="panel-title">{t("cover.title")}</h2>
      <dl className="facts">
        <dt>{t("cover.deliverables")}</dt>
        <dd><ul className="deliverables">{c.deliverables.map((d) => <li key={d}>{d}</li>)}</ul></dd>
        {c.spec_url && <><dt>{t("cover.specUrl")}</dt><dd><a href={c.spec_url} target="_blank" rel="noopener noreferrer nofollow" className="ent">{c.spec_url}</a></dd></>}
        {c.spec_hash && <><dt>{t("cover.specHash")}</dt><dd><code className="hash">{c.spec_hash}</code></dd></>}
        <dt>{t("cover.deemedGrade")}</dt>
        <dd>{c.deemed_grade ? t("cover.deemedAfter", { grade: c.deemed_grade, days: c.deemed_acceptance_days }) : t("cover.noDeemed")}</dd>
        <dt>{t("cover.ip")}</dt><dd>{t(`cover.ip.${c.ip_option}`)}{c.ip_custom_text && ` · ${c.ip_custom_text}`}</dd>
        {c.confidential && <><dt>{t("cover.confidentialShort")}</dt><dd>✓</dd></>}
        {c.client_is_consumer && <><dt>{t("cover.consumerShort")}</dt><dd>✓</dd></>}
        <dt>{t("cover.thirdPartyShort")}</dt><dd>{c.third_party_allowed ? t("cover.allowed") : t("cover.notAllowed")}</dd>
        {c.governing_law && <><dt>{t("cover.law")}</dt><dd>{c.governing_law}</dd></>}
        {c.venue && <><dt>{t("cover.venue")}</dt><dd>{c.venue}</dd></>}
        <dt>{t("nav.terms")}</dt>
        <dd><Link to={`/terms?version=${encodeURIComponent(c.terms_version)}`} className="ent">{c.terms_version}</Link> · <code className="hash">{c.terms_hash.slice(0, 12)}…</code></dd>
      </dl>
    </section>
  );
}

export default function Commission() {
  const { taskId = "" } = useParams();
  const t = useT();
  const [task, setTask] = useState<Task | null>(null);
  const [payout, setPayout] = useState<Invoice | null>(null);
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(true);
  const now = Math.floor(Date.now() / 1000);

  const load = useCallback(async () => {
    setLoading(true);
    setProblem("");
    try {
      const r = await getTask(taskId);
      setTask(r.task);
      setPayout(r.payout ?? null);
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => { void load(); }, [load]);

  if (!task) {
    return (
      <div className="page">
        <div className="card panel">{problem ? <p className="error">{problem}</p> : <Waiting heading={t("waiting.fetchingOne")} />}</div>
      </div>
    );
  }

  const graded = task.assessment;
  const late = !isFinished(task) && !task.accomplished_at ? lateText(task.days_late) : null;

  return (
    <div className="page grid gap-3">
      <div className="toolbar">
        <Link to="/commissions" className="btn btn-quiet"><ArrowLeft size={18} aria-hidden />{t("nav.commissions")}</Link>
        <div className="toolbar-actions">
          {mayEdit(task) && <Link to={`${commissionHref(task.task_id)}/edit`} className="btn btn-quiet"><Pencil size={18} aria-hidden />{t("commission.edit")}</Link>}
          <button type="button" className="icon-btn" onClick={() => void load()} disabled={loading} aria-label={t("actions.lookAgain")} title={t("actions.lookAgain")}>
            <RefreshCw size={18} aria-hidden />
          </button>
        </div>
      </div>

      <section className="card panel grid gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="page-title">{task.title}</h1>
          <StandingBadge standing={task.standing} />
        </div>
        {late && <p className="late-chip"><AlarmClock size={16} aria-hidden />{say(t, late)}</p>}
        {task.description && (
          <Suspense fallback={<p className="whitespace-pre-wrap">{task.description}</p>}>
            <MarkdownText text={task.description} />
          </Suspense>
        )}
        <dl className="facts">
          <dt>{t("commission.neededBy")}</dt><dd>{new Date(task.needed_by * 1000).toLocaleDateString()} · {say(t, dueText(task.needed_by, now))}</dd>
          <dt>{t("commission.ifLate")}</dt><dd>{say(t, lateRuleText(task.late))}</dd>
          <dt>{t("commission.client")}</dt><dd><Person npub={task.purchaser} /></dd>
          {task.performer
            ? <><dt>{t("commission.professional")}</dt><dd><Person npub={task.performer} /></dd></>
            : <><dt>{t("commission.whoMay")}</dt><dd><People npubs={task.audience} /></dd></>}
          {graded && <><dt>{t("commission.grade")}</dt><dd>{graded.grade}{graded.deemed && ` · ${t("history.deemed")}`}{!task.final && ` · ${t("commission.waitingAccepted")}`}</dd></>}
        </dl>
        {graded?.reasons && <blockquote className="quote">{graded.reasons}</blockquote>}
        {graded?.appeal?.reasons && <blockquote className="quote">{t("commission.appealQuote", { reasons: graded.appeal.reasons })}</blockquote>}
        {task.rejection?.reasons && <blockquote className="quote">{task.rejection.reasons}</blockquote>}
        <Actions task={task} onChanged={setTask} />
      </section>

      {task.cover && <OfferPanel task={task} onChanged={setTask} />}
      <MoneyPanel task={task} payout={payout} now={now} onChanged={(next) => { setTask(next); void load(); }} />

      <section className="card panel">
        <h2 className="panel-title mb-1">{t("commission.grades")}</h2>
        <table className="ledger">
          <tbody>
            {byReward(task.rubric.grades).map((g) => (
              <tr key={g.name} className={graded?.grade === g.name ? "grade-given" : undefined}>
                <td className="font-medium">{g.name}</td>
                <td className="muted">{g.criteria}</td>
                <td className="text-right"><Sats sats={g.sats} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <CoverFacts task={task} />
      {task.your_roles.some((r) => r !== "audience") && <History taskId={task.task_id} />}
    </div>
  );
}
