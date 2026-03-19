import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { useAggregatedNews } from "@/hooks/useNews";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import { useSearchStore } from "@/hooks/useSearchStore";
import { PUBLIC_FIGURES } from "@/data/publicFigures";
import {
  MainFeedSkeleton,
} from "@/components/Skeleton";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

const BATCH = 20;

const DEMO_STORIES = [
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
  const { data: stories, isLoading, error, refetch, isFetching } = useAggregatedNews(60);
  const [visible, setVisible] = useState(BATCH);
  const { query } = useSearchStore();
  const normalizedQuery = normalizeSearchText(query || "");
  const hasSearchQuery = normalizedQuery.length > 0;

  // Convertește datele agregate în formatul necesar pentru componente
  const convertedStories = useMemo(() => {
    let filtered = stories || [];

    if (!filtered.length) {
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
  }, [stories, hasSearchQuery, normalizedQuery]);

  const useDemoContent = !isLoading && !(stories?.length ?? 0);

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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1240px] px-4 py-6 md:px-6 md:py-10">

        {/* Editorial Hero Greeting */}
        <section className="mb-10 md:mb-12 relative pt-4 md:pt-0">
          <div className="md:flex md:items-center md:justify-start md:gap-8 lg:gap-16">
            
            {/* Left Column (Title, Text, Boy) */}
            <div className="block flex-1 max-w-[600px]">
              {/* Mobile Boy Image */}
              <div className="md:hidden float-right w-40 -mt-6 -mr-4 ml-4 mb-2 pointer-events-none select-none">
                <img
                  src="/logo_full.png"
                  alt="ClarStiri Investigator Logo"
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
                    src="/logo_full.png"
                    alt="ClarStiri Investigator Logo"
                    className="w-full h-full object-contain dark:invert pointer-events-none"
                  />
                </div>
              </div>

              <p className="text-muted-foreground text-sm sm:text-base md:text-md lg:text-lg block mt-5 md:mt-8 md:max-w-md lg:max-w-lg leading-relaxed font-sans">
                Ieși din propria bulă informațională. Comparăm automat peste 40 de publicații din România pentru ca tu să primești imaginea completă, nu doar varianta lor.
              </p>
            </div>

            {/* Right Column: Desktop Apple Watch Style Logo Cloud */}
            <div className="hidden md:flex flex-1 justify-center shrink-0 items-center min-h-[400px] lg:min-h-[460px] relative pointer-events-auto select-none overflow-visible">
              <div className="relative w-full max-w-[420px] aspect-square">
                
                <style>{`
                  .bubble {
                    position: absolute;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
                    cursor: default;
                  }
                  .bubble:hover {
                    transform: translate(-50%, -50%) scale(1.15);
                    z-index: 50 !important;
                    box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.3);
                  }
                `}</style>
                
                {/* --- CENTER BUBBLE --- */}
                {/* HotNews */}
                <div className="bubble top-[50%] left-[50%] z-40 w-[110px] h-[110px] lg:w-[130px] lg:h-[130px] bg-[#1e40af]">
                  <div className="relative flex items-center justify-center">
                    <span className="text-[#fbb117] font-black text-6xl lg:text-7xl font-sans tracking-tighter">H</span>
                    <div className="absolute -left-[2px] bottom-1 w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] bg-[#f97316] rounded-full" />
                  </div>
                </div>

                {/* --- RING 1 --- */}
                {/* Biziday */}
                <div className="bubble top-[22%] left-[50%] z-30 w-[85px] h-[85px] lg:w-[100px] lg:h-[100px] bg-[#f97316]">
                  <span className="text-white font-black text-[18px] lg:text-[22px] tracking-tight font-sans">BIZI</span>
                </div>

                {/* Libertatea */}
                <div className="bubble top-[35%] left-[73%] z-30 w-[90px] h-[90px] lg:w-[105px] lg:h-[105px] bg-[#e62020]">
                  <span className="text-white font-black text-[14px] lg:text-[16px] leading-[0.9] tracking-tight font-sans">LIBER</span>
                  <span className="text-white font-black text-[14px] lg:text-[16px] leading-[0.9] tracking-tight font-sans mt-0.5">TATEA</span>
                </div>

                {/* Recorder */}
                <div className="bubble top-[65%] left-[73%] z-30 w-[90px] h-[90px] lg:w-[105px] lg:h-[105px] bg-[#111827]">
                  <span className="text-white font-black text-[22px] lg:text-[26px] tracking-tight font-sans">REC</span>
                </div>

                {/* Gandul */}
                <div className="bubble top-[78%] left-[50%] z-30 w-[95px] h-[95px] lg:w-[110px] lg:h-[110px] bg-white">
                  <span className="text-black font-serif font-black text-[20px] lg:text-[24px] tracking-tighter">Gândul.</span>
                </div>

                {/* Adevarul */}
                <div className="bubble top-[65%] left-[27%] z-30 w-[85px] h-[85px] lg:w-[100px] lg:h-[100px] bg-[#0d3b26]">
                  <span className="text-white font-serif font-black text-[38px] lg:text-[46px] leading-none">A</span>
                </div>

                {/* Digi24 */}
                <div className="bubble top-[35%] left-[27%] z-30 w-[95px] h-[95px] lg:w-[110px] lg:h-[110px] bg-[#002fff]">
                  <span className="text-white font-bold text-[24px] lg:text-[28px] tracking-tight font-sans">DIGI</span>
                </div>


                {/* --- RING 2 (OUTER SATELLITES) --- */}
                {/* Ziarul Financiar */}
                <div className="bubble top-[18%] left-[88%] z-20 w-[65px] h-[65px] lg:w-[75px] lg:h-[75px] bg-[#fbb117]">
                  <span className="text-black font-black text-[20px] lg:text-[24px]">ZF</span>
                </div>

                {/* SpotMedia */}
                <div className="bubble top-[50%] left-[96%] z-20 w-[70px] h-[70px] lg:w-[80px] lg:h-[80px] bg-[#0f766e]">
                  <span className="text-white font-black text-[26px] lg:text-[32px]">S</span>
                </div>

                {/* Agerpres */}
                <div className="bubble top-[82%] left-[88%] z-20 w-[60px] h-[60px] lg:w-[70px] lg:h-[70px] bg-[#1e3a8a]">
                  <span className="text-white font-bold text-[13px] lg:text-[15px]">AGE</span>
                </div>

                {/* Bursa */}
                <div className="bubble top-[95%] left-[50%] z-20 w-[55px] h-[55px] lg:w-[65px] lg:h-[65px] bg-[#475569]">
                  <span className="text-white font-bold text-[12px] lg:text-[14px]">BUR</span>
                </div>

                {/* ProTV */}
                <div className="bubble top-[82%] left-[12%] z-20 w-[65px] h-[65px] lg:w-[75px] lg:h-[75px] bg-gradient-to-br from-red-500 to-blue-600">
                  <span className="text-white font-black text-[16px] lg:text-[18px]">PRO</span>
                </div>

                {/* G4Media */}
                <div className="bubble top-[50%] left-[4%] z-20 w-[70px] h-[70px] lg:w-[80px] lg:h-[80px] bg-[#7e22ce]">
                  <span className="text-white font-black text-[22px] lg:text-[26px]">G4</span>
                </div>

                {/* Mediafax */}
                <div className="bubble top-[18%] left-[12%] z-20 w-[60px] h-[60px] lg:w-[70px] lg:h-[70px] bg-[#374151]">
                  <span className="text-white font-bold text-[14px] lg:text-[16px]">MFX</span>
                </div>

                {/* Europa FM */}
                <div className="bubble top-[5%] left-[50%] z-20 w-[55px] h-[55px] lg:w-[65px] lg:h-[65px] bg-[#0891b2]">
                  <span className="text-white font-black text-[18px] lg:text-[22px]">FM</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Skeleton Loading State */}
        {isLoading && (
          <div className="space-y-12">
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
              <Link to="/influenceri" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
                Vezi Influenceri
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedVoices.slice(0, 6).map((figure) => (
                <Link
                  key={figure.id}
                  to={`/voce/${figure.slug}`}
                  className="flex items-center gap-3 border border-border p-3 hover:bg-muted/40 transition-colors"
                >
                  <img
                    src={figure.image}
                    alt={figure.name}
                    className="w-12 h-12 rounded-full object-cover border border-border/50"
                    loading="lazy"
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
        {!isLoading && stories?.length && hasSearchQuery && convertedStories.length === 0 && matchedVoices.length === 0 && (
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 xl:gap-12 px-0 md:px-8 lg:px-12 xl:px-16">
              {convertedStories.slice(0, visible).map((news) => (
                <NewsCard key={news.id} variant="poster" news={news} />
              ))}
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

      {/* Editorial Footer */}
      <footer className="border-t border-border mt-20 pt-12 pb-24 bg-card">
        <div className="container mx-auto px-4 text-center">
          <span className="font-serif italic text-3xl font-semibold text-foreground mb-8 block">
            thesite.ro
          </span>

          <nav className="flex items-center justify-center gap-6 mb-8">
            <Link to="/surse" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">Surse</Link>
            <span className="w-1 h-1 bg-border rounded-full"></span>
            <Link to="/influenceri" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">Influenceri</Link>
          </nav>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            © 2026 Toate drepturile rezervate
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
