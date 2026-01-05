import { Link } from "react-router-dom";
import { SourceFaviconGroup } from "./SourceFavicon";
import { getThumbnailUrl } from "@/utils/imageOptimizer";

interface NewsListItemProps {
  story: {
    id: string;
    title: string;
    image: string;
    bias: { left: number; center: number; right: number };
    category?: string;
    location?: string;
    sourcesCount: number;
    centerCoverage?: number;
    sources?: Array<{ name: string; url: string; bias?: string }>;
  };
}

export function NewsListItem({ story }: NewsListItemProps) {
  return (
    <Link to={`/stire/${story.id}`} className="block group">
      <article className="py-4 px-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
        {/* Top row: Category, Title, Image */}
        <div className="flex gap-4 mb-3">
          <div className="flex-1 min-w-0">
            {story.category && (
              <p className="text-xs text-muted-foreground mb-1.5">
                {story.category} {story.location && `· ${story.location}`}
              </p>
            )}
            <h3 className="font-semibold text-foreground leading-snug group-hover:underline line-clamp-3">
              {story.title}
            </h3>
          </div>

          {/* Stacked Card Image Effect */}
          <div className="relative w-28 h-20 flex-shrink-0" style={{ perspective: '600px' }}>
            {/* Back cards (decorative layers) */}
            <div
              className="absolute inset-0 bg-muted rounded-lg border border-border/50"
              style={{
                transform: 'rotateY(-8deg) translateX(-6px) translateZ(-20px)',
                transformOrigin: 'right center'
              }}
            />
            <div
              className="absolute inset-0 bg-muted/80 rounded-lg border border-border/30"
              style={{
                transform: 'rotateY(-4deg) translateX(-3px) translateZ(-10px)',
                transformOrigin: 'right center'
              }}
            />
            {/* Main image */}
            <img
              src={getThumbnailUrl(story.image)}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
              style={{
                transform: 'rotateY(0deg)',
                transformOrigin: 'right center'
              }}
            />
          </div>
        </div>

        {/* Bottom row: Source Logos + Full-width Bias Bar + Sources count */}
        <div className="flex items-center gap-3">
          {/* Source Logos */}
          {story.sources && story.sources.length > 0 && (
            <SourceFaviconGroup
              sources={story.sources}
              maxVisible={3}
              size="sm"
            />
          )}

          {/* Full-width Bias Bar with labels */}
          <div className="flex-1 flex h-10 rounded overflow-hidden text-xs font-semibold">
            {story.bias.left > 0 && (
              <div
                className="bg-bias-left flex flex-col items-center justify-center text-white overflow-hidden py-1"
                style={{ width: `${story.bias.left}%` }}
              >
                <span className="text-sm font-bold">{story.bias.left}%</span>
                {story.bias.left >= 15 && <span className="text-[10px] opacity-90">Stânga</span>}
              </div>
            )}
            {story.bias.center > 0 && (
              <div
                className="bg-bias-center flex flex-col items-center justify-center text-white overflow-hidden py-1"
                style={{ width: `${story.bias.center}%` }}
              >
                <span className="text-sm font-bold">{story.bias.center}%</span>
                {story.bias.center >= 15 && <span className="text-[10px] opacity-90">Centru</span>}
              </div>
            )}
            {story.bias.right > 0 && (
              <div
                className="bg-bias-right flex flex-col items-center justify-center text-white overflow-hidden py-1"
                style={{ width: `${story.bias.right}%` }}
              >
                <span className="text-sm font-bold">{story.bias.right}%</span>
                {story.bias.right >= 15 && <span className="text-[10px] opacity-90">Dreapta</span>}
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {story.sourcesCount} surse
          </span>
        </div>
      </article>
    </Link>
  );
}
