import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { useAggregatedNews } from "@/hooks/useNews";
import { useSearchStore } from "@/hooks/useSearchStore";
import { PUBLIC_FIGURES } from "@/data/publicFigures";
import { MainFeedSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUpRight, Image as ImageIcon, Layers3, SearchX, Sparkles } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { NewsImage } from "@/components/NewsImage";
import { getThumbnailUrl } from "@/utils/imageOptimizer";

const BATCH = 18;

const normalizeSearchText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

interface StudioStory {
  id: string;
  title: string;
  image: string;
  bias: { left: number; center: number; right: number };
  blindspot?: "left" | "right" | "none";
  category: string;
  location: string;
  sourcesCount: number;
  timeAgo: string;
  description?: string;
  sources: Array<{ name: string; url: string; bias?: string }>;
}

type PosterVariant = "editorial" | "breaking" | "comparison";

const DEMO_STORIES: StudioStory[] = [
  {
    id: "demo-1",
    title: "Guvernul pregătește un nou pachet pentru transportul public din marile orașe",
    image: "https://picsum.photos/seed/clarstiri-demo-transport/1200/1500",
    bias: { left: 22, center: 56, right: 22 },
    blindspot: "none",
    category: "Actualitate",
    location: "România",
    sourcesCount: 9,
    timeAgo: "Acum 12 min",
    description: "Un exemplu de articol scurt, cu un hero clar și o bară de bias care să rămână citibilă în screenshot.",
    sources: [],
  },
  {
    id: "demo-2",
    title: "Un nou raport despre energia verde schimbă discursul public înainte de votul din Parlament",
    image: "https://picsum.photos/seed/clarstiri-demo-energia/1200/1500",
    bias: { left: 41, center: 37, right: 22 },
    blindspot: "left",
    category: "Economie",
    location: "București",
    sourcesCount: 7,
    timeAgo: "Acum 18 min",
    description: "Layout-ul păstrează feed-ul actual, dar îl face să semene mai mult cu un poster editorial pentru Instagram.",
    sources: [],
  },
  {
    id: "demo-3",
    title: "Ce spun sursele din presă despre măsurile de siguranță de la litoral",
    image: "https://picsum.photos/seed/clarstiri-demo-litoral/1200/1500",
    bias: { left: 15, center: 68, right: 17 },
    blindspot: "right",
    category: "Societate",
    location: "Constanța",
    sourcesCount: 11,
    timeAgo: "Acum 23 min",
    description: "Un format util pentru capturi în care vrei titlu mare, context scurt și o singură idee dominantă.",
    sources: [],
  },
  {
    id: "demo-4",
    title: "Negocierile din coaliție rămân tensionate după discuțiile despre bugetul de anul viitor",
    image: "https://picsum.photos/seed/clarstiri-demo-politica/1200/1500",
    bias: { left: 19, center: 49, right: 32 },
    blindspot: "none",
    category: "Politică",
    location: "România",
    sourcesCount: 13,
    timeAgo: "Acum 31 min",
    description: "Bun pentru a testa cum arată cardurile mari pe landing page și cum se exportă în social.",
    sources: [],
  },
  {
    id: "demo-5",
    title: "Ploi puternice și avertizări meteo în mai multe județe din sudul țării",
    image: "https://picsum.photos/seed/clarstiri-demo-meteo/1200/1500",
    bias: { left: 28, center: 44, right: 28 },
    blindspot: "none",
    category: "Mediu",
    location: "Sudul României",
    sourcesCount: 6,
    timeAgo: "Acum 39 min",
    description: "Un exemplu neutru, cu imagine simplă și contrast bun pentru poster preview.",
    sources: [],
  },
  {
    id: "demo-6",
    title: "O schimbare majoră în tehnologie ridică întrebări despre reguli și verificarea informației",
    image: "https://picsum.photos/seed/clarstiri-demo-tech/1200/1500",
    bias: { left: 24, center: 52, right: 24 },
    blindspot: "none",
    category: "Tehnologie",
    location: "Online",
    sourcesCount: 8,
    timeAgo: "Acum 47 min",
    description: "Folosește aceeași ierarhie ca Ground News, dar adaptată la structura ta actuală.",
    sources: [],
  },
];

function StoryPoster({
  story,
  variant = "editorial",
  elementId,
}: {
  story: StudioStory;
  variant?: PosterVariant;
  elementId?: string;
}) {
  const left = Math.round(story.bias.left);
  const center = Math.round(story.bias.center);
  const right = Math.round(story.bias.right);
  const isBreaking = variant === "breaking";
  const isComparison = variant === "comparison";

  return (
    <div
      id={elementId || `studio-poster-${variant}`}
      data-screenshot-target="story-poster"
      className={[
        "relative aspect-[4/5] overflow-hidden rounded-[2rem] border text-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)]",
        isBreaking ? "border-[#b22d2d]/60 bg-[#7e1f1f]" : "border-border/60 bg-zinc-950",
      ].join(" ")}
    >
      <NewsImage
        src={getThumbnailUrl(story.image)}
        seed={story.title}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={[
          "absolute inset-0 h-full w-full object-cover",
          isBreaking ? "grayscale contrast-125 brightness-[0.62]" : "grayscale contrast-110 brightness-[0.72]",
        ].join(" ")}
      />

      <div
        className={[
          "absolute inset-0",
          isBreaking
            ? "bg-[linear-gradient(180deg,rgba(122,23,23,0.16)_0%,rgba(66,9,9,0.42)_42%,rgba(0,0,0,0.78)_100%)]"
            : "bg-[linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.24)_44%,rgba(0,0,0,0.7)_100%)]",
        ].join(" ")}
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          <span className={[
            "rounded-full px-3 py-1 text-[11px] font-semibold tracking-tight text-zinc-900",
            isBreaking ? "bg-red-200/90" : "bg-amber-200/90",
          ].join(" ")}>
            {story.category.toUpperCase()}
          </span>
          <span className="rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold tracking-tight text-zinc-900">
            {story.sourcesCount} sources
          </span>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/8 px-3 py-2 text-right backdrop-blur-md">
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/65">thesite.ro</p>
          <p className="text-[11px] font-medium text-white/85">
            {isBreaking ? "Breaking layout" : isComparison ? "Comparison layout" : "Private preview"}
          </p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
            Trending
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
            {story.location}
          </span>
        </div>

        <h2 className="max-w-[14ch] text-[2.5rem] font-semibold leading-[0.94] tracking-[-0.05em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-[3rem]">
          {story.title}
        </h2>

        {story.description && (
          <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-white/78 line-clamp-2">
            {story.description}
          </p>
        )}

        <div className="mt-5">
          {isComparison ? (
            <div className="rounded-[1.2rem] bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em] text-white/65">
                <span>L {left}%</span>
                <span>C {center}%</span>
                <span>R {right}%</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/12 ring-1 ring-white/15">
                <div className="bg-[#2f5fa6]" style={{ width: `${story.bias.left}%` }} />
                <div className="bg-[#f5f1e8]" style={{ width: `${story.bias.center}%` }} />
                <div className="bg-[#9a2f2f]" style={{ width: `${story.bias.right}%` }} />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em] text-white/65">
                <span>L {left}%</span>
                <span>C {center}%</span>
                <span>R {right}%</span>
              </div>

              <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/12 ring-1 ring-white/15">
                <div className="bg-[#2f5fa6]" style={{ width: `${story.bias.left}%` }} />
                <div className="bg-[#f5f1e8]" style={{ width: `${story.bias.center}%` }} />
                <div className="bg-[#9a2f2f]" style={{ width: `${story.bias.right}%` }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PosterSet({ stories }: { stories: StudioStory[] }) {
  const items = [
    { story: stories[0], variant: "editorial" as const },
    { story: stories[1], variant: "breaking" as const },
    { story: stories[2], variant: "comparison" as const },
  ].filter((item) => Boolean(item.story));

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/80 p-4 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            instagram pack
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Trei screenshot-uri gata de comparat
          </h2>
        </div>
        <div className="hidden rounded-full border border-border bg-muted/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground md:block">
          3 variations
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {items.map(({ story, variant }) => (
          <div key={`${story.id}-${variant}`} className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              <span>{variant}</span>
              <span>{story.category}</span>
            </div>
            <StoryPoster story={story} variant={variant} elementId={`studio-pack-poster-${variant}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

const StudioPreview = () => {
  const { data: stories, isLoading, error, refetch, isFetching } = useAggregatedNews(60);
  const [visible, setVisible] = useState(BATCH);
  const { query, clearQuery } = useSearchStore();

  const normalizedQuery = normalizeSearchText(query || "");
  const hasSearchQuery = normalizedQuery.length > 0;

  const convertedStories = useMemo(() => {
    let filtered = stories || [];

    if (hasSearchQuery) {
      const q = normalizedQuery;
      filtered = filtered.filter((story) => {
        const titleMatch = normalizeSearchText(story.title).includes(q);
        const descMatch = normalizeSearchText(story.description || "").includes(q);
        const sourceMatch = story.sources.some((src) => normalizeSearchText(src.source.name).includes(q));

        return titleMatch || descMatch || sourceMatch;
      });
    }

    return filtered.map((story) => ({
      id: story.id,
      title: story.title,
      image: story.image || PLACEHOLDER_IMAGE,
      bias: story.bias,
      blindspot: story.blindspot,
      category: story.mainCategory || "General",
      location: "România",
      sourcesCount: story.sourcesCount,
      timeAgo: story.timeAgo,
      description: story.description,
      sources: story.sources.map((source) => ({
        name: source.source.name,
        url: source.source.url,
        bias: source.source.bias,
      })),
    })) as StudioStory[];
  }, [stories, hasSearchQuery, normalizedQuery]);

  const useDemoContent = convertedStories.length === 0;
  const displayStories = useDemoContent ? DEMO_STORIES : convertedStories;
  const featuredStory = displayStories[0];

  const matchedVoices = useMemo(() => {
    if (!hasSearchQuery) return [];

    return PUBLIC_FIGURES.filter((figure) => {
      const inName = normalizeSearchText(figure.name).includes(normalizedQuery);
      const inRole = normalizeSearchText(figure.role).includes(normalizedQuery);
      const inDesc = normalizeSearchText(figure.description).includes(normalizedQuery);
      const inTargets = figure.targets.some((target) => normalizeSearchText(target).includes(normalizedQuery));

      return inName || inRole || inDesc || inTargets;
    });
  }, [hasSearchQuery, normalizedQuery]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(245,243,239,0.86)_0%,rgba(249,247,243,1)_20%,rgba(255,255,255,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(10,10,12,1)_0%,rgba(13,13,16,1)_100%)]">
      <Helmet>
        <title>Studio privat | thesite.ro</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-6 md:py-10 lg:max-w-[90%] xl:max-w-[85%]">
        <section className="mb-10 md:mb-14">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            <span className="rounded-full border border-border bg-card px-3 py-1 text-foreground">
              Private preview
            </span>
            <span className="rounded-full border border-border/60 bg-card px-3 py-1">
              layout lab
            </span>
            <span className="rounded-full border border-border/60 bg-card px-3 py-1">
              screenshot-ready
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="space-y-6">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-6xl md:leading-[0.95]">
                  Citești. Compari. Postezi.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Aceasta este o variantă privată a landing page-ului actual, construită ca să păstreze
                  structura pe care o ai deja, dar să îți dea o compoziție mai bună pentru screenshot-uri,
                  export social și un look mai editorial.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.35)]">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Poster
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    Un singur cadru clar, bun pentru Instagram și pentru share.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.35)]">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    <Layers3 className="h-3.5 w-3.5" />
                    Structură
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    Hero, feed, surse și footer rămân, doar sunt compuse mai curat.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.35)]">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Capture
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    Ușor de țintit din script, fără rupe layout-ul public.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-card p-4 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.3)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                    reference poster
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    Format 4:5, bun pentru export.
                  </p>
                </div>
                <div className="rounded-full border border-border bg-muted/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  1080 x 1350
                </div>
              </div>

              {featuredStory ? (
                <StoryPoster story={featuredStory} />
              ) : (
                <div className="flex min-h-[28rem] items-center justify-center rounded-[2rem] border border-dashed border-border bg-muted/30 text-center text-sm text-muted-foreground">
                  Posterul apare după ce încarcă fluxul de știri.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mb-8">
          <PosterSet stories={displayStories} />
        </div>

        {isLoading && !useDemoContent && (
          <div className="space-y-10">
            <MainFeedSkeleton />
            <MainFeedSkeleton />
          </div>
        )}

        {useDemoContent && (
          <div className="mb-8 rounded-[2rem] border border-border bg-card p-5 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  demo content active
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Fluxul RSS nu este disponibil acum, așa că pagina afișează exemple locale cu imagini pentru preview.
                </p>
              </div>
              <Button onClick={() => refetch()} variant="outline" className="rounded-full border-border px-6">
                Reîncearcă datele
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isFetching && !useDemoContent && !stories?.length && (
          <div className="rounded-[2rem] border border-border bg-card p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <p className="font-semibold text-foreground">Flux gol</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              {error?.message ?? "Sursele RSS nu au putut fi interpolate. Reveniți."}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="mt-6 rounded-full border-border px-6">
              Reîncearcă
            </Button>
          </div>
        )}

        {!isLoading && hasSearchQuery && matchedVoices.length > 0 && (
          <section className="mb-8 rounded-[2rem] border border-border bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Voci relevante ({matchedVoices.length})
              </h2>
              <Link
                to="/influenceri"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
              >
                Vezi influenceri
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {matchedVoices.slice(0, 6).map((figure) => (
                <Link
                  key={figure.id}
                  to={`/voce/${figure.slug}`}
                  className="flex items-center gap-3 rounded-[1.25rem] border border-border px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <img
                    src={figure.image}
                    alt={figure.name}
                    className="h-12 w-12 rounded-full object-cover border border-border/50"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{figure.name}</p>
                    <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {figure.role}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!isLoading && stories?.length && hasSearchQuery && convertedStories.length === 0 && matchedVoices.length === 0 && (
          <div className="rounded-[2rem] border border-border bg-card p-8 text-center">
            <SearchX className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="font-semibold text-foreground">Niciun rezultat</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Nu am găsit nimic pentru &quot;{query}&quot;. Încearcă alt termen.
            </p>
            <Button onClick={() => clearQuery()} variant="outline" className="mt-6 rounded-full border-border px-6">
              Șterge căutarea
            </Button>
          </div>
        )}

        {displayStories.length > 0 && (
          <section className="rounded-[2rem] border border-border/70 bg-card/80 p-4 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  curated feed
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  Știri cu aceeași structură, dar cu prezentare mai bună
                </h2>
              </div>
              <div className="hidden rounded-full border border-border bg-muted/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground md:block">
                {visible} / {displayStories.length}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayStories.slice(0, visible).map((news) => (
                <NewsCard key={news.id} variant="default" news={news} />
              ))}
            </div>

            {visible < displayStories.length && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => setVisible((value) => value + BATCH)}
                  variant="outline"
                  className="rounded-full border-border px-6 uppercase tracking-[0.2em]"
                >
                  Mai multe știri
                </Button>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="mt-16 border-t border-border/70 bg-card/80 py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:text-left">
          <div>
            <p className="text-sm font-semibold text-foreground">
              thesite<span className="text-primary">.ro</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              private preview
            </p>
          </div>

          <nav className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <Link to="/surse" className="hover:text-foreground">
              Surse
            </Link>
            <Link to="/influenceri" className="hover:text-foreground">
              Influenceri
            </Link>
            <Link to="/metodologie" className="hover:text-foreground">
              Metodologie
            </Link>
          </nav>

          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            © 2026 Toate drepturile rezervate
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StudioPreview;
