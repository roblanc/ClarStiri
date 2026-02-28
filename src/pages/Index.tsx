import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { useAggregatedNews } from "@/hooks/useNews";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import {
  MainFeedSkeleton,
} from "@/components/Skeleton";

// Placeholder imagine când nu avem una
const PLACEHOLDER_IMAGE = "/default-news.png";

const BATCH = 20;

const Index = () => {
  const { data: stories, isLoading, error, refetch, isFetching } = useAggregatedNews(60);
  const [visible, setVisible] = useState(BATCH);

  // Convertește datele agregate în formatul necesar pentru componente
  const convertedStories = useMemo(() => {
    return stories?.map(story => ({
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
  }, [stories]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-10 lg:max-w-[90%] xl:max-w-[85%]">

        {/* Editorial Hero Greeting */}
        <section className="mb-8 md:mb-12 flex flex-row items-center justify-between gap-6 md:gap-12">
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-snug">
              Citești. Compari. Decizi.
              <span className="text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl block mt-2 md:mt-3 leading-relaxed font-sans">
                Știrile din România agregate din 40+ surse, grupate pe subiect și perspectivă editorială.
              </span>
            </p>
          </div>
          <div className="shrink-0 w-40 md:w-72 flex justify-end">
            <img
              src="/logo_full.png"
              alt="ClarStiri Investigator Logo"
              className="w-full h-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert pointer-events-none"
            />
          </div>
        </section>

        {/* Skeleton Loading State */}
        {isLoading && (
          <div className="space-y-12">
            <MainFeedSkeleton />
            <MainFeedSkeleton />
          </div>
        )}

        {/* Error / Empty State */}
        {!isLoading && !isFetching && !stories?.length && (
          <div className="flex flex-col items-center justify-center py-20 border border-border bg-card">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="font-serif text-2xl mb-2 text-foreground">Flux gol</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center max-w-md">
              {error?.message ?? 'Sursele RSS nu au putut fi interpolate. Reveniți.'}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="rounded-none border-border font-serif uppercase text-xs tracking-widest px-8">
              REÎNCEARCĂ
            </Button>
          </div>
        )}

        {/* Flat Feed - Added gap for better separation on mobile */}
        {convertedStories.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {convertedStories.slice(0, visible).map((news) => (
                <NewsCard key={news.id} variant="default" news={news} />
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
            <Link to="/barometru" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">Barometru</Link>
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
