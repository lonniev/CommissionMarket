/** Times as people say them. Task Booth speaks Unix seconds. */

import type { Said } from "../i18n/index.ts";
import { stepSaid } from "./late.ts";
import type { LateRule } from "./tasks.ts";

const DAY = 86_400;

/** The local calendar day a time falls on, as days since the epoch in local time. */
function dayNumber(seconds: number): number {
  const d = new Date(seconds * 1000);
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / (DAY * 1000));
}

/** "today", "tomorrow", "in 3 days", "yesterday", "4 days ago", as a message for the page to say. */
export function dueText(neededBy: number, now: number): Said {
  const days = dayNumber(neededBy) - dayNumber(now);
  if (days === 0) return { key: "due.today" };
  if (days === 1) return { key: "due.tomorrow" };
  if (days === -1) return { key: "due.yesterday" };
  return days > 0 ? { key: "due.inDays", vars: { days } } : { key: "due.daysAgo", vars: { days: -days } };
}

/** The last second of a `YYYY-MM-DD` day in this device's time zone, or null. */
export function endOfDay(date: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59);
  if (d.getMonth() !== Number(m[2]) - 1) return null;
  return Math.floor(d.getTime() / 1000);
}

/** `YYYY-MM-DD` for the local day `days` from `now`, for a date field. */
export function dayFrom(now: number, days: number): string {
  const d = new Date(now * 1000);
  d.setDate(d.getDate() + days);
  const two = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

/** "1 day late", "3 days late"; nothing when on time. */
export function lateText(daysLate: number): Said | null {
  return daysLate > 0 ? { key: "late.days", vars: { count: daysLate } } : null;
}

/** What happens if the work is late, as the commission's page says it: one phrase, or one per step. */
export function lateRuleText(rule: LateRule | undefined): Said[] {
  if (rule?.kind === "discount") return [{ key: "late.rule.discount", vars: { pct: rule.pct_per_day } }];
  if (rule?.kind === "steps") return rule.steps.map(stepSaid);
  if (rule?.kind === "cancel") return [{ key: "late.rule.cancel" }];
  return [{ key: "late.rule.full" }];
}

/** The local `YYYY-MM-DD` a time falls on, for a date field. */
export function dayKeyOf(seconds: number): string {
  return dayFrom(seconds, 0);
}
