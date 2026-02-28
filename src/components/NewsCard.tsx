import { Link } from "react-router-dom";
import { BiasBadge } from "./BiasBadge";
import { CoverageBar } from "./CoverageBar";
import { getThumbnailUrl } from "@/utils/imageOptimizer";
import { NewsImage } from "./NewsImage";
import { AlertTriangle } from "lucide-react";

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
      <article className="bg-card border border-border flex flex-col h-full group-hover:bg-secondary/20 transition-colors">
        {/* Top Image Box */}
        <div className="h-36 md:h-56 relative border-b border-border overflow-hidden">
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
                className="rounded-none border-border"
              />
            </div>
          )}
        </div>

        {/* Bottom Content Box */}
        <div className="p-4 md:p-5 flex-1 flex flex-col relative z-10">
          <h3 className="font-title font-bold text-[17px] md:text-[22px] leading-[22px] md:leading-[28px] mb-3 md:mb-6 text-foreground min-h-[66px] md:min-h-[84px]">
            {news.title}
          </h3>

          <div className="mt-auto pt-2 md:pt-4 flex flex-col gap-2 md:gap-3 bg-[#0a0a0a] -mx-4 md:-mx-5 -mb-4 md:-mb-5 px-4 md:px-5 py-3 md:py-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold tracking-wider text-neutral-400">
              <span className="text-white">{news.category || "Actualitate"}</span>
              <span>•</span>
              <span>{news.timeAgo || "Acum"}</span>
            </div>
            <CoverageBar bias={news.bias} sourcesCount={news.sourcesCount} />
          </div>
        </div>
      </article>
    </Link>
  );
}
