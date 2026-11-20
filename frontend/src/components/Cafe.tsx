/** The Good Brew café on a page about something else: a few of its collections, each opening here. */

import { Link } from "react-router-dom";
import { Coffee } from "lucide-react";
import type { CafeCollection } from "@tollbooth-dpyc/web";
import { useT } from "../i18n";
import { useCollections } from "../lib/cafe";

export function CollectionTile({ c }: { c: CafeCollection }) {
  return (
    <Link to={`/catalog/${c.handle}`} className="card cafe-tile">
      {c.image
        ? <img src={c.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="cafe-tile-image" />
        : <span className="cafe-tile-image cafe-tile-blank"><Coffee size={40} aria-hidden /></span>}
      <span className="grid content-start gap-1 p-4">
        <span className="panel-title">{c.title}</span>
        {c.says && <span className="muted text-sm cafe-tile-says">{c.says}</span>}
      </span>
    </Link>
  );
}

export function CafeShelf({ count }: { count: number }) {
  const t = useT();
  const { found } = useCollections();
  if (!found?.length) return null;
  return (
    <section className="grid gap-3">
      <div className="card panel flex flex-wrap items-center gap-3">
        <div className="grid min-w-0 flex-1 basis-72 gap-1">
          <h2 className="panel-title"><span aria-hidden>☕</span> {t("cafe.shelfTitle")}</h2>
          <p className="muted">{t("cafe.shelfSays")}</p>
        </div>
        <Link to="/catalog" className="chip">{t("cafe.whole")}</Link>
      </div>
      <div className="cafe-grid">
        {found.slice(0, count).map((c) => <CollectionTile key={c.handle} c={c} />)}
      </div>
    </section>
  );
}
