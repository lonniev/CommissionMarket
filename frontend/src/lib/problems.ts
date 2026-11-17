/**
 * Refusals the Operator words for an agent, which CommissionMarket says its own way.
 */

/** Nothing can be paid yet: the professional has to ask for their sats first. */
export function waitsOnTheirRequest(message: string): boolean {
  return /payout_address/.test(message);
}

/**
 * What a wallet copies when you ask to receive: a Lightning invoice, bare or
 * behind `lightning:`. Task Booth does the real checking.
 */
export function looksLikeInvoice(text: string): boolean {
  return /^(lightning:)?ln(bc|tb|bcrt)[0-9a-z]+$/i.test(text.trim());
}
