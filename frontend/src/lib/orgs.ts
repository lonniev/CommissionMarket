/**
 * Organizations and their Projects, as Task Booth keeps them. An Organization's
 * owner adds members by npub; members see its Projects and every commission
 * filed in them, and may post into them. Only the owner changes them.
 */

import { callTool } from "@tollbooth-dpyc/web";
import type { CoverRows } from "./cover.ts";
import type { IpOption } from "./tasks.ts";

export type Place = "owner" | "member";

export interface Org {
  org_id: string;
  owner: string;
  name: string;
  about: string;
  created_at: number;
  your_place: Place;
}

export interface ProjectSummary {
  project_id: string;
  name: string;
  archived: boolean;
  budget_sats: number;
  created_at: number;
}

export interface OrgDetail extends Org {
  members: { npub: string; label: string }[];
  projects: ProjectSummary[];
}

/** A Project's default cover terms: what a new commission in it starts from. */
export interface Defaults {
  deemed_acceptance_days?: number;
  ip_option?: IpOption;
  ip_custom_text?: string;
  confidential?: boolean;
  client_is_consumer?: boolean;
  third_party_allowed?: boolean;
  governing_law?: string;
  venue?: string;
}

export interface Totals {
  committed_sats: number;
  paid_sats: number;
  tasks: number;
  by_standing: Record<string, number>;
}

export interface Project extends ProjectSummary {
  org_id: string;
  brief: string;
  circle: string[];
  defaults: Defaults;
  your_place: Place;
  totals: Totals;
}

interface Answer {
  ok?: boolean;
  error?: string;
}

async function ask<T>(tool: string, args: Record<string, unknown> = {}): Promise<T> {
  const r = await callTool<T & Answer>(tool, args);
  if (r.ok !== true) throw new Error(r.error ?? `${tool} did not answer.`);
  return r;
}

export const listOrgs = async () => (await ask<{ organizations: Org[] }>("list_organizations")).organizations;
export const getOrg = async (orgId: string) => (await ask<{ organization: OrgDetail }>("get_organization", { org_id: orgId })).organization;
export const saveOrg = async (name: string, about: string, orgId = "") =>
  (await ask<{ org_id: string }>("save_organization", { name, about, org_id: orgId })).org_id;
export const saveMember = async (orgId: string, member: string, label: string) => { await ask("save_member", { org_id: orgId, member, label }); };
export const removeMember = async (orgId: string, member: string) => { await ask("remove_member", { org_id: orgId, member }); };
export const getProject = async (projectId: string) => (await ask<{ project: Project }>("get_project", { project_id: projectId })).project;
export const archiveProject = async (orgId: string, projectId: string, archived: boolean) => {
  await ask("archive_project", { org_id: orgId, project_id: projectId, archived });
};

export interface ProjectInput {
  name: string;
  brief: string;
  budget_sats: number;
  circle: string[];
  defaults: Defaults;
}

export const saveProject = async (orgId: string, input: ProjectInput, projectId = "") =>
  (await ask<{ project_id: string }>("save_project", { org_id: orgId, ...input, project_id: projectId })).project_id;

// ── Pure helpers ─────────────────────────────────────────────────────────────

/** What a budget has left after what was committed; `null` when the Project has no budget. */
export function budgetLeft(budget: number, totals: Pick<Totals, "committed_sats">): number | null {
  return budget > 0 ? budget - totals.committed_sats : null;
}

/** How full a budget is, 0 to 1 (more than 1 when it is overspent), for a bar. */
export function budgetShare(budget: number, sats: number): number {
  return budget > 0 ? Math.max(0, sats) / budget : 0;
}

/** A new commission's cover rows, started from a Project's defaults. */
export function coverFromDefaults(blank: CoverRows, d: Defaults): CoverRows {
  return {
    ...blank,
    deemedDays: d.deemed_acceptance_days ? String(d.deemed_acceptance_days) : blank.deemedDays,
    ip: d.ip_option ?? blank.ip,
    ipCustom: d.ip_custom_text ?? blank.ipCustom,
    confidential: d.confidential ?? blank.confidential,
    consumer: d.client_is_consumer ?? blank.consumer,
    thirdParty: d.third_party_allowed ?? blank.thirdParty,
    law: d.governing_law ?? blank.law,
    venue: d.venue ?? blank.venue,
  };
}

/** A Project's defaults, from the cover rows its owner set them with. Only what differs from a blank cover page is kept. */
export function defaultsFromCover(rows: CoverRows, blank: CoverRows): Defaults {
  const d: Defaults = {};
  const days = Number(rows.deemedDays);
  if (rows.deemedDays !== blank.deemedDays && Number.isInteger(days) && days > 0) d.deemed_acceptance_days = days;
  if (rows.ip !== blank.ip) d.ip_option = rows.ip;
  if (rows.ip === "custom" && rows.ipCustom.trim()) d.ip_custom_text = rows.ipCustom.trim();
  if (rows.confidential) d.confidential = true;
  if (rows.consumer) d.client_is_consumer = true;
  if (rows.thirdParty) d.third_party_allowed = true;
  if (rows.law.trim()) d.governing_law = rows.law.trim();
  if (rows.venue.trim()) d.venue = rows.venue.trim();
  return d;
}

/** Whole sats from what was typed, or NaN. */
export const satsFrom = (text: string): number => (/^\d+$/.test(text.trim()) ? Number(text.trim()) : NaN);
