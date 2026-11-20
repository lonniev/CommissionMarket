/**
 * The words CommissionMarket uses, and what they mean.
 *
 * Each definition says what the word is, in a sentence or two, in the words
 * the pages use. To translate: copy this file, keep every key, and translate
 * the string values. "npub", "nsec", "sha256", "sats" and "Lightning" keep
 * their names; `aka` may list whatever a reader in that language would search
 * by.
 */

import type { GlossaryText } from "../../lib/glossary.ts";

export const glossary: GlossaryText = {
  groups: {
    people: "Who takes part",
    agreement: "The agreement",
    schedule: "Time",
    money: "Money",
    identity: "Keys and signatures",
    standing: "Standing",
    filing: "Where work is filed",
  },
  words: {
    client: {
      term: "Client",
      aka: ["purchaser", "patron", "buyer"],
      said: "The one who commissions the work, sets its terms, grades the delivery and pays.",
    },
    professional: {
      term: "Professional",
      aka: ["artist", "worker", "performer", "artisan"],
      said: "The one who agrees to do the work: they claim a commission, sign its offer, do the work and deliver it.",
    },
    arbiter: {
      term: "Arbiter",
      said: "Someone both parties trust, named on the cover page. The arbiter signs the offer, decides an appeal or a claim of cause, and holds the third key to an escrow.",
    },
    tie_breaker: {
      term: "Tie-breaker",
      said: "Who decides an appeal when the commission has no arbiter: the client, or someone the client names. The professional may ask, and the client's decision settles the payment.",
    },
    inspector: {
      term: "Inspector",
      aka: ["verifier", "assessor"],
      said: "An independent person named on the cover page who looks at the finished work and signs an opinion of it. The opinion is advice, and the inspector holds no escrow key.",
    },
    audience: {
      term: "Invited professionals",
      aka: ["audience", "circle"],
      said: "The professionals a client invites to do the work, by npub. Only they see the commission and may claim it. A Project names its circle for every new commission.",
    },
    offer: {
      term: "Offer",
      aka: ["signed offer", "statement"],
      said: "One plain statement of every term of a commission. The client, the professional, and any arbiter and inspector each sign the same statement.",
    },
    claim: {
      term: "Claim",
      aka: ["claiming", "take on", "accept"],
      said: "A professional's step to take on a commission's work. Once they and the client sign the same offer, they're bound to do the work as specified.",
    },
    cover_page: {
      term: "Cover page",
      aka: ["particulars"],
      said: "The particulars of one commission under the Standard Terms: the deliverables, the people, the windows, the escrow and the legal choices.",
    },
    standard_terms: {
      term: "Standard Terms",
      aka: ["terms and conditions", "contract"],
      said: "The contract every commission is made under, read on the Standard Terms page. The cover page fills in its particulars.",
    },
    deliverable: {
      term: "Deliverable",
      said: "One thing the professional hands over, one to a line on the cover page.",
    },
    spec_link: {
      term: "Specification",
      aka: ["spec", "brief", "design document", "CAD", "requirements", "model", "drawing"],
      said: "A link to the design document the work must meet, such as drawings, CAD, requirements or a model, kept under change control so the signed version stays fixed.",
    },
    spec_hash: {
      term: "Specification sha256",
      aka: ["spec hash", "fingerprint"],
      said: "The fingerprint of the specification file, so both parties can show the file they signed for is the one at the link.",
    },
    grade: {
      term: "Grade",
      said: "A level the work may be judged at, with what it earns in sats. The client grades the delivery, and the highest grade is the price.",
    },
    rubric: {
      term: "Rubric",
      aka: ["grades", "criteria"],
      said: "The list of grades, each with its sats and what earns it.",
    },
    ip_terms: {
      term: "Intellectual property",
      aka: ["IP", "ownership", "copyright", "license"],
      said: "Who owns the finished work and what each party may do with it, chosen on the cover page.",
    },
    governing_law: {
      term: "Governing law",
      aka: ["law", "venue", "jurisdiction"],
      said: "The law the agreement is read under, and the venue where a dispute is heard.",
    },
    needed_by: {
      term: "Needed-by day",
      aka: ["due date", "deadline"],
      said: "The day the client needs the delivery by.",
    },
    late_terms: {
      term: "If the work is late",
      aka: ["late steps", "lateness", "discount"],
      said: "What a late delivery earns: its full grade, a share off for each day, steps off at set times, or the commission closing as missed.",
    },
    failure_point: {
      term: "Failure to deliver",
      aka: ["failure point", "missed"],
      said: "The time after the needed-by day when an undelivered commission ends. Without cause, the escrow and the work handed over are the client's.",
    },
    deemed_acceptance: {
      term: "Deemed acceptance",
      aka: ["deemed grade", "silence"],
      said: "A delivery left ungraded for the agreed days counts as graded at the deemed grade. It keeps silence from holding the sats hostage.",
    },
    appeal_window: {
      term: "Time to appeal",
      aka: ["appeal window"],
      said: "How long the professional has, after a grade, to appeal it, and after a failure, to claim cause. Agreed on the cover page.",
    },
    ruling_time: {
      term: "Arbiter's time to rule",
      aka: ["ruling time"],
      said: "How long the arbiter, or the tie-breaker, has to decide an appeal or a claim of cause. Agreed on the cover page.",
    },
    payment_window: {
      term: "Time to pay",
      aka: ["payment window"],
      said: "How long the client has to pay once a grade is settled. Agreed on the cover page.",
    },
    deposit: {
      term: "Deposit",
      aka: ["deposit on claim", "advance"],
      said: "A share of the top-grade price, paid to the professional when their claim is accepted.",
    },
    milestone: {
      term: "Milestone",
      aka: ["stage", "installment"],
      said: "A share of the top-grade price that falls due on its own day while the work goes on.",
    },
    paid_ahead: {
      term: "Paid ahead",
      said: "The deposit and the milestones together, at most 90% of the price. The grade settles the rest.",
    },
    balance: {
      term: "Balance",
      said: "What the grade awards, less the deposit and the milestones already paid. The client pays it by Lightning invoice.",
    },
    escrow: {
      term: "Escrow",
      said: "The top-grade price less what was paid ahead, held at a Cashu mint and locked to the client's, the professional's and the arbiter's keys. Any two of them release it, in shares.",
    },
    mint: {
      term: "Mint",
      aka: ["Cashu", "ecash"],
      said: "The Cashu service that holds an escrow's sats as ecash locked to the three keys.",
    },
    mint_rule: {
      term: "The mint rule",
      aka: ["meets the rule", "shortlist"],
      said: "What a mint needs before CommissionMarket marks it Meets the rule: it claims every NUT an escrow needs (7, 8, 11, 12 and 20), it was up 99% or more of the last 30 days on cashumints.space, and the Round Robin Auditor has seen it pay without a failure for 3 months or more. If the auditor cannot be reached, a mint still qualifies, marked so. A failed live lock test takes it off.",
    },
    nut: {
      term: "NUT",
      aka: ["Cashu NUT", "Notation, Usage and Terminology"],
      said: "One numbered chapter of the Cashu protocol (Notation, Usage and Terminology). Each mint says which NUTs it supports. An escrow needs five: NUT 7 checks whether ecash is spent, NUT 8 returns a payout's unused Lightning fee, NUT 11 locks sats to keys (the 2-of-3 lock), NUT 12 proves the mint signed honestly, and NUT 20 lets only the key that asked mint a paid invoice.",
    },
    refund_after: {
      term: "Refund after",
      aka: ["refund days", "time-lock"],
      said: "The days after the needed-by day from which the client alone may take an escrow back.",
    },
    sat: {
      term: "sat",
      aka: ["sats", "satoshi"],
      said: "The smallest unit of bitcoin: 100,000,000 sats make one bitcoin. Every price here is in sats.",
    },
    bitcoin: {
      term: "Bitcoin",
      said: "A money with a fixed supply that no government issues and no bank controls.",
    },
    lightning: {
      term: "Lightning",
      said: "A payment network built on Bitcoin for fast, small payments. Commissions are paid over it.",
    },
    invoice: {
      term: "Invoice",
      said: "A Lightning request to be paid an exact number of sats, with an expiry.",
    },
    lightning_address: {
      term: "Lightning address",
      said: "An address like name@wallet.example that makes a fresh invoice for each payment.",
    },
    api_sats: {
      term: "api_sats",
      aka: ["tool fees", "Tollbooth credit"],
      said: "Credit in your Tollbooth wallet that pays the small fee for each Task Booth tool. It is separate from what a commission pays.",
    },
    npub: {
      term: "npub",
      aka: ["public key", "Nostr"],
      said: "Your public Nostr key: the name you are known, invited and signed in by.",
    },
    nsec: {
      term: "nsec",
      aka: ["secret key", "private key"],
      said: "Your secret Nostr key. It signs as you, so it stays in your own hands.",
    },
    signature: {
      term: "Signature",
      aka: ["sign", "signed"],
      said: "Your Nostr key's mark on a statement, proving you agreed to exactly those words. Each signature is asked for and given in a direct message.",
    },
    sha256: {
      term: "sha256",
      aka: ["hash", "fingerprint"],
      said: "A fingerprint of a text or a file: any change to it changes the fingerprint.",
    },
    reputation: {
      term: "Reputation",
      aka: ["standing", "record"],
      said: "What an npub has done on commissions in each part it has played: as client, professional, arbiter and inspector. Anyone may read it.",
    },
    rank: {
      term: "Rank",
      aka: ["new", "uneven", "proven", "trusted", "exemplary"],
      said: "A word for a reputation: new, uneven, proven, trusted or exemplary, from how many commissions finished and how many went well. The Operator sets where each rank begins.",
    },
    claim_of_cause: {
      term: "Claim of cause",
      aka: ["cause", "excuse"],
      said: "The professional's reasons why the work was never delivered, sent within the time to appeal. The arbiter upholds or rejects it, and a failure with cause counts differently.",
    },
    organization: {
      term: "Organization",
      aka: ["org"],
      said: "A group that gathers Projects. Its members post commissions into any of them; the professionals invited to do the work are each Project's circle.",
    },
    member: {
      term: "Member",
      aka: ["members"],
      said: "Someone the owner adds to an Organization. A member sees every Project and its commissions, and may post commissions into them. A member is a client's peer, never one of the invited professionals.",
    },
    project: {
      term: "Project",
      said: "Where a set of commissions is filed, with a budget and default terms. Every new commission is filed in one.",
    },
    project_defaults: {
      term: "Default terms",
      aka: ["defaults", "template"],
      said: "The terms a new commission in a Project starts with. Each commission keeps its own terms afterwards.",
    },
  },
};
