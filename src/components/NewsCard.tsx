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

function CoverageBar({ bias, sourcesCount }: { bias: NewsItem['bias']; sourcesCount: number }) {
  const entries = [
    { key: 'left',   pct: bias.left,   color: 'bg-[#3b82f6]', label: 'STÂNGA',  textColor: 'text-[#3b82f6]' },
    { key: 'center', pct: bias.center, color: 'bg-muted',      label: 'CENTRU',  textColor: 'text-muted-foreground' },
    { key: 'right',  pct: bias.right,  color: 'bg-[#ef4444]', label: 'DREAPTA', textColor: 'text-[#ef4444]' },
  ] as const;

  const dominant = entries.reduce((a, b) => (a.pct >= b.pct ? a : b));

  return (
    <div className="flex flex-col gap-1.5">
      {/* Proportional bar */}
      <div className="h-2 flex w-full overflow-hidden rounded-sm">
        {entries.map(({ key, pct, color }) =>
          pct > 0 ? (
            <div key={key} className={`${color} transition-all`} style={{ width: `${pct}%` }} />
          ) : null
        )}
      </div>
      {/* Coverage label */}
      <p className="text-[10px] font-bold uppercase tracking-wider">
        <span className={dominant.textColor}>{dominant.pct}% {dominant.label}</span>
        <span className="text-muted-foreground"> · {sourcesCount} {sourcesCount === 1 ? 'sursă' : 'surse'}</span>
      </p>
    </div>
  );
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
        <div className="p-5 flex-1 flex flex-col relative z-10">
          <h3 className="font-title font-bold text-[22px] leading-[28px] mb-6 text-foreground">
            {news.title}
          </h3>

          <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-border">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="text-foreground">{news.category || "ACTUALITATE"}</span>
              <span>•</span>
              <span>{news.timeAgo || "ACUM"}</span>
            </div>

            <CoverageBar bias={news.bias} sourcesCount={news.sourcesCount} />
          </div>
        </div>
      </article>
    </Link>
  );
}
