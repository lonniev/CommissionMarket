/**
 * The Arbitration tab: every commission you are part of that names an arbiter, by your part
 * in it. An arbiter sees what they arbitrate and what is asked of them; a client sees who
 * arbitrates their commissions; a professional, who they would appeal to. Pure: from the
 * task as Task Booth shows it to you. The moves themselves live on the commission's page.
 */

import type { MessageKey } from "../i18n/en.ts";
import { isFinished } from "./moves.ts";
import type { Task } from "./tasks.ts";

/** What the arbiter is asked to do now; null when nothing is. */
export type ArbiterDue = "sign" | "appeal" | "cause" | "escrow" | null;

export type Shelf = "asked" | "decide" | "arbitrating" | "client" | "working" | "open" | "closed";

export const SHELVES: Shelf[] = ["asked", "decide", "arbitrating", "client", "working", "open", "closed"];

type Seen = Pick<Task, "standing" | "final" | "your_roles" | "agreement" | "failure" | "escrow" | "cover">;

export const isArbiterOf = (task: Pick<Task, "your_roles">) => task.your_roles.includes("arbiter");

export const arbiterOf = (task: Pick<Task, "cover">) => task.cover?.arbiter_npub ?? "";

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

/** Where a commission sits in the Arbitration tab, or null when it names no arbiter. */
export function shelfOf(task: Seen): Shelf | null {
  if (!arbiterOf(task)) return null;
  const due = arbiterDue(task);
  if (due === "sign") return "asked";
  if (due) return "decide";
  // An escrow still to settle keeps a finished job in view: its split may yet be signed.
  const unsettled = task.escrow && task.escrow.state !== "settled" && task.escrow.state !== "invoiced";
  if (isFinished(task) && !unsettled) return "closed";
  const roles = task.your_roles;
  if (roles.includes("arbiter")) return "arbitrating";
  if (roles.includes("purchaser")) return "client";
  if (roles.includes("performer")) return "working";
  return "open";
}

export const dueKey = (due: Exclude<ArbiterDue, null>) => `arbiter.due.${due}` as const satisfies MessageKey;
