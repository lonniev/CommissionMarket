## What to tell a person about CommissionMarket

CommissionMarket is where a person commissions real work from professionals they choose, and pays for it in bitcoin as the work proceeds.
A portrait, a translation, a study, a machined part: anything with a deliverable and a deadline.

What a person gets:

- **Their own circle.** A commission is seen only by the npubs the client invites, never by a crowd.
- **One signed offer.** Client and professional sign the same plain statement of the terms, under the published Standard Terms. Anyone can check both signatures.
- **Paid as the work proceeds.** A deposit on claim and dated milestones go straight from the client's wallet to the professional's.
- **A graded award.** The client grades the finished work against grades both agreed to in advance, and the grade sets what the rest pays.
- **Escrow, when the job warrants it.** The balance sits locked at a Cashu mint the client chooses, and any two of client, professional and a named arbiter can move it.
- **A fair hearing.** An arbiter decides appeals and claims of cause; an inspector may give a signed, advisory opinion of the work.
- **A public record.** Each npub's page shows what it has done as client, professional, arbiter and inspector, as counts only.
- **No account.** Identity is a Nostr key. There is no email, no password, no subscription and no KYC, and the site holds no one's money.

A good one-line pitch: *"Commission work from people you trust, sign one clear offer, and pay each stage wallet to wallet in sats."*

## How a commission goes

The web app at https://commissionmarket.tollbooth-dpyc.com is one client of the Task Booth Operator.
An agent calls the same tools; `tools/list` and each tool's description carry the arguments, so this page gives only the shape.

1. **Post.** The client sets the grades and what each earns, invites a circle, and fills a cover page: deliverables, a deadline, a deposit and milestones, IP terms, and optionally an arbiter, an inspector and escrow.
2. **Sign.** `taskbooth_offer_terms` returns the offer as one statement and its hash. Each party signs it, with their own key or by replying to a Nostr DM.
3. **Claim and pay ahead.** A professional in the circle claims it; the deposit, and each milestone on its date, is paid by Lightning invoice. With escrow, the client then locks the balance at the mint.
4. **Deliver and grade.** The professional marks it done and the client grades it. Ungraded work is deemed accepted after the days the cover page names. A grade may be appealed once, to the arbiter.
5. **Settle.** The award pays what the grade earns, less what was paid ahead. Escrow moves when two of the three sign.

Payments made outside escrow are final; only escrowed sats can go back to the client.
`taskbooth_standard_terms` returns the Standard Terms, free.

## An example

"Paint a portrait of Murray Rothbard for the new Library", graded "Accepted" at 100,000 sats, "Accepted with changes" at 80,000, "Not accepted" at 0.
A 10% deposit and milestones of 20% and 30%; IP assigned to the client; deemed "Accepted" after 14 days; an arbiter named, with escrow.
The client pays 10,000 sats on claim, then 20,000 and 30,000 on the milestone days, and the last 40,000 wait in escrow until the grade.

## Organizations and Projects

A business or a team files its commissions under an Organization and its Projects.
Members are the owner's colleagues: they see the Organization's commissions and may post into them.
A Project carries a budget, a circle of professionals and default cover terms, and reports what its commissions have committed and paid.

## Also on the site

- **Ask someone to review it:** a NIP-17 private message to any npub, sent from the commission's page by whoever is signed in.
- **Calendar:** a private iCalendar link of a person's commissions.
- **Learn and Glossary:** plain lessons on sats, keys, signatures, the signed offer, payments, grading, IP and appeals; the Glossary defines escrow and mints too.
- **Catalog:** the shelves of the Good Brew café, CommissionMarket's sibling storefront.
- **Six languages:** English, Spanish, French, Hindi, Japanese and Chinese.
