import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { FeaturedStory } from "@/components/FeaturedStory";
import { NewsListItem } from "@/components/NewsListItem";
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
import { VoicesSection } from "@/components/VoicesSection";
import { SplashPage } from "@/components/SplashPage";

// Placeholder imagine când nu avem una
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80";

// Splash always shows on every visit
const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { data: stories, isLoading, error, refetch, isFetching, isRefreshing } = useAggregatedNews(20);

  const handleContinue = useCallback(() => {
    setShowSplash(false);
  }, []);

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

  // Data is ready when we have stories loaded
  const isDataReady = !isLoading && convertedStories.length > 0;

  // Show splash page if needed
  if (showSplash) {
    return <SplashPage onContinue={handleContinue} isDataReady={isDataReady} />;
  }

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

        {/* Error State */}
        {error && !isLoading && !stories && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-foreground font-medium mb-2">Nu am putut încărca știrile</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Încearcă din nou
            </Button>
          </div>
        )}

        {/* Content */}
        {stories && (
          <>
            {/* Voices Barometer Section */}
            <VoicesSection />

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-8">
                {/* Featured Story - Smaller size */}
                {featuredStory && (
                  <div className="mb-6">
                    <FeaturedStory story={featuredStory} />
                  </div>
                )}

                {/* News List */}
                <div className="bg-card rounded-lg border border-border">
                  {otherStories.map((news) => (
                    <NewsListItem
                      key={news.id}
                      story={{
                        id: news.id,
                        title: news.title,
                        image: news.image,
                        bias: news.bias,
                        category: news.category,
                        location: news.location,
                        sourcesCount: news.sourcesCount,
                        sources: news.sources,
                      }}
                    />
                  ))}
                </div>

                {/* Refresh Button */}
                <div className="mt-4 text-center">
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    disabled={isFetching}
                    className="gap-2"
                  >
                    {isFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Actualizează știrile
                  </Button>
                </div>
              </div>

              {/* Right Sidebar */}
              <aside className="lg:col-span-4 space-y-6">

                {/* Sources Info */}
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <h3 className="font-semibold text-foreground mb-2">📡 Surse Active</h3>
                  <p className="text-muted-foreground text-xs mb-3">
                    thesite.ro agregă știri din {NEWS_SOURCES.length} surse pentru o perspectivă echilibrată:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {NEWS_SOURCES.slice(0, 12).map(source => (
                      <div
                        key={source.id}
                        className="flex items-center gap-1.5 px-2 py-1 bg-background rounded"
                      >
                        <SourceFavicon source={source} size="xs" showRing={false} />
                        <span className="text-xs text-muted-foreground">
                          {source.name}
                        </span>
                      </div>
                    ))}
                    {NEWS_SOURCES.length > 12 && (
                      <span className="px-2 py-1 text-xs text-muted-foreground">
                        +{NEWS_SOURCES.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              </aside>
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
              <Link to="/metodologie" className="hover:text-foreground transition-colors">Surse</Link>
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
