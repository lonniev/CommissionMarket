import { test } from "node:test";
import assert from "node:assert/strict";
import { looksLikeInvoice, waitsOnTheirRequest } from "./problems.ts";

test("the Operator's no-address refusal is recognised", () => {
  assert.equal(
    waitsOnTheirRequest("The performer has not set a payout_address. They make an invoice for exactly 800 sats in their own wallet and pass it to taskbooth_request_payout as invoice."),
    true,
  );
});

test("any other refusal is shown as it came", () => {
  assert.equal(waitsOnTheirRequest("This task is already taken."), false);
  assert.equal(waitsOnTheirRequest(""), false);
});

test("an invoice is known bare, behind lightning:, in capitals, and with space around it", () => {
  for (const text of ["lnbc210n1pxyz", "lightning:lnbc210n1pxyz", "LNBC210N1PXYZ", "  lnbc210n1pxyz\n"]) {
    assert.equal(looksLikeInvoice(text), true, text);
  }
});

test("an address, an offer, and ordinary words are not an invoice", () => {
  for (const text of ["sam@wallet.example", "lno1qcp4256ypq", "hello", "", "lnbc 210"]) {
    assert.equal(looksLikeInvoice(text), false, text);
  }
});
