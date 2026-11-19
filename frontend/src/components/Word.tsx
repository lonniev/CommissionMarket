/**
 * A word of CommissionMarket's, defined in place: tap it, and its meaning from
 * the glossary opens under it, with the clause of the Standard Terms that
 * governs it. The disclosure is the package's `Term`; the words are the
 * site's, in the reader's language.
 *
 *   <Word of="deposit" />                  the word, as the glossary names it
 *   <Word of="deposit">deposits</Word>     the same word, in the sentence's own words
 *   <Word of="deposit" badge />            a bare ⓘ beside a label already on screen
 *
 * Inside a translated sentence: `components={{ deposit: <Word of="deposit" /> }}`,
 * and `Tx` hands it the words between the tags.
 */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Term } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import { clauseHref } from "../lib/clauses";
import { useGlossary } from "../lib/content";
import type { GlossaryKey } from "../lib/glossary";

const LOOK = { word: "term-word", badge: "term-badge", panel: "term-panel", extra: "term-extra" };

export default function Word({ of, badge = false, align, children, more }: {
  of: GlossaryKey;
  badge?: boolean;
  align?: "left" | "right";
  children?: ReactNode;
  /** What this page adds under the shared meaning. */
  more?: ReactNode;
}) {
  const t = useT();
  const entry = useGlossary().define(of);
  if (!entry) return <>{children}</>;
  const said = (
    <>
      <strong className="term-name">{entry.term}</strong>
      {entry.said}
      {entry.clause && <> <Link to={clauseHref(entry.clause)} className="ent">§{entry.clause}</Link></>}
    </>
  );
  return (
    <Term label={badge ? undefined : (children ?? entry.term)} said={said} align={align} badgeLabel={t("glossary.whatItMeans", { term: entry.term })}
      classNames={LOOK}>
      {more}
    </Term>
  );
}
