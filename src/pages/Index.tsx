import { useEffect } from "react";
import { Header } from "@/components/Header";
import { FeaturedStory } from "@/components/FeaturedStory";
import { NewsCard } from "@/components/NewsCard";
import { SourceFavicon } from "@/components/SourceFavicon";
import { useAggregatedNews } from "@/hooks/useNews";
import { NEWS_SOURCES } from "@/types/news";
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
  const { data: stories, isLoading, error, refetch, isFetching, isRefreshing } = useAggregatedNews(20);

  // Convertește datele agregate în formatul necesar pentru componente
  const convertedStories = stories?.map(story => ({
    id: story.id,
    title: story.title,
    image: story.image || PLACEHOLDER_IMAGE,
    bias: story.bias,
    category: story.mainCategory,
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

  const featuredStory = convertedStories[0];
  const otherStories = convertedStories.slice(1);


  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Background Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm animate-fade-in">
          <Loader2 className="w-4 h-4 animate-spin" />
          Se actualizează știrile...
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {/* Skeleton Loading State */}
        {isLoading && (
          <div className="grid lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-3">
              <SidebarSkeleton />
            </aside>
            <div className="lg:col-span-5">
              <MainFeedSkeleton />
            </div>
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-32 mb-4"></div>
                  <div className="h-24 bg-muted rounded mb-4"></div>
                  <div className="h-24 bg-muted rounded"></div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Error / Empty State — shows when fetch finished but no stories arrived */}
        {!isLoading && !isFetching && !stories?.length && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-foreground font-medium mb-2">Nu am putut încărca știrile</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message ?? 'Sursele RSS nu răspund în acest moment. Încearcă din nou.'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Încearcă din nou
            </Button>
          </div>
        )}

        {/* Content — only render when we actually have stories */}
        {!!stories?.length && (
          <>
            <div className="flex flex-col gap-6">
              {/* Main Feed */}
              <div className="w-full">
                {/* Featured Story - Smaller size */}
                {featuredStory && (
                  <FeaturedStory story={featuredStory} />
                )}

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherStories.map((news) => (
                    <NewsCard
                      key={news.id}
                      news={{
                        id: news.id,
                        title: news.title,
                        image: news.image,
                        bias: news.bias,
                        category: news.category,
                        location: news.location,
                        sourcesCount: news.sourcesCount,
                        timeAgo: news.timeAgo,
                        description: news.description,
                      }}
                    />
                  ))}
                </div>

                {/* More Content Loader */}
                <div className="mt-12 flex justify-center">
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    disabled={isFetching}
                    className="flex items-center gap-2 border-2 border-border hover:border-primary px-8 py-6 rounded-xl text-sm font-bold transition-all group bg-transparent text-foreground"
                  >
                    {isFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 text-primary" />
                    )}
                    Actualizează știrile
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">thesite<span className="text-primary">.ro</span></span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/metodologie" className="hover:text-foreground transition-colors">Metodologie</Link>
              <Link to="/surse" className="hover:text-foreground transition-colors">Surse</Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2025 thesite.ro
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
