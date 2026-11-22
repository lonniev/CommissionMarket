/**
 * Commissions as things that happened, or will, on days: posted, claimed, each
 * payment ahead, delivered, graded and paid, and what falls due. Pure, so a
 * month and a day's list are both made from the same events.
 */

import { eventsByDay as byDayOf } from "@tollbooth-dpyc/web";
import { isFinished } from "./moves.ts";
import type { Task } from "./tasks.ts";

export type EventKind =
  | "posted" | "claimed" | "deposit" | "milestonePaid" | "delivered" | "graded" | "deemed" | "paid"
  | "milestoneDue" | "due" | "late" | "missed";

export interface CommissionEvent {
  at: number;
  kind: EventKind;
  task: Task;
  /** Whose doing it was, or whose turn it is. */
  who: string;
  /** The milestone's name, for a milestone's events. */
  milestone?: string;
}

/** The order a day's events read in when two fall on one moment. */
export const EVENT_KINDS: EventKind[] = [
  "posted", "claimed", "deposit", "milestonePaid", "delivered", "graded", "deemed", "paid", "milestoneDue", "due", "late", "missed",
];

/** The picture each kind of event shows on a month. */
export const EVENT_MARK: Record<EventKind, string> = {
  posted: "📌",
  claimed: "🤝",
  deposit: "⚡",
  milestonePaid: "⚡",
  delivered: "📦",
  graded: "⭐",
  deemed: "⭐",
  paid: "💰",
  milestoneDue: "🪜",
  due: "📅",
  late: "⏰",
  missed: "✖️",
};

/** Everything that happened, or falls due, on these commissions. */
export function eventsOf(tasks: Task[]): CommissionEvent[] {
  const out: CommissionEvent[] = [];
  for (const task of tasks) {
    const pro = task.performer ?? task.purchaser;
    const add = (at: number | undefined | null, kind: EventKind, who: string, milestone?: string) => {
      if (at) out.push({ at, kind, task, who, ...(milestone ? { milestone } : {}) });
    };
    const closed = task.standing === "withdrawn" || task.standing === "rejected" || task.standing === "expired";
    add(task.created_at, "posted", task.purchaser);
    add(task.claimed_at, "claimed", pro);
    add(task.deposit?.paid_at, "deposit", task.purchaser);
    for (const m of task.milestones) {
      if (m.paid_at) add(m.paid_at, "milestonePaid", task.purchaser, m.name);
      else if (!closed && !isFinished(task)) add(m.due_at, "milestoneDue", task.purchaser, m.name);
    }
    add(task.accomplished_at, "delivered", pro);
    add(task.assessment?.at, task.assessment?.deemed ? "deemed" : "graded", task.assessment?.assessor ?? task.purchaser);
    add(task.paid_at, "paid", task.purchaser);
    if (task.standing === "missed") add(task.needed_by, "missed", pro);
    else if (!isFinished(task) && !task.accomplished_at && task.days_late > 0) add(task.needed_by, "late", pro);
    else if (!closed) add(task.needed_by, "due", pro);
  }
  return out.sort((a, b) => a.at - b.at || EVENT_KINDS.indexOf(a.kind) - EVENT_KINDS.indexOf(b.kind) || a.task.title.localeCompare(b.task.title));
}

/** The events on each day, keyed `YYYY-MM-DD`. */
export function eventsByDay(events: CommissionEvent[]): Map<string, CommissionEvent[]> {
  return byDayOf(events, (e) => e.at);
}
