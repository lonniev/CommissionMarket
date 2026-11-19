/** The words CommissionMarket uses, grouped, with a search. The contract itself is the Standard Terms. */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Landmark } from "lucide-react";
import { tourTarget, useTour } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import { clauseHref } from "../lib/clauses";
import { useGlossary } from "../lib/content";

export default function Glossary() {
  const t = useT();
  const glossary = useGlossary();
  const [query, setQuery] = useState("");
  const hits = glossary.search(query);
  useTour("glossary");
  return (
    <div className="page grid gap-4">
      <header className="card panel flex flex-wrap items-center gap-3">
        <div className="grid min-w-0 flex-1 basis-72 gap-1">
          <h1 className="page-title">{t("glossary.title")}</h1>
          <p className="muted">{t("glossary.lead")}</p>
        </div>
        <input className="field w-full sm:w-72" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={t("glossary.search")} aria-label={t("glossary.search")} {...tourTarget("glossary.search")} />
      </header>
      {hits.length === 0 && <p className="card panel muted">{t("glossary.none")}</p>}
      {glossary.groups.map((group) => {
        const entries = hits.filter((e) => e.group === group.id);
        if (!entries.length) return null;
        return (
          <section key={group.id} className="grid gap-3" {...(group.id === "people" ? tourTarget("glossary.group") : {})}>
            <h2 className="section-title">{group.title}</h2>
            <div className="glossary-grid">
              {entries.map((e) => (
                <article key={e.key} id={`w-${e.key}`} className="card panel grid gap-1">
                  <h3 className="panel-title">{e.term}</h3>
                  {e.aka && e.aka.length > 0 && <p className="muted text-sm">{e.aka.join(" · ")}</p>}
                  <p>{e.said}</p>
                  {e.clause && (
                    <p className="text-right text-sm">
                      <Link to={clauseHref(e.clause)} className="ent">{t("glossary.clause", { clause: e.clause })}</Link>
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}
      <p className="flex flex-wrap justify-end gap-2">
        <Link to="/terms" className="btn btn-quiet"><Landmark size={18} aria-hidden />{t("glossary.toTerms")}</Link>
      </p>
    </div>
  );
}
