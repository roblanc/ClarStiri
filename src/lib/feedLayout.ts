// Shared by the homepage feed grid and its loading skeleton so the two never
// drift apart (a mismatch between them shows up as layout shift / CLS).
export const FEED_GRID_CLASS =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 xl:gap-12 px-0 md:px-8 lg:px-12 xl:px-16";

// Outer box of a poster card (the <Link> in NewsCard) and of its skeleton.
export const POSTER_CARD_OUTER_CLASS =
  "group block h-full w-[calc(100%+2rem)] -mx-4 md:mx-0 md:w-full";

// <article> box of a poster card and of its skeleton (minus hover effects).
export const POSTER_CARD_ARTICLE_CLASS =
  "relative flex h-full w-full flex-col overflow-hidden rounded-none border-none md:border-[#e5e5e5] bg-background md:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)] md:rounded-none md:border";
