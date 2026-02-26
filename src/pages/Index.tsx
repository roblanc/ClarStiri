import { useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { useAggregatedNews } from "@/hooks/useNews";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import {
  MainFeedSkeleton,
  SidebarSkeleton
} from "@/components/Skeleton";

// Placeholder imagine când nu avem una
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80";

const Index = () => {
  const { data: stories, isLoading, error, refetch, isFetching, isRefreshing } = useAggregatedNews(40);

  // Convertește datele agregate în formatul necesar pentru componente
  const convertedStories = useMemo(() => {
    return stories?.map(story => ({
      id: story.id,
      title: story.title,
      image: story.image || PLACEHOLDER_IMAGE,
      bias: story.bias,
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

  // Ordinea fixă a categoriilor — aceeași pe desktop și mobil
  const CATEGORY_ORDER = ["Politică", "Actualitate", "Economie", "Sănătate", "Tehnologie", "Mediu", "Sport", "Cultură", "Internațional"];

  // Group stories by category for the editorial layout
  const groupedStories = useMemo(() => {
    const groups: Record<string, typeof convertedStories> = {};
    convertedStories.forEach(story => {
      if (!groups[story.category]) {
        groups[story.category] = [];
      }
      groups[story.category].push(story);
    });

    // Sort by fixed order; categories not in list go last sorted by count
    return Object.entries(groups)
      .sort((a, b) => {
        const aIdx = CATEGORY_ORDER.indexOf(a[0]);
        const bIdx = CATEGORY_ORDER.indexOf(b[0]);
        if (aIdx === -1 && bIdx === -1) return b[1].length - a[1].length;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      })
      .slice(0, 6);
  }, [convertedStories]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Background Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2 rounded-none border border-border flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] animate-fade-in shadow-[4px_4px_0_hsl(var(--primary))]">
          <Loader2 className="w-4 h-4 animate-spin" />
          ACTUALIZARE...
        </div>
      )}

      <main className="container mx-auto px-4 py-6 md:py-10 lg:max-w-[70%] xl:max-w-[60%]">

        {/* Editorial Hero Greeting */}
        <section className="mb-8 md:mb-12 flex flex-row items-center justify-between gap-4 md:gap-10">
          <div className="flex-1 min-w-0 max-w-lg">
            <p className="text-foreground font-serif text-lg sm:text-xl md:text-2xl leading-snug">
              Citești. Compari. Decizi.
              <span className="text-muted-foreground text-xs sm:text-sm md:text-base block mt-2 md:mt-3 leading-relaxed font-sans">
                Știrile din România agregate din 40+ surse, grupate pe subiect și perspectivă editorială.
              </span>
            </p>
          </div>
          <div className="shrink-0 w-28 md:w-44">
            <img
              src="/hero-illustration.png"
              alt="Editorial Spotlight Illustration"
              className="w-full h-auto object-contain"
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

        {/* Error / Empty State — shows when fetch finished but no stories arrived */}
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

        {/* Content — Grouped Layout */}
        {!!groupedStories.length && (
          <div className="flex flex-col gap-20">
            {groupedStories.map(([category, items]) => (
              <section key={category}>
                <h2 className="font-serif text-3xl text-foreground mb-8 pb-2 border-b border-border">
                  {category}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-border">
                  {items.map((news) => (
                    <div key={news.id} className="border-r border-b border-border">
                      <NewsCard
                        variant="default"
                        news={news}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* More Content Loader */}
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => refetch()}
                variant="outline"
                disabled={isFetching}
                className="flex items-center gap-3 border-border hover:bg-foreground hover:text-background rounded-none px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
              >
                {isFetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                MAI MULTE SUBIECTE
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-border mt-20 pt-12 pb-24 bg-card">
        <div className="container mx-auto px-4 text-center">
          <span className="font-serif italic text-3xl font-semibold text-foreground mb-8 block">
            thesite.ro
          </span>

          <nav className="flex items-center justify-center gap-6 mb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Metodologie</span>
            <span className="w-1 h-1 bg-border rounded-full"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Surse</span>
            <span className="w-1 h-1 bg-border rounded-full"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Barometru</span>
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
