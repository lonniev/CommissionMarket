/**
 * Late steps and the failure point, as the form holds them and as Task Booth
 * takes them. Task Booth counts in hours; the form lets a person say hours or
 * days. Pure: what to send, what to fix, and how to say it.
 */

import type { Said } from "../i18n/index.ts";

export type Unit = "hours" | "days";

/** One step as the form holds it: more than `after` units late takes `pct` off. */
export interface StepRow {
  after: string;
  unit: Unit;
  pct: string;
}

export interface LateStep {
  after_hours: number;
  pct_off: number;
}

export const MAX_LATE_STEPS = 6;
export const MAX_LATE_HOURS = 365 * 24;

const whole = (text: string) => (/^\d+$/.test(text.trim()) ? Number(text.trim()) : NaN);

export const hoursOf = (count: number, unit: Unit) => (unit === "days" ? count * 24 : count);

/** Hours as the form shows them: in days when they are whole days. */
export function rowOf(hours: number): { after: string; unit: Unit } {
  return hours % 24 === 0 ? { after: String(hours / 24), unit: "days" } : { after: String(hours), unit: "hours" };
}

/** A new form's steps: a little off once late, more after three days. */
export const starterSteps = (): StepRow[] => [{ after: "0", unit: "days", pct: "10" }, { after: "3", unit: "days", pct: "25" }];

export const stepRowsOf = (steps: LateStep[]): StepRow[] => steps.map((s) => ({ ...rowOf(s.after_hours), pct: String(s.pct_off) }));

/** The form's steps as Task Booth takes them, or what to fix. Both hours and percent rise. */
export function stepsFrom(rows: StepRow[]): { steps: LateStep[] } | { problem: Said } {
  if (!rows.length) return { problem: { key: "late.needSteps" } };
  if (rows.length > MAX_LATE_STEPS) return { problem: { key: "late.stepsTooMany", vars: { max: MAX_LATE_STEPS } } };
  const steps: LateStep[] = [];
  for (const row of rows) {
    const after = whole(row.after);
    const pct = whole(row.pct);
    const hours = hoursOf(after, row.unit);
    if (Number.isNaN(after) || hours >= MAX_LATE_HOURS || Number.isNaN(pct) || pct < 1 || pct > 100) {
      return { problem: { key: "late.needSteps" } };
    }
    const last = steps[steps.length - 1];
    if (last && (hours <= last.after_hours || pct <= last.pct_off)) return { problem: { key: "late.stepsRise" } };
    steps.push({ after_hours: hours, pct_off: pct });
  }
  return { steps };
}

/** The failure point in hours, or what to fix. It comes after the last step, when there are steps. */
export function failFrom(after: string, unit: Unit, steps: LateStep[] = []): { hours: number } | { problem: Said } {
  const hours = hoursOf(whole(after), unit);
  if (Number.isNaN(hours) || hours < 1 || hours > MAX_LATE_HOURS) return { problem: { key: "late.needFail" } };
  const last = steps[steps.length - 1];
  if (last && hours <= last.after_hours) return { problem: { key: "late.failAfterSteps" } };
  return { hours };
}

/** The failure point in whole days, any part of a day counting as one, as the refund floor counts it. */
export const failDays = (hours: number) => Math.ceil(hours / 24);

/** "10% off once late", "25% off after 3 days late". */
export function stepSaid(step: LateStep): Said {
  if (step.after_hours === 0) return { key: "late.rule.stepAny", vars: { pct: step.pct_off } };
  const { after, unit } = rowOf(step.after_hours);
  return { key: unit === "days" ? "late.rule.stepDays" : "late.rule.stepHours", vars: { pct: step.pct_off, count: Number(after) } };
}

/** "Failure to deliver after 7 days late." */
export function failSaid(hours: number): Said {
  const { after, unit } = rowOf(hours);
  return { key: unit === "days" ? "late.rule.failDays" : "late.rule.failHours", vars: { count: Number(after) } };
}

/** "fails after 7 days", for a block's summary line. */
export function failSummary(hours: number): Said {
  const { after, unit } = rowOf(hours);
  return { key: unit === "days" ? "block.sum.failDays" : "block.sum.failHours", vars: { count: Number(after) } };
}

/** A window as words: "7 days", "2 hours". */
export function spanSaid(hours: number): Said {
  const { after, unit } = rowOf(hours);
  return { key: unit === "days" ? "window.days" : "window.hours", vars: { count: Number(after) } };
}
