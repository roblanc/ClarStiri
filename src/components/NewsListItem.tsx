import { Link } from "react-router-dom";
import { SourceFaviconGroup } from "./SourceFavicon";
import { BiasBar } from "./BiasBar";

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
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            {story.category && (
              <p className="text-xs text-muted-foreground mb-1.5">
                {story.category} {story.location && `· ${story.location}`}
              </p>
            )}
            <h3 className="font-semibold text-foreground leading-snug mb-2 group-hover:underline line-clamp-3">
              {story.title}
            </h3>

            {/* Bias Info Row with Source Logos and Labeled Bar */}
            <div className="flex items-center gap-3">
              {/* Source Logos */}
              {story.sources && story.sources.length > 0 && (
                <SourceFaviconGroup
                  sources={story.sources}
                  maxVisible={4}
                  size="sm"
                />
              )}

              {/* Labeled Bias Bar */}
              <div className="flex-1 max-w-[180px]">
                <BiasBar
                  left={story.bias.left}
                  center={story.bias.center}
                  right={story.bias.right}
                  size="md"
                  variant="labeled"
                />
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {story.sourcesCount} surse
              </span>
            </div>
          </div>

          <img
            src={story.image}
            alt=""
            className="w-24 h-20 object-cover rounded flex-shrink-0"
          />
        </div>
      </article>
    </Link>
  );
}
