/**
 * Drafting a commission from a short idea (Task Booth's `draft_task`).
 *
 * The draft keeps what the person said apart from what it suggests, because the terms
 * become an offer two people sign. `said` fills the form; each `proposed` value is shown
 * as a proposal the person applies by choice; `questions` and `assumptions` are points
 * the person settles before posting.
 */

import { callTool, checkPrice } from "@tollbooth-dpyc/web";
import type { MilestoneRow } from "./cover.ts";
import type { GradeRow } from "./rubric.ts";
import type { IpOption } from "./tasks.ts";
import { dayFrom } from "./when.ts";

/** Task Booth's frozen id for `draft_task`, for its fare. */
export const DRAFT_TASK_ID = "f076ae67-8f1d-4ff0-8a15-96cf8564a91f";
export const IDEA_MAX = 2000;

export interface ProposedGrade {
  name: string;
  amount: number;
  sats: number;
  criteria: string;
}

export interface Draft {
  said: { title: string; brief: string; deliverables?: string[]; needed_by: string | null };
  proposed: {
    grades: ProposedGrade[];
    deposit_pct?: number | null;
    milestones?: { name: string; pct: number; after_days: number }[];
    deemed_days?: number | null;
    ip_option?: Exclude<IpOption, "custom"> | null;
  };
  questions: string[];
  assumptions: string[];
  currency: string;
}

interface Answer extends Draft {
  ok?: boolean;
  error?: string;
}

/** A draft of `idea`, with proposed amounts in `currency` and in sats. */
export async function draftCommission(idea: string, currency: string): Promise<Draft> {
  const r = await callTool<Answer>("draft_task", { idea, kind: "commission", currency }, { timeoutMs: 90_000 });
  if (r.ok !== true) throw new Error(r.error ?? "The draft did not come back.");
  return r;
}

/** What a draft costs, in api_sats; null when the fare cannot be read. */
export const draftFare = () => checkPrice(DRAFT_TASK_ID).catch(() => null);

/** The proposed grades as the form's rubric rows. */
export const gradeRowsOf = (grades: ProposedGrade[]): GradeRow[] =>
  grades.map((g) => ({ name: g.name, sats: String(g.sats), criteria: g.criteria }));

/** The proposed milestones as the form's rows, each dated `after_days` from `now`. */
export const milestoneRowsOf = (list: NonNullable<Draft["proposed"]["milestones"]>, now: number): MilestoneRow[] =>
  list.map((m) => ({ name: m.name, day: dayFrom(now, m.after_days), pct: String(m.pct) }));

/** The points a person must settle before posting: every question, then every assumption. */
export const openPointsOf = (d: Draft): { kind: "question" | "assumption"; text: string }[] => [
  ...d.questions.map((text) => ({ kind: "question" as const, text })),
  ...d.assumptions.map((text) => ({ kind: "assumption" as const, text })),
];

/** Which proposals a draft carries, in the order the form lists its blocks. */
export function proposalsOf(d: Draft): ("grades" | "deposit" | "milestones" | "deemed" | "ip")[] {
  const p = d.proposed;
  return [
    ...(p.grades.length ? ["grades" as const] : []),
    ...(typeof p.deposit_pct === "number" ? ["deposit" as const] : []),
    ...(p.milestones?.length ? ["milestones" as const] : []),
    ...(typeof p.deemed_days === "number" ? ["deemed" as const] : []),
    ...(p.ip_option ? ["ip" as const] : []),
  ];
}
