/** An amount in sats, with what it is worth today in the reader's currency beside it. */

import { formatSats } from "@tollbooth-dpyc/web";
import { useLanguageLocale } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import { useFiat } from "../lib/FiatContext";
import { fiatOf } from "../lib/money";

export function useWorth(): (sats: number) => string {
  const { fiat, price } = useFiat();
  const locale = useLanguageLocale();
  return (sats) => {
    if (price === null) return "";
    const value = fiatOf(sats, price);
    return new Intl.NumberFormat(locale, {
      style: "currency", currency: fiat, maximumFractionDigits: value >= 100 || fiat === "JPY" ? 0 : 2,
    }).format(value);
  };
}

export default function Sats({ sats, big = false }: { sats: number; big?: boolean }) {
  const t = useT();
  const worth = useWorth()(sats);
  return (
    <span className={big ? "sats sats-big" : "sats"}>
      <span className="num">{t("sats.amount", { sats: formatSats(sats) })}</span>
      {worth && <span className="sats-worth num" title={t("sats.worthToday")}>≈ {worth}</span>}
    </span>
  );
}
