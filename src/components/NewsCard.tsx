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
    <Link to={`/stire/${news.id}`} className="block h-full group relative overflow-hidden rounded-xl bg-black min-h-[360px] md:min-h-[420px] shadow-sm">
      {/* Background Image */}
      <div className="absolute inset-0">
        <NewsImage
          src={getThumbnailUrl(news.image)}
          seed={news.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity" />
      </div>

      {blindspotLabel && (
        <div className="absolute top-3 left-3 z-10">
          <BiasBadge
            type={news.blindspot as 'left' | 'right'}
            label={blindspotLabel}
            className="rounded-sm shadow-xl bg-background/90 backdrop-blur-sm border-none scale-90 origin-top-left"
          />
        </div>
      )}

      {/* Content attached to bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex flex-col justify-end z-20">

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {news.timeAgo && !news.timeAgo.includes('INVALID') && (
            <span className="bg-[#e6d5b8] text-black text-[11px] md:text-[12px] font-bold px-2 py-0.5 rounded-sm tracking-wide">
              Trending
            </span>
          )}
          {news.category && (
            <span className="bg-[#1a1a1a]/90 backdrop-blur-md text-white/90 text-[11px] md:text-[12px] font-bold px-2 py-0.5 rounded-sm tracking-wide">
              {news.category}
            </span>
          )}
          <span className="bg-white/95 text-black text-[11px] md:text-[12px] font-bold px-2 py-0.5 rounded-sm tracking-wide shadow-sm">
            {news.sourcesCount} surse
          </span>
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-title font-bold text-white group-hover:text-gray-200 transition-colors line-clamp-4 shadow-sm mb-4",
            news.title.length > 90
              ? "text-[20px] md:text-[24px] leading-[1.2]"
              : "text-[22px] md:text-[28px] leading-[1.15]"
          )}
        >
          {news.title}
        </h3>

        {/* Inline Bias Bar (Ground-News Style) */}
        <div className="w-full flex h-6 md:h-7 text-[11px] md:text-[13px] font-bold tracking-tight text-white rounded-sm overflow-hidden shadow-sm">
          {news.bias.left > 0 && (
            <div
              className={`h-full flex items-center px-2 overflow-hidden ${news.bias.left > news.bias.right && news.bias.left > news.bias.center ? 'justify-center' : 'justify-start'}`}
              style={{ width: `${news.bias.left}%`, backgroundColor: '#1d4ed8' }} // Ground News Blue
            >
              {(news.bias.left > 8) && <span className="truncate">S {news.bias.left}%</span>}
            </div>
          )}
          {news.bias.center > 0 && (
            <div
              className="h-full flex items-center justify-center px-2 text-black overflow-hidden"
              style={{ width: `${news.bias.center}%`, backgroundColor: '#ffffff' }} // Ground News White
            >
              {(news.bias.center > 8) && <span className="truncate">C {news.bias.center}%</span>}
            </div>
          )}
          {news.bias.right > 0 && (
            <div
              className={`h-full flex items-center px-2 overflow-hidden ${news.bias.right > news.bias.left && news.bias.right > news.bias.center ? 'justify-center' : 'justify-end'}`}
              style={{ width: `${news.bias.right}%`, backgroundColor: '#7f1d1d' }} // Ground News Dark Red
            >
              {(news.bias.right > 8) && <span className="truncate">D {news.bias.right}%</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
