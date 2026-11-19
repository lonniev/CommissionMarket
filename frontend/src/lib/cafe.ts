/**
 * What CommissionMarket shows of the Good Brew café: the collections it offers,
 * in its order, read live through `/cafe` (functions/cafe). The reading is the
 * package's; orders are placed at the café, never here.
 */

import { useEffect, useState } from "react";
import { cafeCollections, cafeProducts, type CafeCollection, type CafeProduct } from "@tollbooth-dpyc/web";

/** MCPs, the network's own goods, the bookshop, and consultations. */
export const OFFERED = ["mcps", "dpyc-merch", "books", "advice"] as const;

/** The offered collections: null while reading, [] when the café could not be read. */
export function useCollections(): { found: CafeCollection[] | null; failed: boolean } {
  const [found, setFound] = useState<CafeCollection[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    cafeCollections(OFFERED).then((c) => { if (live) setFound(c); }, () => { if (live) { setFound([]); setFailed(true); } });
    return () => { live = false; };
  }, []);
  return { found, failed };
}

/** One page of a collection's products. */
export function useProducts(handle: string, page: number): { products: CafeProduct[] | null; failed: boolean } {
  const [products, setProducts] = useState<CafeProduct[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    setProducts(null);
    setFailed(false);
    cafeProducts(handle, page).then((p) => { if (live) setProducts(p); }, () => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [handle, page]);
  return { products, failed };
}
