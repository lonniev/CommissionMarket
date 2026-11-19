# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Changes not yet released live in `changelog.d/`, one file per change — see the README there for why, and `scripts/changelog.py` for what folds them in at release time.

## [0.4.0] — 2026-11-18

### Added

- An **Arbitration** tab (⚖) for everyone lists the commissions you're part of that name an arbiter, and who that arbiter is, with whether they've signed. As the arbiter you see Asked to arbitrate (sign the offer, by DM), Waiting on your decision (an appeal, a claim of cause, an escrow split) and You arbitrate. As a client you see Your commissions; as a professional, Your work; as an invitee, Open to you. Each row opens the commission, where you sign or decide.

## [0.3.1] — 2026-11-18

### Fixed

- The commission list shows only commissions: tasks under a cover page. A ChipIn chore posted before sites stamped their tasks, such as Make the Bed, no longer appears here, and stays in ChipIn.

## [0.3.0] — 2026-11-18

### Added

- 📅 Schedule: "If the work is late" offers **Steps**, rows of "more than N hours or days late → X% off", rising.
- 📅 Schedule: every commission sets its **failure point**, "Failure to deliver after N hours or days late". It's 7 days unless changed, and it must come after the last step. The escrow refund floor counts from it.
- A commission that fails to deliver says so, with when the professional may **Claim cause** and the arbiter's **Uphold / Reject**. Once the failure stands without cause, the escrow panel says the client and the arbiter sign the whole escrow back to the client (Terms §14.10).
- The play-by-play's "painter vanishes" now follows the new §14: no clawback of what was paid ahead, the whole escrow back to Rosa, and the sketch becomes hers.

### Changed

- Each block of the commission form and page has its own picture: 📝 👥 🏅 📅 💰 ⚖️ 📜.
- A deposit or milestone shows what it is a share of: 10 % × 1,000 sats = 100 sats.

## [0.2.0] — 2026-11-18

### Added

- The commission form reads as seven collapsible blocks — Commission specification, Who takes part, Grades and price, Schedule, Payment stages, Conclusion protocol, Legal terms — each with a one-line summary while closed. A refused Post opens the block holding the problem; escrow's missing pieces link to the blocks that set them. A posted commission's page shows the same seven blocks, read-only.
- Every npub asked for (who may claim, arbiter, Project circle and arbiter, Organization members) is an npub field: checked as typed, shown as a chiclet with the person's Nostr name, picture and NIP-05, with Remove.
- Deemed acceptance reads "If the client doesn't grade in time", with choices like "Count it as Good".

- A Project names a default arbiter, who fills in on each new commission filed under it.

### Fixed

- "Hold the Balance in escrow" ticks at any time, and says under it what is still missing (an arbiter, a deemed grade). Its refund days rise to the floor when escrow is ticked or the deemed days grow.

## [0.1.0] — 2026-11-18

### Added

- Escrow on the site. The commission form names an arbiter and can hold the Balance at a Cashu mint, with the refund date's floor shown as you type. The offer gains the arbiter's signature. A new Escrow panel shows each step and the invoice, proposes the award, the arbiter's ruling or the client's refund, and collects a share. Each signature is made with this browser's key, in Pricing Studio, or elsewhere and pasted, and the page never signs a message it has not rebuilt and checked.

- CommissionMarket's first cut, over Task Booth 0.2.0: post a commission with grades, an invited circle of npubs, a deposit, dated milestones and a cover page; both parties sign one offer by Nostr DM; claim, pay the deposit and each milestone by exact Lightning invoice, deliver, grade, and pay the award less what was paid ahead. The Standard Terms are readable signed out. English, French, Spanish, Japanese, Chinese and Hindi; the translations are machine-made and not yet reviewed.

- A Guide in seven step cards, and a lighter Home: a line, two ways in, three reasons.
- Learn: nine lessons for clients and professionals (sats, keys, signatures, the signed offer, payments ahead, grading, IP, disagreements, price), a glossary and a bookshelf, in all six languages.
- A Calendar of every commission's events, with a private link for your own calendar app on Profile.
- Search and ordering (by date, person or state) on the commission list.
- The brief opens in the shared Markdown editor from `@tollbooth-dpyc/web`.
- The Wallet's top-up tiles are marked Sketch, Study, Commission, Gallery and Library.
- The running example is now "Paint a portrait of Murray Rothbard for the new Library".

- Home's hero stands over a guild courtyard, and shared links show it as their preview image.

- Organizations and Projects: make an Organization, add colleagues by npub, and keep Projects in it, each with a brief, a budget, a default circle and default terms. Post a commission into a Project and it starts from those; the Project page shows its budget against what its commissions committed and paid.
- The commission list filters and orders by Project, and a commission names its Project. Members see an Organization's commissions under "In my Organizations".
- The site names itself to Task Booth, so its lists and calendar show only CommissionMarket commissions (and any posted with no site).

- The Guide is now "Commissions, Play by Play": after the seven steps, one portrait commission ends three ways side by side (it goes well, the painter vanishes, the client won't pay), each told against the Standard Terms v1 with a TL;DR, who ends up with what, and what would have gone otherwise. Key words show their meaning on hover or tap, and every § number links its clause.
- "The clock": a short, wide timeline of one commission's key dates in four lanes (pay ahead, work, grading, escrow), with the refund date in gold. A slider moves the refund date, and the stretch where the client could take the escrow back before an appeal is settled is marked exposed.

### Changed

- The clock's tightest case now delivers on the last day of grace, and the story's refund date is Task Booth's floor: 28 days after delivery (day 58), so Ada always has her week.

- The Standard Terms page lays the terms out for reading: a contents list, numbered sections with their clauses in a gutter, defined terms in bold, and section references as links. Every clause has its own link (`/terms#t-6-16`). The words are unchanged, and the exact hashed text is one tap away.

### Fixed

- Text now uses the width the screen gives it: the page grows to 90rem (it stopped at 60rem), and the Home hero, the Standard Terms and the commission and sign-in forms no longer stop their text partway across.

- The Operator settings on Profile sit in a card like the panels beside them, and their field takes the card's width.

- The Task Booth operator now sees the Operator panel on Profile, with Escrow mints (web 3.11.1).

- Web 3.11.2: the sign-in box uses the page's width, and an empty setting shows its example (Escrow mints shows the test mint's address) instead of "null".

