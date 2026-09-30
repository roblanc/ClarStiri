import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsCard, type NewsItem } from "@/components/NewsCard";
import { useAggregatedNews } from "@/hooks/useNews";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import { useSearchStore } from "@/hooks/useSearchStore";
import type { PublicFigure } from "@/data/publicFigures";
import { VoiceAvatar } from "@/components/VoiceAvatar";
import { FeedSkeleton } from "@/components/Skeleton";
import { FEED_GRID_CLASS } from "@/lib/feedLayout";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { Helmet } from "react-helmet-async";

const BATCH = 20;
// The feed shares the 100-story card list with search/story pages; the homepage shows the top 40.
const HOMEPAGE_MAX_STORIES = 40;

type DemoStory = NewsItem & { sources: { name: string; url: string; bias: string }[] };

const DEMO_STORIES: DemoStory[] = [
  {
    id: "demo-home-1",
    title: "Guvernul pregătește un nou pachet pentru transportul public din marile orașe",
    image: "https://picsum.photos/seed/home-demo-transport/1200/1500",
    bias: { left: 22, center: 56, right: 22 },
    blindspot: "none" as const,
    category: "Actualitate",
    location: "România",
    sourcesCount: 9,
    timeAgo: "Acum 12 min",
    description: "Un feed demo ca să vezi imediat cum arată cardurile poster pe landing page.",
    sources: [],
  },
  {
    id: "demo-home-2",
    title: "Un nou raport despre energia verde schimbă discursul public înainte de votul din Parlament",
    image: "https://picsum.photos/seed/home-demo-energia/1200/1500",
    bias: { left: 41, center: 37, right: 22 },
    blindspot: "left" as const,
    category: "Economie",
    location: "București",
    sourcesCount: 7,
    timeAgo: "Acum 18 min",
    description: "Aceeași structură, dar cu o compoziție mai apropiată de un screenshot social.",
    sources: [],
  },
  {
    id: "demo-home-3",
    title: "Ce spun sursele din presă despre măsurile de siguranță de la litoral",
    image: "https://picsum.photos/seed/home-demo-litoral/1200/1500",
    bias: { left: 15, center: 68, right: 17 },
    blindspot: "right" as const,
    category: "Societate",
    location: "Constanța",
    sourcesCount: 11,
    timeAgo: "Acum 23 min",
    description: "Titlu mare, imagine mare, bară de bias clară la bază.",
    sources: [],
  },
  {
    id: "demo-home-4",
    title: "Negocierile din coaliție rămân tensionate după discuțiile despre bugetul de anul viitor",
    image: "https://picsum.photos/seed/home-demo-politica/1200/1500",
    bias: { left: 19, center: 49, right: 32 },
    blindspot: "none" as const,
    category: "Politică",
    location: "România",
    sourcesCount: 13,
    timeAgo: "Acum 31 min",
    description: "Un card puțin mai sobru, bun să vezi dacă layout-ul stă bine pe subiecte serioase.",
    sources: [],
  },
  {
    id: "demo-home-5",
    title: "Ploi puternice și avertizări meteo în mai multe județe din sudul țării",
    image: "https://picsum.photos/seed/home-demo-meteo/1200/1500",
    bias: { left: 28, center: 44, right: 28 },
    blindspot: "none" as const,
    category: "Mediu",
    location: "Sudul României",
    sourcesCount: 6,
    timeAgo: "Acum 39 min",
    description: "Un exemplu neutru, cu contrast bun și imagine simplă.",
    sources: [],
  },
  {
    id: "demo-home-6",
    title: "O schimbare majoră în tehnologie ridică întrebări despre reguli și verificarea informației",
    image: "https://picsum.photos/seed/home-demo-tech/1200/1500",
    bias: { left: 24, center: 52, right: 24 },
    blindspot: "none" as const,
    category: "Tehnologie",
    location: "Online",
    sourcesCount: 8,
    timeAgo: "Acum 47 min",
    description: "Același mesaj, dar în forma de poster pe care o căutăm.",
    sources: [],
  },
];

const normalizeSearchText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const Index = () => {
  const { data: stories, isLoading, error, refetch, isFetching, isLoadingFresh } = useAggregatedNews("card");
  const [visible, setVisible] = useState(BATCH);
  const { query } = useSearchStore();
  const normalizedQuery = normalizeSearchText(query || "");
  const hasSearchQuery = normalizedQuery.length > 0;
  const hasFetchedStories = (stories?.length ?? 0) > 0;
  // Demo stories are only a fallback for when the feed failed / came back
  // empty — never while it is still loading (they used to render under the
  // skeleton, download picsum images and then jump when the real feed landed).
  const useDemoContent = !isLoading && !hasFetchedStories;

  // Convertește datele agregate în formatul necesar pentru componente
  const convertedStories = useMemo(() => {
    const realStories = (stories || []).slice(0, HOMEPAGE_MAX_STORIES);
    let filtered = realStories.filter((story) => story.sourcesCount > 1);

    if (!filtered.length && realStories.length > 0) {
      filtered = realStories;
    }

    if (!filtered.length) {
      if (!useDemoContent) return [];

      const demoFiltered = hasSearchQuery
        ? DEMO_STORIES.filter((story) => {
            const titleMatch = normalizeSearchText(story.title).includes(normalizedQuery);
            const descMatch = normalizeSearchText(story.description || "").includes(normalizedQuery);
            const sourceMatch = story.sources.some((src) => normalizeSearchText(src.name).includes(normalizedQuery));

            return titleMatch || descMatch || sourceMatch;
          })
        : DEMO_STORIES;

      return demoFiltered;
    }

    if (hasSearchQuery) {
      const q = normalizedQuery;
      filtered = filtered.filter(s => {
        const titleMatch = normalizeSearchText(s.title).includes(q);
        const descMatch = normalizeSearchText(s.description || "").includes(q);
        const sourceMatch = s.sources.some(src => normalizeSearchText(src.source.name).includes(q));

        return titleMatch || descMatch || sourceMatch;
      });
    }

    return filtered.map(story => ({
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
      sources: story.sources.map(s => ({
        name: s.source.name,
        url: s.source.url,
        bias: s.source.bias,
      })),
    })) || [];
  }, [stories, hasSearchQuery, normalizedQuery, useDemoContent]);

  // The public-figures dataset (~88 KB) is only needed to match a search
  // query, so it is fetched the first time someone actually searches.
  const [publicFigures, setPublicFigures] = useState<PublicFigure[] | null>(null);
  useEffect(() => {
    if (!hasSearchQuery || publicFigures) return;
    let cancelled = false;
    import("@/data/publicFigures").then(({ PUBLIC_FIGURES }) => {
      if (!cancelled) setPublicFigures(PUBLIC_FIGURES);
    });
    return () => {
      cancelled = true;
    };
  }, [hasSearchQuery, publicFigures]);

  const matchedVoices = useMemo(() => {
    if (!hasSearchQuery || !publicFigures) return [];

    return publicFigures.filter((figure) => {
      const inName = normalizeSearchText(figure.name).includes(normalizedQuery);
      const inRole = normalizeSearchText(figure.role).includes(normalizedQuery);
      const inDesc = normalizeSearchText(figure.description).includes(normalizedQuery);
      const inTargets = figure.targets.some((target) => normalizeSearchText(target).includes(normalizedQuery));

      return inName || inRole || inDesc || inTargets;
    });
  }, [hasSearchQuery, normalizedQuery, publicFigures]);

  const searchTitle = hasSearchQuery
    ? `„${query}" — Căutare | thesite.ro`
    : "thesite.ro | Știri din toate perspectivele";
  const searchDesc = hasSearchQuery
    ? `Rezultate pentru „${query}" — știri românești din surse multiple, analizate pe axa stânga–centru–dreapta.`
    : "Agregator de știri românești. Aceeași poveste, perspective multiple — analizate pe axa stânga–centru–dreapta.";

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{searchTitle}</title>
        <meta name="description" content={searchDesc} />
        <link rel="canonical" href="https://thesite.ro" />
        {hasSearchQuery && <meta name="robots" content="noindex, follow" />}
        <meta property="og:title" content={searchTitle} />
        <meta property="og:description" content={searchDesc} />
        <meta property="og:url" content="https://thesite.ro" />
        <meta property="og:image" content="https://thesite.ro/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={searchTitle} />
        <meta name="twitter:description" content={searchDesc} />
        <meta name="twitter:image" content="https://thesite.ro/og-image.png" />
      </Helmet>
      <Header />

      <main className="mx-auto w-full max-w-[1240px] px-4 py-6 md:px-6 md:py-10">

        {/* Editorial Hero Greeting */}
        <section className="mb-10 md:mb-12 relative pt-4 md:pt-0">
          <div className="md:flex md:items-center md:justify-start md:gap-8 lg:gap-16">
            
            {/* Left Column (Title, Text, Boy) */}
            <div className="block flex-1 max-w-[600px]">
              {/* Mobile Boy Image */}
              <div className="md:hidden float-right w-40 min-h-[160px] -mt-6 -mr-4 ml-4 mb-2 pointer-events-none select-none">
                <img
                  src="/hero-illustration-headphones.webp"
                  alt=""
                  width={480}
                  height={482}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-auto object-contain dark:invert transform scale-125"
                />
              </div>

              {/* Desktop Header & Boy Block */}
              <div className="flex items-center gap-6 lg:gap-8">
                <h1 className="text-foreground font-serif text-4xl sm:text-5xl md:text-5xl lg:text-7xl leading-[1.15] font-bold tracking-tight">
                  Citești.<br />Compari.<br />Decizi.
                </h1>

                {/* Desktop Inline Boy Image (Seamless) */}
                <div className="hidden md:flex shrink-0 w-40 h-52 lg:w-48 lg:h-64 items-center justify-center transform transition-transform duration-500 hover:-translate-y-2 pointer-events-none select-none">
                  <img
                    src="/hero-illustration-headphones.webp"
                    alt=""
                    width={480}
                    height={482}
                    className="w-full h-full object-contain dark:invert pointer-events-none"
                  />
                </div>
              </div>

              <p className="text-muted-foreground text-sm sm:text-base md:text-md lg:text-lg block mt-5 md:mt-8 md:max-w-md lg:max-w-lg leading-relaxed font-sans">
                Ieși din propria bulă informațională. Comparăm automat peste 70 de publicații din România pentru ca tu să primești imaginea completă, nu doar varianta lor.
              </p>
            </div>

            {/* Right Column: Desktop Apple Watch Style Logo Cloud */}
            <div className="hidden md:flex flex-1 justify-center shrink-0 items-center min-h-[400px] lg:min-h-[500px] relative pointer-events-auto select-none overflow-visible">
              <div className="relative w-[280px] h-[280px] lg:w-[360px] lg:h-[360px]">
                
                <style>{`
                  .bubble {
                    position: absolute;
                    transform: translate(-50%, -50%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: default;
                  }
                  .bubble:hover {
                    transform: translate(-50%, -50%) scale(1.15);
                    z-index: 50 !important;
                  }
                  .bubble img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    mix-blend-mode: multiply;
                    filter: grayscale(100%) contrast(1.1) opacity(0.8);
                    transition: filter 0.4s ease, opacity 0.4s ease;
                  }
                  .dark .bubble img {
                    mix-blend-mode: screen;
                  }
                  .bubble:hover img {
                    filter: grayscale(0%) contrast(1) opacity(1);
                  }
                `}</style>
                
                {/* --- CENTER BUBBLE --- */}
                <div className="bubble top-[50%] left-[50%] z-40 w-14 h-14 lg:w-16 lg:h-16">
                  <img src="/logos/sm/hotnews.webp" width={128} height={128} alt="HotNews" className="p-1"  loading="lazy" />
                </div>

                {/* --- RING 1 --- */}
                <div className="bubble top-[27%] left-[50%] z-30 w-12 h-12 lg:w-14 lg:h-14">
                  <img src="/logos/sm/biziday.webp" width={128} height={128} alt="Biziday" className="p-1.5"  loading="lazy" />
                </div>
                <div className="bubble top-[38%] left-[70%] z-30 w-12 h-12 lg:w-14 lg:h-14">
                  <img src="/logos/sm/libertatea.webp" width={128} height={128} alt="Libertatea" className="p-1.5"  loading="lazy" />
                </div>
                <div className="bubble top-[62%] left-[70%] z-30 w-12 h-12 lg:w-14 lg:h-14">
                  <img src="/logos/sm/recorder.webp" width={128} height={128} alt="Recorder"  loading="lazy" />
                </div>
                <div className="bubble top-[73%] left-[50%] z-30 w-12 h-12 lg:w-14 lg:h-14">
                  <img src="/logos/sm/gandul.webp" width={128} height={128} alt="Gandul" className="p-2"  loading="lazy" />
                </div>
                <div className="bubble top-[62%] left-[30%] z-30 w-12 h-12 lg:w-14 lg:h-14">
                  <img src="/logos/sm/adevarul.webp" width={128} height={128} alt="Adevărul" className="p-1.5"  loading="lazy" />
                </div>
                <div className="bubble top-[38%] left-[30%] z-30 w-12 h-12 lg:w-14 lg:h-14">
                  <img src="/logos/sm/digi24.webp" width={128} height={128} alt="Digi24"  loading="lazy" />
                </div>

                {/* --- RING 2 --- */}
                <div className="bubble top-[50%] left-[88%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/spotmedia.webp" width={128} height={128} alt="SpotMedia" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[69%] left-[83%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/zf.webp" width={128} height={128} alt="Ziarul Financiar" className="p-0.5"  loading="lazy" />
                </div>
                <div className="bubble top-[83%] left-[69%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/bursa.webp" width={128} height={128} alt="Bursa" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[88%] left-[50%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/protv.webp" width={128} height={128} alt="ProTV"  loading="lazy" />
                </div>
                <div className="bubble top-[83%] left-[31%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/mediafax.webp" width={128} height={128} alt="Mediafax" className="p-1.5"  loading="lazy" />
                </div>
                <div className="bubble top-[69%] left-[17%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/g4media.webp" width={128} height={128} alt="G4Media" className="p-0.5"  loading="lazy" />
                </div>
                <div className="bubble top-[50%] left-[12%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/europafm.webp" width={128} height={128} alt="EuropaFM" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[31%] left-[17%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/agerpres.webp" width={128} height={128} alt="Agerpres" className="p-1.5"  loading="lazy" />
                </div>
                <div className="bubble top-[17%] left-[31%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/jurnalul.webp" width={128} height={128} alt="Jurnalul" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[12%] left-[50%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/dcnews.webp" width={128} height={128} alt="DCNews" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[17%] left-[69%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/antena3.webp" width={128} height={128} alt="Antena 3" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[31%] left-[83%] z-20 w-9 h-9 lg:w-10 lg:h-10">
                  <img src="/logos/sm/romaniatv.webp" width={128} height={128} alt="Romania TV" className="p-1"  loading="lazy" />
                </div>

                {/* --- RING 3 (Tiny satellites) --- */}
                <div className="bubble top-[8%] left-[85%] z-10 w-7 h-7 lg:w-8 lg:h-8">
                  <img src="/logos/sm/capital.webp" width={128} height={128} alt="Capital" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[8%] left-[15%] z-10 w-7 h-7 lg:w-8 lg:h-8">
                  <img src="/logos/sm/profit.webp" width={128} height={128} alt="Profit.ro" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[92%] left-[85%] z-10 w-7 h-7 lg:w-8 lg:h-8">
                  <img src="/logos/sm/stiripesurse.webp" width={128} height={128} alt="Stiripesurse" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[92%] left-[15%] z-10 w-7 h-7 lg:w-8 lg:h-8">
                  <img src="/logos/sm/romanialibera.webp" width={128} height={128} alt="Romania Libera" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[5%] left-[70%] z-10 w-7 h-7 lg:w-8 lg:h-8">
                  <img src="/logos/sm/cotidianul.webp" width={128} height={128} alt="Cotidianul" className="p-1.5"  loading="lazy" />
                </div>
                <div className="bubble top-[5%] left-[30%] z-10 w-7 h-7 lg:w-8 lg:h-8">
                  <img src="/logos/sm/b1tv.webp" width={128} height={128} alt="B1TV" className="p-0.5"  loading="lazy" />
                </div>
                <div className="bubble top-[95%] left-[30%] z-10 w-7 h-7 lg:w-8 lg:h-8">
                  <img src="/logos/sm/realitatea.webp" width={128} height={128} alt="Realitatea" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[95%] left-[70%] z-10 w-7 h-7 lg:w-8 lg:h-8">
                  <img src="/logos/sm/aktual24.webp" width={128} height={128} alt="Aktual24" className="p-1"  loading="lazy" />
                </div>
                <div className="bubble top-[50%] left-[2%] z-10 w-7 h-7 lg:w-8 lg:h-8">
                  <img src="/logos/sm/ziaruldeiasi.webp" width={128} height={128} alt="Ziarul de Iasi" className="p-1"  loading="lazy" />
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Loading state: same grid as the feed, so nothing moves when it lands */}
        {isLoading && <FeedSkeleton />}

        {useDemoContent && (
          <div className="mb-8 rounded-[2rem] border border-border bg-card p-5 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  demo content active
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Nu am date RSS acum, așa că pagina afișează exemple locale ca să poți evalua cardurile poster.
                </p>
                {error?.message && (
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {error.message}
                  </p>
                )}
              </div>
              <Button onClick={() => refetch()} variant="outline" className="rounded-full border-border px-6">
                Reîncearcă datele
              </Button>
            </div>
          </div>
        )}

        {/* Voice Search Results */}
        {!isLoading && hasSearchQuery && matchedVoices.length > 0 && (
          <section className="mb-8 border border-border bg-card p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="font-serif text-xl text-foreground">
                Voci Relevante ({matchedVoices.length})
              </h2>
              <Link to="/tribuni" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
                Vezi Tribuni
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedVoices.slice(0, 6).map((figure) => (
                <Link
                  key={figure.id}
                  to={`/voce/${figure.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3 hover:border-foreground/40 transition-colors"
                >
                  <VoiceAvatar
                    src={figure.image}
                    name={figure.name}
                    score={figure.bias.score}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{figure.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground truncate">
                      {figure.role}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* No Search Results */}
        {!isLoading && stories?.length && hasSearchQuery && convertedStories.length === 0 && publicFigures && matchedVoices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border border-border bg-card rounded-none">
            <SearchX className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="font-serif text-2xl mb-2 text-foreground">Niciun rezultat</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center max-w-md">
              Nu am găsit nimic pentru "{query}". Încearcă alți termeni.
            </p>
            <Button onClick={() => useSearchStore.getState().clearQuery()} variant="outline" className="rounded-none border-border font-serif uppercase text-xs tracking-widest px-8">
              ȘTERGE CĂUTAREA
            </Button>
          </div>
        )}

        {/* Flat Feed - Added gap for better separation on mobile */}
        {convertedStories.length > 0 && (
          <>
            {/* Screen-reader heading so the h3 story titles don't skip a level after the hero h1. */}
            <h2 className="sr-only">Ultimele știri</h2>
            <div className="relative">
              {/* Banner actualizare — date din cache, se aduc cele proaspete.
                  Absolutely positioned in the gap above the grid so showing /
                  hiding it never pushes the cards around. */}
              {isLoadingFresh && (
                <div
                  role="status"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-xs"
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" className="refresh-pill-icon shrink-0 text-muted-foreground" aria-hidden="true">
                    {[0, 60, 120, 180, 240, 300].map((angle) => (
                      <rect key={angle} x="7.5" y="1.5" width="3" height="6.5" rx="1.5" transform={`rotate(${angle} 9 9)`} />
                    ))}
                  </svg>
                  <span className="refresh-pill-text">Se actualizează știrile…</span>
                </div>
              )}

              <div className={FEED_GRID_CLASS}>
                {convertedStories.slice(0, visible).map((news, index) => (
                  <NewsCard key={news.id} variant="poster" news={news} priority={index === 0} />
                ))}
              </div>
            </div>

            {visible < convertedStories.length && (
              <div className="flex justify-center mt-10">
                <Button
                  onClick={() => setVisible(v => v + BATCH)}
                  variant="outline"
                  className="rounded-none border-border font-serif uppercase text-xs tracking-widest px-10 py-5"
                >
                  Mai multe știri
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
