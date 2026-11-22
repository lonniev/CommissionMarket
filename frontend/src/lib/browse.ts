/**
 * Finding commissions in a long list: search them and order them. Pure functions over the list Task Booth gave.
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
  project_id?: string;
}

export type Order = "due" | "person" | "state" | "project";

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
 * By person, sections go by name; by state, by the standing's name; by project, by the Project's
 * name (commissions filed under none share a section keyed ""); by due, one section.
 */
export function grouped<T extends Browsable>(tasks: T[], order: Order, label: (key: string) => string): Group<T>[] {
  const byDue = [...tasks].sort((a, b) => a.needed_by - b.needed_by || a.title.localeCompare(b.title));
  if (order === "due") return byDue.length ? [{ key: "", rows: byDue }] : [];
  const keyOf = order === "person" ? (t: T) => personOf(t) : order === "project" ? (t: T) => t.project_id ?? "" : (t: T) => t.standing;
  const found = new Map<string, T[]>();
  for (const t of byDue) found.set(keyOf(t), [...(found.get(keyOf(t)) ?? []), t]);
  return [...found.entries()]
    .map(([key, rows]) => ({ key, rows }))
    .sort((a, b) => label(a.key).localeCompare(label(b.key)));
}
