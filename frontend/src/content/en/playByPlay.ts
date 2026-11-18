/**
 * Commissions, play by play, in English: one portrait, three endings, told
 * against the Standard Terms v1. One sentence to a line.
 *
 * Markup: [[word]] or [[word|other words]] marks a key word from `words`, and
 * §6.5 links a clause. To translate, translate the string values only; keep
 * the keys, the markup, the clause numbers, and how many items a list has.
 */

import type { PlayByPlayText } from "../../lib/playByPlay.ts";

export const playByPlay: PlayByPlayText = {
  title: "One portrait, three endings",
  intro: [
    "Rosa commissions a portrait from Theo, and the story ends three ways.",
    "Each ending follows the Standard Terms v1, clause by clause.",
    "Hover or tap an underlined word for what it means, and a § number to read the clause.",
  ],
  setupTitle: "How it starts, every time",
  setup: [
    "Rosa wants an oil portrait of her grandfather, painted from an old photograph.",
    "She writes a [[cover]] with a [[rubric]] of four [[grade|grades]], a [[deposit]], one [[milestone]], and an [[arbiter]], Ada.",
    "She invites Theo, a painter she admires, by his [[npub]].",
    "Theo claims the job and signs, and Rosa and Ada sign the same cover page (§2.3, §2.4).",
    "From that moment the terms they signed are fixed for this job (§2.6).",
    "Rosa pays Theo the 20,000 sat deposit, straight to his wallet (§5.2).",
    "Then she pays the [[escrowed|Escrowed Amount]], 50,000 sats, to the [[mint]] (§6.2, §6.3).",
    "It waits there in [[escrow]], locked to all three of their keys (§6.4).",
  ],
  coverTitle: "The cover page",
  cover: [
    ["Grades", "Delighted 100,000 · Good 80,000 · Fair 50,000 · Rough 20,000 sats"],
    ["Deposit", "20% · 20,000 sats at the claim"],
    ["Milestone", "The sketch, day 10 · 30% · 30,000 sats"],
    ["Delivery date", "Day 30"],
    ["Deemed acceptance", "7 days, at Good"],
    ["Arbiter", "Ada"],
    ["Escrow", "50,000 sats at a mint the site offers"],
    ["Refund date", "28 days after delivery · day 58"],
    ["Failure to deliver", "More than 7 days late · day 37"],
  ],
  clock: {
    title: "The clock",
    caption: "Drawn for the tightest case: the portrait arrives just before the failure point, and Rosa grades on the last day she may. Task Booth refuses a refund date that falls before the arbiter's week is out.",
    lanes: ["Pay ahead", "Work", "Grading", "Escrow"],
    deposit: "Deposit",
    milestone: "Milestone",
    painting: "Painting",
    failure: "Before failure",
    delivered: "Delivered",
    grade: "Grade",
    appeal: "Appeal",
    arbiter: "Arbiter",
    locked: "Any two of three keys",
    alone: "Client alone",
    exposed: "Exposed",
    deliveryDate: "Delivery date",
    refund: "Refund date",
    day: "day {n}",
    slider: "Refund date: {n} days after the delivery date",
    roomy: "Ada has {n} days after the last possible appeal, before Rosa could take the escrow back alone.",
    same: "The refund date falls on the last day to appeal, which leaves Ada no time to decide.",
    tight: "The refund date comes {n} days before the last appeal is settled, so Rosa could take the escrow back alone first.",
  },
  phases: ["Day 10 · The sketch", "Day 30 · The delivery date", "A week later · Grading", "The settlement"],
  tallyTitle: "Who ends up with what",
  asideTitle: "Otherwise",
  endings: [
    {
      key: "happy",
      emoji: "🎨",
      title: "It goes well",
      tldr: "Everyone keeps their word, and the escrow pays Theo in full.",
      beats: [
        [
          "Theo sends the sketch, and Rosa likes it.",
          "The [[milestone]] falls due, and Rosa pays Theo 30,000 sats (§5.4).",
        ],
        ["Theo delivers the portrait on day 28 and marks it delivered (§4.1)."],
        [
          "Rosa grades it Delighted: 100,000 sats (§4.3).",
          "She has paid 50,000 ahead, so the [[balance]] is 50,000 (§5.7).",
        ],
        [
          "Rosa and Theo sign the [[split]] together (§6.10).",
          "All 50,000 sats leave the escrow for Theo's [[address]] (§6.9, §6.12).",
          "The mint's small fee comes out of the escrow first (§6.13).",
        ],
      ],
      tally: ["Theo: 100,000 sats, less a few sats of fees.", "Rosa: the portrait, hers outright (§9.1)."],
      aside: ["Theo may show the portrait in his portfolio, unless they agreed on confidentiality (§9.6)."],
    },
    {
      key: "vanish",
      emoji: "🫥",
      title: "The painter vanishes",
      tldr: "Rosa's escrow comes home whole, and the sketch becomes hers.",
      beats: [
        [
          "Theo sends the sketch, and Rosa pays the 30,000 sat milestone (§5.4).",
          "Then he goes quiet.",
        ],
        [
          "Day 30 comes and goes with no portrait.",
          "Rosa writes to Theo's npub, which is how notices are given (§18.4), and hears nothing.",
        ],
        [
          "Past day 37 the portrait is more than 7 days late, the failure point on the cover page.",
          "The job ends for failure to deliver (§14.7).",
          "Theo had 7 days to claim cause for Ada to rule on, and said nothing, so the failure is without cause (§14.8).",
        ],
        [
          "The escrow was never touched.",
          "Ada signs with Rosa to release all 50,000 sats to her (§6.11, §14.10).",
          "The sketch Theo handed over is now Rosa's (§14.11).",
          "Rosa may post the portrait again, for another painter (§14.4).",
        ],
      ],
      tally: ["Theo: keeps the 50,000 sats paid ahead.", "Rosa: 50,000 sats back from escrow, and the sketch."],
      aside: [
        "If Ada can't be reached, Rosa takes the escrow back alone from the [[refund]], day 58 (§6.6).",
        "Nobody here can claw back the deposit or the milestone, because the site never held them (§5.9, §14.9).",
        "Rosa may pursue them in court, under the law the cover page names (§15.2).",
      ],
    },
    {
      key: "stiff",
      emoji: "🧾",
      title: "The client won't pay",
      tldr: "Two keys outvote one: Rosa can't sit on the escrow, and a lowball grade goes to Ada.",
      beats: [
        ["Theo sends the sketch, and Rosa pays the 30,000 sat milestone (§5.4)."],
        ["Theo delivers the portrait on day 28 and marks it delivered (§4.1)."],
        [
          "Rosa grades it Rough: 20,000 sats.",
          "She has already paid 50,000, so the Balance would be zero and the escrow would go back to her (§5.7, §6.9).",
          "Theo [[appeal|appeals]] within 7 days (§4.6).",
          "Ada sets the portrait beside the rubric and decides it is Good: 80,000 sats (§4.7, §8.3).",
        ],
        [
          "Ada signs the split with Theo, and Rosa's signature isn't needed (§6.5, §6.11).",
          "Theo gets 30,000 sats from the escrow, and Rosa gets 20,000 back (§6.9).",
        ],
      ],
      tally: ["Theo: 80,000 sats in all, the Good grade.", "Rosa: the portrait, and 20,000 sats back."],
      aside: [
        "Had Rosa gone silent instead, the [[deemed]], Good, applies after 7 days (§4.5), and Ada signs with Theo the same way (§6.11).",
        "Ada signs before the [[refund]], day 58, when Rosa could take the escrow back alone (§6.6).",
        "Without escrow, the Balance is a debt Rosa owes (§7.3), and the liability cap doesn't shield it (§12.3).",
      ],
    },
  ],
  words: {
    cover: { word: "cover page", says: "The one page everyone signs: the grades, prices, dates and people for this job.", clause: "2.7" },
    rubric: { word: "rubric", says: "The list of grades, each with the sats it pays.", clause: "4.2" },
    grade: { word: "grade", says: "The client's verdict on the delivery, chosen from the rubric. Each grade pays a fixed amount.", clause: "4.3" },
    deposit: { word: "deposit", says: "A share of the top-grade price, paid to the professional when the claim is accepted.", clause: "5.3" },
    milestone: { word: "milestone", says: "A share of the top-grade price that falls due on a set day.", clause: "5.4" },
    arbiter: { word: "arbiter", says: "A person both sides trust, named on the cover page. Ada decides appeals and disputes, and holds one of the escrow's three keys.", clause: "8.3" },
    npub: { word: "npub", says: "A person's public Nostr key: their name here, and the key they sign with.", clause: "18.4" },
    escrowed: { word: "Escrowed Amount", says: "The top-grade price less the deposit and the milestones.", clause: "6.2" },
    mint: { word: "mint", says: "A Cashu mint the site offers. It holds the escrow, and can't move it without the signatures.", clause: "6.15" },
    escrow: { word: "escrow", says: "Sats held at the mint, locked to the client's, the professional's and the arbiter's keys. Any two of them can release it.", clause: "6.5" },
    balance: { word: "Balance", says: "The award less what was paid ahead, and never below zero.", clause: "5.7" },
    split: { word: "split", says: "How the escrow is shared between the professional and the client. Two of the three keys sign it.", clause: "6.10" },
    address: { word: "Lightning address", says: "Where a person is paid: like an email address, for sats.", clause: "6.12" },
    appeal: { word: "appeal", says: "The professional's one chance to contest a grade, within 7 days of it.", clause: "4.6" },
    deemed: { word: "deemed grade", says: "The grade that applies when the client doesn't grade in time.", clause: "4.5" },
    refund: { word: "refund date", says: "From this day, the client alone may take back the whole escrow.", clause: "6.6" },
  },
};
