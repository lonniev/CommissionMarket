/** An npub's reputation, asked of Task Booth once per page load and shared by every view that shows it. */

import { useEffect, useState } from "react";
import { reputation, type Reputation } from "./tasks";

const asked = new Map<string, Promise<Reputation>>();

export function useReputation(npub: string): { rep: Reputation | null; problem: string } {
  const [rep, setRep] = useState<Reputation | null>(null);
  const [problem, setProblem] = useState("");
  useEffect(() => {
    setRep(null);
    setProblem("");
    if (!npub) return;
    let live = true;
    let ask = asked.get(npub);
    if (!ask) {
      ask = reputation(npub);
      asked.set(npub, ask);
      ask.catch(() => asked.delete(npub));
    }
    ask.then((r) => live && setRep(r)).catch((e: Error) => live && setProblem(e.message));
    return () => { live = false; };
  }, [npub]);
  return { rep, problem };
}
