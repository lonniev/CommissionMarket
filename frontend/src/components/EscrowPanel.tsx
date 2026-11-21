/**
 * A commission's escrow: the Balance held at a Cashu mint, locked so any two of
 * client, professional and arbiter move it, and the client alone after the
 * refund date (terms 6).
 *
 * Every move is a signature by a person's own Nostr key. This page never signs
 * a digest it is handed: the web package rebuilds the message from its parts
 * and checks it first. A person without a key in this browser signs in Pricing
 * Studio, or anywhere else, and pastes the signature; Task Booth verifies it.
 */

import { Fragment, useCallback, useEffect, useState } from "react";
import type { MintFacts } from "../lib/mints";
import MintCard from "./MintCard";
import { Link } from "react-router-dom";
import { Check, Copy, KeyRound, Lock, Pencil, PenLine, Smartphone, Vault } from "lucide-react";
import {
  checkedEscrowMessage, isSignatureHex, pricingStudioEscrowLink, signEscrowWithSessionKey, tollboothConfig,
} from "@tollbooth-dpyc/web";
import { useAppShell, useLanguageLocale } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import {
  escrowCollect, escrowInvoice, escrowPropose, escrowSign, escrowStatus, isTestMint, mintFacts,
  type Escrow, type EscrowPending, type EscrowReading, type EscrowRole, type Invoice, type Task,
} from "../lib/tasks";
import InvoicePanel from "./InvoicePanel";
import { commissionHref, Person } from "./Person";
import { mayEdit } from "../lib/moves";
import Sats from "./Sats";

const STEPS = ["invoiced", "funded", "proposed", "split", "settled"] as const;

/** The most a move may pay out, which the rebuilt message must stay within. */
function mostFor(item: EscrowPending, escrow: Escrow | null): number {
  if (!escrow) return 0;
  if (item.what === "fund") return escrow.sats;
  if (item.what === "proposal") return escrow.held_sats ?? 0;
  return escrow.to_collect?.[item.role] ?? 0;
}

function SignBox({ task, item, escrow, onSigned }: {
  task: Task;
  item: EscrowPending;
  escrow: Escrow | null;
  onSigned: () => Promise<void>;
}) {
  const t = useT();
  const { session } = useAppShell();
  const [pasted, setPasted] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const most = mostFor(item, escrow);
  const checked = checkedEscrowMessage(item, session.npub, most);
  const operator = tollboothConfig().operatorUrl;

  async function send(signature: string) {
    setBusy(true);
    setProblem("");
    try {
      await escrowSign(task.task_id, signature);
      setPasted("");
      await onSigned();
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function signHere() {
    const r = signEscrowWithSessionKey(item, session.npub, most);
    if ("why" in r) setProblem(r.why);
    else void send(r.signature);
  }

  async function copy() {
    await navigator.clipboard?.writeText(item.sign_digest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const what = item.what === "fund"
    ? t("escrow.sign.fund", { sats: item.sats ?? escrow?.sats ?? 0 })
    : item.what === "proposal"
      ? t("escrow.sign.proposal", { performer: item.to_performer ?? 0, purchaser: item.to_purchaser ?? 0 })
      : t("escrow.sign.collect", { sats: item.sats ?? 0, reserve: item.fee_reserve ?? 0 });

  return (
    <div className="sign-box grid gap-2">
      <p className="font-medium flex items-center gap-2"><PenLine size={18} aria-hidden />{what}</p>
      {"why" in checked ? (
        <p className="error">{t("escrow.refused", { why: checked.why })}</p>
      ) : (
        <>
          <div className="actions-row">
            {session.canSign && (
              <button type="button" className="btn btn-go" disabled={busy} onClick={signHere}>
                <KeyRound size={18} aria-hidden />{t("escrow.signHere")}
              </button>
            )}
            {operator && (
              <a className="btn btn-quiet" href={pricingStudioEscrowLink({ mcp: `${operator}/mcp`, taskId: task.task_id, npub: session.npub, tool: "taskbooth" })}>
                <Smartphone size={18} aria-hidden />{t("escrow.signInStudio")}
              </a>
            )}
          </div>
          <details className="grid gap-2">
            <summary className="cursor-pointer muted text-sm">{t("escrow.signElsewhere")}</summary>
            <p className="muted text-sm">{t("escrow.elsewhereHelp")}</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <code className="hash break-all">{item.sign_digest}</code>
              <button type="button" className="btn btn-quiet" onClick={() => void copy()}>
                {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
                {copied ? t("actions.copied") : t("escrow.copyDigest")}
              </button>
            </div>
            <input className="field font-mono text-sm" value={pasted} onChange={(e) => setPasted(e.target.value.trim())}
              placeholder={t("escrow.pastePlaceholder")} autoCapitalize="none" spellCheck={false} aria-label={t("escrow.pastePlaceholder")} />
            <div className="actions-row">
              <button type="button" className="btn btn-go" disabled={busy || !isSignatureHex(pasted)} onClick={() => void send(pasted.toLowerCase())}>
                {t("escrow.sendSignature")}
              </button>
            </div>
          </details>
        </>
      )}
      {problem && <p className="error text-right">{problem}</p>}
    </div>
  );
}

export default function EscrowPanel({ task, now, onChanged }: { task: Task; now: number; onChanged: () => void }) {
  const t = useT();
  const locale = useLanguageLocale();
  const [reading, setReading] = useState<EscrowReading | null>(null);
  const [mintSeen, setMintSeen] = useState<MintFacts | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [ruling, setRuling] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [needsPayout, setNeedsPayout] = useState(false);
  const party = (["purchaser", "performer", "arbiter"] as const).filter((r) => task.your_roles.includes(r));
  const escrow = reading?.escrow ?? task.escrow ?? null;
  const cover = task.cover;

  const load = useCallback(async () => {
    try {
      setReading(await escrowStatus(task.task_id));
    } catch (e) {
      setProblem((e as Error).message);
    }
  }, [task.task_id]);

  useEffect(() => { void load(); }, [load, task.standing]);

  async function act(run: () => Promise<unknown>) {
    setBusy(true);
    setProblem("");
    setNeedsPayout(false);
    try {
      await run();
      await load();
      onChanged();
    } catch (e) {
      const said = (e as Error).message;
      if (/payout_address/.test(said)) setNeedsPayout(true);
      else setProblem(said);
    } finally {
      setBusy(false);
    }
  }

  const mintUrl = reading?.escrow?.mint ?? cover?.escrow_mint ?? "";
  useEffect(() => {
    if (!cover?.escrow || !mintUrl) return;
    let live = true;
    mintFacts([mintUrl]).then((r) => live && setMintSeen(r.mints[0] ?? null)).catch(() => undefined);
    return () => { live = false; };
  }, [cover?.escrow, mintUrl]);

  if (!cover?.escrow) return null;

  const when = (s: number) => new Date(s * 1000).toLocaleDateString(locale, { dateStyle: "medium" });
  const roleName = (r: EscrowRole) => t(`escrow.role.${r}`);
  const at = escrow ? STEPS.indexOf(escrow.state) : -1;
  const isPurchaser = party.includes("purchaser");
  const isArbiter = party.includes("arbiter");
  const everyoneSigned = task.agreement.purchaser_signed && task.agreement.performer_signed && task.agreement.arbiter_signed;
  const mayFund = isPurchaser && task.standing === "claimed" && (!escrow || escrow.state === "invoiced");
  const divisible = escrow && (escrow.state === "funded" || escrow.state === "proposed");
  const unsigned = escrow?.proposal && !escrow.proposal.signed_by.length;
  const held = escrow?.held_sats ?? 0;
  const mine = (escrow?.to_collect && party.find((r) => (escrow.to_collect?.[r] ?? 0) > 0)) || null;
  const collecting = reading?.for_you?.some((p) => p.what === "collect");
  const kept = (s: { invoice: string; expires_at: number; sats: number }): Invoice => ({
    sats: s.sats, invoice: s.invoice, lightning_uri: `lightning:${s.invoice}`, payment_hash: "", expires_at: s.expires_at, paid_at: null,
  });
  const shownInvoice = invoice ?? (mayFund && escrow?.invoice ? kept({ ...escrow.invoice, sats: escrow.sats }) : null);

  return (
    <section className="card panel grid gap-3">
      <h2 className="panel-title flex items-center gap-2"><Vault size={18} aria-hidden />{t("escrow.title")}</h2>
      <p className="muted text-sm">{t("escrow.says")}</p>

      <ol className="escrow-steps" aria-label={t("escrow.title")}>
        {STEPS.map((s, i) => (
          <li key={s} className={i < at ? "done" : i === at ? "now" : undefined} aria-current={i === at ? "step" : undefined}>
            {t(`escrow.step.${s}`)}
          </li>
        ))}
      </ol>

      <dl className="facts">
        <dt>{t("escrow.balance")}</dt><dd><Sats sats={escrow?.sats ?? reading?.sats ?? 0} /></dd>
        {escrow?.funded_at !== undefined && <><dt>{t("escrow.held")}</dt><dd><Sats sats={held} /> · {when(escrow.funded_at)}</dd></>}
        <dt>{t("escrow.mint")}</dt>
        <dd>
          {escrow?.mint ?? cover.escrow_mint}{isTestMint(escrow?.mint ?? cover.escrow_mint) && <span className="muted"> · {t("cover.testMint")}</span>}
          {mayEdit(task) && (
            <span className="block mt-1">
              <Link to={`${commissionHref(task.task_id)}/edit?open=payments`} className="chip" title={t("escrow.changeMintSays")}>
                <Pencil size={16} aria-hidden />{t("escrow.changeMint")}
              </Link>
            </span>
          )}
        </dd>
        <dt>{t("escrow.refundAt")}</dt>
        <dd>
          {escrow ? when(escrow.refund_at) : t("escrow.refundAfter", { days: cover.refund_days })}{" "}
          <Link to="/terms?version=v1#t-6-6" className="ent">§6.6</Link>
          {escrow?.refund_open && <span className="muted"> · {t("escrow.refundOpen")}</span>}
        </dd>
        {escrow && (["purchaser", "performer", "arbiter"] as const).map((r) => (
          <Fragment key={r}><dt>{roleName(r)}</dt><dd><Person npub={escrow.parties[r]} /></dd></Fragment>
        ))}
      </dl>

      {mintSeen && <MintCard facts={mintSeen} now={now} />}

      {task.escrow_due_to === "client" && divisible && (
        <p className="gate">{t("escrow.dueToClient")} <Link to="/terms?version=v1#t-14-10" className="ent">§14.10</Link></p>
      )}

      {escrow?.proposal && (
        <div className="grid gap-1">
          <p className="font-medium">{t("escrow.proposal", { by: roleName(escrow.proposal.by) })}</p>
          <p>{t("escrow.proposalSplit", { performer: escrow.proposal.to_performer, purchaser: escrow.proposal.to_purchaser })}</p>
          <p className="muted text-sm">
            {escrow.proposal.signed_by.length
              ? t("escrow.signedBy", { who: escrow.proposal.signed_by.map(roleName).join(", ") })
              : t("escrow.noSignatures")}
          </p>
        </div>
      )}

      {escrow?.to_collect && (
        <ul className="grid gap-1">
          {(Object.entries(escrow.to_collect) as [EscrowRole, number][]).map(([r, sats]) => (
            <li key={r} className="flex justify-between gap-2"><span>{t("escrow.toCollect", { who: roleName(r) })}</span><Sats sats={sats} /></li>
          ))}
          {(Object.entries(escrow.paid ?? {}) as [EscrowRole, number][]).map(([r, sats]) => (
            <li key={`paid-${r}`} className="flex justify-between gap-2 muted"><span>{t("escrow.paidTo", { who: roleName(r) })}</span><Sats sats={sats} /></li>
          ))}
        </ul>
      )}

      {mayFund && !everyoneSigned && <p>{t("escrow.waitSignatures")}</p>}
      {mayFund && everyoneSigned && !shownInvoice && (
        <div className="actions-row">
          <button type="button" className="btn btn-money" disabled={busy}
            onClick={() => void act(async () => { const bill = await escrowInvoice(task.task_id); setInvoice(kept(bill)); })}>
            <Lock size={18} aria-hidden />{t("escrow.getInvoice")}
          </button>
        </div>
      )}
      {mayFund && shownInvoice && (
        <>
          <InvoicePanel invoice={shownInvoice} now={now} />
          <p className="muted text-sm">{t("escrow.afterPaying")}</p>
        </>
      )}

      {divisible && party.length > 0 && (!escrow.proposal || unsigned) && (
        <div className="grid gap-2">
          <div className="actions-row">
            {task.final && task.assessment && (
              <button type="button" className="btn btn-go" disabled={busy} onClick={() => void act(() => escrowPropose(task.task_id))}>
                {t("escrow.proposeAward")}
              </button>
            )}
            {isPurchaser && escrow.refund_open && (
              <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => void act(() => escrowPropose(task.task_id, 0))}>
                {t("escrow.takeBack")}
              </button>
            )}
          </div>
          {isArbiter && (
            <div className="flex flex-wrap items-end justify-end gap-2">
              <label className="grid gap-1">
                <span className="label">{t("escrow.ruling")}</span>
                <input className="field num text-right" inputMode="numeric" value={ruling} onChange={(e) => setRuling(e.target.value)} placeholder={String(held)} />
              </label>
              <button type="button" className="btn btn-go" disabled={busy || !/^\d+$/.test(ruling.trim())}
                onClick={() => void act(() => escrowPropose(task.task_id, Number(ruling.trim())))}>
                {t("escrow.proposeRuling")}
              </button>
            </div>
          )}
        </div>
      )}

      {mine && !collecting && (
        <div className="actions-row">
          <button type="button" className="btn btn-money" disabled={busy} onClick={() => void act(() => escrowCollect(task.task_id))}>
            {t("escrow.collect")}
          </button>
        </div>
      )}
      {needsPayout && <p className="error text-right">{t("escrow.needPayout")} <Link to="/profile" className="ent">{t("nav.profile")}</Link></p>}

      {reading?.for_you?.map((item) => (
        <SignBox key={`${item.what}-${item.role}-${item.sign_digest}`} task={task} item={item} escrow={escrow} onSigned={async () => { await load(); onChanged(); }} />
      ))}

      {problem && <p className="error text-right">{problem}</p>}
    </section>
  );
}
