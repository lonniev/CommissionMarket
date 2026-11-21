## What to tell a person about CommissionMarket

CommissionMarket is where a person commissions real work from professionals they choose, and pays for it in bitcoin as the work proceeds.
A portrait, a translation, a study, a machined part: anything with a deliverable and a deadline.

What a person gets:

- **Their own circle.** A commission is seen only by the npubs the client invites. It is never posted to a crowd.
- **One signed offer.** Client and professional sign the same plain statement of the terms, under the published Standard Terms. Anyone can check both signatures.
- **Paid as the work proceeds.** A deposit on claim and dated milestones go straight from the client's wallet to the professional's, by Lightning invoice.
- **A graded award.** The client grades the finished work against the grades both agreed to in advance, and the grade sets what the rest of the award pays.
- **Escrow, when the job warrants it.** The balance can sit locked at a Cashu mint, and any two of client, professional and a named arbiter can move it.
- **A fair hearing.** An arbiter decides appeals and claims of cause, and an inspector may give a signed, advisory opinion of the work.
- **No account.** Identity is a Nostr key. There is no email, no password, no subscription and no KYC, and the site holds no one's money.

A good one-line pitch: *"Commission work from people you trust, sign one clear offer, and pay each stage wallet to wallet in sats."*

The web app at https://commissionmarket.tollbooth-dpyc.com is one client of the Task Booth Operator.
An agent calls Task Booth's tools directly, and everything below works from either.

## A commission, start to finish

1. `taskbooth_post_task` posts it. Give it these arguments:
   - the `rubric` of grades and the sats each grade earns;
   - the `audience` of npubs who may claim it;
   - `needed_by`;
   - `deposit_pct`;
   - `milestones` (each with a name, `due_at` and `pct` of the top grade);
   - a `cover` page.

   The cover page puts the job under the Standard Terms. It holds:
   - the deliverables, the spec and its hash;
   - the deemed grade and deemed-acceptance days;
   - the IP option;
   - the arbiter, the inspector, escrow and the mint;
   - the failure point and the appeal, ruling and payment windows.

   A commission with a cover page is filed in a Project (see below).
2. `taskbooth_offer_terms` returns the offer as one plain statement and its sha256. Every party signs that same hash.
3. The client signs before anyone may claim; the professional signs before marking the work done.
   A named arbiter signs too, and escrow waits for all three signatures.
   - **An agent holding its own key** signs with `taskbooth_sign_offer(task_id, statement_hash)`, called as a NIP-98 signed request.
   - **A person signs by DM.** Call `taskbooth_request_offer_signature`. They reply from any Nostr client, then call `taskbooth_receive_offer_signature(task_id, nonce, statement_hash)`.
4. `taskbooth_claim_task`, then the deposit.
   - `taskbooth_request_deposit` returns an invoice for exactly the deposit, and the client pays it.
   - `taskbooth_confirm_deposit` is the professional saying it arrived.
5. Each milestone, once its date comes: `taskbooth_request_milestone(task_id, index)`, then `taskbooth_confirm_milestone(task_id, index)`.
6. `taskbooth_mark_done`, then the client calls `taskbooth_assess_task` with a grade, or `taskbooth_reject_task`. What was paid ahead comes off the award.
   - An ungraded delivery is graded at the cover page's deemed grade once its deemed-acceptance days pass.
   - The professional calls `taskbooth_accept_assessment` or `taskbooth_appeal_assessment`, and may appeal once.
7. `taskbooth_request_payout` and `taskbooth_confirm_paid` settle what is owed.

Other steps and tools:
- **No payout address:** a professional with no `payout_address` passes their own BOLT11 invoice, for the exact amount, as `invoice`.
- **Changing the commission:**
  - `taskbooth_edit_task` changes a commission while nobody has claimed it, and the changed offer must be signed again.
  - `taskbooth_withdraw_task` takes it back.
  - `taskbooth_release_claim` gives a claim back.
- **Reminders and history:**
  - `taskbooth_nudge_task` sends the other side a reminder: `pay` or `due`.
  - `taskbooth_task_history` lists every move made on a commission.
- **Free:** `taskbooth_standard_terms` returns the Standard Terms text and its hash.
- **Proof:** every other tool acts for the calling npub, and the connection must prove that npub.

## Escrow

Escrow holds the **Balance**: the top grade less the deposit and the milestones.
Payments made outside escrow are final, and only escrowed sats can go back to the client.

- Set `cover.escrow: true` and `cover.escrow_mint`. Escrow needs:
  - an arbiter (`cover.arbiter_npub`);
  - a deemed grade;
  - a failure point (`cover.fail_after_hours`).
- **Choosing a mint:**
  - The Operator offers its mints in the `escrow_mints` property, read with `taskbooth_get_operator_properties`.
  - `taskbooth_find_mints` lists online Cashu mints that claim every NUT an escrow needs.
  - `taskbooth_mint_facts` gives each mint's record, every fact with its source and the time it was observed:
    - uptime and reviews;
    - the Lightning node behind it;
    - its record of audited swaps;
    - live lock tests.
  - The Operator judges nothing: the client decides what record a mint needs.
- **Changing the mint** is a `taskbooth_edit_task` with a new `cover.escrow_mint`, while the commission is unclaimed.
- **After the claim, funding it:**
  1. The client pays `taskbooth_escrow_invoice`.
  2. The client signs the `sign_digest` with their Nostr key (BIP-340).
  3. The client passes the signature to `taskbooth_escrow_sign`.

  The mint then locks the sats to client, professional and arbiter: any two may move them, and after the refund date, the client alone.
- **Moving it:**
  - `taskbooth_escrow_propose` proposes a split, and it takes effect once two of the three sign.
  - `taskbooth_escrow_collect` readies each share for its owner's payout address.
  - `taskbooth_escrow_status` shows where the escrow stands, and what each party may sign now.

## Arbiters, inspectors and reputation

- **Arbiter:**
  - A named arbiter decides an appeal with `taskbooth_decide_appeal`.
  - A professional whose job ended for failure to deliver may claim cause once, with `taskbooth_claim_cause`.
  - The arbiter rules on that claim with `taskbooth_decide_cause`.
- **Inspector:**
  - A named inspector gives one signed, advisory opinion of the finished work with `taskbooth_inspect_task`.
  - An inspector without their own key uses the DM pair `taskbooth_request_inspection_signature` and `taskbooth_receive_inspection_signature`.
  - The opinion grades nothing and moves no sats, but the arbiter may weigh it.
- **Reputation:**
  - `taskbooth_reputation(of_npub)` gives what an npub has done as client, professional, arbiter and inspector.
  - It is free, and it holds counts only: it names no job, no title and no sats.
  - Each npub's page at `/people/<npub>` shows the same record.

## Asking someone to review a commission

On a commission's page, anyone signed in can send any npub a private Nostr message: "Please review this commission", with a link to it.
It is a NIP-17 gift-wrapped direct message, signed in the browser by whoever is signed in, and only the recipient can read it.
An agent with its own key can do the same from any Nostr library.

## An example

The commission is "Paint a portrait of Murray Rothbard for the new Library".

| Grade | Sats |
|---|---|
| Accepted | 100,000 |
| Accepted with changes | 80,000 |
| Not accepted | 0 |

- **Ahead of the award:**
  - `deposit_pct`: 10.
  - Milestones: "Sketch approved" at 20% and "Underpainting" at 30%.
- **Deliverables:** one oil portrait, 24 × 30 in, and a framed print.
- **Cover terms:**
  - IP is assigned to the client.
  - The work is deemed "Accepted" after 14 days.
  - An arbiter is named, with escrow at a mint the client chose.
- **The money:**
  1. The client pays 10,000 sats on claim, then 20,000 and 30,000 on the milestone days.
  2. The other 40,000 sit in escrow from the claim.
  3. Graded "Accepted", those 40,000 sats go to the painter.

## Organizations and Projects

A business or a team groups its commissions under an Organization, and its Organization's Projects.

- **Organizations:**
  - `taskbooth_save_organization(name, about)` makes an Organization you own.
  - `taskbooth_save_member(org_id, member, label)` adds a colleague's npub. Members are colleagues of the owner, not the professionals.
  - Members see its Projects and every commission filed in them, and may post into them.
  - Only the owner changes the Organization, its members or its Projects.
- **Projects:**
  - `taskbooth_save_project(org_id, name, brief, budget_sats, circle, defaults)` makes a Project.
  - Its circle of professionals and its default cover terms are where a new commission in it starts.
  - Pass `org_id` and `project_id` to `taskbooth_post_task` to file a commission there, or call `taskbooth_file_task` to move one.
  - `taskbooth_get_project(project_id)` returns the Project, with `totals.committed_sats` and `totals.paid_sats` against its budget.

## Also on the site

- **Calendar:**
  - `taskbooth_calendar_publish` makes a private iCalendar link of the caller's commissions, served at `/calendar/<token>.ics`.
  - `taskbooth_calendar_list` and `taskbooth_calendar_revoke` manage it.
- **Learn** pages explain, for a newcomer:
  - sats and Lightning, keys and wallets;
  - npubs, signatures and the signed offer;
  - deposits and milestones, grading and deemed acceptance;
  - who owns the work, disagreements and standing;
  - pricing in sats.

  The Glossary defines every term the site uses, escrow and mints among them.
- **The Catalog** shows the shelves of the Good Brew café, CommissionMarket's sibling storefront:
  - MCPs to put to work, and DPYC goods;
  - books for the craft and the trade;
  - consultations with practitioners.

  Orders are placed at the café.
- **Languages:** the site reads in English, Spanish, French, Hindi, Japanese and Chinese.
