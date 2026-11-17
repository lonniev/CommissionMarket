/** For a guest: what CommissionMarket is, how a commission runs, and the way in. */

import { Link } from "react-router-dom";
import { BadgeCheck, FilePen, FileSignature, Hand, Landmark, PackageCheck, Scale, Zap, type LucideIcon } from "lucide-react";
import { useT } from "../i18n";
import type { MessageKey } from "../i18n/en";

const STEPS: { icon: LucideIcon; key: MessageKey }[] = [
  { icon: FilePen, key: "home.step.post" },
  { icon: FileSignature, key: "home.step.sign" },
  { icon: Hand, key: "home.step.claim" },
  { icon: Zap, key: "home.step.ahead" },
  { icon: PackageCheck, key: "home.step.deliver" },
  { icon: Scale, key: "home.step.grade" },
  { icon: BadgeCheck, key: "home.step.paid" },
];

export default function Home() {
  const t = useT();
  return (
    <div className="page grid gap-4">
      <section className="hero card panel grid gap-3">
        <h1 className="hero-title">{t("app.tagline")}</h1>
        <p className="hero-lines">{t("home.lead")}</p>
        <div className="flex flex-wrap gap-2">
          <Link to="/signin" className="btn btn-go">{t("home.start")}</Link>
          <Link to="/terms" className="btn btn-quiet"><Landmark size={18} aria-hidden />{t("home.readTerms")}</Link>
        </div>
      </section>

      <section className="card panel grid gap-3">
        <h2 className="section-title">{t("home.howTitle")}</h2>
        <ol className="steps">
          {STEPS.map(({ icon: Icon, key }, i) => (
            <li key={key} className="step">
              <span className="step-mark"><span className="num">{i + 1}</span><Icon size={18} aria-hidden /></span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card panel grid gap-2">
        <h2 className="section-title">{t("home.whyTitle")}</h2>
        <ul className="points">
          <li>{t("home.why.direct")}</li>
          <li>{t("home.why.signed")}</li>
          <li>{t("home.why.ahead")}</li>
          <li>{t("home.why.circle")}</li>
        </ul>
      </section>
    </div>
  );
}
