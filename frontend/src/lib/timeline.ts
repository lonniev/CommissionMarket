/**
 * The clock a commission in escrow runs on, under the Standard Terms v1,
 * drawn for its tightest case: the professional delivers just before the
 * failure point after the delivery date, and the client grades on the last day allowed. The question it
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
  /** §14.7: days late before the work is a failure to deliver (the cover page's failure point). */
  failDays: number;
  /** §6.7: days after the delivery date until the refund date. */
  refundDays: number;
}

export interface Dates {
  deposit: number;
  milestone: number;
  deliveryDate: number;
  /** The latest delivery before it is a failure to deliver (§14.7). */
  delivered: number;
  /** The last day to grade; after it the deemed grade applies (§4.5). */
  graded: number;
  /** The last day to appeal that grade. */
  appealed: number;
  refund: number;
  /** Days the arbiter has between the last appeal and the refund date; below zero, the client can act first. */
  arbiterDays: number;
  /** The last day worth drawing. */
  end: number;
}

export const STORY_CLOCK: Clock = { milestoneDay: 10, deliveryDay: 30, deemedDays: 7, appealDays: 7, failDays: 7, refundDays: 28 };

export function datesOf(c: Clock): Dates {
  const delivered = c.deliveryDay + c.failDays;
  const graded = delivered + c.deemedDays;
  const appealed = graded + c.appealDays;
  const refund = c.deliveryDay + c.refundDays;
  return {
    deposit: 0,
    milestone: c.milestoneDay,
    deliveryDate: c.deliveryDay,
    delivered,
    graded,
    appealed,
    refund,
    arbiterDays: refund - appealed,
    end: Math.max(refund, appealed) + 14,
  };
}

/** Task Booth's floor for the refund period (taskbooth store.least_refund_days): failure point, grading, appeal, a week to decide. */
export const leastRefundDays = (c: Clock) => c.failDays + c.deemedDays + c.appealDays + 7;

/** Fill `{n}` in a phrase. */
export const fill = (phrase: string, n: number) => phrase.replaceAll("{n}", String(n));
