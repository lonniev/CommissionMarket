/**
 * A commission's terms in seven blocks of related settings, so the whole
 * contract reads closed, one line a block, and opens where a reader wants to
 * look. The form and the commission page share the names and the order.
 *
 * Pure: which block a problem belongs to, and what each block's summary line
 * says, from what the form holds.
 */

import type { Said } from "../i18n/index.ts";
import type { MessageKey } from "../i18n/en.ts";
import type { LateKind } from "./rubric.ts";
import { failSummary } from "./late.ts";

export const BLOCKS = ["spec", "people", "grades", "schedule", "payments", "conclusion", "legal"] as const;
export type BlockId = (typeof BLOCKS)[number];

export const blockTitle = (id: BlockId) => `block.${id}` as const satisfies MessageKey;

/** Each block's picture, so its place in the contract is remembered at a glance. */
export const BLOCK_ICON: Record<BlockId, string> = {
  spec: "📝", people: "👥", grades: "🏅", schedule: "📅", payments: "💰", conclusion: "⚖️", legal: "📜",
};

const BY_KEY: [RegExp, BlockId][] = [
  [/^form\.(needTitle|needDeliverable|deliverablesTooMany|deliverableLong|badSpecUrl|badSpecHash)$/, "spec"],
  [/^form\.(needAudience|audienceTooMany|notAnNpub|badArbiter|escrowNeedsArbiter|badInspector|inspectorIsArbiter)$/, "people"],
  [/^rubric\./, "grades"],
  [/^(form\.needDay|late\.)/, "schedule"],
  [/^form\.(depositPct|aheadCap|milestone\w*|escrowNeedsMint|badRefundDays)$/, "payments"],
  [/^form\.(badDeemedGrade|badDeemedDays|escrowNeedsDeemed|badWindow\.\w+)$/, "conclusion"],
  [/^form\.needIpCustom$/, "legal"],
];

/** The block that holds what a problem asks to fix; the first block when none names it. */
export function blockOf(key: string): BlockId {
  return BY_KEY.find(([re]) => re.test(key))?.[1] ?? "spec";
}

/** What a block's summary is made from: the form's state, as plain values. */
export interface Shape {
  title: string;
  deliverables: number;
  invited: number;
  arbiter: string;
  inspector: string;
  grades: number;
  topSats: number;
  neededBy: string;
  late: LateKind;
  /** The failure point in hours; 0 when none is set. */
  failHours: number;
  depositPct: number;
  milestones: number;
  escrowMint: string;
  deemedGrade: string;
  deemedDays: number;
  ip: string;
  law: string;
}

const host = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

/** Each block's summary line, as phrases to say and join with " · ". */
export function summaryOf(id: BlockId, s: Shape): Said[] {
  switch (id) {
    case "spec":
      return [s.title.trim() ? { key: "block.sum.title", vars: { title: s.title.trim() } } : { key: "block.sum.untitled" },
        { key: "block.sum.deliverables", vars: { count: s.deliverables } }];
    case "people":
      return [{ key: "block.sum.invited", vars: { count: s.invited } },
        s.arbiter ? { key: "block.sum.arbiter", vars: { who: `${s.arbiter.slice(0, 10)}…` } } : { key: "block.sum.noArbiter" },
        ...(s.inspector ? [{ key: "block.sum.inspector", vars: { who: `${s.inspector.slice(0, 10)}…` } } satisfies Said] : [])];
    case "grades":
      return [{ key: "block.sum.grades", vars: { count: s.grades, top: s.topSats.toLocaleString() } }];
    case "schedule":
      return [{ key: "block.sum.neededBy", vars: { day: s.neededBy } }, { key: `late.pick.${s.late}` },
        ...(s.failHours ? [failSummary(s.failHours)] : [])];
    case "payments": {
      const said: Said[] = [];
      if (s.depositPct) said.push({ key: "block.sum.deposit", vars: { pct: s.depositPct } });
      if (s.milestones) said.push({ key: "block.sum.milestones", vars: { count: s.milestones } });
      said.push(s.escrowMint ? { key: "block.sum.escrowAt", vars: { mint: host(s.escrowMint) } } : { key: "block.sum.noEscrow" });
      return said;
    }
    case "conclusion":
      return [s.deemedGrade
        ? { key: "block.sum.fallback", vars: { grade: s.deemedGrade, days: s.deemedDays } }
        : { key: "block.sum.noFallback" }];
    case "legal":
      return [{ key: `cover.ip.${s.ip}` as MessageKey }, ...(s.law.trim() ? [{ key: "block.sum.law" as const, vars: { law: s.law.trim() } }] : [])];
  }
}
