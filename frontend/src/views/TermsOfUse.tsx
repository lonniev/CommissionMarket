/**
 * Terms of use: the agreement between each person and CommissionMarket's
 * operator. A commission's own contract is the Standard Terms, between its
 * client and its professional, and the site is no party to it (Terms §1.5); so
 * what the site promises, and disclaims, lives here.
 *
 * CommissionMarket writes only its own sections. Keys, fees, the café and the
 * marks are the package's, the same on every Tollbooth site. A draft for the
 * owner's review: nothing here has had legal review.
 */

import { Link } from "react-router-dom";
import { termsOfUse } from "@tollbooth-dpyc/web";
import { TermsOfUse as Page } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";

const SECTIONS = termsOfUse({
  name: "CommissionMarket",
  cafe: true,
  own: [
    { title: "The service", says: [
      "CommissionMarket is a site over the Task Booth operator.",
      "It publishes commissions, records signatures and moves, fetches Lightning invoices, and builds and submits escrow transactions.",
      "It never holds your sats or a key that can move them, and it is provided as is.",
    ] },
    { title: "Commissions", says: [
      "A commission is a contract between its client and its professional, under the Standard Terms, and CommissionMarket is no party to it.",
      "CommissionMarket is not liable for any commission, for what anyone in it does or leaves undone, or for a Mint, a Lightning wallet or the network.",
      "An Arbiter or an Inspector acts for neither party, and is chosen by the parties.",
    ] },
    { title: "Escrow", says: [
      "An escrow is held by the Cashu mint its cover page names, locked to the keys of the client, the professional and the Arbiter.",
      "CommissionMarket controls no mint, and a mint that fails may lose what it holds.",
    ] },
    { title: "Your data", says: [
      "A commission's words, grades, sats and signatures are stored encrypted.",
      "Its ids, npubs, state and dates are stored in the clear, so it can be found and listed.",
      "Only the npubs a commission names see it, and a reputation counts what each npub has done, for anyone to read.",
    ] },
    { title: "Acceptable use", says: [
      "Post only commissions you may lawfully offer, and deal honestly with the people you invite.",
      "The operator may remove a posting or refuse service.",
    ] },
  ],
});

export default function TermsOfUse() {
  const t = useT();
  return (
    <div className="page grid gap-3">
      <Page
        heading={t("termsOfUse.title")}
        sections={SECTIONS}
        classNames={{
          root: "grid gap-3", header: "card panel grid gap-1", heading: "page-title",
          sections: "tou-sections", section: "card panel tou-section", title: "panel-title", line: "text-sm mt-1",
        }}
      />
      <p className="muted text-sm text-right">
        <Link to="/terms" className="ent">{t("termsOfUse.standardTerms")}</Link>
      </p>
    </div>
  );
}
