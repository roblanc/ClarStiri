import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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

type PosterVariant = "editorial" | "breaking" | "comparison" | "tabloid";

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
    description: "Un exemplu tehnic, bun pentru a testa contrastul și compoziția.",
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

  const getDominantBadge = (s: StudioStory) => {
    if (s.blindspot === 'left') return 'Ignorat de Stânga';
    if (s.blindspot === 'right') return 'Ignorat de Dreapta';
    if (left > center && left > right) return 'Preluat de Stânga';
    if (right > center && right > left) return 'Preluat de Dreapta';
    return 'Preluat de Centru';
  };

  return (
    <div
      id={elementId || `studio-poster-${variant}`}
      data-screenshot-target="story-poster"
      className="relative overflow-hidden rounded-none border border-black bg-black text-white shadow-2xl flex flex-col justify-between"
    >
      {/* 4:5 Poster Image Area */}
      <div className="relative aspect-[4/5] overflow-hidden w-full flex flex-col justify-between p-5 sm:p-6">
        <NewsImage
          src={getThumbnailUrl(story.image)}
          seed={story.title}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

        {/* Top Badges */}
        <div className="relative z-20 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="bg-[#132238] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-none shadow">
              {story.sourcesCount} SURSE
            </span>
            <span className="bg-[#132238]/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-none backdrop-blur-sm">
              {story.timeAgo || "acum 20 min"}
            </span>
          </div>

          <span className="bg-white text-black text-[11px] font-bold px-3.5 py-1.5 rounded-none shadow">
            {getDominantBadge(story)}
          </span>
        </div>

        {/* Title & Official Watermark with Headphone Character Logo */}
        <div className="relative z-20 space-y-2.5 pt-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug tracking-tight text-balance drop-shadow-md">
            {story.title}
          </h2>
          
          {/* Logo Watermark Pill */}
          <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/20">
            <img 
              src="/hero-illustration-headphones.webp" 
              alt="thesite.ro logo" 
              className="w-4 h-4 object-contain"
            />
            <span className="text-[11px] font-bold text-white tracking-wide">
              thesite.ro
            </span>
          </div>
        </div>
      </div>

      {/* Proportional 3-Column Solid Bias Bar */}
      <div className="flex w-full h-[75px] shrink-0 border-t border-black/20 font-sans">
        {left > 0 && (
          <div 
            style={{ flexGrow: left, minWidth: '15%' }}
            className="bg-[#28508a] text-white flex flex-col items-center justify-center p-1.5"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-90">STÂNGA</span>
            <span className="text-xl font-black">{left}%</span>
          </div>
        )}

        {center > 0 && (
          <div 
            style={{ flexGrow: center, minWidth: '15%' }}
            className="bg-white text-[#1f2937] flex flex-col items-center justify-center p-1.5 border-x border-black/10"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-80">CENTRU</span>
            <span className="text-xl font-black">{center}%</span>
          </div>
        )}

        {right > 0 && (
          <div 
            style={{ flexGrow: right, minWidth: '15%' }}
            className="bg-[#822727] text-white flex flex-col items-center justify-center p-1.5"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-90">DREAPTA</span>
            <span className="text-xl font-black">{right}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PosterSet({ stories }: { stories: StudioStory[] }) {
  const items = [
    { story: stories[0], variant: "editorial" as const },
    { story: stories[1], variant: "breaking" as const },
    { story: stories[2], variant: "comparison" as const },
    { story: stories[3], variant: "tabloid" as const },
  ].filter((item) => Boolean(item.story));

  return (
    <section className="py-8 md:py-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            Pachet Instagram
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Trei screenshot-uri gata de comparat
          </h2>
        </div>
        <div className="hidden rounded-full border border-border bg-muted/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground md:block">
          3 variante
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2 2xl:grid-cols-4">
        {items.map(({ story, variant }) => (
          <div key={`${story.id}-${variant}`} className="space-y-3 w-[calc(100%+2rem)] -mx-4 md:mx-0 md:w-auto">
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

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 md:py-10 lg:px-8">
        <section className="mb-10 md:mb-14">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-foreground">
              Previzualizare privată
            </span>
            <span className="rounded-full border border-border/60 bg-background px-3 py-1">
              laborator de layout
            </span>
            <span className="rounded-full border border-border/60 bg-background px-3 py-1">
              gata de captură
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="space-y-6">
              <div className="max-w-3xl">
                <h1 className="text-[clamp(2.5rem,4.2vw,4.6rem)] font-semibold tracking-[-0.06em] text-foreground leading-[0.95]">
                  Citești. Compari. Postezi.
                </h1>
                <p className="mt-5 max-w-2xl text-[clamp(1rem,1.15vw,1.15rem)] leading-relaxed text-muted-foreground">
                  Aceasta este o variantă privată a landing page-ului actual, construită ca să păstreze
                  structura pe care o ai deja, dar să îți dea o compoziție mai bună pentru screenshot-uri,
                  export social și un look mai editorial.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    to="/studio-instagram"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    Laborator Carusele Instagram (5 Slide-uri)
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="border-t border-border/60 pt-3">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Cadru
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    Un singur cadru clar, bun pentru Instagram și pentru share.
                  </p>
                </div>
                <div className="border-t border-border/60 pt-3">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    <Layers3 className="h-3.5 w-3.5" />
                    Structură
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    Hero, feed, surse și footer rămân, doar sunt compuse mai curat.
                  </p>
                </div>
                <div className="border-t border-border/60 pt-3">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Captură
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    Ușor de țintit din script, fără rupe layout-ul public.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-6">
              <div className="mb-4 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                <div>
                  <p>Poster de referință</p>
                  <p className="mt-1 text-[11px] font-medium tracking-normal normal-case text-foreground">
                    Format 4:5, bun pentru export.
                  </p>
                </div>
                <div className="rounded-full border border-border/70 bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
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

        <div className="mt-8 border-t border-border/60 pt-8 md:mt-10 md:pt-10">
          <PosterSet stories={displayStories} />
        </div>

        {isLoading && !useDemoContent && (
          <div className="space-y-10">
            <MainFeedSkeleton />
            <MainFeedSkeleton />
          </div>
        )}

        {useDemoContent && (
          <div className="my-8 border-y border-border/60 py-4 md:my-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  Conținut demo activ
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
          <div className="py-10 text-center">
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
          <section className="my-8 border-y border-border/60 py-6 md:my-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Voci relevante ({matchedVoices.length})
              </h2>
              <Link
                to="/tribuni"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
              >
                Vezi Tribuni
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
          <div className="py-10 text-center">
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
          <section className="py-8 md:py-10">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  Feed curat
                </p>
                <h2 className="mt-1 text-[clamp(1.3rem,1.8vw,1.9rem)] font-semibold tracking-tight text-foreground">
                  Știri cu aceeași structură, dar cu prezentare mai bună
                </h2>
              </div>
              <div className="hidden rounded-full border border-border/70 bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground md:block">
                {visible} / {displayStories.length}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-7">
              {displayStories.slice(0, visible).map((news) => (
                <NewsCard key={news.id} variant="poster" news={news} />
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

      <Footer />
    </div>
  );
};

export default StudioPreview;
