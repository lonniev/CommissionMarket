/** Task Booth's tools, as CommissionMarket calls them. A commission is a Task Booth task. */

import { callTool } from "@tollbooth-dpyc/web";
import type { Ahead } from "./money.ts";
import type { Role, Standing } from "./moves.ts";
import type { Rubric } from "./rubric.ts";

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

export type LateRule = { kind: "full" } | { kind: "discount"; pct_per_day: number } | { kind: "cancel" };

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
  client_is_consumer: boolean;
  third_party_allowed: boolean;
  governing_law: string;
  venue: string;
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
  agreement: { purchaser_signed: boolean; performer_signed: boolean };
}

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
async function ask<T>(tool: string, args: Record<string, unknown> = {}): Promise<T> {
  const r = await callTool<T & Answer>(tool, args);
  if (r.ok !== true) throw new Error(r.error ?? `${tool} did not answer.`);
  return r;
}

export const listTasks = async () => (await ask<{ tasks: Task[] }>("list_tasks")).tasks;

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
  (await ask<{ task: Task }>("post_task", { ...terms })).task;

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

// ── The offer, and both signatures on it ────────────────────────────────────

export interface Offer {
  statement: string;
  statement_hash: string;
  signatures: Partial<Record<"purchaser" | "performer", { signer: string; signed_at: number; method: string }>>;
}

export const offerTerms = (taskId: string) => ask<Offer>("offer_terms", { task_id: taskId });

/** Ask Task Booth to DM the offer to the signed-in person; their reply is their signature. */
export const requestSignature = (taskId: string) =>
  ask<{ nonce: string; statement_hash: string }>("request_offer_signature", { task_id: taskId });

/** Collect that reply and keep it as their signature. */
export const receiveSignature = async (taskId: string, nonce: string, statementHash: string) =>
  (await ask<{ task: Task }>("receive_offer_signature", { task_id: taskId, nonce, statement_hash: statementHash })).task;

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
  (await ask<{ feed: Feed }>("calendar_publish", { name, time_zone: timeZone })).feed;

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
