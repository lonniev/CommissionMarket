/** For a guest: what CommissionMarket is in a line, three reasons, and the way in. */

import { Link } from "react-router-dom";
import { ArrowRight, FileSignature, Landmark, Users, Zap, type LucideIcon } from "lucide-react";
import { useT } from "../i18n";
import type { MessageKey } from "../i18n/en";

const CARDS: { icon: LucideIcon; title: MessageKey; says: MessageKey }[] = [
  { icon: FileSignature, title: "home.card.signed.title", says: "home.card.signed.says" },
  { icon: Zap, title: "home.card.ahead.title", says: "home.card.ahead.says" },
  { icon: Users, title: "home.card.circle.title", says: "home.card.circle.says" },
];

export default function Home() {
  const t = useT();
  return (
    <div className="page grid gap-4">
      <section className="hero card grid gap-3">
        <h1 className="hero-title">{t("app.tagline")}</h1>
        <p className="hero-lines">{t("home.lead")}</p>
        <div className="flex flex-wrap justify-end gap-2">
          <Link to="/guide" className="btn btn-quiet">{t("home.howItWorks")}<ArrowRight size={18} aria-hidden /></Link>
          <Link to="/signin" className="btn btn-go">{t("home.start")}</Link>
        </div>
      </section>

      <ul className="home-cards">
        {CARDS.map(({ icon: Icon, title, says }) => (
          <li key={title} className="card panel home-card">
            <Icon size={26} aria-hidden className="home-card-mark" />
            <h2 className="panel-title">{t(title)}</h2>
            <p className="muted">{t(says)}</p>
          </li>
        ))}
      </ul>

      <p className="flex flex-wrap justify-end gap-x-4 gap-y-2">
        <Link to="/learn" className="ent">{t("nav.learn")}</Link>
        <Link to="/terms" className="ent inline-flex items-center gap-1"><Landmark size={16} aria-hidden />{t("home.readTerms")}</Link>
      </p>
    </div>
  );
}
