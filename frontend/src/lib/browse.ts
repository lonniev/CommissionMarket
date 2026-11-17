/**
 * Finding commissions in a long list: search them, order them, and lay them on
 * a month. Pure functions over the list Task Booth gave.
 */

import type { Standing } from "./moves.ts";

export interface Browsable {
  task_id: string;
  title: string;
  description: string;
  purchaser: string;
  performer: string | null;
  standing: Standing;
  needed_by: number;
}

export type Order = "due" | "person" | "state";

/** Whose commission it is to you: the professional on it, or the client while nobody has claimed it. */
export function personOf(task: Pick<Browsable, "performer" | "purchaser">): string {
  return task.performer ?? task.purchaser;
}

/**
 * Every word typed is found somewhere in the commission: its title, brief, people or standing.
 * `name` says who an npub is on screen; `standing` says a standing in the language on screen.
 */
export function matches(task: Browsable, query: string, name: (npub: string) => string, standing: (s: Standing) => string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = [task.title, task.description, task.purchaser, name(task.purchaser), task.performer ?? "", task.performer ? name(task.performer) : "", standing(task.standing)]
    .join(" ").toLowerCase();
  return words.every((w) => hay.includes(w));
}

export interface Group<T> {
  key: string;
  rows: T[];
}

/**
 * The commissions in sections, soonest needed first inside each.
 * By person, sections go by name; by state, by the standing's name; by due, one section.
 */
export function grouped<T extends Browsable>(tasks: T[], order: Order, label: (key: string) => string): Group<T>[] {
  const byDue = [...tasks].sort((a, b) => a.needed_by - b.needed_by || a.title.localeCompare(b.title));
  if (order === "due") return byDue.length ? [{ key: "", rows: byDue }] : [];
  const keyOf = order === "person" ? (t: T) => personOf(t) : (t: T) => t.standing;
  const found = new Map<string, T[]>();
  for (const t of byDue) found.set(keyOf(t), [...(found.get(keyOf(t)) ?? []), t]);
  return [...found.entries()]
    .map(([key, rows]) => ({ key, rows }))
    .sort((a, b) => label(a.key).localeCompare(label(b.key)));
}

const two = (n: number) => String(n).padStart(2, "0");

/** The local `YYYY-MM-DD` a time falls on. */
export function dayKey(seconds: number): string {
  const d = new Date(seconds * 1000);
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

export interface MonthDay {
  /** `YYYY-MM-DD`. */
  key: string;
  day: number;
  /** Belongs to the month shown, as against the days that pad its first and last weeks. */
  inMonth: boolean;
}

/** The weeks of a month, Sunday first, padded to whole weeks. `month` is 0 to 11. */
export function monthWeeks(year: number, month: number): MonthDay[][] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const weeks: MonthDay[][] = [];
  for (let d = new Date(start); weeks.length < 6; ) {
    const week: MonthDay[] = [];
    for (let i = 0; i < 7; i++) {
      week.push({ key: `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`, day: d.getDate(), inMonth: d.getMonth() === month });
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    }
    if (weeks.length >= 4 && !week.some((x) => x.inMonth)) break;
    weeks.push(week);
  }
  return weeks;
}

/** The month before or after: `{ year, month }` with month 0 to 11. */
export function shiftMonth(year: number, month: number, by: number): { year: number; month: number } {
  const d = new Date(year, month + by, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}
