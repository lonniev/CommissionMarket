/**
 * The currency a reader thinks in, and what one bitcoin costs in it.
 *
 * A commission is priced in sats; this only shows what that is worth today.
 * The reader picks the currency on their Profile; until then it follows the
 * language. The price is Task Booth's free `btc_price`, read once a page load.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLanguage } from "@tollbooth-dpyc/web/react";
import { btcPrice } from "./tasks";

export const FIATS = ["USD", "EUR", "GBP", "CAD", "CHF", "AUD", "JPY"] as const;
export type Fiat = (typeof FIATS)[number];

const KEPT = "commission:fiat";

const BY_LANGUAGE: Record<string, Fiat> = { fr: "EUR", es: "EUR", ja: "JPY" };

function keptFiat(): Fiat | null {
  try {
    const kept = localStorage.getItem(KEPT);
    return FIATS.includes(kept as Fiat) ? (kept as Fiat) : null;
  } catch {
    return null;
  }
}

interface FiatState {
  fiat: Fiat;
  /** What one bitcoin costs in `fiat`, once read. */
  price: number | null;
  choose: (fiat: Fiat) => void;
}

const FiatContext = createContext<FiatState>({ fiat: "USD", price: null, choose: () => {} });

export function FiatProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [chosen, setChosen] = useState<Fiat | null>(keptFiat);
  const fiat = chosen ?? BY_LANGUAGE[language] ?? "USD";
  const [prices, setPrices] = useState<Partial<Record<Fiat, number>>>({});

  useEffect(() => {
    if (prices[fiat] !== undefined) return;
    let live = true;
    btcPrice(fiat)
      .then((r) => live && setPrices((p) => ({ ...p, [fiat]: r.price })))
      .catch(() => {});
    return () => { live = false; };
  }, [fiat, prices]);

  function choose(next: Fiat) {
    setChosen(next);
    try {
      localStorage.setItem(KEPT, next);
    } catch {
      // A private window keeps the choice for this visit only.
    }
  }

  return <FiatContext.Provider value={{ fiat, price: prices[fiat] ?? null, choose }}>{children}</FiatContext.Provider>;
}

export const useFiat = () => useContext(FiatContext);
