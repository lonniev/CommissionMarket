/**
 * The parts of a commission's form beyond the grades: who may claim it, the
 * deposit and milestones, and the cover page. Each is checked here so the page
 * can say what to fix; Task Booth checks everything again.
 */

import { nip19 } from "nostr-tools";
import type { Said } from "../i18n/index.ts";
import { failDays, failFrom, rowOf, type LateStep, type Unit } from "./late.ts";
import { MAX_AHEAD_PCT, MAX_MILESTONES, withinCap } from "./money.ts";
import type { CoverInput, IpOption } from "./tasks.ts";
import { endOfDay } from "./when.ts";

export const IP_OPTIONS: IpOption[] = ["assign", "license", "worker_keeps", "custom"];
export const MAX_DELIVERABLES = 20;
export const MAX_DEEMED_DAYS = 60;
export const MAX_AUDIENCE = 500;
export const MAX_REFUND_DAYS = 90;
/** Days the Standard Terms give an appeal or a claim of cause (4.6, 14.8), and the arbiter to decide it. */
const APPEAL_DAYS = 7;
const ARBITER_DAYS = 7;

/**
 * The shortest refund period that cannot cut an appeal short, as Task Booth enforces it: the
 * failure point in whole days, the deemed-acceptance period, a week to appeal and a week to decide.
 */
export const leastRefundDays = (deemedDays: number, failHours: number) =>
  failDays(failHours) + deemedDays + APPEAL_DAYS + ARBITER_DAYS;

/** The failure point the form holds in hours, or 0 while it is not a whole number. */
export function failHoursOf(rows: Pick<CoverRows, "failAfter" | "failUnit">): number {
  const made = failFrom(rows.failAfter, rows.failUnit);
  return "hours" in made ? made.hours : 0;
}

export const isNpub = (text: string) => {
  try {
    return nip19.decode(text).type === "npub";
  } catch {
    return false;
  }
};

const whole = (text: string) => (/^\d+$/.test(text.trim()) ? Number(text.trim()) : NaN);

/** The npubs in a pasted list, one per line or separated by spaces or commas, or what to fix. */
export function audienceFrom(text: string): { audience: string[] } | { problem: Said } {
  const words = [...new Set(text.split(/[\s,;]+/).map((w) => w.trim()).filter(Boolean))];
  if (!words.length) return { problem: { key: "form.needAudience" } };
  if (words.length > MAX_AUDIENCE) return { problem: { key: "form.audienceTooMany", vars: { max: MAX_AUDIENCE } } };
  for (const word of words) {
    let kind = "";
    try {
      kind = nip19.decode(word).type;
    } catch {
      kind = "";
    }
    if (kind !== "npub") return { problem: { key: "form.notAnNpub", vars: { text: word.slice(0, 24) } } };
  }
  return { audience: words };
}

/** A milestone as the form holds it. */
export interface MilestoneRow {
  name: string;
  /** `YYYY-MM-DD`; it falls due at the end of that day. */
  day: string;
  pct: string;
}

/** The form's deposit and milestones as Task Booth takes them, or what to fix. */
export function aheadFrom(
  depositText: string, rows: MilestoneRow[], neededBy: number, now: number,
): { deposit_pct: number; milestones: { name: string; due_at: number; pct: number }[] } | { problem: Said } {
  const deposit = depositText.trim() ? whole(depositText) : 0;
  if (Number.isNaN(deposit) || deposit > MAX_AHEAD_PCT) return { problem: { key: "form.depositPct", vars: { max: MAX_AHEAD_PCT } } };
  const filled = rows.filter((r) => r.name.trim() || r.day || r.pct.trim());
  if (filled.length > MAX_MILESTONES) return { problem: { key: "form.milestonesTooMany", vars: { max: MAX_MILESTONES } } };
  const milestones: { name: string; due_at: number; pct: number }[] = [];
  for (const row of filled) {
    const name = row.name.trim();
    if (!name) return { problem: { key: "form.milestoneNeedsName" } };
    const due = endOfDay(row.day);
    if (due === null || due <= now || due > neededBy) return { problem: { key: "form.milestoneBadDay", vars: { name } } };
    const pct = whole(row.pct);
    if (Number.isNaN(pct) || pct < 1) return { problem: { key: "form.milestoneBadPct", vars: { name } } };
    milestones.push({ name: name.slice(0, 60), due_at: due, pct });
  }
  if (!withinCap(deposit, milestones.map((m) => m.pct))) return { problem: { key: "form.aheadCap", vars: { max: MAX_AHEAD_PCT } } };
  milestones.sort((a, b) => a.due_at - b.due_at);
  return { deposit_pct: deposit, milestones };
}

/** The cover page as the form holds it. */
export interface CoverRows {
  deliverables: string;
  specUrl: string;
  specHash: string;
  deemedGrade: string;
  deemedDays: string;
  ip: IpOption;
  ipCustom: string;
  confidential: boolean;
  consumer: boolean;
  thirdParty: boolean;
  law: string;
  venue: string;
  arbiter: string;
  /** Who gives a signed opinion of the finished work (terms 8.6). */
  inspector: string;
  escrow: boolean;
  mint: string;
  refundDays: string;
  /** When late becomes failure to deliver (terms 14.7). */
  failAfter: string;
  failUnit: Unit;
}

export const blankCover = (): CoverRows => ({
  deliverables: "", specUrl: "", specHash: "", deemedGrade: "", deemedDays: "14", ip: "assign", ipCustom: "",
  confidential: false, consumer: false, thirdParty: false, law: "", venue: "",
  arbiter: "", inspector: "", escrow: false, mint: "", refundDays: "", failAfter: "7", failUnit: "days",
});

/**
 * The cover page as Task Booth takes it, or what to fix. `grades` are the rubric's names; `steps`
 * are the late steps, which the failure point must come after.
 */
export function coverFrom(rows: CoverRows, grades: string[], steps: LateStep[] = []): { cover: CoverInput } | { problem: Said } {
  const deliverables = rows.deliverables.split("\n").map((d) => d.trim()).filter(Boolean);
  if (!deliverables.length) return { problem: { key: "form.needDeliverable" } };
  if (deliverables.length > MAX_DELIVERABLES) return { problem: { key: "form.deliverablesTooMany", vars: { max: MAX_DELIVERABLES } } };
  if (deliverables.some((d) => d.length > 200)) return { problem: { key: "form.deliverableLong" } };
  const url = rows.specUrl.trim();
  if (url && !/^https:\/\/\S+$/.test(url)) return { problem: { key: "form.badSpecUrl" } };
  const hash = rows.specHash.trim().toLowerCase();
  if (hash && !/^[0-9a-f]{64}$/.test(hash)) return { problem: { key: "form.badSpecHash" } };
  const deemed = rows.deemedGrade;
  let days = 0;
  if (deemed) {
    if (!grades.includes(deemed)) return { problem: { key: "form.badDeemedGrade" } };
    days = whole(rows.deemedDays);
    if (Number.isNaN(days) || days < 1 || days > MAX_DEEMED_DAYS) return { problem: { key: "form.badDeemedDays", vars: { max: MAX_DEEMED_DAYS } } };
  }
  if (rows.ip === "custom" && !rows.ipCustom.trim()) return { problem: { key: "form.needIpCustom" } };
  const arbiter = rows.arbiter.trim();
  if (arbiter && !isNpub(arbiter)) return { problem: { key: "form.badArbiter" } };
  const inspector = rows.inspector.trim();
  if (inspector && !isNpub(inspector)) return { problem: { key: "form.badInspector" } };
  if (inspector && inspector === arbiter) return { problem: { key: "form.inspectorIsArbiter" } };
  const fail = failFrom(rows.failAfter, rows.failUnit, steps);
  if ("problem" in fail) return fail;
  let refund = 0;
  if (rows.escrow) {
    if (!arbiter) return { problem: { key: "form.escrowNeedsArbiter" } };
    if (!deemed) return { problem: { key: "form.escrowNeedsDeemed" } };
    if (!rows.mint) return { problem: { key: "form.escrowNeedsMint" } };
    const least = leastRefundDays(days, fail.hours);
    refund = whole(rows.refundDays);
    if (Number.isNaN(refund) || refund < least || refund > MAX_REFUND_DAYS) {
      return { problem: { key: "form.badRefundDays", vars: { least, most: MAX_REFUND_DAYS } } };
    }
  }
  return {
    cover: {
      deliverables,
      spec_url: url,
      spec_hash: hash,
      deemed_grade: deemed,
      deemed_acceptance_days: days,
      ip_option: rows.ip,
      ip_custom_text: rows.ip === "custom" ? rows.ipCustom.trim() : "",
      confidential: rows.confidential,
      client_is_consumer: rows.consumer,
      third_party_allowed: rows.thirdParty,
      governing_law: rows.law.trim().slice(0, 200),
      venue: rows.venue.trim().slice(0, 200),
      arbiter_npub: arbiter,
      inspector_npub: inspector,
      escrow: rows.escrow,
      escrow_mint: rows.escrow ? rows.mint : "",
      refund_days: refund,
      fail_after_hours: fail.hours,
    },
  };
}

/** A cover page back into the form, to edit it. */
export function rowsOf(cover: CoverInput | null): CoverRows {
  if (!cover) return blankCover();
  return {
    deliverables: cover.deliverables.join("\n"), specUrl: cover.spec_url, specHash: cover.spec_hash,
    deemedGrade: cover.deemed_grade, deemedDays: cover.deemed_acceptance_days ? String(cover.deemed_acceptance_days) : "14",
    ip: cover.ip_option, ipCustom: cover.ip_custom_text, confidential: cover.confidential, consumer: cover.client_is_consumer,
    thirdParty: cover.third_party_allowed, law: cover.governing_law, venue: cover.venue,
    arbiter: cover.arbiter_npub ?? "", inspector: cover.inspector_npub ?? "", escrow: Boolean(cover.escrow), mint: cover.escrow_mint ?? "",
    refundDays: cover.refund_days ? String(cover.refund_days) : "",
    ...(cover.fail_after_hours ? { failAfter: rowOf(cover.fail_after_hours).after, failUnit: rowOf(cover.fail_after_hours).unit }
      : { failAfter: "7", failUnit: "days" as const }),
  };
}
