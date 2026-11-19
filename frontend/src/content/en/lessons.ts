/**
 * The lessons, in English: what CommissionMarket teaches a client or a
 * professional new to it. One sentence to a line. A lesson may carry one
 * saying, never more.
 *
 * To translate: copy this folder, and translate the string values only.
 * Keys, the order of lists, and how many items a list has stay as they are.
 * Book titles, authors and the names of outside places are kept in `src/lib/lessons.ts`.
 */

import type { LessonsText } from "../../lib/lessons.ts";

export const lessons: LessonsText = {
  lessons: {
    "sats-and-lightning": {
      title: "Sats and Lightning",
      lines: [
        "A sat is the smallest unit of bitcoin: one hundred-millionth of a coin.",
        "Lightning moves sats from one wallet to another in a second or two, for a fraction of a cent.",
        "Every price on CommissionMarket is in sats, and every payment is a Lightning invoice."
      ],
      more: [
        "Bitcoin is a money no government issues and no bank can freeze.",
        "Its supply is fixed by rule at twenty-one million coins, so nobody can print more to pay their bills.",
        "Lightning is a network of payment channels built on top of Bitcoin, made for small and frequent payments.",
        "A Lightning invoice names an exact amount, and it expires if nobody pays it in time.",
        "When the client pays the professional's invoice, the sats arrive in the professional's own wallet.",
        "CommissionMarket never holds the money, so there is no balance here to be lost, seized or misused.",
        "Beside each price you see its worth in your own currency at today's rate, for reference."
      ],
      saying: {
        text: "The root problem with conventional currency is all the trust that's required to make it work.",
        from: "Satoshi Nakamoto, 2009"
      },
      tryThis: "Ask your wallet for a Lightning invoice of 1,000 sats, and read the amount and the expiry it shows.",
      ask: "What does it change for you when payment for your work arrives in a second instead of in thirty days?"
    },
    "your-keys-your-wallet": {
      title: "Your keys, your wallet",
      lines: [
        "A Lightning wallet holds the keys that control your sats.",
        "Choose a wallet where you hold the keys yourself, and keep its backup words somewhere safe.",
        "A professional needs a wallet that can receive, and a client one that can pay."
      ],
      more: [
        "A key is a very long secret number, and whoever knows it can spend the sats it controls.",
        "Most wallets show the key as twelve or twenty-four backup words when you first set them up.",
        "Write the words on paper and keep the paper where you keep important documents.",
        "Never type them into a website, never photograph them, and never send them to anyone.",
        "A custodial wallet holds the keys for you, which is convenient and asks you to trust its company.",
        "A self-custodial wallet leaves the keys with you alone, which is the sound choice for the income you earn.",
        "A Lightning address, such as name@wallet.example, lets a client pay you without asking you for an invoice each time.",
        "Your Profile here is where you can save one."
      ],
      saying: {
        text: "Not your keys, not your coins.",
        from: "A saying among Bitcoiners"
      },
      tryThis: "Find where your wallet shows its backup words, and check that your written copy matches them.",
      ask: "If your phone were lost tomorrow, could you restore your wallet from what you have written down?"
    },
    "your-npub-and-signing": {
      title: "Your npub and your signature",
      lines: [
        "On CommissionMarket you are known by your npub, the public half of a Nostr key.",
        "The private half, your nsec, signs what you agree to.",
        "Anyone can check a signature against your npub, and nobody can forge it without your nsec."
      ],
      more: [
        "Nostr is an open protocol for messages, and a Nostr key works with any Nostr app.",
        "Your npub is safe to share: it is how clients invite you and how professionals find your commissions.",
        "Your nsec must stay secret, because whoever holds it can sign as you.",
        "To sign in, you approve a message sent to your npub from your Nostr client.",
        "To sign an offer, you reply to the direct message Task Booth sends you, and your reply carries your signature.",
        "A signature covers the exact text of the offer through its sha256, so it cannot be moved to a different offer.",
        "Neither CommissionMarket nor Task Booth ever asks for your nsec."
      ],
      saying: {
        text: "Let your yea be yea; and your nay, nay.",
        from: "James 5:12"
      },
      tryThis: "Open your Nostr client and find your npub, then compare its first eight characters with the one shown on your Profile here.",
      links: ["A plain introduction to Nostr: keys, clients and relays."],
      ask: "Who could act in your name today, and how would you know?"
    },
    "the-signed-offer": {
      title: "The signed offer",
      lines: [
        "A commission becomes an agreement when the client and the professional sign the same offer.",
        "The offer is one plain statement of every term, with its sha256.",
        "The client signs first, and the professional signs before delivering."
      ],
      more: [
        "The offer names the brief, the grades and what each earns, the deposit, the milestones and the needed-by day.",
        "It also carries the cover page: the deliverables, the specification and its sha256, deemed acceptance, intellectual property, confidentiality and governing law.",
        "Everything not on the cover page follows the Standard Terms, named by version and by sha256.",
        "The sha256 is a fingerprint of the text: change one character and the fingerprint changes completely.",
        "So when both signatures cover the same fingerprint, both parties agreed to the very same words.",
        "If the client edits the commission, the offer changes and the client signs again.",
        "An invited professional may claim a commission only after the client has signed it.",
        "Read the offer before you sign it, as you would any contract."
      ],
      saying: {
        text: "It is not from the benevolence of the butcher, the brewer, or the baker that we expect our dinner, but from their regard to their own interest.",
        from: "Adam Smith, The Wealth of Nations (1776)"
      },
      tryThis: "Open the Standard Terms and read the section on deliverables before you post or claim your next commission.",
      ask: "Which term of your last agreement would you most want written down if it came to a disagreement?"
    },
    "deposits-and-milestones": {
      title: "Deposits and milestones",
      lines: [
        "A professional can be paid as the work proceeds.",
        "A deposit is paid when the commission is claimed, and each milestone on its date.",
        "Together they may come to at most 90% of the price, and the grade settles the rest."
      ],
      more: [
        "The client chooses the deposit and the milestones when posting, each as a share of the top grade's price.",
        "A milestone has a name, a due day on or before the needed-by day, and its share.",
        "For each payment, Task Booth makes a Lightning invoice for the exact amount, payable to the professional.",
        "When the professional has a Lightning address on their Profile, the invoice is made from it.",
        "Otherwise the professional hands in an invoice from their own wallet.",
        "The client pays from their own wallet, and the professional confirms when the sats arrive.",
        "At the end, the award is what the grade earns less everything already paid ahead.",
        "If the grade earns less than was paid ahead, nothing more is owed, and nothing is clawed back by the site."
      ],
      saying: {
        text: "At his day thou shalt give him his hire, neither shall the sun go down upon it.",
        from: "Deuteronomy 24:15"
      },
      tryThis: "Take a job you know well and split its price into a deposit and two milestones that match how the work really unfolds.",
      ask: "How much risk does each of you carry before the first sats move, and how would a deposit change that?"
    },
    "delivery-and-grading": {
      title: "Delivery, grading and deemed acceptance",
      lines: [
        "The professional delivers the work and marks the commission delivered.",
        "The client then grades it with one of the grades in the offer.",
        "If the client does not grade within the agreed days, the work is deemed accepted at the agreed grade."
      ],
      more: [
        "Grades are named in advance, such as Accepted, Accepted with changes and Not accepted, each with its sats.",
        "Naming them up front means both parties know what each outcome is worth before any work begins.",
        "Deliver what the cover page lists, in the form the specification describes.",
        "If the work is late, the late rule in the offer applies: paid in full, a share off per day, steps off at set times, or the commission closes as missed.",
        "Work still undelivered at the failure point on the cover page ends the commission, and the professional may claim cause within the time to appeal.",
        "Deemed acceptance protects the professional from a client who never answers.",
        "The cover page sets its grade and its period, from 1 to 60 days.",
        "Once graded, the award less what was paid ahead is owed, and paid by Lightning invoice like every other payment."
      ],
      saying: {
        text: "Seest thou a man diligent in his business? he shall stand before kings.",
        from: "Proverbs 22:29"
      },
      tryThis: "Write the grades for a commission you have in mind, each with a sentence saying exactly what earns it.",
      ask: "What would you need to see in a delivery to grade it at the top without hesitating?"
    },
    "who-owns-the-work": {
      title: "Who owns the work",
      lines: [
        "The cover page says who owns what the professional makes.",
        "It may be assigned to the client, licensed to the client, kept by the professional, or set by your own words.",
        "Settle it before the work starts, because it is part of what is being bought."
      ],
      more: [
        "Assigned means that on payment the client owns the work and its rights outright.",
        "Licensed means the professional keeps ownership and grants the client the right to use it.",
        "Kept by the professional means the client receives the deliverables and the professional keeps every right.",
        "Custom terms let the two of you write exactly what you agree, such as rights for one use or one region.",
        "A portrait for a library's wall, a logo for a company and a study for private use each call for something different.",
        "The choice usually moves the price: owning outright is worth more to a client than a licence.",
        "The cover page also says whether the brief and the work are confidential, and whether subcontractors are allowed."
      ],
      tryThis: "For your next commission, decide which of the four choices fits before you name a price.",
      ask: "What will you want to do with this work in ten years, and does the agreement let you?"
    },
    "when-you-disagree": {
      title: "When you disagree",
      lines: [
        "A professional who disagrees with a grade may appeal it once, with reasons.",
        "The arbiter named on the cover page reads both sides and decides, or the tie-breaker when there is no arbiter.",
        "A client who received nothing may reject the delivery instead of grading it."
      ],
      more: [
        "Most disagreements end sooner with a direct message than with an appeal, so talk first.",
        "An appeal comes within the time to appeal on the cover page, and names what the arbiter should look at.",
        "The record already holds the offer, the grades and the history.",
        "The arbiter chooses a grade from the same list within the time to rule, and that decision is final.",
        "An inspector's signed opinion of the work is advice the arbiter may weigh.",
        "Every step is in the commission's history with its time and who took it.",
        "Before anyone claims a commission, the client may withdraw it.",
        "After claiming it, the professional may release the claim, and the commission opens again to the circle.",
        "The cover page names the governing law and the venue for anything the Standard Terms leave open."
      ],
      saying: {
        text: "Agree with thine adversary quickly, whiles thou art in the way with him.",
        from: "Matthew 5:25"
      },
      tryThis: "Look at the history of a commission you are in, and check that it tells the story as you remember it.",
      ask: "If this commission went wrong, what would you want the arbiter to be able to read?"
    },
    "your-standing": {
      title: "Your standing",
      lines: [
        "Every npub has a reputation, read from the commissions it took part in.",
        "It counts each part separately: as client, professional, arbiter and inspector.",
        "Anyone may read it, so a client can see who they invite and a professional who they work for."
      ],
      more: [
        "For a professional, it counts commissions delivered, on time and late, failures with and without cause, and appeals won and lost.",
        "For a client, it counts grades given in time, Balances paid, and appeals lost.",
        "For an arbiter, it counts rulings given within the time to rule; for an inspector, opinions given.",
        "A rank sums it up in a word: new, uneven, proven, trusted or exemplary.",
        "The rank comes from how many commissions finished and how many of them went well, at thresholds the Operator sets.",
        "Only commissions count, so chores and practice jobs leave your standing as it was.",
        "Each name on the commission form shows its rank beside it, and links to the full record."
      ],
      saying: {
        text: "A good name is rather to be chosen than great riches.",
        from: "Proverbs 22:1"
      },
      tryThis: "Open your own reputation page from your npub, and read it as a stranger would before inviting you.",
      ask: "Which one count in your record would you most like to improve over your next three commissions?"
    },
    "price-and-worth": {
      title: "Price in sats, worth in your currency",
      lines: [
        "Every commission is priced in sats, and every payment is made in sats.",
        "Its worth in your own currency is shown beside it at today's rate, as a reference.",
        "The price you agree is the number of sats, whatever the exchange rate does afterwards."
      ],
      more: [
        "A price is how two people who value things differently agree on an exchange.",
        "The client values the finished work more than the sats, and the professional values the sats more than the hours: that is why both say yes.",
        "Pricing in sats keeps the agreement in the money that is actually paid.",
        "Over a long commission the rate between sats and your currency will move, in either direction.",
        "A deposit and milestones fix part of the price at each payment's own time.",
        "Set the currency shown beside prices on your Profile; it changes the reference only, never the price."
      ],
      saying: {
        text: "We must look at the price system as such a mechanism for communicating information if we want to understand its real function.",
        from: "F. A. Hayek, The Use of Knowledge in Society (1945)"
      },
      tryThis: "Price a commission you would accept, first in your own currency, then in sats, and note the rate you used.",
      ask: "Which do you expect to buy more next year: a thousand sats, or what they are worth in your currency today?"
    }
  },
  shelves: {
    money: "Money",
    exchange: "Exchange and enterprise",
    free: "Free people"
  },
  books: {
    "the-bitcoin-standard": "The history of money, and why a fixed supply matters.",
    "mastering-the-lightning-network": "How Lightning payments work, from channels to invoices.",
    "history-of-money-and-banking-in-the-united-states": "How American money went from gold to paper, told by the man in our example portrait.",
    "economics-in-one-lesson": "Look past today to what a choice does later, and to everyone it touches.",
    "man-economy-and-state": "Rothbard's full treatise on exchange, prices and production.",
    "human-action": "Mises on why people act, trade and plan, and what prices tell them.",
    "principles-of-economics": "Menger's founding work on value: worth lives in the person who values.",
    "choice-cooperation-enterprise-and-human-action": "Human Action, retold for today's reader.",
    "the-sovereign-individual": "What happens to work and income when they move online and across borders.",
    "the-road-to-serfdom": "Why planned economies end in less freedom.",
    "the-church-and-the-market": "A Catholic case for the free economy.",
    "the-network-state": "How communities that begin online can grow into something more."
  }
};
