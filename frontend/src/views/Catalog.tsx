/** The Good Brew café's collections that CommissionMarket offers, and what each holds, read live. Orders are placed at the café. */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { CAFE_URL, PRODUCT_PAGE_SIZE } from "@tollbooth-dpyc/web";
import { PageControls, tourTarget, useTour } from "@tollbooth-dpyc/web/react";
import { CollectionTile } from "../components/Cafe";
import Waiting from "../components/Waiting";
import { useT } from "../i18n";
import { useCollections, useProducts } from "../lib/cafe";

const out = { target: "_blank", rel: "noopener noreferrer" } as const;

function Trouble({ text }: { text: string }) {
  const t = useT();
  return <p className="card panel">{text} <a href={CAFE_URL} {...out} className="ent">{t("cafe.visit")}</a></p>;
}

export default function Catalog() {
  const t = useT();
  const { found, failed } = useCollections();
  useTour("catalog", { ready: !!found?.length });
  return (
    <div className="page grid gap-4">
      <header className="card panel flex flex-wrap items-center gap-3">
        <div className="grid min-w-0 flex-1 basis-72 gap-1">
          <h1 className="page-title">{t("cafe.title")}</h1>
          <p className="muted">{t("cafe.lead")}</p>
        </div>
        <a href={CAFE_URL} {...out} className="chip chip-accent" {...tourTarget("catalog.visit")}>{t("cafe.visit")} <ExternalLink size={14} aria-hidden /></a>
      </header>
      {failed && <Trouble text={t("cafe.shelvesFailed")} />}
      {!found && <div className="card panel"><Waiting heading={t("cafe.reading")} /></div>}
      {found && found.length > 0 && (
        <div className="cafe-grid" {...tourTarget("catalog.shelves")}>
          {found.map((c) => <CollectionTile key={c.handle} c={c} />)}
        </div>
      )}
    </div>
  );
}

export function CatalogCollection() {
  const t = useT();
  const { handle = "" } = useParams();
  const { found } = useCollections();
  const [page, setPage] = useState(0);
  const { products, failed } = useProducts(handle, page);
  const collection = found?.find((c) => c.handle === handle);
  const controls = { root: "flex flex-wrap items-center justify-center gap-2", chip: "chip", label: "px-2" };
  return (
    <div className="page grid gap-4">
      <header className="card panel flex flex-wrap items-center gap-3">
        <div className="grid min-w-0 flex-1 basis-80 gap-1">
          <Link to="/catalog" className="ent text-sm">{t("cafe.title")}</Link>
          <h1 className="page-title">{collection?.title ?? handle}</h1>
          {collection?.says && <p className="muted">{collection.says}</p>}
        </div>
        <a href={collection?.url ?? `${CAFE_URL}/collections/${handle}`} {...out} className="chip chip-accent">
          {t("cafe.shop")} <ExternalLink size={14} aria-hidden />
        </a>
      </header>
      {failed && <Trouble text={t("cafe.collectionFailed")} />}
      {!products && !failed && <div className="card panel"><Waiting heading={t("cafe.readingCollection")} /></div>}
      {products && (
        <div className="cafe-grid cafe-grid-products">
          {products.map((p) => (
            <a key={p.handle} href={p.url} {...out} className="card cafe-tile">
              {p.image ? <img src={p.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="cafe-tile-image" /> : <span className="cafe-tile-image cafe-tile-blank" />}
              <span className="grid gap-0.5 p-3">
                <span className="font-semibold">{p.title}</span>
                {p.kind && <span className="muted text-sm">{p.kind}</span>}
              </span>
            </a>
          ))}
        </div>
      )}
      {collection && (
        <div className="card panel">
          <PageControls page={page} pageSize={PRODUCT_PAGE_SIZE} total={collection.count} onPage={setPage} hideSinglePage classNames={controls} />
        </div>
      )}
    </div>
  );
}
