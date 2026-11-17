/**
 * What the signed-in person may do to a commission from where it stands.
 *
 * Task Booth decides what is allowed; this table only chooses which buttons a
 * page draws, from the roles Task Booth says the person holds (`your_roles`).
 */

import type { MessageKey } from "../i18n/en.ts";

export type Standing =
  | "posted" | "expired" | "claimed" | "done" | "assessed"
  | "appealed" | "owed" | "paid" | "rejected" | "withdrawn" | "missed";

export type Role = "purchaser" | "audience" | "performer" | "assessor" | "tie_breaker" | "member";

export type Move =
  | "claim" | "release" | "withdraw" | "mark_done" | "grade" | "reject"
  | "accept" | "appeal" | "decide" | "pay" | "confirm_paid";

export interface Stands {
  standing: Standing;
  /** The grade is settled: accepted, decided on appeal, or the top grade. */
  final: boolean;
  your_roles: Role[];
  /** Present when the commission has a cover page, so both parties must sign its offer. */
  cover?: unknown;
  agreement?: { purchaser_signed: boolean; performer_signed: boolean };
}

const OPEN: Partial<Record<Standing, [Move, Role[]][]>> = {
  posted: [["claim", ["audience"]], ["withdraw", ["purchaser"]]],
  expired: [["withdraw", ["purchaser"]]],
  claimed: [["mark_done", ["performer"]], ["release", ["performer", "purchaser"]]],
  done: [["grade", ["assessor"]], ["reject", ["assessor"]]],
  assessed: [["accept", ["performer"]], ["appeal", ["performer"]]],
  appealed: [["decide", ["tie_breaker"]]],
  owed: [["pay", ["purchaser"]], ["confirm_paid", ["performer"]]],
};

/** The moves open to this person, most likely first. */
export function movesFor(task: Stands): Move[] {
  if (task.standing === "assessed" && task.final) return [];
  return (OPEN[task.standing] ?? [])
    .filter(([, roles]) => roles.some((r) => task.your_roles.includes(r)))
    .map(([move]) => move);
}

/**
 * Why a move must wait for a signature, or null when it need not.
 *
 * A commission under a cover page is a contract once both parties sign one
 * offer: nobody claims it before the client signs, and the professional signs
 * before delivering. Task Booth refuses either way; the page says so first.
 */
export function waitsOnSignature(task: Stands, move: Move): MessageKey | null {
  if (!task.cover || !task.agreement) return null;
  if (move === "claim" && !task.agreement.purchaser_signed) return "gate.clientSignsFirst";
  if (move === "mark_done" && !task.agreement.performer_signed) return "gate.signBeforeDelivering";
  return null;
}

/** Whose signature the offer still lacks that this person can give, or null. */
export function mySignatureDue(task: Stands): "purchaser" | "performer" | null {
  if (!task.cover || !task.agreement) return null;
  const roles = task.your_roles;
  if ((task.standing === "posted" || task.standing === "expired") && roles.includes("purchaser") && !task.agreement.purchaser_signed) {
    return "purchaser";
  }
  if (task.standing === "claimed" && roles.includes("performer") && !task.agreement.performer_signed) return "performer";
  return null;
}

export function isFinished(task: Pick<Stands, "standing" | "final">): boolean {
  if (task.standing === "paid" || task.standing === "rejected" || task.standing === "withdrawn" || task.standing === "missed") return true;
  return task.standing === "assessed" && task.final;
}

export type Lane = "yours" | "waiting" | "finished";

/** Where a commission sits: waiting on you, waiting on someone else, or over. */
export function laneOf(task: Stands): Lane {
  if (mySignatureDue(task) || movesFor(task).length) return "yours";
  return isFinished(task) ? "finished" : "waiting";
}

export const standingKey = (standing: Standing) => `standing.${standing}` as const satisfies MessageKey;

/** Its terms may still change: nobody has claimed it, and it is yours. */
export const mayEdit = (task: Pick<Stands, "standing" | "your_roles">) =>
  (task.standing === "posted" || task.standing === "expired") && task.your_roles.includes("purchaser");
