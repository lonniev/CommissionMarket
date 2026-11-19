/** One lesson told at length, with something to try and a question worth asking yourself. */

import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useT } from "../i18n";
import { useLessons } from "../lib/content";
import Word from "../components/Word";

export default function LessonPage() {
  const { slug = "" } = useParams();
  const t = useT();
  const library = useLessons();
  const lesson = library.at(slug);
  if (!lesson) return <Navigate to="/learn" replace />;
  const next = library.lessons[(library.lessons.indexOf(lesson) + 1) % library.lessons.length];

  return (
    <div className="page grid gap-3">
      <div className="toolbar">
        <Link to="/learn" className="btn btn-quiet"><ArrowLeft size={18} aria-hidden />{t("nav.learn")}</Link>
      </div>
      <article className="card panel lesson lesson-long">
        <span className="lesson-art-slot lesson-art-big" aria-hidden>{lesson.picture}</span>
        <h1 className="page-title">{lesson.title}</h1>
        {lesson.lines.map((line) => <p key={line} className="lesson-lead">{line}</p>)}
        {lesson.more.map((line) => <p key={line}>{line}</p>)}
        {lesson.saying && (
          <blockquote className="saying">
            {t("lesson.quote", { text: lesson.saying.text })}
            <cite>{lesson.saying.from}</cite>
          </blockquote>
        )}
      </article>
      <section className="card panel grid gap-2">
        <h2 className="panel-title"><span aria-hidden>📖</span> {t("lesson.words")}</h2>
        <p className="step-words">{lesson.words.map((w) => <Word key={w} of={w} align="left" />)}</p>
      </section>
      {lesson.links && (
        <section className="card panel grid gap-2">
          <h2 className="panel-title">{t("lesson.places")}</h2>
          <ul className="shelf">
            {lesson.links.map((k) => (
              <li key={k.href}>
                <ExternalLink size={18} aria-hidden className="shelf-mark" />
                <div>
                  <a href={k.href} target="_blank" rel="noopener noreferrer" className="ent font-semibold">{k.name}</a>
                  <p>{k.says}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="two-up">
        <section className="card panel grid gap-1">
          <h2 className="panel-title"><span aria-hidden>🛠️</span> {t("lesson.try")}</h2>
          <p>{lesson.tryThis}</p>
        </section>
        <section className="card panel grid gap-1">
          <h2 className="panel-title"><span aria-hidden>🤔</span> {t("lesson.ask")}</h2>
          <p>{lesson.ask}</p>
        </section>
      </div>
      <div className="flex justify-end">
        <Link to={`/learn/${next.slug}`} className="btn btn-go">{next.title}<ArrowRight size={18} aria-hidden /></Link>
      </div>
    </div>
  );
}
