import { Link } from "react-router-dom";
import { BiasBar } from "./BiasBar";
import { BiasBadge } from "./BiasBadge";
import { getThumbnailUrl } from "@/utils/imageOptimizer";
import { AlertTriangle, CheckCircle } from "lucide-react";

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
          <div className="flex gap-3">
            <img
              src={getThumbnailUrl(news.image)}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-20 h-20 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight line-clamp-3 text-card-foreground">
                {news.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-2">
                {news.bias.center}% Centru: {news.sourcesCount} surse
              </p>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={`/stire/${news.id}`} className="block">
        <article className="news-card overflow-hidden">
          <div className="relative">
            <img
              src={getThumbnailUrl(news.image)}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-56 object-cover"
            />
            {blindspotLabel && (
              <div className="absolute top-3 left-3">
                <BiasBadge
                  type={news.blindspot as 'left' | 'right'}
                  label={blindspotLabel}
                />
              </div>
            )}
          </div>
          <div className="p-4">
            <h2 className="font-semibold text-lg leading-tight text-card-foreground mb-3">
              {news.title}
            </h2>
            <BiasBar
              left={news.bias.left}
              center={news.bias.center}
              right={news.bias.right}
              showLabels
            />
            <p className="text-xs text-muted-foreground mt-3">
              {news.sourcesCount} surse · {news.timeAgo}
            </p>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/stire/${news.id}`} className="block h-full">
      <article className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all flex flex-col h-full group">
        <div className="h-48 relative">
          <img
            src={getThumbnailUrl(news.image)}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          {blindspotLabel && (
            <div className="absolute top-3 left-3">
              <BiasBadge
                type={news.blindspot as 'left' | 'right'}
                label={blindspotLabel}
              />
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col relative z-10 bg-card">
          <div className="flex items-center gap-2 text-[10px] mb-3">
            <span className="text-slate-500 font-bold uppercase">
              {news.category || "THE GUARDIAN"}
            </span>
            <span className="text-slate-400 font-medium">{news.timeAgo || "6h ago"}</span>
          </div>
          <h3 className="text-lg font-bold leading-snug mb-3 hover:text-primary transition-colors line-clamp-2 text-slate-900 dark:text-slate-100">
            {news.title}
          </h3>
          {news.description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3">
              {news.description}
            </p>
          )}

          <div className="mt-auto pt-4 pb-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[11px] font-bold mb-2">
              <span className="text-[#1d4ed8]">{news.bias.left}% Stânga</span>
              <span className="text-[#64748b]">{news.bias.center}% Centru</span>
              <span className="text-[#dc2626]">{news.bias.right}% Dreapta</span>
            </div>
            <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 mb-5">
              <div className="bg-[#1d4ed8] h-full" style={{ width: `${news.bias.left}%` }}></div>
              <div className="bg-[#64748b] h-full" style={{ width: `${news.bias.center}%` }}></div>
              <div className="bg-[#dc2626] h-full" style={{ width: `${news.bias.right}%` }}></div>
            </div>

            {news.blindspot && news.blindspot !== 'none' && (
              <div className="flex items-start gap-2 p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 outline outline-1 outline-slate-100 dark:outline-slate-700/50">
                <AlertTriangle className="text-amber-500 w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
                  Punct Orbit: {blindspotLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
