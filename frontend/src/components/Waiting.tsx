/** A wait worth reading: the status line, then a quotation on patrons, commissions, craftsmen and contracts. */

import { QuoteScroller } from "@tollbooth-dpyc/web/react";
import { useQuotes } from "../lib/content";

export default function Waiting({ heading }: { heading: string }) {
  const quotes = useQuotes();
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
