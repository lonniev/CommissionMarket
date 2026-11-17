/** How a commission runs, in seven steps, then the wallet you need and what is good to know. */

import { Link } from "react-router-dom";
import { BadgeCheck, FilePen, FileSignature, Hand, Landmark, PackageCheck, Scale, Zap, type LucideIcon } from "lucide-react";
import { Tx, WalletChooser } from "@tollbooth-dpyc/web/react";
import { useT, WORDS } from "../i18n";
import type { MessageKey } from "../i18n/en";

const STEPS: { icon: LucideIcon; title: MessageKey; says: MessageKey }[] = [
  { icon: FilePen, title: "guide.step.post.title", says: "guide.step.post.says" },
  { icon: FileSignature, title: "guide.step.sign.title", says: "guide.step.sign.says" },
  { icon: Hand, title: "guide.step.claim.title", says: "guide.step.claim.says" },
  { icon: Zap, title: "guide.step.ahead.title", says: "guide.step.ahead.says" },
  { icon: PackageCheck, title: "guide.step.deliver.title", says: "guide.step.deliver.says" },
  { icon: Scale, title: "guide.step.grade.title", says: "guide.step.grade.says" },
  { icon: BadgeCheck, title: "guide.step.paid.title", says: "guide.step.paid.says" },
];

export default function Guide() {
  const t = useT();
  return (
    <div className="page grid gap-4">
      <h1 className="page-title">{t("guide.title")}</h1>
      <ol className="step-cards">
        {STEPS.map(({ icon: Icon, title, says }, i) => (
          <li key={title} className="card panel step-card">
            <span className="step-badge" aria-hidden><Icon size={22} /><span className="num">{i + 1}</span></span>
            <div className="grid gap-1">
              <h2 className="panel-title">{t(title)}</h2>
              <p className="muted">{t(says)}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="card panel grid gap-2" id="wallet">
        <h2 className="panel-title"><span aria-hidden>👛</span> {t("guide.wallet.title")}</h2>
        <p>{t("guide.wallet.lightning")}</p>
        <p>{t("guide.wallet.keys")}</p>
        <p className="muted">{t("guide.wallet.apiSats")}</p>
        <div className="flex flex-wrap justify-end gap-2">
          <WalletChooser className="btn btn-go wallet-door" />
        </div>
      </section>

      <section className="card panel grid gap-2">
        <h2 className="panel-title"><span aria-hidden>🧭</span> {t("guide.know.title")}</h2>
        <p>{t("guide.know.npub")}</p>
        <p>{t("guide.know.circle")}</p>
        <p>{t("guide.know.direct")}</p>
        <p><Tx ns={WORDS} k="guide.know.terms" components={{ terms: <Link to="/terms" className="ent">{t("nav.terms")}</Link> }} /></p>
        <p><Tx ns={WORDS} k="guide.know.learn" components={{ learn: <Link to="/learn" className="ent">{t("nav.learn")}</Link> }} /></p>
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        <Link to="/terms" className="btn btn-quiet"><Landmark size={18} aria-hidden />{t("home.readTerms")}</Link>
        <Link to="/commissions" className="btn btn-go">{t("guide.go")}</Link>
      </div>
    </div>
  );
}
