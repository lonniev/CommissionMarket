/** What a client or professional new to CommissionMarket should know: the money, the agreement, and what a price says. */

import { BookOpen, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "../i18n";
import type { MessageKey } from "../i18n/en";
import { useLessons } from "../lib/content";
import { bookHref, BOOKSHELF_HREF, type Lesson } from "../lib/lessons";

function LessonCard({ lesson }: { lesson: Lesson }) {
  const t = useT();
  return (
    <Link to={`/learn/${lesson.slug}`} className="card panel lesson lesson-link">
      <span className="lesson-art-slot" aria-hidden>{lesson.picture}</span>
      <h3 className="lesson-title">{lesson.title}</h3>
      {lesson.lines.map((line) => <p key={line}>{line}</p>)}
      <span className="lesson-more">{t("learn.more")}<ChevronRight size={18} aria-hidden /></span>
    </Link>
  );
}

const out = { target: "_blank", rel: "noopener noreferrer" } as const;

const GROUPS: { group: "money" | "contract" | "worth"; title: MessageKey }[] = [
  { group: "money", title: "learn.money" },
  { group: "contract", title: "learn.contract" },
  { group: "worth", title: "learn.worth" },
];

export default function Learn() {
  const t = useT();
  const library = useLessons();
  return (
    <div className="page grid gap-4">
      <div className="grid gap-1">
        <h1 className="page-title">{t("learn.title")}</h1>
        <p className="muted">{t("learn.lead")}</p>
      </div>

      {GROUPS.map(({ group, title }) => (
        <section key={group} className="grid gap-3">
          <h2 className="section-title">{t(title)}</h2>
          <div className="lessons">{library[group].map((l) => <LessonCard key={l.slug} lesson={l} />)}</div>
        </section>
      ))}

      <section className="card panel grid gap-2">
        <h2 className="panel-title">{t("learn.words")}</h2>
        <dl className="words">
          {library.words.map((w) => (<div key={w.word}><dt>{w.word}</dt><dd>{w.means}</dd></div>))}
        </dl>
      </section>

      <section className="card panel grid gap-3">
        <h2 className="panel-title">{t("learn.shelf.title")}</h2>
        <p className="muted">{t("learn.shelf.says")}</p>
        {library.shelves.map((shelf) => (
          <div key={shelf.key} className="grid gap-2">
            <h3 className="shelf-title">{shelf.title}</h3>
            <ul className="shelf">
              {shelf.books.map((k) => (
                <li key={k.handle}>
                  <BookOpen size={20} aria-hidden className="shelf-mark" />
                  <div>
                    <a href={bookHref(k)} {...out} className="ent font-semibold">{k.name}</a>
                    <span className="muted"> · {k.by}</span>
                    <p>{k.says}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex flex-wrap justify-end gap-2">
          <a href={BOOKSHELF_HREF} {...out} className="btn btn-quiet"><BookOpen size={18} aria-hidden />{t("learn.shelf.more")}<ExternalLink size={14} aria-hidden /></a>
        </div>
      </section>
    </div>
  );
}
