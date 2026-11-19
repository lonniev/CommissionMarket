/** Where a clause of the Standard Terms lives, under the version commissions are made under. */

export const TERMS_VERSION = "v1";

export const clauseHref = (clause: string, version: string = TERMS_VERSION) =>
  `/terms?version=${version}#t-${clause.replace(".", "-")}`;

/** How many clauses each section of the Standard Terms v1 has, for tests that cite them. */
export const V1_CLAUSES = [7, 9, 3, 10, 10, 17, 3, 10, 7, 3, 4, 3, 3, 12, 3, 2, 5, 4];

/** Whether "6.5" (or a whole section, "6") exists in the Standard Terms v1. */
export function inV1(clause: string): boolean {
  const [s, c] = clause.split(".").map(Number);
  return s >= 1 && s <= V1_CLAUSES.length && (c === undefined || (c >= 1 && c <= V1_CLAUSES[s - 1]));
}
