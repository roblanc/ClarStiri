import { Link } from "react-router-dom";
import { SourceFaviconGroup } from "./SourceFavicon";
import { getFeaturedImageUrl } from "@/utils/imageOptimizer";
import { NewsImage } from "./NewsImage";
import { EyeOff, AlertTriangle } from "lucide-react";
import { buildStoryHref } from "@/utils/storyRoute";

interface FeaturedStoryProps {
  story: {
    id: string;
    title: string;
    description?: string;
    timeAgo?: string;
    image: string;
    bias: { left: number; center: number; right: number };
    category?: string;
    location?: string;
    sources?: Array<{ name: string; url: string; bias?: string }>;
    sourcesCount?: number;
    blindspot?: 'left' | 'right' | 'none';
  };
}

export function FeaturedStory({ story }: FeaturedStoryProps) {
  const getBlindspotLabel = (blindspot: string | undefined) => {
    if (blindspot === 'left') return 'Punct Orbit Stânga';
    if (blindspot === 'right') return 'Punct Orbit Dreapta';
    return null;
  };

  const blindspotLabel = getBlindspotLabel(story.blindspot);

  return (
    <Link to={buildStoryHref(story.id, story.title)} className="block group mb-12">
      <div className="relative flex flex-col lg:flex-row bg-card rounded-none overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">

        {/* Imagine */}
        <div className="lg:w-3/5 h-64 lg:h-auto overflow-hidden relative min-h-[300px]">
          <NewsImage
            src={getFeaturedImageUrl(story.image)}
            seed={story.title}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              Top Story
            </span>
          </div>
        </div>

        {/* Conținut */}
        <div className="lg:w-2/5 p-6 lg:p-8 flex flex-col justify-between bg-card text-card-foreground">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-3">
              <span className="text-primary/80">{story.category || "Actualitate"}</span>
              <span className="opacity-40">•</span>
              <span>{story.timeAgo || "Acum"}</span>
              <span className="opacity-40">•</span>
              <span>{story.sourcesCount} surse</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors">
              {story.title}
            </h2>
            {story.description && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-4">
                {story.description}
              </p>
            )}
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 mt-4">
              <span>Distribuție Acoperire</span>
            </div>

            {/* Ground News aesthetic bar layout */}
            <div className="flex flex-col w-full gap-1.5">
              {/* Labels Row ABOVE the bar */}
              <div className="flex justify-between items-end w-full text-[11px] uppercase tracking-wide font-bold">
                <div className="flex-1 flex justify-start">
                  {story.bias.left > 0 && (
                    <span className="text-blue-600 dark:text-blue-500">
                      Stânga {Math.round(story.bias.left)}%
                    </span>
                  )}
                </div>
                <div className="flex-1 flex justify-center">
                  {story.bias.center > 0 && (
                    <span className="text-muted-foreground">
                      Centru {Math.round(story.bias.center)}%
                    </span>
                  )}
                </div>
                <div className="flex-1 flex justify-end">
                  {story.bias.right > 0 && (
                    <span className="text-red-700 dark:text-red-500">
                      Dreapta {Math.round(story.bias.right)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Solid Thick Bar */}
              <div className="flex h-2.5 sm:h-3 w-full rounded-[3px] overflow-hidden shadow-sm border border-border/20">
                {story.bias.left > 0 && <div className="h-full transition-all duration-500" style={{ width: `${story.bias.left}%`, backgroundColor: '#1d4ed8' }} />}
                {story.bias.center > 0 && <div className="h-full transition-all duration-500 bg-white dark:bg-[#e2e8f0]" style={{ width: `${story.bias.center}%` }} />}
                {story.bias.right > 0 && <div className="h-full transition-all duration-500" style={{ width: `${story.bias.right}%`, backgroundColor: '#7f1d1d' }} />}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex-1">
                {blindspotLabel ? (
                  <div className="flex items-center gap-1 text-[#135bec] text-xs font-bold">
                    <EyeOff className="text-[#135bec] w-4 h-4" />
                    <span className="line-clamp-2">Punct Orbit: {blindspotLabel}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {story.sources && story.sources.length > 0 && (
                      <SourceFaviconGroup
                        sources={story.sources}
                        maxVisible={4}
                        size="sm"
                      />
                    )}
                  </div>
                )}
              </div>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-4 py-2 rounded-none transition-colors ml-4 shrink-0">
                Citește Acoperirea
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
