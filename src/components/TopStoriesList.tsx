import { Link } from "react-router-dom";
import { BiasBar } from "./BiasBar";

interface TopStoriesListProps {
  stories: Array<{
    id: string;
    title: string;
    bias: { left: number; center: number; right: number };
    sourcesCount: number;
  }>;
}

export function TopStoriesList({ stories }: TopStoriesListProps) {
  return (
    <div className="space-y-0">
      {stories.map((story) => {
        return (
          <Link
            key={story.id}
            to={`/stire/${story.id}`}
            className="block py-3 border-b border-border last:border-b-0 group"
          >
            <h4 className="font-semibold text-sm text-foreground leading-snug mb-2 group-hover:underline line-clamp-2">
              {story.title}
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <BiasBar
                  left={story.bias.left}
                  center={story.bias.center}
                  right={story.bias.right}
                  size="sm"
                  variant="labeled"
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {story.sourcesCount} surse
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
