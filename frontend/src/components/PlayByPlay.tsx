/**
 * One portrait, three endings, side by side. Each ending is a column and each
 * phase a row, so a reader compares the same day across the endings; on a
 * phone the columns stack, one ending after another. Key words open a short
 * meaning on hover or tap, and every § number links its clause.
 */

import { createContext, useContext, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { usePlayByPlay } from "../lib/content";
import Clock from "./Clock";
import { clauseHref, storyPieces, type Word } from "../lib/playByPlay";

const Open = createContext<{ open: string; setOpen: (id: string) => void }>({ open: "", setOpen: () => {} });

const WIDTH = 288;

function KeyWord({ word, children }: { word: Word; children: ReactNode }) {
  const id = useId();
  const { open, setOpen } = useContext(Open);
  const button = useRef<HTMLButtonElement>(null);
  const leave = useRef<number>(0);
  const [at, setAt] = useState({ left: 0, top: 0 });
  const shown = open === id;

  const show = () => {
    window.clearTimeout(leave.current);
    const r = button.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(WIDTH, window.innerWidth - 32);
    setAt({ left: Math.max(16, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - 16 - width)), top: r.bottom + 6 });
    setOpen(id);
  };
  const hideSoon = () => { leave.current = window.setTimeout(() => setOpen(""), 180); };

  return (
    <>
      <button
        ref={button}
        type="button"
        className="pbp-word"
        aria-expanded={shown}
        aria-controls={shown ? id : undefined}
        onClick={() => (shown ? setOpen("") : show())}
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e) => e.pointerType === "mouse" && hideSoon()}
      >
        {children}
      </button>
      {shown && (
        <span
          id={id}
          role="note"
          className="pbp-pop"
          style={{ left: at.left, top: at.top, width: Math.min(WIDTH, window.innerWidth - 32) }}
          onPointerEnter={() => window.clearTimeout(leave.current)}
          onPointerLeave={(e) => e.pointerType === "mouse" && hideSoon()}
        >
          <strong>{word.word}</strong>
          <span>{word.says}</span>
          <Link to={clauseHref(word.clause)} className="pbp-clause">§{word.clause}</Link>
        </span>
      )}
    </>
  );
}

function Line({ text }: { text: string }) {
  const { words } = usePlayByPlay();
  return (
    <span className="pbp-line">
      {storyPieces(text, words).map((p, i) =>
        p.kind === "word" ? <KeyWord key={i} word={words[p.key]}>{p.text}</KeyWord>
          : p.kind === "clause" ? <Link key={i} to={clauseHref(p.clause)} className="pbp-clause">{p.text}</Link>
            : <span key={i}>{p.text}</span>)}
    </span>
  );
}

/** A cell placed at (column, row) side by side, or in reading order when stacked. */
function Cell({ col, row, className, children }: { col: number; row: number; className: string; children: ReactNode }) {
  const at = { "--c": col + 1, "--r": row + 1, "--o": col * 100 + row } as CSSProperties;
  return <div className={`pbp-cell ${className}`} style={at}>{children}</div>;
}

export default function PlayByPlay() {
  const story = usePlayByPlay();
  const [open, setOpen] = useState("");

  // Tapping elsewhere, scrolling or Escape puts a meaning away.
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (!(e.target as Element).closest?.(".pbp-word, .pbp-pop")) setOpen(""); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen("");
    const close = () => setOpen("");
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const rows = story.phases.length;
  return (
    <Open.Provider value={{ open, setOpen }}>
      <section className="grid gap-3" aria-labelledby="pbp-title">
        <h2 id="pbp-title" className="section-title">{story.title}</h2>
        <div className="grid gap-1">{story.intro.map((l) => <Line key={l} text={l} />)}</div>

        <div className="card panel pbp-setup">
          <div className="grid gap-2 content-start">
            <h3 className="panel-title">{story.setupTitle}</h3>
            <div className="pbp-lines">{story.setup.map((l) => <Line key={l} text={l} />)}</div>
          </div>
          <div className="grid gap-2 content-start">
            <h3 className="panel-title">{story.coverTitle}</h3>
            <dl className="pbp-cover">
              {story.cover.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
        </div>

        <Clock />

        <div className="pbp-grid">
          {story.endings.map((e, c) => (
            <Cell key={`${e.key}-head`} col={c} row={0} className={`pbp-head pbp-${e.key}`}>
              <h3 className="pbp-title"><span aria-hidden>{e.emoji}</span>{e.title}</h3>
              <div className="pbp-tldr"><span className="pbp-tag">TL;DR</span><Line text={e.tldr} /></div>
            </Cell>
          ))}
          {story.endings.flatMap((e, c) => e.beats.map((beat, r) => (
            <Cell key={`${e.key}-${r}`} col={c} row={r + 1} className={`pbp-beat pbp-${e.key}`}>
              <p className="pbp-phase">{story.phases[r]}</p>
              <div className="pbp-lines">{beat.map((l) => <Line key={l} text={l} />)}</div>
            </Cell>
          )))}
          {story.endings.map((e, c) => (
            <Cell key={`${e.key}-tally`} col={c} row={rows + 1} className={`pbp-tally pbp-${e.key}`}>
              <p className="pbp-phase">{story.tallyTitle}</p>
              <div className="pbp-lines">{e.tally.map((l) => <Line key={l} text={l} />)}</div>
            </Cell>
          ))}
          {story.endings.map((e, c) => (
            <Cell key={`${e.key}-aside`} col={c} row={rows + 2} className={`pbp-aside pbp-${e.key}`}>
              <p className="pbp-phase">{story.asideTitle}</p>
              <div className="pbp-lines">{e.aside.map((l) => <Line key={l} text={l} />)}</div>
            </Cell>
          ))}
        </div>
      </section>
    </Open.Provider>
  );
}
