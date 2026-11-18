/**
 * The clock a commission in escrow runs on, under the Standard Terms v1,
 * drawn for its tightest case: the professional delivers on the delivery
 * date, and the client grades on the last day allowed. The question it
 * answers is whether the arbiter has time to settle an appeal before the
 * refund date lets the client take the escrow back alone (§6.6).
 */

export interface Clock {
  milestoneDay: number;
  deliveryDay: number;
  /** §4.4: days the client has to grade. */
  deemedDays: number;
  /** §4.6: days the professional has to appeal a grade. */
  appealDays: number;
  /** §14.3: days late before the deposit is owed back. */
  graceDays: number;
  /** §6.7: days after the delivery date until the refund date. */
  refundDays: number;
}

export interface Dates {
  deposit: number;
  milestone: number;
  deliveryDate: number;
  /** The last day to grade; after it the deemed grade applies (§4.5). */
  graded: number;
  /** The last day to appeal that grade. */
  appealed: number;
  /** From this day a late professional owes the deposit back (§14.3). */
  late: number;
  refund: number;
  /** Days the arbiter has between the last appeal and the refund date; below zero, the client can act first. */
  arbiterDays: number;
  /** The last day worth drawing. */
  end: number;
}

export const STORY_CLOCK: Clock = { milestoneDay: 10, deliveryDay: 30, deemedDays: 7, appealDays: 7, graceDays: 7, refundDays: 21 };

export function datesOf(c: Clock): Dates {
  const graded = c.deliveryDay + c.deemedDays;
  const appealed = graded + c.appealDays;
  const refund = c.deliveryDay + c.refundDays;
  return {
    deposit: 0,
    milestone: c.milestoneDay,
    deliveryDate: c.deliveryDay,
    graded,
    appealed,
    late: c.deliveryDay + c.graceDays + 1,
    refund,
    arbiterDays: refund - appealed,
    end: Math.max(refund, appealed) + 14,
  };
}

/** Fill `{n}` in a phrase. */
export const fill = (phrase: string, n: number) => phrase.replaceAll("{n}", String(n));
