/**
 * A signature asked for by DM and not yet collected, kept for this browser tab under its
 * own key, so a reload between asking and replying loses nothing.
 */

export interface Asked {
  nonce: string;
  statement_hash: string;
}

export function keptAsk(key: string): Asked | null {
  try {
    const kept = sessionStorage.getItem(key);
    return kept ? (JSON.parse(kept) as Asked) : null;
  } catch {
    return null;
  }
}

export function keepAsk(key: string, asked: Asked | null) {
  try {
    if (asked) sessionStorage.setItem(key, JSON.stringify(asked));
    else sessionStorage.removeItem(key);
  } catch {
    // Without storage the ask lives as long as this page does.
  }
}
