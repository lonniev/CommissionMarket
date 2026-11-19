/**
 * Quotations for a wait. The quotations themselves are per language, in
 * `src/content/<language>/quotes.ts`.
 */

export interface QuoteText {
  text: string;
  /** Who said it, and where. */
  author: string;
}
