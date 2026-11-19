/**
 * Where a new commission is filed: a Project in an Organization you are in. A commission is
 * always filed in one, so the form opens only once a Project is chosen.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, FolderOpen, Plus } from "lucide-react";
import { useT } from "../i18n";
import { getOrg, listOrgs, type OrgDetail } from "../lib/orgs";
import { orgHref } from "./Person";
import Waiting from "./Waiting";

export default function ProjectPicker() {
  const t = useT();
  const [orgs, setOrgs] = useState<OrgDetail[] | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const mine = await listOrgs();
        const detail = await Promise.all(mine.map((o) => getOrg(o.org_id)));
        if (live) setOrgs(detail);
      } catch (e) {
        if (live) setProblem((e as Error).message);
      }
    })();
    return () => { live = false; };
  }, []);

  const filed = (orgs ?? []).map((o) => ({ org: o, projects: o.projects.filter((p) => !p.archived) }));
  const any = filed.some((f) => f.projects.length);

  return (
    <div className="page grid gap-3">
      <h1 className="page-title">{t("filing.title")}</h1>
      <p className="muted">{t("filing.says")}</p>
      {problem && <p className="error">{problem}</p>}
      {!orgs && !problem && <Waiting heading={t("waiting.fetchingList")} />}
      {filed.filter((f) => f.projects.length).map(({ org, projects }) => (
        <section key={org.org_id} className="card panel grid gap-2">
          <h2 className="panel-title flex items-center gap-2">
            <Building2 size={18} aria-hidden /><Link to={orgHref(org.org_id)} className="ent">{org.name}</Link>
          </h2>
          <div className="flex flex-wrap gap-2">
            {projects.map((p) => (
              <Link key={p.project_id} to={`/commissions/new?project=${encodeURIComponent(p.project_id)}`} className="chip">
                <FolderOpen size={16} aria-hidden />{p.name}
              </Link>
            ))}
          </div>
        </section>
      ))}
      {orgs && !any && (
        <section className="card panel grid gap-2">
          <p>{orgs.length ? t("filing.noProjects") : t("filing.noOrgs")}</p>
          <div className="actions-row">
            <Link to="/orgs" className="btn btn-go"><Plus size={18} aria-hidden />{t("filing.toOrgs")}</Link>
          </div>
        </section>
      )}
    </div>
  );
}
