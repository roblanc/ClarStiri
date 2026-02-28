import { Link } from "react-router-dom";
import { BiasBadge } from "./BiasBadge";
import { CoverageBar } from "./CoverageBar";
import { getThumbnailUrl } from "@/utils/imageOptimizer";
import { NewsImage } from "./NewsImage";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <Link to={`/stire/${news.id}`} className="block">
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
    <Link to={`/stire/${news.id}`} className="block h-full group">
      <article className="flex flex-col h-full transition-all duration-300">
        {/* Top Image Box */}
        <div className="h-44 md:h-64 relative overflow-hidden rounded-2xl mb-4 md:mb-6">
          <NewsImage
            src={getThumbnailUrl(news.image)}
            seed={news.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          />
          {blindspotLabel && (
            <div className="absolute top-3 left-3">
              <BiasBadge
                type={news.blindspot as 'left' | 'right'}
                label={blindspotLabel}
                className="rounded-full border-none shadow-lg backdrop-blur-md bg-background/60"
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col px-1">
          <h3
            className={cn(
              "font-title font-bold mb-4 md:mb-6 text-foreground group-hover:text-primary transition-colors line-clamp-3",
              news.title.length > 100
                ? "text-[16px] md:text-[20px] leading-[1.3]"
                : "text-[18px] md:text-[24px] leading-[1.2]"
            )}
          >
            {news.title}
          </h3>

          <div className="mt-auto pt-4 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold tracking-[0.15em] text-muted-foreground uppercase opacity-70 group-hover:opacity-100 transition-opacity mb-3">
              <span className="text-primary/80">{news.category || "Actualitate"}</span>
              <span className="opacity-30">•</span>
              <span>{news.timeAgo || "Acum"}</span>
            </div>
            <CoverageBar bias={news.bias} sourcesCount={news.sourcesCount} />
          </div>
        </div>
      </article>
    </Link>
  );
}
