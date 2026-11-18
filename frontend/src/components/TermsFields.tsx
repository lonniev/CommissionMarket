/** The cover terms a commission and a Project's defaults share: intellectual property, the three flags, law and venue. */

import { IP_OPTIONS, type CoverRows } from "../lib/cover";
import type { IpOption } from "../lib/tasks";
import { useT } from "../i18n";

export default function TermsFields({ cover, set }: {
  cover: CoverRows;
  set: <K extends keyof CoverRows>(key: K, value: CoverRows[K]) => void;
}) {
  const t = useT();
  return (
    <>
      <div className="grid gap-2">
        <span className="label">{t("cover.ip")}</span>
        <div className="flex flex-wrap gap-2">
          {IP_OPTIONS.map((ip: IpOption) => (
            <button key={ip} type="button" className={cover.ip === ip ? "chip chip-on" : "chip"} aria-pressed={cover.ip === ip} onClick={() => set("ip", ip)}>
              {t(`cover.ip.${ip}`)}
            </button>
          ))}
        </div>
        <p className="muted text-sm">{t(`cover.ipHelp.${cover.ip}`)}</p>
        {cover.ip === "custom" && (
          <textarea className="field" rows={3} value={cover.ipCustom} onChange={(e) => set("ipCustom", e.target.value)} placeholder={t("cover.ipCustom")} />
        )}
      </div>
      <div className="grid gap-1">
        {(["confidential", "consumer", "thirdParty"] as const).map((flag) => (
          <label key={flag} className="check">
            <input type="checkbox" checked={cover[flag]} onChange={(e) => set(flag, e.target.checked)} />
            <span>{t(`cover.${flag}`)}</span>
          </label>
        ))}
      </div>
      <div className="two-up">
        <label className="grid gap-1">
          <span className="label">{t("cover.law")}</span>
          <input className="field" value={cover.law} maxLength={200} onChange={(e) => set("law", e.target.value)} placeholder={t("cover.lawPlaceholder")} />
        </label>
        <label className="grid gap-1">
          <span className="label">{t("cover.venue")}</span>
          <input className="field" value={cover.venue} maxLength={200} onChange={(e) => set("venue", e.target.value)} placeholder={t("cover.venuePlaceholder")} />
        </label>
      </div>
    </>
  );
}
