import { Link } from "react-router-dom";
import { BiasBar } from "./BiasBar";
import { BiasBadge } from "./BiasBadge";

export interface NewsItem {
  id: string;
  title: string;
  image: string;
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
              src={news.image} 
              alt="" 
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
              src={news.image} 
              alt="" 
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
    <Link to={`/stire/${news.id}`} className="block">
      <article className="news-card overflow-hidden">
        <div className="relative">
          <img 
            src={news.image} 
            alt="" 
            className="w-full h-44 object-cover grayscale hover:grayscale-0 transition-all duration-300"
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
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">
              {news.sourcesCount} surse
            </span>
          </div>
          <h3 className="font-medium text-sm leading-tight line-clamp-3 text-card-foreground mb-3">
            {news.title}
          </h3>
          <BiasBar 
            left={news.bias.left} 
            center={news.bias.center} 
            right={news.bias.right}
            size="sm"
          />
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>S {news.bias.left}%</span>
            <span>C {news.bias.center}%</span>
            <span>D {news.bias.right}%</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
