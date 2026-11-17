/**
 * The parts of a commission's form beyond the grades: who may claim it, the
 * deposit and milestones, and the cover page. Each is checked here so the page
 * can say what to fix; Task Booth checks everything again.
 */

import { nip19 } from "nostr-tools";
import type { Said } from "../i18n/index.ts";
import { MAX_AHEAD_PCT, MAX_MILESTONES, withinCap } from "./money.ts";
import type { CoverInput, IpOption } from "./tasks.ts";
import { endOfDay } from "./when.ts";

export const IP_OPTIONS: IpOption[] = ["assign", "license", "worker_keeps", "custom"];
export const MAX_DELIVERABLES = 20;
export const MAX_DEEMED_DAYS = 60;
export const MAX_AUDIENCE = 500;

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
}

export const blankCover = (): CoverRows => ({
  deliverables: "", specUrl: "", specHash: "", deemedGrade: "", deemedDays: "14", ip: "assign", ipCustom: "",
  confidential: false, consumer: false, thirdParty: false, law: "", venue: "",
});

/** The cover page as Task Booth takes it, or what to fix. `grades` are the rubric's names. */
export function coverFrom(rows: CoverRows, grades: string[]): { cover: CoverInput } | { problem: Said } {
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
  };
}
