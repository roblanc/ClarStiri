import { Link } from "react-router-dom";
import { BiasBadge } from "./BiasBadge";
import { CoverageBar } from "./CoverageBar";
import { getThumbnailUrl } from "@/utils/imageOptimizer";
import { NewsImage } from "./NewsImage";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildStoryHref } from "@/utils/storyRoute";

export interface NewsItem {
  id: string;
  title: string;
  image: string;
  description?: string;
  sourcesCount: number;
  bias: {
    left: number;
    center: number;
    right: number;
  };
  blindspot?: 'left' | 'right' | 'none';
  timeAgo: string;
  category?: string;
  location?: string;
}

interface NewsCardProps {
  news: NewsItem;
  variant?: 'default' | 'featured' | 'compact';
}

export function NewsCard({ news, variant = 'default' }: NewsCardProps) {
  const getBlindspotLabel = (blindspot: string | undefined) => {
    if (blindspot === 'left') return 'Ignorat de Stânga';
    if (blindspot === 'right') return 'Ignorat de Dreapta';
    return null;
  };

  const blindspotLabel = getBlindspotLabel(news.blindspot);

  if (variant === 'compact') {
    return (
      <Link to={buildStoryHref(news.id, news.title)} className="block">
        <article className="news-card p-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 flex-shrink-0 border border-border overflow-hidden">
              <NewsImage
                src={getThumbnailUrl(news.image)}
                seed={news.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="font-title font-bold text-[22px] leading-[28px] line-clamp-3 text-foreground">
                {news.title}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-3">
                {news.bias.center}% CENTRU · {news.sourcesCount} SURSE
              </p>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={buildStoryHref(news.id, news.title)} className="block h-full group">
      <article className="flex flex-col h-full">
        {/* The Card Box (Image + Title) */}
        <div className="flex flex-row md:flex-col md:bg-card md:border md:border-border overflow-hidden md:rounded-none group-hover:bg-muted/30 md:group-hover:bg-secondary/5 transition-colors">
          <div className="flex-1 py-1 pr-4 md:p-5 flex flex-col justify-start md:justify-center min-h-[100px] md:min-h-[140px] order-1 md:order-2">
            {/* Top metadata row (Category • Time • Sources) */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] md:text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-1.5 md:mb-2">
              <span className="text-primary/70">{news.category || "Actualitate"}</span>
              <span className="opacity-40">•</span>
              <span>{(news.timeAgo && !news.timeAgo.toLowerCase().includes('invalid')) ? news.timeAgo : "Acum"}</span>
              <span className="opacity-40">•</span>
              <span>{news.sourcesCount} surse</span>
            </div>

            <h3
              className={cn(
                "font-title font-bold text-foreground group-hover:text-primary transition-colors line-clamp-3",
                news.title.length > 100
                  ? "text-[16px] md:text-[19px] leading-[1.3]"
                  : "text-[18px] md:text-[22px] leading-[1.2]"
              )}
            >
              {news.title}
            </h3>

            {/* Mobile Only Metadata & Bias: Only under the text, not the image */}
            <div className="md:hidden mt-4">
              <CoverageBar bias={news.bias} sourcesCount={news.sourcesCount} />
              {/* Added a subtle line only on mobile */}
              <div className="mt-5 border-b border-border/30 w-full" />
            </div>
          </div>

          <div className="w-28 h-20 md:w-full md:h-56 relative overflow-hidden md:border-b border-border order-2 md:order-1 flex-shrink-0 self-center md:self-auto">
            <NewsImage
              src={getThumbnailUrl(news.image)}
              seed={news.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            {blindspotLabel && (
              <div className="absolute top-1 left-1 md:top-3 md:left-3">
                <BiasBadge
                  type={news.blindspot as 'left' | 'right'}
                  label={blindspotLabel}
                  className="rounded-full border-none shadow-lg backdrop-blur-md bg-background/60 scale-[0.6] md:scale-100 origin-top-left"
                />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Only Seamless Info Area */}
        <div className="hidden md:block mt-4 px-1">
          <CoverageBar bias={news.bias} sourcesCount={news.sourcesCount} />
        </div>
      </article>
    </Link>
  );
}
