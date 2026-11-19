/** One line saying how an npub has done in one role, linked to their reputation: "⚖️ Arbiter · Trusted · 12 finished". */

import { Link } from "react-router-dom";
import { useT } from "../i18n";
import { isNpub } from "../lib/cover";
import { standingIn, type RepRole } from "../lib/reputation";
import { useReputation } from "../lib/useReputation";
import { personHref } from "./Person";

export const ROLE_MARK: Record<RepRole, string> = { client: "🧑‍💼", artist: "🎨", arbiter: "⚖️", inspector: "🔍" };

export default function RankLine({ npub, role }: { npub: string; role: RepRole }) {
  const t = useT();
  const valid = isNpub(npub);
  const { rep } = useReputation(valid ? npub : "");
  if (!valid || !rep) return null;
  const { rank, finished } = standingIn(rep, role);
  return (
    <Link to={personHref(npub)} className="rank-line">
      <span aria-hidden>{ROLE_MARK[role]}</span>
      <span>{t(`rep.role.${role}`)}</span>
      <span className={`rank-badge rank-${rank}`}>{t(`rep.rank.${rank}`)}</span>
      {rank !== "none" && <span className="muted">{t("rep.finished", { count: finished })}</span>}
    </Link>
  );
}
