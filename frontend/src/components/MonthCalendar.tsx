/** A month of commission events: each day shows a mark for each kind of event, and a tap lists them. */

import type { ReactNode } from "react";
import { CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { MonthCalendar as Month } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import type { MessageKey } from "../i18n/en";
import { EVENT_KINDS, EVENT_MARK, type CommissionEvent, type EventKind } from "../lib/calendar";

export const kindKey = (kind: EventKind) => `cal.kind.${kind}` as const satisfies MessageKey;

/** The kinds of event on a day, each once, in the order they read. */
const kindsOf = (events: CommissionEvent[]): EventKind[] => [...new Set(events.map((e) => e.kind))];

export default function MonthCalendar({ events, now, renderDay }: {
  events: CommissionEvent[]; now: number; renderDay: (events: CommissionEvent[]) => ReactNode;
}) {
  const t = useT();
  return (
    <Month
      events={events}
      at={(e) => e.at}
      now={now}
      marks={(day) => [...new Set(day.map((e) => EVENT_MARK[e.kind]))]}
      dayLabel={(day) => kindsOf(day).map((k) => t(kindKey(k)))}
      dayClass={(day) => day.some((e) => e.kind === "late") && "month-day-late"}
      legend={EVENT_KINDS.map((k) => ({ mark: EVENT_MARK[k], label: t(kindKey(k)) }))}
      footer={<p className="text-right"><Link to="/profile#calendar" className="ent inline-flex items-center gap-1"><CalendarPlus size={16} aria-hidden />{t("feed.add")}</Link></p>}
      renderDay={renderDay}
      words={{ before: t("cal.before"), after: t("cal.after"), key: t("cal.key"), nothing: t("cal.nothing") }}
      classNames={{ title: "section-title", marks: "month-marks", count: "muted num" }}
      iconSize={20}
    />
  );
}
