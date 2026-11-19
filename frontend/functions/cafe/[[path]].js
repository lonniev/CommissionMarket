// Cloudflare Pages Function: /cafe/… → the Good Brew café's public catalog, for the shelf.
// Only the two catalog reads pass (see the package's makeCafeProxy); orders are placed at the café.
import { makeCafeProxy } from "@tollbooth-dpyc/web/pages-proxy";

export const onRequestGet = makeCafeProxy("CommissionMarket-Catalog/1.0 (+https://commissionmarket.tollbooth-dpyc.com)");
