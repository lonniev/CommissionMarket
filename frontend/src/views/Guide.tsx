/** Commissions, play by play: the seven steps, one portrait ending three ways, then the wallet you need and what is good to know. */

import { Link, useNavigate } from "react-router-dom";
import { BadgeCheck, FilePen, FileSignature, Hand, Landmark, MonitorPlay, PackageCheck, Scale, Zap, type LucideIcon } from "lucide-react";
import { Tx, WalletChooser, useTourReplay, useTourSwitch } from "@tollbooth-dpyc/web/react";
import { useT, WORDS } from "../i18n";
import type { MessageKey } from "../i18n/en";
import PlayByPlay from "../components/PlayByPlay";
import Word from "../components/Word";
import type { GlossaryKey } from "../lib/glossary";
import { SHOW_ME } from "../lib/tours";

const STEPS: { icon: LucideIcon; title: MessageKey; says: MessageKey; words: GlossaryKey[] }[] = [
  { icon: FilePen, title: "guide.step.post.title", says: "guide.step.post.says", words: ["cover_page", "rubric", "project"] },
  { icon: FileSignature, title: "guide.step.sign.title", says: "guide.step.sign.says", words: ["offer", "signature", "arbiter", "inspector"] },
  { icon: Hand, title: "guide.step.claim.title", says: "guide.step.claim.says", words: ["deposit", "escrow"] },
  { icon: Zap, title: "guide.step.ahead.title", says: "guide.step.ahead.says", words: ["milestone", "paid_ahead"] },
  { icon: PackageCheck, title: "guide.step.deliver.title", says: "guide.step.deliver.says", words: ["deliverable", "late_terms", "failure_point"] },
  { icon: Scale, title: "guide.step.grade.title", says: "guide.step.grade.says", words: ["grade", "deemed_acceptance", "appeal_window", "ruling_time"] },
  { icon: BadgeCheck, title: "guide.step.paid.title", says: "guide.step.paid.says", words: ["balance", "invoice", "payment_window"] },
];

/** The live tutorial: on, every page offers its tour once; and any page's tour, shown at once. */
function Tutorial() {
  const t = useT();
  const { on, setOn } = useTourSwitch();
  const replay = useTourReplay();
  const go = useNavigate();
  return (
    <section className="card panel grid gap-2" id="tutorial">
      <h2 className="panel-title"><span aria-hidden>🧑‍🏫</span> {t("guide.tutorial.title")}</h2>
      <p>{t("guide.tutorial.says")}</p>
      <label className="check justify-end">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
        <span>{t("guide.tutorial.on")}</span>
      </label>
      <p className="muted text-sm">{t("guide.tutorial.showMe")}</p>
      <div className="flex flex-wrap justify-end gap-2">
        {SHOW_ME.map(({ page, href, label }) => (
          <button key={page} type="button" className="chip" onClick={() => { replay(page); go(href); }}>
            <MonitorPlay size={16} aria-hidden />{t(label)}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Guide() {
  const t = useT();
  return (
    <div className="page grid gap-4">
      <h1 className="page-title">{t("guide.title")}</h1>
      <h2 className="section-title">{t("guide.steps")}</h2>
      <ol className="step-cards">
        {STEPS.map(({ icon: Icon, title, says, words }, i) => (
          <li key={title} className="card panel step-card">
            <span className="step-badge" aria-hidden><Icon size={22} /><span className="num">{i + 1}</span></span>
            <div className="grid gap-1">
              <h2 className="panel-title">{t(title)}</h2>
              <p className="muted">{t(says)}</p>
              <p className="step-words">{words.map((w) => <Word key={w} of={w} align="left" />)}</p>
            </div>
          </li>
        ))}
      </ol>

      <Tutorial />

      <PlayByPlay />

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
        <p><Tx ns={WORDS} k="guide.know.glossary" components={{ glossary: <Link to="/glossary" className="ent">{t("nav.glossary")}</Link> }} /></p>
        <p><Tx ns={WORDS} k="guide.know.catalog" components={{ catalog: <Link to="/catalog" className="ent">{t("nav.catalog")}</Link> }} /></p>
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        <Link to="/terms" className="btn btn-quiet"><Landmark size={18} aria-hidden />{t("home.readTerms")}</Link>
        <Link to="/commissions" className="btn btn-go">{t("guide.go")}</Link>
      </div>
    </div>
  );
}
