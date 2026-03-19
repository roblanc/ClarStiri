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
  variant?: 'default' | 'featured' | 'compact' | 'poster';
}

export function NewsCard({ news, variant = 'default' }: NewsCardProps) {
  const getBlindspotLabel = (blindspot: string | undefined) => {
    if (blindspot === 'left') return 'Ignorat de Stânga';
    if (blindspot === 'right') return 'Ignorat de Dreapta';
    return null;
  };

  const blindspotLabel = getBlindspotLabel(news.blindspot);

  if (variant === 'poster') {
    return (
      <Link to={buildStoryHref(news.id, news.title)} className="block h-full group">
        <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-zinc-900/80 bg-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1">
          <div className="relative aspect-[4/5] overflow-hidden">
            <NewsImage
              src={getThumbnailUrl(news.image)}
              seed={news.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.2)_30%,rgba(0,0,0,0.55)_62%,rgba(0,0,0,0.88)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.1),transparent_32%)]" />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-amber-200/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-900 backdrop-blur-sm">
                  {news.category || "Actualitate"}
                </span>
                <span className="rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
                  {news.sourcesCount} surse
                </span>
              </div>

              {blindspotLabel ? (
                <BiasBadge
                  type={news.blindspot as 'left' | 'right'}
                  label={blindspotLabel}
                  className="rounded-full border-none bg-white/86 px-3 py-1 text-[10px] shadow-none backdrop-blur-sm"
                />
              ) : (
                <div className="rounded-2xl border border-white/15 bg-white/8 px-3 py-2 text-right backdrop-blur-md">
                  <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/65">thesite.ro</p>
                  <p className="text-[11px] font-medium text-white/85">Previzualizare privată</p>
                </div>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-black/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
                  În trend
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
                  {news.location || "România"}
                </span>
              </div>

              <h3 className="max-w-[15ch] font-serif text-[clamp(1.35rem,1.8vw,2rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]">
                {news.title}
              </h3>

              <div className="mt-4 rounded-[1.35rem] bg-white/92 p-3 text-zinc-900 ring-1 ring-black/10">
                <div className="mb-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.24em] text-zinc-500">
                  <span>Stânga {Math.round(news.bias.left)}%</span>
                  <span>Centru {Math.round(news.bias.center)}%</span>
                  <span>Dreapta {Math.round(news.bias.right)}%</span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-200 ring-1 ring-black/10">
                  {news.bias.left > 0 && (
                    <div className="h-full bg-[#2f5fa6]" style={{ width: `${news.bias.left}%` }} />
                  )}
                  {news.bias.center > 0 && (
                    <div className="h-full bg-[#efe9dc]" style={{ width: `${news.bias.center}%` }} />
                  )}
                  {news.bias.right > 0 && (
                    <div className="h-full bg-[#9a2f2f]" style={{ width: `${news.bias.right}%` }} />
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  <span>{news.sourcesCount} surse</span>
                  <span>{news.category || "Actualitate"}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

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
