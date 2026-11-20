/**
 * The Operator's live lock test of one mint.
 *
 * This browser makes three throwaway keys and keeps them in local storage, so
 * a reload mid-test can carry on; Task Booth never sees a private key. You pay
 * one invoice; then one button runs every check and brings the sats back to
 * your payout address. The keys are thrown away when the test ends.
 */

import { useEffect, useState } from "react";
import { CircleAlert, CircleCheck, FlaskConical, Play } from "lucide-react";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { bytesToHex, hexToBytes } from "nostr-tools/utils";
import { signEscrow, type EscrowSignable } from "@tollbooth-dpyc/web";
import { useT } from "../i18n";
import type { MessageKey } from "../i18n/en";
import type { MintTest as Test, MintTestItem } from "../lib/mints";
import { isTestMint, mintTestList, mintTestSign, mintTestStart } from "../lib/tasks";
import InvoicePanel from "./InvoicePanel";

const STORE = "cm.minttest.";
const CHECKS = ["nuts", "fund", "one_signature", "two_signatures", "refund", "melt"] as const;

function keep(testId: string, secrets: string[]) {
  try { localStorage.setItem(STORE + testId, JSON.stringify(secrets)); } catch { /* the test still runs in this tab */ }
}

function forget(testId: string) {
  try { localStorage.removeItem(STORE + testId); } catch { /* nothing kept */ }
}

/** The throwaway keys by npub, from memory or local storage. */
function keysOf(testId: string, held: Map<string, Uint8Array>): Map<string, Uint8Array> {
  if (held.size) return held;
  try {
    const hex = JSON.parse(localStorage.getItem(STORE + testId) ?? "[]") as string[];
    return new Map(hex.map((h) => { const k = hexToBytes(h); return [nip19.npubEncode(getPublicKey(k)), k]; }));
  } catch {
    return new Map();
  }
}

const good = (name: string, value: string) => (name === "one_signature" ? value.startsWith("refused") : value === "ok");

export default function MintTest({ mint, now, onDone }: { mint: string; now: number; onDone: () => void }) {
  const t = useT();
  const [sats, setSats] = useState("100");
  const [test, setTest] = useState<Test | null>(null);
  const [held, setHeld] = useState<Map<string, Uint8Array>>(new Map());
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  // An unfinished test of this mint, from an earlier visit, carries on.
  useEffect(() => {
    let live = true;
    mintTestList()
      .then((r) => {
        const open = r.tests.find((x) => x.mint === mint && x.verdict === "unfinished" && keysOf(x.test_id, new Map()).size === 3);
        if (live && open) setTest(open);
      })
      .catch(() => undefined);
    return () => { live = false; };
  }, [mint]);

  async function start() {
    setBusy(true);
    setProblem("");
    try {
      const secrets = [generateSecretKey(), generateSecretKey(), generateSecretKey()];
      const npubs = secrets.map((k) => nip19.npubEncode(getPublicKey(k)));
      const r = await mintTestStart(mint, npubs, Number(sats));
      keep(r.test.test_id, secrets.map(bytesToHex));
      setHeld(new Map(npubs.map((n, i) => [n, secrets[i]])));
      setTest(r.test);
      if (r.test.verdict !== "unfinished") finish(r.test);
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function signed(items: MintTestItem[], keys: Map<string, Uint8Array>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const item of items) {
      const key = keys.get(item.npub);
      if (!key) throw new Error(t("mints.test.keysLost"));
      const r = signEscrow(item as unknown as EscrowSignable, item.npub, item.most, key);
      if ("why" in r) throw new Error(r.why);
      out[item.npub] = r.signature;
    }
    return out;
  }

  function finish(done: Test) {
    forget(done.test_id);
    setHeld(new Map());
    onDone();
  }

  /** Every step after the invoice is paid: fund, the three spends, ready the return, return. */
  async function run() {
    if (!test) return;
    setBusy(true);
    setProblem("");
    let current = test;
    try {
      const keys = keysOf(current.test_id, held);
      for (let step = 0; step < 6 && current.verdict === "unfinished"; step++) {
        const items = current.sign ?? [];
        current = (await mintTestSign(current.test_id, signed(items, keys))).test;
        setTest(current);
      }
      if (current.verdict !== "unfinished") finish(current);
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mint-test grid gap-2">
      <h3 className="font-semibold flex items-center gap-2"><FlaskConical size={18} aria-hidden />{t("mints.test.title")}</h3>
      {!test && (
        <>
          <p className="muted text-sm">{t("mints.test.says")}</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <label className="flex items-center gap-2">
              <span className="muted text-sm">{t("mints.test.sats")}</span>
              <input className="field num w-24 text-right" inputMode="numeric" maxLength={4} value={sats}
                onChange={(e) => setSats(e.target.value.replace(/\D/g, ""))} />
            </label>
            <button type="button" className="btn btn-go" disabled={busy || Number(sats) < 20 || Number(sats) > 1000} onClick={() => void start()}>
              <Play size={18} aria-hidden />{t("mints.test.start")}
            </button>
          </div>
        </>
      )}
      {test?.state === "invoiced" && isTestMint(mint) && <p className="text-sm">{t("mints.test.testMintNote")}</p>}
      {test?.state === "invoiced" && test.invoice && !isTestMint(mint) && (
        <>
          <p className="text-sm">{t("mints.test.pay")}</p>
          <InvoicePanel now={now} invoice={{ sats: test.sats, invoice: test.invoice, lightning_uri: `lightning:${test.invoice}`,
            payment_hash: "", expires_at: test.expires_at ?? 0, paid_at: null }} />
        </>
      )}
      {test && test.verdict === "unfinished" && (
        <div className="flex justify-end">
          <button type="button" className="btn btn-go" disabled={busy} onClick={() => void run()}>
            <Play size={18} aria-hidden />{busy ? t("mints.test.running") : t("mints.test.run")}
          </button>
        </div>
      )}
      {test && Object.keys(test.checks).length > 0 && (
        <ul className="mint-facts">
          {CHECKS.filter((c) => test.checks[c]).map((c) => (
            <li key={c}>
              {good(c, test.checks[c])
                ? <CircleCheck size={16} aria-hidden className="ok" />
                : <CircleAlert size={16} aria-hidden className="error" />}
              <span>{t(`mints.test.check.${c}` as MessageKey)}</span>
              {!good(c, test.checks[c]) && <span className="muted text-sm">{test.checks[c]}</span>}
            </li>
          ))}
        </ul>
      )}
      {test?.stopped && <p className="muted text-sm">{test.stopped}</p>}
      {test && test.verdict !== "unfinished" && test.returned_sats !== undefined && (
        <p className="text-sm">{t("mints.test.returned", { sats: test.returned_sats, change: test.change_sats ?? 0 })}</p>
      )}
      {problem && <p className="error text-right">{problem}</p>}
    </div>
  );
}
