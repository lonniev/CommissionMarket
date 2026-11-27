/** Every tool a patron can call and its live fare, read from the operator's pricing model. Public: no sign-in. */

import { PriceSheet } from "@tollbooth-dpyc/web/react";
import "@tollbooth-dpyc/web/price-sheet.css";

export default function Prices() {
  return (
    <div className="page">
      <div className="card p-5"><PriceSheet /></div>
    </div>
  );
}
