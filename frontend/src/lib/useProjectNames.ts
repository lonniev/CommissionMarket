/**
 * The names of the Projects these commissions are filed under, for the ones the
 * reader may see: one read of their Organizations, then one of each Organization
 * the commissions name. A professional outside an Organization sees no name.
 */

import { useEffect, useState } from "react";
import { getOrg, listOrgs } from "./orgs";

export function useProjectNames(tasks: { org_id: string; project_id: string }[] | null): Map<string, string> {
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const wanted = [...new Set((tasks ?? []).map((t) => t.org_id).filter(Boolean))].sort().join(",");

  useEffect(() => {
    if (!wanted) return;
    let live = true;
    (async () => {
      const mine = new Set((await listOrgs()).map((o) => o.org_id));
      const found = new Map<string, string>();
      for (const orgId of wanted.split(",").filter((id) => mine.has(id))) {
        for (const p of (await getOrg(orgId)).projects) found.set(p.project_id, p.name);
      }
      if (live) setNames(found);
    })().catch(() => { /* names are a nicety; the list stands without them */ });
    return () => { live = false; };
  }, [wanted]);

  return names;
}
