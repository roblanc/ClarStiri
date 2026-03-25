import { Link } from "react-router-dom";
import { BiasBadge } from "./BiasBadge";
import { CoverageBar } from "./CoverageBar";
import { getThumbnailUrl, getCardThumbUrl } from "@/utils/imageOptimizer";
import { NewsImage } from "./NewsImage";
import { AlertTriangle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildStoryHref } from "@/utils/storyRoute";
import { getPosterTitleSizing } from "@/utils/posterTypography";

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
  priority?: boolean;
}

export function NewsCard({ news, variant = 'default', priority = false }: NewsCardProps) {
  const getBlindspotLabel = (blindspot: string | undefined) => {
    if (blindspot === 'left') return 'Ignorat de Stânga';
    if (blindspot === 'right') return 'Ignorat de Dreapta';
    return null;
  };

  const blindspotLabel = getBlindspotLabel(news.blindspot);

  if (variant === 'poster') {
    return (
      <Link to={buildStoryHref(news.id, news.title)} className="group block h-full w-[calc(100%+2rem)] -mx-4 md:mx-0 md:w-full">
        <article data-story-id={news.id} className="group relative flex h-full w-full flex-col overflow-hidden rounded-none border-none md:border-[#e5e5e5] bg-background md:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-1 md:rounded-[10px] md:border">
          
          {/* Mobile Layout */}
          <div className="flex md:hidden flex-col h-full px-4 py-5 w-full">
            <div className="flex items-center w-full mb-3">
              <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-[#fbbf24] mr-2 shrink-0" />
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-foreground shrink-0">
                {news.category || "ACTUALITATE"} <span className="text-muted-foreground/40 mx-1 font-normal text-[8px]">●</span> <span className="text-red-600 dark:text-red-500">{news.sourcesCount} SURSE</span>
              </span>
              <div className="flex-1 border-b-[2px] border-dotted border-muted-foreground/30 mx-3 translate-y-[-2px]" />
              <span className="text-[12px] font-bold text-foreground shrink-0 flex items-center gap-1.5">
                {(news.timeAgo && !news.timeAgo.toLowerCase().includes('invalid')) ? news.timeAgo : "11:30"}
              </span>
            </div>

            <div className="flex gap-4 mb-4">
              <h3 className="flex-1 font-title font-bold text-[18px] leading-[1.3] text-foreground">
                {news.title}
              </h3>
              
              <div className="w-[124px] h-[82px] shrink-0 rounded-[6px] overflow-hidden relative shadow-sm border border-border/40">
                <NewsImage
                  src={getCardThumbUrl(news.image)}
                  seed={news.title}
                  width={124}
                  height={82}
                  loading={priority ? 'eager' : 'lazy'}
                  decoding={priority ? 'sync' : 'async'}
                  fetchPriority={priority ? 'high' : undefined}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {blindspotLabel && (
                  <div className="absolute top-1 left-1">
                    <BiasBadge
                      type={news.blindspot as 'left' | 'right'}
                      label={blindspotLabel}
                      className="rounded-sm border-none shadow-sm backdrop-blur-md bg-background/80 scale-[0.6] origin-top-left px-1.5 py-0.5"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto">
              <CoverageBar bias={news.bias} sourcesCount={news.sourcesCount} />
            </div>
          </div>

          {/* Desktop/Tablet - Poster Layout */}
          <div className="hidden md:flex flex-col h-full overflow-hidden w-full">
            <div className="relative flex-1 min-h-[16rem] w-full overflow-hidden">
              <NewsImage
                src={getThumbnailUrl(news.image)}
                seed={news.title}
                width={800}
                height={400}
                loading={priority ? 'eager' : 'lazy'}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : undefined}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.01)_0%,rgba(0,0,0,0.08)_28%,rgba(0,0,0,0.2)_46%,rgba(0,0,0,0.46)_64%,rgba(0,0,0,0.78)_82%,rgba(0,0,0,0.96)_100%)] md:bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.1)_24%,rgba(0,0,0,0.26)_46%,rgba(0,0,0,0.56)_66%,rgba(0,0,0,0.84)_84%,rgba(0,0,0,0.98)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.07),transparent_30%)]" />

              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm sm:text-[9px]">
                    {news.sourcesCount} surse
                  </span>
                  {news.timeAgo && !news.timeAgo.toLowerCase().includes('invalid') && (
                    <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-semibold text-white/75 backdrop-blur-sm sm:text-[9px]">
                      {news.timeAgo}
                    </span>
                  )}
                </div>

                {blindspotLabel ? (
                  <BiasBadge
                    type={news.blindspot as 'left' | 'right'}
                    label={blindspotLabel}
                    className="rounded-full border-none bg-white/86 px-3 py-1 text-[10px] shadow-none backdrop-blur-sm"
                  />
                ) : null}
              </div>

              <div className="absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-5 sm:pb-5 pt-20 sm:pt-14">
                <h3
                  className={[
                    "w-full max-w-none font-title font-bold tracking-[-0.05em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] text-balance",
                    getPosterTitleSizing(news.title),
                  ].join(" ")}
                >
                  {news.title}
                </h3>
              </div>
            </div>
            
            <div className="w-full shrink-0">
              <CoverageBar bias={news.bias} sourcesCount={news.sourcesCount} className="!rounded-none !shadow-none h-10 md:h-[43px] !border-none" />
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={buildStoryHref(news.id, news.title)} className="block">
        <article data-story-id={news.id} className="news-card p-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 flex-shrink-0 border border-border overflow-hidden">
              <NewsImage
                src={getCardThumbUrl(news.image)}
                seed={news.title}
                width={96}
                height={96}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="font-title font-bold text-[22px] leading-[28px] line-clamp-3 text-foreground">
                {news.title}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] mt-3">
                <span className="text-foreground">{news.bias.center}% CENTRU</span> <span className="text-muted-foreground/40 mx-1.5 font-normal text-[8px]">●</span> <span className="text-red-600 dark:text-red-500">{news.sourcesCount} SURSE</span>
              </p>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={buildStoryHref(news.id, news.title)} className="block h-full group">
      <article data-story-id={news.id} className="flex flex-col h-full">
        {/* The Card Box (Image + Title) */}
        <div className="flex flex-row md:flex-col md:bg-card md:border md:border-border overflow-hidden md:rounded-none group-hover:bg-muted/30 md:group-hover:bg-secondary/5 transition-colors">
          <div className="flex-1 py-1 pr-4 md:p-5 flex flex-col justify-start md:justify-center min-h-[100px] md:min-h-[140px] order-1 md:order-2">
            {/* Top metadata row (Category • Time • Sources) */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] md:text-[9px] font-black uppercase tracking-[0.15em] mb-1.5 md:mb-2">
              <span className="text-foreground">{news.category || "Actualitate"}</span>
              <span className="text-muted-foreground/40 text-[8px]">●</span>
              <span className="text-red-600 dark:text-red-500">{news.sourcesCount} surse</span>
              <span className="text-muted-foreground/40 text-[8px]">●</span>
              <span className="text-foreground">{(news.timeAgo && !news.timeAgo.toLowerCase().includes('invalid')) ? news.timeAgo : "Acum"}</span>
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
              width={350}
              height={224}
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
