/** A wait worth reading: the status line, then a quotation, by default on patrons, commissions, craftsmen and contracts. */

import { QuoteScroller } from "@tollbooth-dpyc/web/react";
import { useQuotes } from "../lib/content";
import type { QuoteText } from "../lib/quotes";

export default function Waiting({ heading, quotes: own }: { heading: string; quotes?: QuoteText[] }) {
  const usual = useQuotes();
  const quotes = own ?? usual;
  return (
    <QuoteScroller
      quotes={quotes}
      heading={heading}
      spinner
      intervalMs={6000}
      classNames={{
        root: "waiting",
        heading: "waiting-head",
        spinner: "waiting-spin",
        figure: "waiting-figure",
        text: "waiting-text",
        mark: "waiting-mark",
        author: "waiting-author",
      }}
    />
  );
}
