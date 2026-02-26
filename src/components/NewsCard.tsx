import { Link } from "react-router-dom";
import { BiasBar } from "./BiasBar";
import { BiasBadge } from "./BiasBadge";
import { getThumbnailUrl } from "@/utils/imageOptimizer";
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
    if (blindspot === 'left') return 'Punct Orbit Stânga';
    if (blindspot === 'right') return 'Punct Orbit Dreapta';
    return null;
  };

  const blindspotLabel = getBlindspotLabel(news.blindspot);

  if (variant === 'compact') {
    return (
      <Link to={`/stire/${news.id}`} className="block">
        <article className="news-card p-4">
          <div className="flex gap-4">
            <img
              src={getThumbnailUrl(news.image)}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-24 h-24 object-cover flex-shrink-0 border border-border"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="font-serif font-semibold text-lg leading-tight line-clamp-3 text-foreground">
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
        <div className="h-56 relative border-b border-border overflow-hidden bg-[#e5e7eb]">
          <img
            src={getThumbnailUrl(news.image)}
            alt=""
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
        <div className="p-6 flex-1 flex flex-col relative z-10">
          <h3 className="text-2xl font-serif font-medium leading-snug mb-4 text-foreground">
            {news.title}
          </h3>

          <div className="mt-auto pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                {news.category || "ACTUALITATE"}
              </span>
              <span className="w-1 h-1 bg-foreground rounded-full"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {news.timeAgo || "ACUM"}
              </span>
            </div>

            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex gap-3">
              <span className="text-[#3b82f6]">{news.bias.left}% S</span>
              <span className="text-foreground">{news.bias.center}% C</span>
              <span className="text-[#ef4444]">{news.bias.right}% D</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
