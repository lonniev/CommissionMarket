/**
 * What a commission asks of its arbiter, for the Arbitration tab. Pure: from the task as
 * Task Booth shows it to the arbiter. The moves themselves live on the commission's page.
 */

import type { MessageKey } from "../i18n/en.ts";
import { isFinished } from "./moves.ts";
import type { Task } from "./tasks.ts";

/** What the arbiter is asked to do now; null when nothing is. */
export type ArbiterDue = "sign" | "appeal" | "cause" | "escrow" | null;

export type ArbiterShelf = "asked" | "decide" | "watching" | "closed";

export const SHELVES: ArbiterShelf[] = ["asked", "decide", "watching", "closed"];

type Seen = Pick<Task, "standing" | "final" | "your_roles" | "agreement" | "failure" | "escrow">;

export const isArbiterOf = (task: Pick<Task, "your_roles">) => task.your_roles.includes("arbiter");

export function arbiterDue(task: Seen): ArbiterDue {
  if (!isArbiterOf(task)) return null;
  const open = task.standing === "posted" || task.standing === "expired" || task.standing === "claimed";
  if (open && !task.agreement.arbiter_signed) return "sign";
  if (task.standing === "appealed") return "appeal";
  if (task.failure?.cause && !task.failure.cause.ruling) return "cause";
  const proposal = task.escrow?.state === "proposed" ? task.escrow.proposal : undefined;
  if (proposal && !proposal.signed_by.includes("arbiter")) return "escrow";
  return null;
}

/** The shelf a commission sits on in the Arbitration tab. */
export function shelfOf(task: Seen): ArbiterShelf {
  const due = arbiterDue(task);
  if (due === "sign") return "asked";
  if (due) return "decide";
  // An escrow still to settle keeps a finished job in view: the arbiter may yet sign its split.
  const unsettled = task.escrow && task.escrow.state !== "settled" && task.escrow.state !== "invoiced";
  return isFinished(task) && !unsettled ? "closed" : "watching";
}

export const dueKey = (due: Exclude<ArbiterDue, null>) => `arbiter.due.${due}` as const satisfies MessageKey;
