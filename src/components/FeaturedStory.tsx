import { Link } from "react-router-dom";
import { SourceFaviconGroup } from "./SourceFavicon";
import { getFeaturedImageUrl } from "@/utils/imageOptimizer";
import { NewsImage } from "./NewsImage";
import { EyeOff, AlertTriangle } from "lucide-react";

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
    <Link to={`/stire/${story.id}`} className="block group mb-12">
      <div className="relative flex flex-col lg:flex-row bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">

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
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-3">
              <span className="font-bold text-slate-900 dark:text-slate-200 uppercase">
                {story.category || "Reuters"}
              </span>
              <span>•</span>
              <span>{story.timeAgo || "2 hours ago"}</span>
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
            <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              <span>Distribuție Acoperire</span>
              <div className="flex gap-4">
                <span className="text-[#1d4ed8]">{story.bias.left}% S</span>
                <span className="text-[#64748b]">{story.bias.center}% C</span>
                <span className="text-[#dc2626]">{story.bias.right}% D</span>
              </div>
            </div>

            <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <div className="bg-[#1d4ed8] h-full transition-all duration-300" style={{ width: `${story.bias.left}%` }}></div>
              <div className="bg-[#64748b] h-full transition-all duration-300" style={{ width: `${story.bias.center}%` }}></div>
              <div className="bg-[#dc2626] h-full transition-all duration-300" style={{ width: `${story.bias.right}%` }}></div>
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
                    <span className="text-xs text-muted-foreground font-medium">
                      {story.sourcesCount} surse analizate
                    </span>
                  </div>
                )}
              </div>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-4 py-2 rounded-lg transition-colors ml-4 shrink-0">
                Citește Acoperirea
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
