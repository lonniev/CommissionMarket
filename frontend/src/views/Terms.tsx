/**
 * The Standard Terms, readable by anyone, signed in or not. The text is shown
 * exactly as Task Booth keeps it, in English: its sha256 is over these words,
 * and every cover page names that hash. The page only lays the words out:
 * contents, numbered clauses, linked section references, and the exact text
 * one tap away.
 */

import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { anchorFor, clausePieces, layoutTerms, type Section } from "../lib/termsLayout";
import { standardTerms, type StandardTerms } from "../lib/tasks";

function Clause({ text }: { text: string }) {
  return (
    <>
      {clausePieces(text).map((p, i) =>
        p.kind === "ref" ? <a key={i} href={`#${p.target}`}>{p.text}</a>
          : p.kind === "defined" ? <strong key={i}>{p.text}</strong>
            : <span key={i}>{p.text}</span>)}
    </>
  );
}

function TermsSection({ section }: { section: Section }) {
  return (
    <section id={anchorFor(section.number)} className="terms-section" aria-labelledby={`${anchorFor(section.number)}-h`}>
      <h2 id={`${anchorFor(section.number)}-h`} className="terms-heading">
        <span className="terms-badge">{section.number}</span>
        {section.heading}
      </h2>
      <ol className="terms-clauses">
        {section.clauses.map((c) => (
          <li key={c.number} id={anchorFor(c.number)} className="terms-clause">
            <a href={`#${anchorFor(c.number)}`} className="terms-number">{c.number}</a>
            <span><Clause text={c.text} /></span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Terms() {
  const t = useT();
  const { hash } = useLocation();
  const [params, setParams] = useSearchParams();
  const version = params.get("version") ?? "";
  const [terms, setTerms] = useState<StandardTerms | null>(null);
  const [problem, setProblem] = useState("");
  const layout = useMemo(() => (terms ? layoutTerms(terms.text) : null), [terms]);

  useEffect(() => {
    let live = true;
    setTerms(null);
    standardTerms(version).then((r) => live && setTerms(r)).catch((e) => live && setProblem((e as Error).message));
    return () => { live = false; };
  }, [version]);

  // A link to a clause (/terms#t-6-16) lands on it once the words arrive.
  useEffect(() => {
    if (layout && hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [layout, hash]);

  return (
    <div className="page grid gap-3">
      <section className="card panel grid gap-2">
        <h1 className="page-title">{t("terms.title")}</h1>
        <p className="muted">{t("terms.says")}</p>
        {terms && (
          <dl className="facts text-sm">
            <dt>{t("terms.version")}</dt>
            <dd>
              {(terms.versions ?? [terms.version]).length > 1
                ? (
                  <select className="field" value={terms.version} onChange={(e) => setParams({ version: e.target.value })}>
                    {(terms.versions ?? []).map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                )
                : terms.version}
            </dd>
            <dt>sha256</dt><dd><code className="hash">{terms.hash}</code></dd>
          </dl>
        )}
      </section>
      {problem && <section className="card panel"><p className="error">{problem}</p></section>}
      {!terms && !problem && <section className="card panel"><Waiting heading={t("waiting.fetchingTerms")} /></section>}
      {terms && layout && (
        <>
          <nav className="card panel grid gap-2" aria-label={t("terms.contents")}>
            <h2 className="section-title">{t("terms.contents")}</h2>
            <ol className="terms-contents" lang="en">
              {layout.sections.map((s) => (
                <li key={s.number}>
                  <a href={`#${anchorFor(s.number)}`}><span className="terms-badge">{s.number}</span>{s.heading}</a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="card panel terms-body" lang="en">
            <p className="terms-doc-title">{layout.title}</p>
            {layout.sections.map((s) => <TermsSection key={s.number} section={s} />)}
          </article>
        </>
      )}
      {terms && (
        layout
          ? (
            <details className="card panel statement">
              <summary>{t("terms.exact")}</summary>
              <pre className="statement-text" lang="en">{terms.text}</pre>
            </details>
          )
          : <section className="card panel"><pre className="terms-text" lang="en">{terms.text}</pre></section>
      )}
    </div>
  );
}
