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
      <article className="flex flex-col h-full">
        {/* The Card Box (Image + Title) */}
        <div className="bg-card border border-border overflow-hidden flex flex-row md:flex-col rounded-none group-hover:bg-secondary/5 transition-colors">
          <div className="flex-1 p-4 md:p-5 flex flex-col justify-center min-h-[90px] md:min-h-[140px] order-1 md:order-2">
            {/* Category shown above title on mobile only to match screenshot positioning */}
            <div className="md:hidden text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 mb-2">
              {news.category || "Actualitate"}
            </div>

            <h3
              className={cn(
                "font-title font-bold text-foreground group-hover:text-primary transition-colors line-clamp-3",
                news.title.length > 100
                  ? "text-[14px] md:text-[19px] leading-[1.3]"
                  : "text-[16px] md:text-[22px] leading-[1.2]"
              )}
            >
              {news.title}
            </h3>
          </div>

          <div className="w-32 h-32 md:w-full md:h-56 relative overflow-hidden border-l md:border-l-0 md:border-b border-border order-2 md:order-1 flex-shrink-0">
            <NewsImage
              src={getThumbnailUrl(news.image)}
              seed={news.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            {blindspotLabel && (
              <div className="absolute top-2 left-2 md:top-3 md:left-3">
                <BiasBadge
                  type={news.blindspot as 'left' | 'right'}
                  label={blindspotLabel}
                  className="rounded-full border-none shadow-lg backdrop-blur-md bg-background/60 scale-75 md:scale-100 origin-top-left"
                />
              </div>
            )}
          </div>
        </div>

        {/* Seamless Info Area - Outside the card box */}
        <div className="mt-4 px-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold tracking-[0.15em] text-muted-foreground uppercase opacity-70 mb-3">
            <span className="hidden md:inline text-primary/70">{news.category || "Actualitate"}</span>
            <span className="hidden md:inline opacity-30">•</span>
            <span>{(news.timeAgo && !news.timeAgo.includes('INVALID')) ? news.timeAgo : "Acum"}</span>
          </div>
          <CoverageBar bias={news.bias} sourcesCount={news.sourcesCount} />
        </div>
      </article>
    </Link>
  );
}
