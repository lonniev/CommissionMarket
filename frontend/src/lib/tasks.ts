/** Task Booth's tools, as CommissionMarket calls them. A commission is a Task Booth task. */

import { callTool, type EscrowSignable } from "@tollbooth-dpyc/web";
import type { Ahead } from "./money.ts";
import type { MintFacts, MintTest } from "./mints.ts";
import type { Role, Standing } from "./moves.ts";
import type { LateChoice, Rubric } from "./rubric.ts";

export interface Assessment {
  grade: string;
  /** What is still owed after lateness and what was paid ahead. */
  sats: number;
  assessor: string;
  reasons: string;
  at: number;
  appeal?: { reasons: string; at: number; first_grade?: string; first_sats?: number; decision_reasons?: string };
  full_sats?: number;
  days_late?: number;
  pct_off?: number;
  /** What the grade earned, before what was paid ahead came off. */
  earned_sats?: number;
  paid_ahead_sats?: number;
  /** Graded by the cover page's deemed-acceptance rule, not by a person. */
  deemed?: boolean;
}

export type LateRule = LateChoice;

export type IpOption = "assign" | "license" | "worker_keeps" | "custom";

/** The cover page: the terms of this commission beyond the grades. */
export interface Cover {
  terms_version: string;
  terms_hash: string;
  spec_url: string;
  spec_hash: string;
  deliverables: string[];
  deemed_grade: string;
  deemed_acceptance_days: number;
  ip_option: IpOption;
  ip_custom_text: string;
  confidential: boolean;
  third_party_allowed: boolean;
  governing_law: string;
  venue: string;
  /** Someone both parties trust: signs the offer, decides an appeal, holds the third escrow key. */
  arbiter_npub: string;
  /** Someone who signs the offer and gives one signed opinion of the finished work, as advice (terms 8.6). */
  inspector_npub?: string;
  /** The Balance is held at a Cashu mint until two of the three agree how it divides (terms 6). */
  escrow: boolean;
  escrow_mint: string;
  /** Days after the needed-by date when the client alone may take the escrow back (terms 6.6). */
  refund_days: number;
  /** Hours past the needed-by time when undelivered work is a failure to deliver (terms 14.7); 0 for none. */
  fail_after_hours: number;
  /** Hours to appeal a grade or claim cause, for the arbiter to rule, and for the client to pay (terms 4.6, 14.8, 7.2).
   * A cover signed before these were set has none, and reads as 7 days. */
  appeal_hours?: number;
  ruling_hours?: number;
  pay_hours?: number;
}

/** The windows a cover page sets, in hours. */
export const WINDOWS = ["appeal_hours", "ruling_hours", "pay_hours"] as const;
export type WindowName = (typeof WINDOWS)[number];
export const DEFAULT_WINDOW_HOURS = 168;
export const windowHours = (cover: Partial<Cover> | null | undefined, name: WindowName) => cover?.[name] || DEFAULT_WINDOW_HOURS;

/** A failure to deliver, and where a claim of cause stands (terms 14.7, 14.8). */
export interface Failure {
  at: number;
  /** Until when the professional may claim cause; null when no arbiter is named. */
  cause_ends: number | null;
  cause: { reasons: string; at: number; ruling?: "upheld" | "rejected"; ruling_reasons?: string; ruled_at?: number } | null;
  /** True once the failure stands without cause; false when cause was upheld; null while it may still come. */
  without_cause: boolean | null;
}

/** A cover page as posted: Task Booth stamps the terms version and hash itself. */
export type CoverInput = Omit<Cover, "terms_version" | "terms_hash">;

/** An invoice paying ahead, while it is kept on the commission. */
interface Invoiced extends Ahead {
  invoice?: string;
  expires_at?: number;
}

export interface Deposit extends Invoiced {
  pct: number;
  sats: number;
}

export interface Milestone extends Invoiced {
  name: string;
  due_at: number;
  pct: number;
}

export interface Task {
  task_id: string;
  title: string;
  description: string;
  rubric: Rubric;
  purchaser: string;
  performer: string | null;
  audience: string[];
  assessors: string[];
  tie_breaker: string;
  standing: Standing;
  final: boolean;
  your_roles: Role[];
  /** The Organization and Project it is filed under, or empty. */
  org_id: string;
  project_id: string;
  needed_by: number;
  every_days: number;
  assessment?: Assessment | null;
  rejection?: { by: string; reasons: string; at: number } | null;
  created_at: number;
  claimed_at?: number;
  accomplished_at?: number;
  paid_at?: number;
  late: LateRule;
  days_late: number;
  deposit_pct: number;
  deposit?: Deposit;
  milestones: Milestone[];
  cover: Cover | null;
  agreement: { purchaser_signed: boolean; performer_signed: boolean; arbiter_signed?: boolean; inspector_signed?: boolean };
  /** The inspector's signed opinion of the delivered work, once given (terms 8.7). */
  inspection?: Inspection | null;
  /** Where the escrow stands, once its invoice is asked for. */
  escrow?: Escrow | null;
  failure?: Failure | null;
  /** After a failure without cause, the whole escrow is the client's (terms 14.10). */
  escrow_due_to?: "client";
}

export type EscrowRole = "purchaser" | "performer" | "arbiter";

export const VERDICTS = ["verified", "concerns", "not_verified"] as const;
export type Verdict = (typeof VERDICTS)[number];

/** The inspector's opinion: advice that grades nothing and moves no escrow (terms 8.8). */
export interface Inspection {
  verdict: Verdict;
  reasons: string;
  at: number;
  inspector: string;
  statement_hash: string;
  method: string;
}

/** A commission's escrow as anyone on it reads it: no proofs, no blinding factors. */
export interface Escrow {
  state: "invoiced" | "funded" | "proposed" | "split" | "settled";
  mint: string;
  sats: number;
  parties: Record<EscrowRole, string>;
  refund_at: number;
  refund_open: boolean;
  invoice?: { invoice: string; expires_at: number };
  funded_at?: number;
  held_sats?: number;
  proposal?: { to_performer: number; to_purchaser: number; by: EscrowRole; at: number; signed_by: EscrowRole[] };
  to_collect?: Partial<Record<EscrowRole, number>>;
  paid?: Partial<Record<EscrowRole, number>>;
}

/** Something waiting on the signed-in person's signature, with the parts to rebuild it from. */
export type EscrowPending = EscrowSignable & {
  role: EscrowRole;
  sats?: number;
  fee_reserve?: number;
  to_performer?: number;
  to_purchaser?: number;
};

/** An invoice Task Booth hands over: the award, the deposit or a milestone. */
export interface Invoice {
  sats: number;
  invoice: string;
  lightning_uri: string;
  payment_hash: string;
  expires_at: number;
  paid_at: number | null;
}

export interface TaskEvent {
  seq: number;
  at: number;
  actor: string;
  action: string;
  from: string | null;
  to: string;
  grade?: string;
  sats?: number;
  reasons?: string;
  deemed?: boolean;
}

interface Answer {
  ok?: boolean;
  error?: string;
}

/** A Task Booth answer, or its refusal raised as the sentence Task Booth gave. */
/** This site's name on the tasks it posts. Task Booth serves several sites; each lists its own tasks and every unstamped one. */
const SITE = "commissionmarket";

async function ask<T>(tool: string, args: Record<string, unknown> = {}): Promise<T> {
  const r = await callTool<T & Answer>(tool, args);
  if (r.ok !== true) throw new Error(r.error ?? `${tool} did not answer.`);
  return r;
}

/**
 * A commission is a task under a cover page: every one this site posts has one. Task Booth
 * also lists tasks no site stamped (posted before sites stamped them) on every site, and a
 * ChipIn chore among them has no cover page, so it stays in ChipIn.
 */
export const isCommission = (task: Pick<Task, "cover">) => Boolean(task.cover);

export const listTasks = async () => (await ask<{ tasks: Task[] }>("list_tasks", { site: SITE })).tasks.filter(isCommission);

/** Move a commission you posted into a Project, or to another: its terms and signatures stand. */
export const fileTask = async (taskId: string, orgId: string, projectId: string) =>
  (await ask<{ task: Task }>("file_task", { task_id: taskId, org_id: orgId, project_id: projectId })).task;

export const getTask = (taskId: string) => ask<{ task: Task; payout?: Invoice }>("get_task", { task_id: taskId });

export const taskHistory = async (taskId: string) =>
  (await ask<{ events: TaskEvent[] }>("task_history", { task_id: taskId })).events;

export interface Terms {
  title: string;
  description: string;
  rubric: Rubric;
  audience: string[];
  needed_by: number;
  late: LateRule;
  deposit_pct: number;
  milestones: { name: string; due_at: number; pct: number }[];
  cover: CoverInput;
}

/** Post a commission; filed under an Organization's Project when both ids are given. */
export const postTask = async (terms: Terms & { org_id?: string; project_id?: string }) =>
  (await ask<{ task: Task }>("post_task", { ...terms, site: SITE })).task;

/** Change an open commission's terms. Give only what changes. */
export const editTask = async (taskId: string, changes: Partial<Terms>) =>
  (await ask<{ task: Task }>("edit_task", { task_id: taskId, ...changes })).task;

const PLAIN = {
  claim: "claim_task",
  release: "release_claim",
  withdraw: "withdraw_task",
  mark_done: "mark_done",
  accept: "accept_assessment",
  confirm_paid: "confirm_paid",
} as const;

export type PlainMove = keyof typeof PLAIN;

export const isPlain = (move: string): move is PlainMove => move in PLAIN;

export const move = async (taskId: string, what: PlainMove) =>
  (await ask<{ task: Task }>(PLAIN[what], { task_id: taskId })).task;

export const assess = async (taskId: string, grade: string, reasons: string) =>
  (await ask<{ task: Task }>("assess_task", { task_id: taskId, grade, reasons })).task;

export const decideAppeal = async (taskId: string, grade: string, reasons: string) =>
  (await ask<{ task: Task }>("decide_appeal", { task_id: taskId, grade, reasons })).task;

export const reject = async (taskId: string, reasons: string) =>
  (await ask<{ task: Task }>("reject_task", { task_id: taskId, reasons })).task;

export const appeal = async (taskId: string, reasons: string) =>
  (await ask<{ task: Task }>("appeal_assessment", { task_id: taskId, reasons })).task;

export const claimCause = async (taskId: string, reasons: string) =>
  (await ask<{ task: Task }>("claim_cause", { task_id: taskId, reasons })).task;

export const decideCause = async (taskId: string, ruling: "upheld" | "rejected", reasons: string) =>
  (await ask<{ task: Task }>("decide_cause", { task_id: taskId, ruling, reasons })).task;

// ── The offer, and both signatures on it ────────────────────────────────────

export interface Offer {
  statement: string;
  statement_hash: string;
  signatures: Partial<Record<EscrowRole | "inspector", { signer: string; signed_at: number; method: string }>>;
}

export const offerTerms = (taskId: string) => ask<Offer>("offer_terms", { task_id: taskId });

/** Ask Task Booth to DM the offer to the signed-in person; their reply is their signature. */
export const requestSignature = (taskId: string) =>
  ask<{ nonce: string; statement_hash: string }>("request_offer_signature", { task_id: taskId });

/** Collect that reply and keep it as their signature. */
export const receiveSignature = async (taskId: string, nonce: string, statementHash: string) =>
  (await ask<{ task: Task }>("receive_offer_signature", { task_id: taskId, nonce, statement_hash: statementHash })).task;

// ── The inspector's opinion ─────────────────────────────────────────────────

/** Ask Task Booth to DM the opinion to the inspector; their reply is their signature. */
export const requestInspection = (taskId: string, verdict: Verdict, reasons: string) =>
  ask<{ nonce: string; statement_hash: string }>("request_inspection_signature", { task_id: taskId, verdict, reasons });

/** Collect that reply and keep it as the inspector's opinion. */
export const receiveInspection = async (taskId: string, verdict: Verdict, reasons: string, nonce: string, statementHash: string) =>
  (await ask<{ task: Task }>("receive_inspection_signature",
    { task_id: taskId, verdict, reasons, nonce, statement_hash: statementHash })).task;

// ── Reputation ──────────────────────────────────────────────────────────────

export type VerdictCounts = Record<Verdict, number>;

/** What an npub did on commissions, role by role: counts only (Task Booth's `reputation`). */
export interface Reputation {
  npub: string;
  client: { commissions: number; graded: number; graded_in_time: number; owed: number; paid: number; appeals_lost: number };
  artist: {
    commissions: number; delivered: number; on_time: number; late: number; failed_without_cause: number;
    failed_with_cause: number; appeals_won: number; appeals_lost: number; grade_pct: number | null; verdicts: VerdictCounts;
  };
  arbiter: { named: number; signed: number; decided: number; decided_in_time: number };
  inspector: { named: number; signed: number; opinions: number; opinions_in_time: number; verdicts: VerdictCounts };
  /** Where the operator says each rank begins. */
  ranks: RankThresholds;
}

/** The operator's rank thresholds (Task Booth's rank_* operator properties). */
export interface RankThresholds {
  rank_min_finished: number;
  rank_proven_pct: number;
  rank_trusted_pct: number;
  rank_trusted_finished: number;
  rank_exemplary_pct: number;
  rank_exemplary_finished: number;
}

export const reputation = (npub: string) => ask<Reputation>("reputation", { of_npub: npub });

// ── Paying: ahead, and the award ────────────────────────────────────────────

/** Which payment: the deposit, a milestone by its place in the list, or the graded award. */
export type Payment = { kind: "deposit" } | { kind: "milestone"; index: number } | { kind: "award" };

/** The invoice for a payment. A professional may hand in their own instead. */
export async function invoiceFor(taskId: string, what: Payment, invoice = ""): Promise<Invoice> {
  const mine = invoice ? { invoice } : {};
  if (what.kind === "deposit") return (await ask<{ deposit: Invoice }>("request_deposit", { task_id: taskId, ...mine })).deposit;
  if (what.kind === "milestone") {
    return (await ask<{ milestone: Invoice }>("request_milestone", { task_id: taskId, index: what.index, ...mine })).milestone;
  }
  return (await ask<{ payout: Invoice }>("request_payout", { task_id: taskId, ...mine })).payout;
}

/** The professional says a payment arrived. */
export async function confirmArrived(taskId: string, what: Payment): Promise<Task> {
  if (what.kind === "deposit") return (await ask<{ task: Task }>("confirm_deposit", { task_id: taskId })).task;
  if (what.kind === "milestone") {
    return (await ask<{ task: Task }>("confirm_milestone", { task_id: taskId, index: what.index })).task;
  }
  return move(taskId, "confirm_paid");
}

// ── Escrow at a Cashu mint ───────────────────────────────────────────────────

export interface EscrowReading {
  escrow: Escrow | null;
  for_you?: EscrowPending[];
  /** Before the invoice: whether the cover asks for escrow, and the Balance it would hold. */
  offered?: boolean;
  sats?: number;
}

export const escrowStatus = (taskId: string) => ask<EscrowReading>("escrow_status", { task_id: taskId });

/** The invoice that funds the escrow; the client pays it, then signs to lock the sats. */
export const escrowInvoice = async (taskId: string) =>
  (await ask<{ escrow: { invoice: string; sats: number; expires_at: number; mint: string; refund_at: number } }>(
    "escrow_invoice", { task_id: taskId })).escrow;

/** Propose a split; with no share, the award of a final grade. */
export const escrowPropose = (taskId: string, toPerformer?: number) =>
  ask<{ proposal: NonNullable<Escrow["proposal"]> }>("escrow_propose", toPerformer === undefined ? { task_id: taskId } : { task_id: taskId, to_performer: toPerformer });

/** Ready the signed-in person's share for their payout address. */
export const escrowCollect = (taskId: string) =>
  ask<{ sats: number; fee_reserve: number; address: string }>("escrow_collect", { task_id: taskId });

export const escrowSign = (taskId: string, signature: string) =>
  ask<{ escrow: Escrow; split?: boolean; paid?: number }>("escrow_sign", { task_id: taskId, signature });

interface PropertyRow {
  name: string;
  value: unknown;
  suggestions?: string[];
}

/** The mints the owner offers for escrow, read from the Operator's public properties. */
export async function escrowMints(): Promise<string[]> {
  const r = await callTool<{ success?: boolean; properties?: PropertyRow[] }>("get_operator_properties", {});
  const row = (r.properties ?? []).find((p) => p.name === "escrow_mints");
  const value = typeof row?.value === "string" ? row.value : "";
  return [...new Set(value.split(/[\s,]+/).map((w) => w.trim()).filter((w) => w.startsWith("https://")))];
}

// ── Choosing escrow mints ────────────────────────────────────────────────────

/** Facts about mints (empty: the ones the Operator offers), each from its source, with the Operator's offer. */
export const mintFacts = (mints: string[] = []) =>
  ask<{ offered: string[]; mints: MintFacts[] }>("mint_facts", mints.length ? { mints } : {});

/** Online mints that claim every escrow NUT, with their facts. */
export const findMints = () => ask<{ offered: string[]; mints: MintFacts[] }>("find_mints");

/** The Operator's choice of escrow mints, stored as their property. */
export async function offerMints(urls: string[]): Promise<void> {
  const r = await callTool<{ success?: boolean; error?: string }>("set_operator_property",
    { name: "escrow_mints", value: urls.join(" ") });
  if (r.success === false) throw new Error(r.error ?? "The mints were not saved.");
}

export const mintTestStart = (mint: string, keys: string[], sats: number) =>
  ask<{ test: MintTest }>("mint_test_start", { mint, keys, sats });

export const mintTestSign = (testId: string, signatures: Record<string, string>) =>
  ask<{ test: MintTest }>("mint_test_sign", { test_id: testId, signatures });

export const mintTestList = () => ask<{ tests: MintTest[] }>("mint_test_list");

/** A test mint: its sats are not real. */
export const isTestMint = (url: string) => /^https:\/\/([a-z0-9-]+\.)*testnut\.cashu\.space(\/|$)/i.test(url);

// ── The calendar feed ────────────────────────────────────────────────────────

/** A private calendar link: the token is its whole credential. */
export interface Feed {
  token: string;
  name: string;
  zone: string;
  created_at: number;
  fetches: number;
  last_fetch: number | null;
}

export const listFeeds = async () => (await ask<{ feeds: Feed[] }>("calendar_list")).feeds;

export const publishFeed = async (name: string, timeZone: string) =>
  (await ask<{ feed: Feed }>("calendar_publish", { name, time_zone: timeZone, site: SITE })).feed;

export const revokeFeed = async (token: string) => { await ask("calendar_revoke", { token }); };

// ── Free reading ────────────────────────────────────────────────────────────

export interface StandardTerms {
  version: string;
  hash: string;
  text: string;
  versions?: string[];
}

export const standardTerms = (version = "") => ask<StandardTerms>("standard_terms", version ? { version } : {});

export interface PriceReading {
  fiat: string;
  price: number;
  observed_at: number;
  source: string;
  source_url: string;
}

export const btcPrice = (fiat: string) => ask<PriceReading>("btc_price", { fiat, years: 0 });
