/** A commission's grades, and the sats each one earns. */

import type { MessageKey } from "../i18n/en.ts";
import type { Said } from "../i18n/index.ts";
import { stepsFrom, type LateStep, type StepRow } from "./late.ts";

export interface Grade {
  name: string;
  sats: number;
  criteria: string;
}

export interface Rubric {
  grades: Grade[];
  appeal: string;
}

/** A grade as the form holds it: sats is whatever was typed. */
export interface GradeRow {
  name: string;
  sats: string;
  criteria: string;
}

export const MAX_GRADES = 12;
export const MAX_GRADE_SATS = 100_000_000;

/** The grades a new commission starts with, named in the language on screen. */
export function starterRows(name: (key: MessageKey) => string): GradeRow[] {
  return [
    { name: name("rubric.starter.great"), sats: "1000", criteria: "" },
    { name: name("rubric.starter.good"), sats: "500", criteria: "" },
    { name: name("rubric.starter.none"), sats: "0", criteria: "" },
  ];
}

/** The most a commission can earn. */
export function topSats(rubric: Pick<Rubric, "grades">): number {
  return rubric.grades.reduce((most, g) => Math.max(most, g.sats), 0);
}

/** The grades highest first, as people read a reward list. */
export function byReward(grades: Grade[]): Grade[] {
  return [...grades].sort((a, b) => b.sats - a.sats);
}

/** The form's rows as a rubric, or the message that says what to fix. */
export function rubricFrom(rows: GradeRow[]): { rubric: Rubric } | { problem: Said } {
  const filled = rows.filter((r) => r.name.trim() || r.sats.trim());
  if (!filled.length) return { problem: { key: "rubric.needOne" } };
  if (filled.length > MAX_GRADES) return { problem: { key: "rubric.tooMany", vars: { max: MAX_GRADES } } };
  const grades: Grade[] = [];
  const seen = new Set<string>();
  for (const row of filled) {
    const name = row.name.trim();
    if (!name) return { problem: { key: "rubric.needName" } };
    if (name.length > 60) return { problem: { key: "rubric.nameLong", vars: { name: name.slice(0, 20) } } };
    const key = name.toLowerCase();
    if (seen.has(key)) return { problem: { key: "rubric.twoNamed", vars: { name } } };
    seen.add(key);
    if (!/^\d+$/.test(row.sats.trim())) return { problem: { key: "rubric.wholeNumber", vars: { name } } };
    const sats = Number(row.sats.trim());
    if (sats > MAX_GRADE_SATS) return { problem: { key: "rubric.tooMuch", vars: { name, max: MAX_GRADE_SATS } } };
    grades.push({ name, sats, criteria: row.criteria.trim().slice(0, 500) });
  }
  return { rubric: { grades, appeal: "" } };
}

/** The late choice as the form holds it: a kind, and the percent as typed. */
export type LateKind = "full" | "discount" | "steps" | "cancel";

export type LateChoice = { kind: "full" } | { kind: "discount"; pct_per_day: number } | { kind: "steps"; steps: LateStep[] } | { kind: "cancel" };

/** The form's late choice as Task Booth takes it, or the message that says what to fix. */
export function lateFrom(kind: LateKind, pct: string, steps: StepRow[] = []): { late: LateChoice } | { problem: Said } {
  if (kind === "steps") {
    const made = stepsFrom(steps);
    return "problem" in made ? made : { late: { kind: "steps", steps: made.steps } };
  }
  if (kind !== "discount") return { late: { kind } };
  const n = Number(pct.trim());
  if (!/^\d+$/.test(pct.trim()) || n < 1 || n > 100) return { problem: { key: "late.needPct" } };
  return { late: { kind: "discount", pct_per_day: n } };
}
