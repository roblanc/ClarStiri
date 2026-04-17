import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAggregatedNews } from "@/hooks/useNews";
import { buildStoryHref } from "@/utils/storyRoute";
import { AggregatedStory } from "@/types/news";

const MAX_SPREADS = 10;

type SpreadKind = "hero" | "rose" | "pale" | "midnight" | "olive" | "drop";

interface Spread {
  kind: SpreadKind;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
}

const PALETTE: Record<SpreadKind, Spread> = {
  hero: {
    kind: "hero",
    bg: "#F0E8D6",
    surface: "#E7DFCD",
    text: "#141414",
    muted: "#5E584B",
    accent: "#C64028",
  },
  rose: {
    kind: "rose",
    bg: "#F2D1CB",
    surface: "#E9C3BC",
    text: "#141414",
    muted: "#6A4A46",
    accent: "#C64028",
  },
  pale: {
    kind: "pale",
    bg: "#CEDEE3",
    surface: "#BDD0D6",
    text: "#15212A",
    muted: "#3F5560",
    accent: "#1B3341",
  },
  midnight: {
    kind: "midnight",
    bg: "#0F1410",
    surface: "#1A2019",
    text: "#EDE6D6",
    muted: "#8FA38F",
    accent: "#D4A64D",
  },
  olive: {
    kind: "olive",
    bg: "#4A5A4B",
    surface: "#3F4E40",
    text: "#EDE6D6",
    muted: "#B8C4B8",
    accent: "#E8B85C",
  },
  drop: {
    kind: "drop",
    bg: "#EDE5D4",
    surface: "#E3DAC6",
    text: "#141414",
    muted: "#5E584B",
    accent: "#7E3B1F",
  },
};

const SEQUENCE: SpreadKind[] = ["hero", "pale", "rose", "olive", "drop", "midnight", "pale", "hero", "drop", "midnight"];

function domainFromUrl(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function firstSentence(text: string): string {
  if (!text) return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  const match = cleaned.match(/^[^.!?]+[.!?]/);
  return (match ? match[0] : cleaned).trim();
}

function splitBody(description: string, title: string): string[] {
  const base = (description || "").replace(/\s+/g, " ").trim();
  if (base.length < 40) {
    return [
      base || `${title}. Un subiect urmărit în presa românească.`,
      "Mai multe surse au reluat informația cu perspective diferite — click pe card pentru comparație.",
    ];
  }
  const sentences = base.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 1) return [base];
  const mid = Math.ceil(sentences.length / 2);
  return [sentences.slice(0, mid).join(" "), sentences.slice(mid).join(" ")];
}

// ────────────────────────────────────────────────────────────────────────────
// Eyebrow (tagline uppercase small-caps)
// ────────────────────────────────────────────────────────────────────────────
function Eyebrow({ label, accent }: { label: string; accent: string }) {
  return (
    <p
      className="font-editorial-sans font-bold uppercase"
      style={{
        color: accent,
        fontSize: "13px",
        letterSpacing: "0.18em",
      }}
    >
      {label}
    </p>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Bottom metadata
// ────────────────────────────────────────────────────────────────────────────
function Meta({ story, palette }: { story: AggregatedStory; palette: Spread }) {
  const domain = domainFromUrl(story.sources[0]?.link);
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-editorial-sans text-[15px]" style={{ color: palette.muted }}>
      <span>{story.sourcesCount} surse · {story.timeAgo}</span>
      {domain && (
        <a
          href={story.sources[0]?.link}
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline underline-offset-4 hover:no-underline"
          style={{ color: palette.accent, textDecorationColor: palette.accent }}
        >
          {domain}
        </a>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SPREAD VARIANTS
// ────────────────────────────────────────────────────────────────────────────

function HeroSpread({ story, index, palette }: { story: AggregatedStory; index: number; palette: Spread }) {
  const body = splitBody(story.description, story.title);
  const n = String(index + 1).padStart(2, "0");
  const tag = index === 0 ? "THE BIG ONE" : "MAIN STORY";
  return (
    <Link to={buildStoryHref(story.id, story.title)} className="block group" style={{ background: palette.bg }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-16 py-20 md:py-32">
        <Eyebrow label={`${tag} · ${(story.mainCategory || "Actualitate").toUpperCase()}`} accent={palette.accent} />
        <h2
          className="font-editorial font-bold group-hover:italic transition-all"
          style={{
            color: palette.text,
            fontSize: "clamp(3rem, 7vw, 7rem)",
            lineHeight: "0.95",
            letterSpacing: "-0.02em",
            marginTop: "2rem",
          }}
        >
          {story.title}
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-16 items-start">
          <span
            className="font-editorial italic font-bold leading-none"
            style={{ color: palette.accent, fontSize: "clamp(6rem, 14vw, 14rem)" }}
          >
            {n}
          </span>
          <div className="max-w-[640px]">
            {body.map((p, i) => (
              <p
                key={i}
                className="font-editorial-sans"
                style={{
                  color: palette.text,
                  fontSize: "19px",
                  lineHeight: "1.55",
                  marginBottom: "1.25rem",
                }}
              >
                {p}
              </p>
            ))}
            {index === 0 && (
              <aside className="mt-8 py-5 pl-5 pr-6" style={{ background: palette.surface, borderLeft: `4px solid ${palette.accent}` }}>
                <Eyebrow label="TE PRIVEȘTE" accent={palette.accent} />
                <p className="font-editorial-sans mt-2" style={{ color: palette.text, fontSize: "18px", lineHeight: "1.5" }}>
                  Dacă urmărești {(story.mainCategory || "știri").toLowerCase()}, articolul ăsta merită 5 minute din dimineața ta.
                </p>
              </aside>
            )}
            <div className="mt-10">
              <Meta story={story} palette={palette} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RoseAlertSpread({ story, index, palette }: { story: AggregatedStory; index: number; palette: Spread }) {
  const body = splitBody(story.description, story.title);
  const n = String(index + 1).padStart(2, "0");
  return (
    <Link to={buildStoryHref(story.id, story.title)} className="block group" style={{ background: palette.bg }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-16 py-20 md:py-28">
        <div
          className="inline-block px-4 py-2 font-editorial-sans font-bold uppercase"
          style={{
            border: `2px solid ${palette.accent}`,
            color: palette.accent,
            fontSize: "13px",
            letterSpacing: "0.2em",
          }}
        >
          HEADS UP · ACTION REQUIRED
        </div>
        <div className="mt-8">
          <Eyebrow label={`${n} · ${(story.mainCategory || "Actualitate").toUpperCase()}`} accent={palette.accent} />
        </div>
        <h2
          className="font-editorial font-bold mt-6 group-hover:italic transition-all"
          style={{
            color: palette.text,
            fontSize: "clamp(2.5rem, 6vw, 6rem)",
            lineHeight: "0.98",
            letterSpacing: "-0.015em",
          }}
        >
          {story.title}
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[1100px]">
          {body.map((p, i) => (
            <p
              key={i}
              className="font-editorial-sans"
              style={{ color: palette.text, fontSize: "19px", lineHeight: "1.55" }}
            >
              {p}
            </p>
          ))}
        </div>
        <div className="mt-12">
          <Meta story={story} palette={palette} />
        </div>
      </div>
    </Link>
  );
}

function PaleItalicSpread({ story, index, palette }: { story: AggregatedStory; index: number; palette: Spread }) {
  const body = splitBody(story.description, story.title);
  const pull = firstSentence(story.description) || story.title;
  return (
    <Link to={buildStoryHref(story.id, story.title)} className="block group" style={{ background: palette.bg }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-16 py-20 md:py-28">
        <div className="h-px w-full" style={{ background: palette.text, opacity: 0.85 }} />
        <div className="mt-10">
          <Eyebrow label={(story.mainCategory || "Actualitate").toUpperCase()} accent={palette.accent} />
        </div>
        <h2
          className="font-editorial italic font-semibold mt-6"
          style={{
            color: palette.text,
            fontSize: "clamp(2.75rem, 6.5vw, 6.5rem)",
            lineHeight: "1.02",
            letterSpacing: "-0.01em",
          }}
        >
          {story.title}
        </h2>
        <div className="mt-12 max-w-[720px]">
          {body.map((p, i) => (
            <p
              key={i}
              className="font-editorial-sans"
              style={{ color: palette.text, fontSize: "19px", lineHeight: "1.6", marginBottom: "1.25rem" }}
            >
              {p}
            </p>
          ))}
        </div>
        <blockquote className="mt-10 pl-5 max-w-[720px]" style={{ borderLeft: `4px solid ${palette.text}` }}>
          <p className="font-editorial font-semibold" style={{ color: palette.text, fontSize: "clamp(1.5rem, 2.4vw, 2rem)", lineHeight: "1.25" }}>
            {pull}
          </p>
        </blockquote>
        <div className="mt-12">
          <Meta story={story} palette={palette} />
        </div>
      </div>
    </Link>
  );
}

function MidnightTerminalSpread({ story, index, palette }: { story: AggregatedStory; index: number; palette: Spread }) {
  const body = splitBody(story.description, story.title);
  const n = String(index + 1).padStart(2, "0");
  const slug = (story.mainCategory || "news").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 18) || "news";
  return (
    <Link to={buildStoryHref(story.id, story.title)} className="block group" style={{ background: palette.bg }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-16 py-20 md:py-28">
        <div className="font-editorial-mono" style={{ fontSize: "17px" }}>
          <span style={{ color: palette.accent }}>~/stiri</span>
          <span style={{ color: palette.muted }}> $ </span>
          <span style={{ color: palette.text }}>cat {slug}.md</span>
        </div>
        <div className="mt-10 flex items-start justify-between gap-6">
          <Eyebrow label={`${(story.mainCategory || "actualitate").toUpperCase()} · WORTH A LOOK`} accent={palette.accent} />
          <span
            className="font-editorial-mono leading-none"
            style={{ color: palette.accent, fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
          >
            {n}
          </span>
        </div>
        <div className="h-px w-full mt-5" style={{ background: palette.muted, opacity: 0.3 }} />
        <h2
          className="font-editorial font-bold mt-10"
          style={{
            color: palette.text,
            fontSize: "clamp(2.5rem, 6vw, 6rem)",
            lineHeight: "1",
            letterSpacing: "-0.015em",
          }}
        >
          {story.title}
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[1100px]">
          {body.map((p, i) => (
            <p
              key={i}
              className="font-editorial-sans"
              style={{ color: palette.text, fontSize: "19px", lineHeight: "1.6", opacity: 0.92 }}
            >
              {p}
            </p>
          ))}
        </div>
        <div className="mt-12">
          <Meta story={story} palette={palette} />
        </div>
      </div>
    </Link>
  );
}

function OliveSpread({ story, index, palette }: { story: AggregatedStory; index: number; palette: Spread }) {
  const body = splitBody(story.description, story.title);
  const n = String(index + 1).padStart(2, "0");
  return (
    <Link to={buildStoryHref(story.id, story.title)} className="block group" style={{ background: palette.bg }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-16 py-20 md:py-28">
        <div className="flex items-baseline justify-between">
          <Eyebrow label={(story.mainCategory || "Actualitate").toUpperCase()} accent={palette.accent} />
          <span
            className="font-editorial italic font-bold leading-none"
            style={{ color: palette.accent, fontSize: "clamp(2.5rem, 4vw, 4rem)" }}
          >
            {n}
          </span>
        </div>
        <h2
          className="font-editorial font-bold mt-8"
          style={{
            color: palette.text,
            fontSize: "clamp(2.5rem, 6.5vw, 6.5rem)",
            lineHeight: "1",
            letterSpacing: "-0.015em",
          }}
        >
          {story.title}
        </h2>
        <div className="mt-14 max-w-[720px]">
          {body.map((p, i) => (
            <p
              key={i}
              className="font-editorial-sans"
              style={{ color: palette.text, fontSize: "19px", lineHeight: "1.6", marginBottom: "1.25rem", opacity: 0.94 }}
            >
              {p}
            </p>
          ))}
        </div>
        <div className="mt-10">
          <Meta story={story} palette={palette} />
        </div>
      </div>
    </Link>
  );
}

function DropCapSpread({ story, index, palette }: { story: AggregatedStory; index: number; palette: Spread }) {
  const body = splitBody(story.description, story.title);
  const joined = body.join(" ");
  const firstChar = joined.charAt(0) || story.title.charAt(0);
  const rest = joined.slice(1);
  const n = String(index + 1).padStart(2, "0");
  return (
    <Link to={buildStoryHref(story.id, story.title)} className="block group" style={{ background: palette.bg }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-16 py-20 md:py-28">
        <div className="flex items-baseline justify-between">
          <Eyebrow label={`ESEU · ${(story.mainCategory || "Actualitate").toUpperCase()}`} accent={palette.accent} />
          <span className="font-editorial-sans font-bold" style={{ color: palette.muted, fontSize: "15px", letterSpacing: "0.15em" }}>
            № {n}
          </span>
        </div>
        <h2
          className="font-editorial font-bold mt-8"
          style={{
            color: palette.text,
            fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
            lineHeight: "1.02",
            letterSpacing: "-0.015em",
          }}
        >
          {story.title}
        </h2>
        <div className="mt-12 max-w-[780px]">
          <p className="font-editorial-sans" style={{ color: palette.text, fontSize: "19px", lineHeight: "1.65" }}>
            <span
              className="font-editorial font-bold float-left mr-4"
              style={{
                color: palette.accent,
                fontSize: "clamp(5rem, 8vw, 7rem)",
                lineHeight: "0.85",
                marginTop: "0.15em",
              }}
            >
              {firstChar}
            </span>
            {rest}
          </p>
        </div>
        <div className="mt-10">
          <Meta story={story} palette={palette} />
        </div>
      </div>
    </Link>
  );
}

function SpreadRouter({ story, index }: { story: AggregatedStory; index: number }) {
  const kind = SEQUENCE[index % SEQUENCE.length];
  const palette = PALETTE[kind];
  switch (kind) {
    case "hero":
      return <HeroSpread story={story} index={index} palette={palette} />;
    case "rose":
      return <RoseAlertSpread story={story} index={index} palette={palette} />;
    case "pale":
      return <PaleItalicSpread story={story} index={index} palette={palette} />;
    case "midnight":
      return <MidnightTerminalSpread story={story} index={index} palette={palette} />;
    case "olive":
      return <OliveSpread story={story} index={index} palette={palette} />;
    case "drop":
      return <DropCapSpread story={story} index={index} palette={palette} />;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Masthead + Footer
// ────────────────────────────────────────────────────────────────────────────
function Masthead() {
  const today = new Date().toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <header className="border-b" style={{ borderColor: "#1a1a1a", background: "#F0E8D6" }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-16 py-6 flex items-center justify-between gap-4">
        <div className="font-editorial-sans font-bold uppercase" style={{ color: "#C64028", fontSize: "12px", letterSpacing: "0.22em" }}>
          Morning Edition
        </div>
        <h1
          className="font-editorial italic font-bold text-center"
          style={{ color: "#141414", fontSize: "clamp(1.75rem, 3vw, 2.25rem)", letterSpacing: "-0.01em" }}
        >
          thesite.ro
        </h1>
        <Link to="/" className="font-editorial-sans font-bold uppercase hover:underline" style={{ color: "#5E584B", fontSize: "12px", letterSpacing: "0.18em" }}>
          ← layout clasic
        </Link>
      </div>
      <div className="mx-auto max-w-[1400px] px-6 md:px-16 pb-5 font-editorial-sans" style={{ color: "#5E584B", fontSize: "13px", letterSpacing: "0.08em" }}>
        {today}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: "#1a1a1a", background: "#F0E8D6" }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-editorial italic font-bold" style={{ color: "#141414", fontSize: "1.5rem" }}>
          thesite.ro
        </span>
        <span className="font-editorial-sans font-bold uppercase" style={{ color: "#5E584B", fontSize: "11px", letterSpacing: "0.22em" }}>
          © 2026 · ediție editorială experimentală
        </span>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Loading & empty
// ────────────────────────────────────────────────────────────────────────────
function LoadingSpread() {
  return (
    <div style={{ background: "#F0E8D6" }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-16 py-32 flex flex-col items-center justify-center gap-6">
        <div className="font-editorial italic font-bold" style={{ color: "#C64028", fontSize: "clamp(3rem, 6vw, 5rem)" }}>
          …
        </div>
        <p className="font-editorial-sans font-bold uppercase" style={{ color: "#5E584B", fontSize: "12px", letterSpacing: "0.22em" }}>
          Se pregătește ediția
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────
const IndexEditorial = () => {
  const { data: stories, isLoading } = useAggregatedNews(40);

  const spreads = useMemo(() => (stories || []).slice(0, MAX_SPREADS), [stories]);

  return (
    <div className="min-h-screen">
      <Masthead />
      <main>
        {isLoading && <LoadingSpread />}
        {!isLoading && spreads.length === 0 && (
          <div style={{ background: "#F0E8D6" }}>
            <div className="mx-auto max-w-[1400px] px-6 md:px-16 py-32">
              <p className="font-editorial italic" style={{ color: "#141414", fontSize: "2rem" }}>
                Ediția de azi e goală. Revino mai târziu.
              </p>
            </div>
          </div>
        )}
        {spreads.map((story, index) => (
          <SpreadRouter key={story.id} story={story} index={index} />
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default IndexEditorial;
