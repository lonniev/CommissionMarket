/** Your Organizations: the ones you own and the ones you belong to, and a way to make one. */

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { orgHref } from "../components/Person";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { listOrgs, saveOrg, type Org } from "../lib/orgs";

function NewOrg({ onCancel }: { onCancel: () => void }) {
  const t = useT();
  const go = useNavigate();
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  async function make() {
    if (!name.trim()) return setProblem(t("org.needName"));
    setBusy(true);
    setProblem("");
    try {
      go(orgHref(await saveOrg(name.trim(), about.trim())));
    } catch (e) {
      setProblem((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <section className="card panel grid gap-3">
      <h2 className="panel-title">{t("org.new")}</h2>
      <label className="grid gap-1">
        <span className="label">{t("org.name")}</span>
        <input className="field" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder={t("org.namePlaceholder")} autoFocus />
      </label>
      <label className="grid gap-1">
        <span className="label">{t("org.about")}</span>
        <textarea className="field" rows={2} value={about} maxLength={1000} onChange={(e) => setAbout(e.target.value)} placeholder={t("org.aboutPlaceholder")} />
      </label>
      <p className="muted text-sm">{t("org.youOwn")}</p>
      {problem && <p className="error text-right">{problem}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className="btn btn-quiet" onClick={onCancel}>{t("actions.cancel")}</button>
        <button type="button" className="btn btn-go" disabled={busy} onClick={() => void make()}>{t("org.make")}</button>
      </div>
    </section>
  );
}

export default function Orgs() {
  const t = useT();
  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const [problem, setProblem] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setProblem("");
    try {
      setOrgs(await listOrgs());
    } catch (e) {
      setProblem((e as Error).message);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return (
    <div className="page grid gap-3">
      <div className="toolbar">
        <h1 className="page-title">{t("nav.orgs")}</h1>
        <div className="toolbar-actions">
          <button type="button" className="icon-btn" onClick={() => void load()} aria-label={t("actions.lookAgain")} title={t("actions.lookAgain")}>
            <RefreshCw size={18} aria-hidden />
          </button>
          {!adding && <button type="button" className="btn btn-go" onClick={() => setAdding(true)}><Plus size={18} aria-hidden />{t("org.new")}</button>}
        </div>
      </div>
      <p className="muted">{t("org.lead")}</p>
      {adding && <NewOrg onCancel={() => setAdding(false)} />}
      {problem && <p className="card panel error">{problem}</p>}
      {!orgs && !problem && <div className="card panel"><Waiting heading={t("waiting.fetchingOrgs")} /></div>}
      {orgs && !orgs.length && !adding && <p className="card panel muted">{t("org.none")}</p>}
      {orgs && orgs.length > 0 && (
        <ul className="card-list">
          {orgs.map((o) => (
            <li key={o.org_id}>
              <Link to={orgHref(o.org_id)} className="card panel org-card">
                <Building2 size={22} aria-hidden className="org-mark" />
                <div className="grid gap-0.5 min-w-0">
                  <span className="row-title">{o.name}</span>
                  {o.about && <span className="muted text-sm">{o.about}</span>}
                </div>
                <span className="badge">{t(`org.place.${o.your_place}`)}</span>
                <ChevronRight size={18} aria-hidden className="muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
