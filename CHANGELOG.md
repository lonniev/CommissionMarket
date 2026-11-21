# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Changes not yet released live in `changelog.d/`, one file per change — see the README there for why, and `scripts/changelog.py` for what folds them in at release time.

## [0.15.1] — 2026-11-20

### Changed

- llms.txt now opens with what to tell a person about CommissionMarket, and covers escrow and choosing a mint, arbiters and inspectors, reputation, asking someone to review, Organizations and Projects, and the café catalog.

## [0.15.0] — 2026-11-20

### Added

- Every commission has **Ask someone to review it**: pick anyone it names, or anyone else by npub or name@domain, and send them a Nostr message from you with a link to it (NIP-17, signed in your browser by your session key or NIP-07 extension).
- The Escrow card's mint has **Change the mint** while the commission is unclaimed; it opens the editor at Payment stages, and you sign the changed offer again.

### Changed

- Composing a commission, Schedule sits in two columns: when it is needed and when late becomes failure on one side, what lateness costs on the wider other. One column on a phone.

### Fixed

- The ⓘ beside a Project's Circle and Default terms opens toward the card, not off the left of the screen.

## [0.14.3] — 2026-11-20

### Added

- A Project's Circle and Default terms each carry an ⓘ that opens their Glossary meaning, on the Project page and in its form.

### Fixed

- The café's tiles each show the first four lines of their description, right under the title, so every tile is the same modest length.

- On Learn, a section with one lesson (The price) shows it as wide as every other lesson card, so its picture is no longer stretched across the page.

## [0.14.2] — 2026-11-20

### Changed

- An Organization's members now sit under its name, above its Projects, titled "Members of <Organization>". The help and the Glossary say what a member is: a peer who posts commissions into any of its Projects, apart from the professionals each Project's circle invites.

## [0.14.1] — 2026-11-20

### Added

- While Find mints runs, quotations on trust, banks, hoarding and keeping wealth safe scroll by, in every language. Satoshi Nakamoto, Bagehot, Hayek, Mises, J. P. Morgan, Szabo, scripture and Buffett are each quoted from their source.

## [0.14.0] — 2026-11-20

### Changed

- The Profile page sits in folding groups:
  - **You:** profile, language, appearance, time zone, Log out.
  - **Money:** payout address, currency, balance.
  - **This site:** calendar.
  - **Operator:** reputation ranks and Escrow mints, which folds too.

  Each group's panels sit in a grid, so no pane overlaps or repeats. The rank sliders show what each does and read with their units.

## [0.13.1] — 2026-11-20

### Changed

- The found mints sit in a section that folds open and shut, titled with how many were found.
- The freshness filter says "Node updated within 60 days", and the provenance panel says "Last updated".
- A long line on a mint card (such as its server) wraps beside its icon instead of dropping below it.

## [0.13.0] — 2026-11-20

### Added

- Each mint card says where its Lightning node is (country, capacity, channels, or private) and where its web server is (city, country, network, or the shared front it sits behind such as Cloudflare). The provenance panel adds both sources: mempool.space with a link to the node, and ipinfo.io.
- Find mints filters by region (the node's country, and the server's unless it is a shared front), by established (seen a year or more) and by a node announced within 60 days, alongside the rule.

- The mint rule is in the Glossary, in every language. Every "Meets the rule" badge, the mint picker and the Operator's panel link to it, and a link to one Glossary word now scrolls to it and marks it.

- The Glossary explains NUT (a numbered chapter of the Cashu protocol) and the five an escrow needs, in every language; each mint card's escrow NUT line links to it.

## [0.12.1] — 2026-11-20

### Added

- Find mints has a search by name or address and pages of nine, with the count shown.
- Each mint's address opens its provenance, on a mouse hover or the eye on a tablet. It shows what the mint says of itself (description, key, contacts, terms), what cashumints.space has seen and its page there, the Round Robin Auditor's record with its last failure, and the live lock test, each with when it was seen.
- A lock test on a test mint shows no invoice: a test mint marks its own invoices paid, so there is nothing to pay.

## [0.12.0] — 2026-11-20

### Added

- Choosing an escrow mint shows each mint as a card: its escrow NUTs, its uptime over 30 days, the Round Robin Auditor's record and its review count with the latest date (never stars), each from a named source with when it was seen. The commission's escrow panel shows its mint's card too.
- The Operator gets an Escrow mints panel on the Profile page: the mints on offer, a search of every mint that claims the escrow NUTs (best record first, with a filter for the rule: 99% uptime and 3 months clean on the auditor), and a live lock test that locks a few of their own sats with throwaway keys this browser makes, checks the mint refuses one signature, takes two and takes the refund key after its date, then returns the sats.

## [0.11.0] — 2026-11-19

### Added

- A **Terms of use** page (`/terms-of-use`, linked in the footer and on the sign-in card). It covers what the site does and never does, that commissions are between their parties under the Standard Terms, escrow and mints, your data and acceptable use, plus the sections every Tollbooth site shares.

## [0.10.1] — 2026-11-19

### Changed

- The Glossary says that with no arbiter the client, or someone the client names, decides an appeal, as the Standard Terms now do (§4.8).

### Removed

- The cover page and Project defaults no longer ask whether the client commissions as a consumer.

## [0.10.0] — 2026-11-19

### Added

- The **Specification document** field asks for a link to the design document the work must meet (drawings, CAD, requirements, a model) kept under change control. Its link previews on hover, or on a tap of the 👁: the site, the document's title and summary or a file's type and size, and whether a GitHub, GitLab or Bitbucket link is pinned to a commit or tag or follows a branch. A small Pages Function, `/unfurl`, reads a link's head for the preview; it fetches only https links to public sites.
- **Deliverables** are a numbered list: one row each in the form (Enter adds the next, pasted lines split into rows) and numbered on the commission's cover page.

### Changed

- The Catalog and the café shelf show four collections: MCPs, DPYC, Books and Consultations.

### Fixed

- The Profile page packs its cards into columns, so a short card leaves no gap under it.

## [0.9.2] — 2026-11-19

### Changed

- The new-commission form, its tour, the Guide and the Glossary say that the invited professionals are the people who would do the work, and that claiming a commission takes that work on as specified. The Glossary adds **Claim** (Standard Terms §2.2), and the field has an ⓘ.

## [0.9.1] — 2026-11-19

### Changed

- Spanish, Chinese and Hindi address the reader informally (tú, 你, तुम), like French; quotations keep their own words.

## [0.9.0] — 2026-11-19

### Added

- A Glossary of the site's words, apart from the Standard Terms. Every word is searchable, with the clause that governs it, and words tap open in place across the form, the contract, the Guide and the lessons.
- The Good Brew café's shelf on Home and a Catalog: machines artisans prefer, consultations, books and the network's goods, read live, with orders at the café.
- The guild courtyard behind every page, under a veil of the page's colour.
- Guided tours on every page. The new-commission tour opens each block of the form in turn and points at each field.
- A live-tutorial switch and "show me" buttons on the Guide.
- The play-by-play story's cover page now covers every field: filing, deliverables, specification, inspector, late rule and legal choices.
- A new lesson, "Your standing". "When you disagree" now names the arbiter, the windows and the inspector.

## [0.8.0] — 2026-11-19

### Added

- Every wait shows a quotation while Task Booth answers: patrons of the arts, famous commissions, craftsmen such as Gaudí, and contract lawyers, in all six languages.

## [0.7.0] — 2026-11-19

### Added

- Move a commission into a Project: a Project page lists your commissions filed elsewhere, or nowhere, with **Move here**, and a commission's client can move it from its own page. Its terms and signatures stand; a Project's default terms only start new commissions, as its page now says.

## [0.6.0] — 2026-11-19

### Changed

- **Organizations** is the first tab, and a new commission is filed in a Project first: "New commission" asks which Project of your Organizations, and points you to Organizations when you have none.
- The ⚖️ Conclusion block sets the **time to appeal**, the **arbiter's time to rule** and the **time to pay**, in hours or days, in place of a fixed 7 days. The commission page and the escrow refund floor follow them.
- Reputation ranks follow the thresholds the Operator sets on its Profile page.

## [0.5.0] — 2026-11-19

### Added

- **Inspector**: the 👥 People block names an inspector, who signs the offer and, once the work is delivered, gives one signed opinion of it (✅ Verified, ⚠️ Concerns, ❌ Not verified) by Nostr DM. Everyone on the commission sees it; it is advice, and grades nothing.
- **Reputation** at `/people/<npub>`, open to anyone: a card for each part an npub has played (client, professional, arbiter, inspector) with its rank and counts. Every name on the site links to it, and the form shows the rank of each invited professional, arbiter and inspector.
- The Arbitration tab also lists what you inspect, and each row names the commission's inspector.

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

