/**
 * The guided tours: the package's shared ones, and CommissionMarket's own
 * pages. Each step points at one control (`tourTarget` on the page) and says
 * what it is for, in the words of `src/i18n/<code>.ts` (`tours.<page>.<step>`).
 *
 * The new-commission tour walks every block of the form. A block's steps ask
 * the form to open it first (`open:<block>`), so the tour can point at fields
 * that start folded away. A step whose control a page is not showing (an
 * escrow on a commission without one, a milestone button at the limit) is
 * skipped.
 */

import { accountTour, signInTour, walletTour, type Tour, type TourStep } from "@tollbooth-dpyc/web";
import { tr, type Translate } from "../i18n/index.ts";
import type { MessageKey } from "../i18n/en.ts";
import type { BlockId } from "./formBlocks.ts";

type Side = TourStep["side"];

/** One step: the target's name after the page's prefix, and where the popover sits. */
type Row = [step: string, opts?: { before?: BlockId; side?: Side }];

/** CommissionMarket's own pages, each a list of its steps in order. */
export const OWN: Record<string, Row[]> = {
  commissions: [["new"], ["tabs"], ["browse"], ["list", { side: "top" }], ["refresh"]],
  orgs: [["new"], ["list", { side: "top" }]],
  org: [["projects", { side: "top" }], ["newProject"], ["members", { side: "top" }]],
  project: [["budget"], ["circle", { side: "top" }], ["defaults", { side: "top" }], ["commissions", { side: "top" }], ["moveHere"], ["post"]],
  pick: [["projects"]],
  compose: [
    ["filing"],
    ["title", { before: "spec" }], ["brief", { before: "spec" }], ["deliverables", { before: "spec" }], ["spec", { before: "spec" }],
    ["audience", { before: "people" }], ["arbiter", { before: "people" }], ["inspector", { before: "people" }],
    ["grade", { before: "grades" }], ["addGrade", { before: "grades" }], ["top", { before: "grades" }],
    ["neededBy", { before: "schedule" }], ["late", { before: "schedule" }], ["failure", { before: "schedule" }],
    ["deposit", { before: "payments" }], ["milestones", { before: "payments" }], ["escrow", { before: "payments" }],
    ["deemed", { before: "conclusion" }], ["appeal", { before: "conclusion" }], ["ruling", { before: "conclusion" }], ["pay", { before: "conclusion" }],
    ["ip", { before: "legal" }], ["flags", { before: "legal" }], ["law", { before: "legal" }],
    ["post", { side: "top" }],
  ],
  commission: [["facts"], ["project"], ["actions", { side: "top" }], ["offer", { side: "top" }], ["inspection", { side: "top" }],
    ["escrow", { side: "top" }], ["money", { side: "top" }], ["contract", { side: "top" }], ["refresh"]],
  calendar: [["month", { side: "top" }], ["refresh"]],
  arbitration: [["says"], ["shelf", { side: "top" }]],
  person: [["says"], ["ranks", { side: "top" }]],
  glossary: [["search"], ["group", { side: "top" }]],
  catalog: [["shelves", { side: "top" }], ["visit"]],
};

/** The Profile page's own panels, after the package's; the rank sliders show for the Operator only. */
const ACCOUNT_OWN: Row[] = [["payout"], ["currency"], ["language"]];

function stepsOf(page: string, rows: Row[], t: Translate, prefix = page): TourStep[] {
  return rows.map(([step, opts = {}]) => ({
    target: `${prefix}.${step}`,
    title: t(`tours.${page}.${step}.title` as MessageKey),
    says: t(`tours.${page}.${step}.says` as MessageKey),
    ...(opts.side ? { side: opts.side } : {}),
    ...(opts.before ? { before: `open:${opts.before}` } : {}),
  }));
}

/** Every tour, in the language `t` speaks: build them again when the language changes. */
export function tours(t: Translate = tr): Record<string, Tour> {
  const own = Object.fromEntries(Object.entries(OWN).map(([page, rows]) => [page, { page, steps: stepsOf(page, rows, t) }]));
  return {
    signin: signInTour(),
    wallet: walletTour(),
    account: accountTour("account", [
      ...stepsOf("account", ACCOUNT_OWN, t, "profile"),
      {
        target: () => document.querySelector(".operator-props"),
        title: t("tours.account.ranks.title"),
        says: t("tours.account.ranks.says"),
        side: "top",
      },
    ]),
    ...own,
  };
}

/** The pages a reader may ask to be shown, from the Guide, and where each one is. */
export const SHOW_ME: { page: string; href: string; label: MessageKey }[] = [
  { page: "commissions", href: "/commissions", label: "nav.commissions" },
  { page: "compose", href: "/commissions/new", label: "list.new" },
  { page: "orgs", href: "/orgs", label: "nav.orgs" },
  { page: "calendar", href: "/calendar", label: "nav.calendar" },
  { page: "arbitration", href: "/arbitration", label: "nav.arbitration" },
  { page: "account", href: "/profile", label: "nav.profile" },
  { page: "wallet", href: "/wallet", label: "nav.wallet" },
  { page: "glossary", href: "/glossary", label: "nav.glossary" },
];
