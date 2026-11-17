/**
 * What CommissionMarket teaches a professional or a client new to it: the
 * money (sats, keys, signatures), how a commission is agreed and paid, and what
 * a price says.
 *
 * This file holds what is the same in every language: each lesson's address,
 * picture and outside links, and the bookshelf. The words are per language,
 * in `src/content/<language>/lessons.ts`.
 */

export type LessonGroup = "money" | "contract" | "worth";

interface LessonShape {
  /** The lesson's address: /learn/<slug>. */
  slug: string;
  /** Shown until the lesson's artwork arrives. */
  picture: string;
  group: LessonGroup;
  /** Places outside CommissionMarket. Each opens in a new tab. */
  links?: ReadonlyArray<{ name: string; href: string }>;
}

export const LESSON_SHAPES = [
  { slug: "sats-and-lightning", picture: "⚡", group: "money" },
  { slug: "your-keys-your-wallet", picture: "🔑", group: "money" },
  {
    slug: "your-npub-and-signing", picture: "✍️", group: "money",
    links: [{ name: "nostr.how", href: "https://nostr.how" }],
  },
  { slug: "the-signed-offer", picture: "📜", group: "contract" },
  { slug: "deposits-and-milestones", picture: "🪜", group: "contract" },
  { slug: "delivery-and-grading", picture: "📦", group: "contract" },
  { slug: "who-owns-the-work", picture: "🖼️", group: "contract" },
  { slug: "when-you-disagree", picture: "⚖️", group: "contract" },
  { slug: "price-and-worth", picture: "🏷️", group: "worth" },
] as const satisfies ReadonlyArray<LessonShape>;

export type LessonSlug = (typeof LESSON_SHAPES)[number]["slug"];

const GOOD_BREW = "https://cafe.tollbooth-dpyc.com";

/** Where to go on reading: three shelves at Good Brew. A book's handle is its product page there. */
export const SHELF_SHAPES = [
  {
    key: "money",
    books: [
      { name: "The Bitcoin Standard", by: "Saifedean Ammous", handle: "the-bitcoin-standard" },
      { name: "Mastering the Lightning Network", by: "Andreas M. Antonopoulos, Olaoluwa Osuntokun and René Pickhardt", handle: "mastering-the-lightning-network" },
      { name: "A History of Money and Banking in the United States", by: "Murray N. Rothbard", handle: "history-of-money-and-banking-in-the-united-states" },
      { name: "Economics in One Lesson", by: "Henry Hazlitt", handle: "economics-in-one-lesson" },
    ],
  },
  {
    key: "exchange",
    books: [
      { name: "Man, Economy, and State", by: "Murray N. Rothbard", handle: "man-economy-and-state" },
      { name: "Human Action", by: "Ludwig von Mises", handle: "human-action" },
      { name: "Principles of Economics", by: "Carl Menger", handle: "principles-of-economics" },
      { name: "Choice: Cooperation, Enterprise, and Human Action", by: "Robert P. Murphy", handle: "choice-cooperation-enterprise-and-human-action" },
    ],
  },
  {
    key: "free",
    books: [
      { name: "The Sovereign Individual", by: "James Dale Davidson and William Rees-Mogg", handle: "the-sovereign-individual" },
      { name: "The Road to Serfdom", by: "F. A. Hayek", handle: "the-road-to-serfdom" },
      { name: "The Church and the Market", by: "Thomas E. Woods Jr.", handle: "the-church-and-the-market" },
      { name: "The Network State", by: "Balaji Srinivasan", handle: "the-network-state" },
    ],
  },
] as const;

export type ShelfKey = (typeof SHELF_SHAPES)[number]["key"];
export type BookHandle = (typeof SHELF_SHAPES)[number]["books"][number]["handle"];

export const BOOKSHELF_HREF = `${GOOD_BREW}/collections/books`;

/** One lesson's words in one language. */
export interface LessonText {
  title: string;
  /** Two or three short sentences, one to a line: the lesson in brief. */
  lines: string[];
  /** The longer telling, one sentence to a line. */
  more: string[];
  /** One saying and where it is from. */
  saying?: { text: string; from: string };
  /** Something to do, today, with what was just read. */
  tryThis: string;
  /** A question worth asking yourself. */
  ask: string;
  /** What each outside place is, in the order `LESSON_SHAPES` lists the lesson's links. */
  links?: string[];
}

/** Everything the Learn pages say in one language. */
export interface LessonsText {
  lessons: Record<LessonSlug, LessonText>;
  /** The glossary. "npub", "nsec" and "sha256" keep their names. */
  words: { word: string; means: string }[];
  /** Each shelf's title. */
  shelves: Record<ShelfKey, string>;
  /** What each book is about, by its handle. */
  books: Record<BookHandle, string>;
}

export interface Lesson {
  slug: LessonSlug;
  picture: string;
  group: LessonGroup;
  title: string;
  lines: string[];
  more: string[];
  saying?: { text: string; from: string };
  tryThis: string;
  ask: string;
  links?: { name: string; href: string; says: string }[];
}

export interface Book {
  name: string;
  by: string;
  says: string;
  /** The product's handle at Good Brew. */
  handle: string;
}

export const bookHref = (book: Pick<Book, "handle">) => `${GOOD_BREW}/products/${book.handle}`;

/** The lessons, glossary and bookshelf in one language. */
export interface Library {
  /** Every lesson, in reading order. */
  lessons: Lesson[];
  money: Lesson[];
  contract: Lesson[];
  worth: Lesson[];
  words: { word: string; means: string }[];
  shelves: { key: ShelfKey; title: string; books: Book[] }[];
  at: (slug: string) => Lesson | undefined;
}

/** The lessons as a page shows them: this file's structure with one language's words. */
export function libraryIn(text: LessonsText): Library {
  const lessons: Lesson[] = LESSON_SHAPES.map((shape) => {
    const { links: says, ...rest } = text.lessons[shape.slug];
    const places: ReadonlyArray<{ name: string; href: string }> | undefined = "links" in shape ? shape.links : undefined;
    return {
      ...rest,
      slug: shape.slug,
      picture: shape.picture,
      group: shape.group,
      ...(places ? { links: places.map((k, i) => ({ ...k, says: says?.[i] ?? "" })) } : {}),
    };
  });
  const of = (group: LessonGroup) => lessons.filter((l) => l.group === group);
  return {
    lessons,
    money: of("money"),
    contract: of("contract"),
    worth: of("worth"),
    words: text.words,
    shelves: SHELF_SHAPES.map((s) => ({
      key: s.key,
      title: text.shelves[s.key],
      books: s.books.map((b) => ({ ...b, says: text.books[b.handle] })),
    })),
    at: (slug) => lessons.find((l) => l.slug === slug),
  };
}
