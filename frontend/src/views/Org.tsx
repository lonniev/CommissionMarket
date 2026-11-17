/** One Organization: what it is, its members, and its Projects. Its owner changes them; its members see them. */

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, FolderOpen, Pencil, Plus, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { Person, projectHref } from "../components/Person";
import ProjectForm from "../components/ProjectForm";
import Sats from "../components/Sats";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { audienceFrom } from "../lib/cover";
import { getOrg, removeMember, saveMember, saveOrg, type OrgDetail } from "../lib/orgs";

function About({ org, onChanged }: { org: OrgDetail; onChanged: () => void }) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(org.name);
  const [about, setAbout] = useState(org.about);
  const [problem, setProblem] = useState("");
  const owner = org.your_place === "owner";

  async function save() {
    if (!name.trim()) return setProblem(t("org.needName"));
    try {
      await saveOrg(name.trim(), about.trim(), org.org_id);
      setEditing(false);
      onChanged();
    } catch (e) {
      setProblem((e as Error).message);
    }
  }

  if (editing) {
    return (
      <section className="card panel grid gap-3">
        <label className="grid gap-1"><span className="label">{t("org.name")}</span>
          <input className="field" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} /></label>
        <label className="grid gap-1"><span className="label">{t("org.about")}</span>
          <textarea className="field" rows={2} value={about} maxLength={1000} onChange={(e) => setAbout(e.target.value)} /></label>
        {problem && <p className="error text-right">{problem}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-quiet" onClick={() => setEditing(false)}>{t("actions.cancel")}</button>
          <button type="button" className="btn btn-go" onClick={() => void save()}>{t("form.save")}</button>
        </div>
      </section>
    );
  }
  return (
    <div className="toolbar">
      <div className="grid gap-1 min-w-0">
        <h1 className="page-title">{org.name}</h1>
        {org.about && <p className="muted">{org.about}</p>}
        <p className="muted text-sm flex flex-wrap items-center gap-2">{t("org.ownedBy")} <Person npub={org.owner} /></p>
      </div>
      {owner && (
        <div className="toolbar-actions">
          <button type="button" className="icon-btn" onClick={() => setEditing(true)} aria-label={t("org.rename")} title={t("org.rename")}>
            <Pencil size={18} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

function Members({ org, onChanged }: { org: OrgDetail; onChanged: () => void }) {
  const t = useT();
  const owner = org.your_place === "owner";
  const [npub, setNpub] = useState("");
  const [label, setLabel] = useState("");
  const [sure, setSure] = useState("");
  const [problem, setProblem] = useState("");

  async function add() {
    setProblem("");
    const who = audienceFrom(npub);
    if ("problem" in who || who.audience.length !== 1) return setProblem(t("org.oneNpub"));
    try {
      await saveMember(org.org_id, who.audience[0], label.trim());
      setNpub("");
      setLabel("");
      onChanged();
    } catch (e) {
      setProblem((e as Error).message);
    }
  }

  async function remove(member: string) {
    try {
      await removeMember(org.org_id, member);
      setSure("");
      onChanged();
    } catch (e) {
      setProblem((e as Error).message);
    }
  }

  return (
    <section className="card panel grid gap-3">
      <h2 className="panel-title">{t("org.members")} <span className="muted num">({org.members.length})</span></h2>
      <p className="muted text-sm">{t("org.membersHelp")}</p>
      {org.members.length > 0 && (
        <ul className="member-list">
          {org.members.map((m) => (
            <li key={m.npub}>
              <span className="grid min-w-0">
                {m.label && <span className="font-semibold">{m.label}</span>}
                <Person npub={m.npub} />
              </span>
              {owner && (sure === m.npub ? (
                <button type="button" className="btn btn-quiet" onClick={() => void remove(m.npub)}><Trash2 size={16} aria-hidden />{t("org.yesRemove")}</button>
              ) : (
                <button type="button" className="icon-btn" onClick={() => setSure(m.npub)} aria-label={t("org.remove")} title={t("org.remove")}>
                  <Trash2 size={16} aria-hidden />
                </button>
              ))}
            </li>
          ))}
        </ul>
      )}
      {owner && (
        <div className="member-add">
          <input className="field font-mono text-sm" value={npub} onChange={(e) => setNpub(e.target.value)} placeholder="npub1…" aria-label={t("org.memberNpub")}
            autoCapitalize="none" spellCheck={false} />
          <input className="field" value={label} maxLength={80} onChange={(e) => setLabel(e.target.value)} placeholder={t("org.labelPlaceholder")} aria-label={t("org.label")} />
          <button type="button" className="btn btn-go" onClick={() => void add()}><UserPlus size={18} aria-hidden />{t("org.add")}</button>
        </div>
      )}
      {problem && <p className="error text-right">{problem}</p>}
    </section>
  );
}

export default function Org() {
  const { orgId = "" } = useParams();
  const t = useT();
  const go = useNavigate();
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [problem, setProblem] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setProblem("");
    try {
      setOrg(await getOrg(orgId));
    } catch (e) {
      setProblem((e as Error).message);
    }
  }, [orgId]);
  useEffect(() => { void load(); }, [load]);

  return (
    <div className="page grid gap-3">
      <div className="toolbar">
        <Link to="/orgs" className="btn btn-quiet"><ArrowLeft size={18} aria-hidden />{t("nav.orgs")}</Link>
        <button type="button" className="icon-btn" onClick={() => void load()} aria-label={t("actions.lookAgain")} title={t("actions.lookAgain")}>
          <RefreshCw size={18} aria-hidden />
        </button>
      </div>
      {problem && <p className="card panel error">{problem}</p>}
      {!org && !problem && <div className="card panel"><Waiting heading={t("waiting.fetchingOrgs")} /></div>}
      {org && (
        <>
          <About key={`${org.name}|${org.about}`} org={org} onChanged={() => void load()} />
          <section className="grid gap-2">
            <div className="toolbar">
              <h2 className="section-title">{t("org.projects")} <span className="muted num">({org.projects.length})</span></h2>
              {org.your_place === "owner" && !adding && (
                <button type="button" className="btn btn-go" onClick={() => setAdding(true)}><Plus size={18} aria-hidden />{t("project.new")}</button>
              )}
            </div>
            {adding && <ProjectForm orgId={org.org_id} onSaved={(id) => go(projectHref({ org_id: org.org_id, project_id: id }))} onCancel={() => setAdding(false)} />}
            {!org.projects.length && !adding && <p className="card panel muted">{t("org.noProjects")}</p>}
            <ul className="card-list">
              {org.projects.map((p) => (
                <li key={p.project_id}>
                  <Link to={projectHref({ org_id: org.org_id, project_id: p.project_id })} className={p.archived ? "card panel org-card is-archived" : "card panel org-card"}>
                    <FolderOpen size={20} aria-hidden className="org-mark" />
                    <span className="row-title min-w-0">{p.name}</span>
                    <span className="flex flex-wrap items-center justify-end gap-2">
                      {p.archived && <span className="badge">{t("project.archived")}</span>}
                      {p.budget_sats > 0 && <Sats sats={p.budget_sats} />}
                    </span>
                    <ChevronRight size={18} aria-hidden className="muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <Members org={org} onChanged={() => void load()} />
        </>
      )}
    </div>
  );
}
