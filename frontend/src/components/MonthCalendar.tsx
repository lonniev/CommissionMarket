/** A month of commission events: each day shows a mark for each kind of event, and a tap lists them. */

import { useState, type ReactNode } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguageLocale } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import type { MessageKey } from "../i18n/en";
import { dayKey, monthWeeks, shiftMonth } from "../lib/browse";
import { EVENT_KINDS, EVENT_MARK, eventsByDay, type CommissionEvent, type EventKind } from "../lib/calendar";

/** A week of days starting on a Sunday, for the letters over the month's columns. */
const A_SUNDAY = new Date(2023, 0, 1);
const SHOWN_PER_DAY = 3;

export const kindKey = (kind: EventKind) => `cal.kind.${kind}` as const satisfies MessageKey;

/** The marks on a day, each once, in the order they read. */
const marksOf = (events: CommissionEvent[]): string[] => [...new Set(events.map((e) => EVENT_MARK[e.kind]))];

export default function MonthCalendar({ events, now, renderDay }: {
  events: CommissionEvent[]; now: number; renderDay: (events: CommissionEvent[]) => ReactNode;
}) {
  const t = useT();
  const locale = useLanguageLocale();
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(A_SUNDAY.getFullYear(), A_SUNDAY.getMonth(), A_SUNDAY.getDate() + i).toLocaleDateString(locale, { weekday: "narrow" }));
  const today = dayKey(now);
  const start = new Date(now * 1000);
  const [shown, setShown] = useState({ year: start.getFullYear(), month: start.getMonth() });
  const [picked, setPicked] = useState(today);
  const days = eventsByDay(events);
  const title = new Date(shown.year, shown.month, 1).toLocaleDateString(locale, { month: "long", year: "numeric" });
  const pickedEvents = days.get(picked) ?? [];
  const pickedTitle = new Date(`${picked}T12:00:00`).toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" });

  return (
    <section className="grid gap-3">
      <div className="card panel grid gap-2">
        <div className="month-head">
          <button type="button" className="icon-btn" onClick={() => setShown((s) => shiftMonth(s.year, s.month, -1))} aria-label={t("cal.before")} title={t("cal.before")}>
            <ChevronLeft size={20} aria-hidden />
          </button>
          <h2 className="section-title">{title}</h2>
          <button type="button" className="icon-btn" onClick={() => setShown((s) => shiftMonth(s.year, s.month, 1))} aria-label={t("cal.after")} title={t("cal.after")}>
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
        <div className="month" role="grid" aria-label={title}>
          {weekdays.map((d, i) => <span key={i} className="month-weekday" aria-hidden>{d}</span>)}
          {monthWeeks(shown.year, shown.month).flat().map((d) => {
            const here = days.get(d.key) ?? [];
            const marks = marksOf(here);
            const kinds = [...new Set(here.map((e) => e.kind))];
            const classes = ["month-day", !d.inMonth && "month-day-out", d.key === today && "month-day-today", d.key === picked && "month-day-on",
              kinds.includes("late") && "month-day-late"].filter(Boolean).join(" ");
            return (
              <button key={d.key} type="button" className={classes} aria-pressed={d.key === picked} onClick={() => setPicked(d.key)}
                aria-label={[d.key, ...kinds.map((k) => t(kindKey(k)))].join(", ")}>
                <span className="month-num num">{d.day}</span>
                <span className="month-marks" aria-hidden>
                  {marks.slice(0, SHOWN_PER_DAY).map((m) => <span key={m}>{m}</span>)}
                  {marks.length > SHOWN_PER_DAY && <span className="month-more num">+{marks.length - SHOWN_PER_DAY}</span>}
                </span>
              </button>
            );
          })}
        </div>
        <details className="month-key">
          <summary className="muted">{t("cal.key")}</summary>
          <ul className="month-key-list">
            {EVENT_KINDS.map((k) => <li key={k}><span aria-hidden>{EVENT_MARK[k]}</span> {t(kindKey(k))}</li>)}
          </ul>
        </details>
        <p className="text-right"><Link to="/profile#calendar" className="ent inline-flex items-center gap-1"><CalendarPlus size={16} aria-hidden />{t("feed.add")}</Link></p>
      </div>
      <h2 className="section-title">{pickedTitle} <span className="muted num">({pickedEvents.length})</span></h2>
      {pickedEvents.length > 0 ? renderDay(pickedEvents) : <p className="card panel muted">{t("cal.nothing")}</p>}
    </section>
  );
}
