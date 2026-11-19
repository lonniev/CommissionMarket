/**
 * The Arbitration tab: every commission you are part of that names an arbiter or an
 * inspector, by your part in it. An arbiter sees what they arbitrate and what is asked of
 * them, and an inspector what they inspect; a client sees who arbitrates and inspects their
 * commissions; a professional, who they would appeal to and who will judge the work. Pure:
 * from the task as Task Booth shows it to you. The moves themselves live on the commission's page.
 */

import type { MessageKey } from "../i18n/en.ts";
import { isFinished } from "./moves.ts";
import type { Task } from "./tasks.ts";

/** What the arbiter is asked to do now; null when nothing is. */
export type ArbiterDue = "sign" | "appeal" | "cause" | "escrow" | null;

/** What the inspector is asked to do now; null when nothing is. */
export type InspectorDue = "sign" | "opinion" | null;

export type Shelf =
  | "asked" | "decide" | "arbitrating" | "inspectAsked" | "inspectDue" | "inspecting"
  | "client" | "working" | "open" | "closed";

export const SHELVES: Shelf[] = [
  "asked", "decide", "arbitrating", "inspectAsked", "inspectDue", "inspecting", "client", "working", "open", "closed",
];

type Seen = Pick<Task, "standing" | "final" | "your_roles" | "agreement" | "failure" | "escrow" | "cover">
  & Partial<Pick<Task, "inspection">>;

const OPEN = new Set(["posted", "expired", "claimed"]);
/** Delivered work, which the inspector may give an opinion of (Task Booth's INSPECTABLE). */
const DELIVERED = new Set(["done", "assessed", "appealed", "owed", "paid", "rejected"]);

export const isArbiterOf = (task: Pick<Task, "your_roles">) => task.your_roles.includes("arbiter");

export const arbiterOf = (task: Pick<Task, "cover">) => task.cover?.arbiter_npub ?? "";

export function arbiterDue(task: Seen): ArbiterDue {
  if (!isArbiterOf(task)) return null;
  if (OPEN.has(task.standing) && !task.agreement.arbiter_signed) return "sign";
  if (task.standing === "appealed") return "appeal";
  if (task.failure?.cause && !task.failure.cause.ruling) return "cause";
  const proposal = task.escrow?.state === "proposed" ? task.escrow.proposal : undefined;
  if (proposal && !proposal.signed_by.includes("arbiter")) return "escrow";
  return null;
}

export const isInspectorOf = (task: Pick<Task, "your_roles">) => task.your_roles.includes("inspector");

export const inspectorOf = (task: Pick<Task, "cover">) => task.cover?.inspector_npub ?? "";

export function inspectorDue(task: Seen): InspectorDue {
  if (!isInspectorOf(task)) return null;
  if (OPEN.has(task.standing) && !task.agreement.inspector_signed) return "sign";
  if (DELIVERED.has(task.standing) && !task.inspection) return "opinion";
  return null;
}

/** Where a commission sits in the Arbitration tab, or null when it names no arbiter and no inspector. */
export function shelfOf(task: Seen): Shelf | null {
  if (!arbiterOf(task) && !inspectorOf(task)) return null;
  const due = arbiterDue(task);
  if (due === "sign") return "asked";
  if (due) return "decide";
  const asked = inspectorDue(task);
  if (asked === "sign") return "inspectAsked";
  if (asked) return "inspectDue";
  // An escrow still to settle keeps a finished job in view: its split may yet be signed.
  const unsettled = task.escrow && task.escrow.state !== "settled" && task.escrow.state !== "invoiced";
  if (isFinished(task) && !unsettled) return "closed";
  const roles = task.your_roles;
  if (roles.includes("arbiter")) return "arbitrating";
  if (roles.includes("inspector")) return "inspecting";
  if (roles.includes("purchaser")) return "client";
  if (roles.includes("performer")) return "working";
  return "open";
}

export const dueKey = (due: Exclude<ArbiterDue, null>) => `arbiter.due.${due}` as const satisfies MessageKey;

export const inspectorDueKey = (due: Exclude<InspectorDue, null>) => `inspector.due.${due}` as const satisfies MessageKey;
