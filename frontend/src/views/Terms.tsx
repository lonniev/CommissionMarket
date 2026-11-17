/**
 * The Standard Terms, readable by anyone, signed in or not. The text is shown
 * exactly as Task Booth keeps it, in English: its sha256 is over these words,
 * and every cover page names that hash.
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { standardTerms, type StandardTerms } from "../lib/tasks";

export default function Terms() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const version = params.get("version") ?? "";
  const [terms, setTerms] = useState<StandardTerms | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    let live = true;
    setTerms(null);
    standardTerms(version).then((r) => live && setTerms(r)).catch((e) => live && setProblem((e as Error).message));
    return () => { live = false; };
  }, [version]);

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
      <section className="card panel">
        {problem && <p className="error">{problem}</p>}
        {!terms && !problem && <Waiting heading={t("waiting.fetchingTerms")} />}
        {terms && <pre className="terms-text" lang="en">{terms.text}</pre>}
      </section>
    </div>
  );
}
