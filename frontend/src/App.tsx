import { lazy, Suspense, useMemo, type ReactNode } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BookA, BookOpen, BriefcaseBusiness, Building2, CalendarDays, Coffee, Compass, Scale, ScrollText, Wallet as WalletIcon } from "lucide-react";
import { AppShell, SiteNav, TourProvider, Wallet, matchesPath, useAppShell, useTour } from "@tollbooth-dpyc/web/react";
import Waiting from "./components/Waiting";
import { useT } from "./i18n";
import { FiatProvider } from "./lib/FiatContext";
import { decorateTileWith } from "./lib/tiles";
import { tours } from "./lib/tours";

// Each page is its own chunk, fetched the first time it opens.
const Arbitration = lazy(() => import("./views/Arbitration"));
const Calendar = lazy(() => import("./views/Calendar"));
const Catalog = lazy(() => import("./views/Catalog"));
const CatalogCollection = lazy(() => import("./views/Catalog").then((m) => ({ default: m.CatalogCollection })));
const Commission = lazy(() => import("./views/Commission"));
const Commissions = lazy(() => import("./views/Commissions"));
const EditCommission = lazy(() => import("./views/EditCommission"));
const Glossary = lazy(() => import("./views/Glossary"));
const Guide = lazy(() => import("./views/Guide"));
const Home = lazy(() => import("./views/Home"));
const Learn = lazy(() => import("./views/Learn"));
const LessonPage = lazy(() => import("./views/LessonPage"));
const NewCommission = lazy(() => import("./views/NewCommission"));
const PersonPage = lazy(() => import("./views/PersonPage"));
const Org = lazy(() => import("./views/Org"));
const Orgs = lazy(() => import("./views/Orgs"));
const Project = lazy(() => import("./views/Project"));
const Profile = lazy(() => import("./views/Profile"));
const Terms = lazy(() => import("./views/Terms"));

const PAGES = [
  { href: "/orgs", label: "nav.orgs", icon: <Building2 size={18} aria-hidden /> },
  { href: "/commissions", label: "nav.commissions", icon: <ScrollText size={18} aria-hidden /> },
  { href: "/calendar", label: "nav.calendar", icon: <CalendarDays size={18} aria-hidden /> },
  { href: "/arbitration", label: "nav.arbitration", icon: <Scale size={18} aria-hidden /> },
  { href: "/learn", label: "nav.learn", icon: <BookOpen size={18} aria-hidden /> },
  { href: "/glossary", label: "nav.glossary", icon: <BookA size={18} aria-hidden /> },
  { href: "/guide", label: "nav.guide", icon: <Compass size={18} aria-hidden /> },
  { href: "/catalog", label: "nav.catalog", icon: <Coffee size={18} aria-hidden /> },
  { href: "/wallet", label: "nav.wallet", icon: <WalletIcon size={18} aria-hidden /> },
] as const;

const NAV_CLASSES = {
  root: "flex flex-wrap items-center gap-2",
  nav: "relative",
  list: "flex flex-wrap gap-1",
  item: "chip",
  active: "chip chip-on",
  toggle: "chip",
  menu: "site-menu left-0",
  menuItem: "site-menu-item",
  menuItemActive: "site-menu-item text-[var(--tb-accent)]",
  end: "ml-auto flex items-center gap-3",
  account: "relative",
  accountButton: "rounded-full",
  accountMenu: "site-menu right-0",
  accountHeader: "border-b border-[var(--tb-line)] px-3 pb-2 mb-1",
  accountHeading: "text-xs text-[var(--tb-muted)]",
  accountNpub: "break-all font-mono text-xs",
  accountLink: "site-menu-item",
  signOut: "site-menu-item w-full text-left",
};

function Brand() {
  return (
    <Link to="/" className="brand">
      <BriefcaseBusiness size={22} aria-hidden className="text-[var(--tb-accent)]" />
      CommissionMarket
    </Link>
  );
}

function Nav() {
  const { session } = useAppShell();
  const { pathname } = useLocation();
  const t = useT();
  if (!session.signedIn) {
    return (
      <header className="site-bar flex flex-wrap items-center gap-2 px-4 py-2.5">
        <Brand />
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <Link to="/guide" className="chip">{t("nav.guide")}</Link>
          <Link to="/learn" className="chip">{t("nav.learn")}</Link>
          <Link to="/glossary" className="chip">{t("nav.glossary")}</Link>
          <Link to="/catalog" className="chip">{t("nav.catalog")}</Link>
        </span>
        <Link to="/signin" className="chip chip-accent">{t("nav.signIn")}</Link>
      </header>
    );
  }
  return (
    <header className="site-bar px-4 py-2">
      <SiteNav
        brand={<Brand />}
        items={PAGES.map((p) => ({ ...p, label: t(p.label) }))}
        isActive={(href) => matchesPath(pathname, href)}
        renderLink={({ href, ...p }) => <Link to={href} {...p} />}
        account={{ npub: session.npub, links: [{ href: "/profile", label: t("nav.profile") }, { href: "/terms", label: t("nav.terms") }], onSignOut: session.signOut }}
        classNames={NAV_CLASSES}
      />
    </header>
  );
}

function Footer() {
  const { status } = useAppShell();
  const t = useT();
  return (
    <footer className="site-foot">
      <div>
        CommissionMarket v{__APP_VERSION__} · {__BUILD_COMMIT__}
        {status?.version && ` · Task Booth ${status.version}`}
        {status?.tollbooth_dpyc_version && ` · SDK ${status.tollbooth_dpyc_version}`}
      </div>
      <div>
        {t("footer.monetizedWith")}{" "}
        <a href="https://tollbooth-dpyc.com" target="_blank" rel="noopener noreferrer" className="underline">Tollbooth DPYC™</a>
        {" · "}Apache-2.0 · {t("footer.patentPending")}
      </div>
    </footer>
  );
}

function SignedIn({ children }: { children: ReactNode }) {
  const { session } = useAppShell();
  return session.signedIn ? <>{children}</> : <Navigate to="/signin" replace />;
}

function SignInPage() {
  const { gate } = useAppShell();
  useTour("signin");
  return <div className="page"><div className="card p-6">{gate}</div></div>;
}

function WalletPage() {
  const t = useT();
  useTour("wallet");
  return (
    <div className="page grid gap-3">
      <section className="card panel grid gap-1">
        <h1 className="page-title">{t("wallet.title")}</h1>
        <p>{t("wallet.holds")}</p>
        <p className="muted">{t("wallet.notCommissions")}</p>
      </section>
      <Wallet decorateTile={decorateTileWith(t)} />
    </div>
  );
}

function Site() {
  const { session } = useAppShell();
  const t = useT();
  const shown = useMemo(() => tours(t), [t]);
  return (
    <BrowserRouter>
      <TourProvider tours={shown}>
      <FiatProvider>
        <Nav />
        <main className="flex-1">
          <Suspense fallback={<div className="page"><div className="card panel"><Waiting heading={t("waiting.openingPage")} /></div></div>}>
            <Routes>
              <Route index element={session.signedIn ? <Navigate to="/commissions" replace /> : <Home />} />
              <Route path="signin" element={session.signedIn ? <Navigate to="/commissions" replace /> : <SignInPage />} />
              <Route path="commissions" element={<SignedIn><Commissions /></SignedIn>} />
              <Route path="commissions/new" element={<SignedIn><NewCommission /></SignedIn>} />
              <Route path="commissions/:taskId" element={<SignedIn><Commission /></SignedIn>} />
              <Route path="commissions/:taskId/edit" element={<SignedIn><EditCommission /></SignedIn>} />
              <Route path="orgs" element={<SignedIn><Orgs /></SignedIn>} />
              <Route path="orgs/:orgId" element={<SignedIn><Org /></SignedIn>} />
              <Route path="orgs/:orgId/projects/:projectId" element={<SignedIn><Project /></SignedIn>} />
              <Route path="calendar" element={<SignedIn><Calendar /></SignedIn>} />
              <Route path="arbitration" element={<SignedIn><Arbitration /></SignedIn>} />
              <Route path="wallet" element={<SignedIn><WalletPage /></SignedIn>} />
              <Route path="profile" element={<SignedIn><Profile /></SignedIn>} />
              <Route path="people/:npub" element={<PersonPage />} />
              <Route path="terms" element={<Terms />} />
              <Route path="guide" element={<Guide />} />
              <Route path="learn" element={<Learn />} />
              <Route path="glossary" element={<Glossary />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="catalog/:handle" element={<CatalogCollection />} />
              <Route path="learn/:slug" element={<LessonPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </FiatProvider>
      </TourProvider>
    </BrowserRouter>
  );
}

export default function App() {
  const t = useT();
  return (
    <AppShell theme="system" gateOptions={{ welcome: t("app.tagline") }} signedOut={() => <Site />}>
      {() => <Site />}
    </AppShell>
  );
}
