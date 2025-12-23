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
        const dominantBias = story.bias.left > story.bias.center && story.bias.left > story.bias.right 
          ? 'left' 
          : story.bias.right > story.bias.center 
            ? 'right' 
            : 'center';
        
        const coverageText = dominantBias === 'left' 
          ? `${story.bias.left}% Stânga` 
          : dominantBias === 'right' 
            ? `${story.bias.right}% Dreapta`
            : `${story.bias.center}% Centru`;

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
              <div className="flex h-1.5 w-16 rounded-sm overflow-hidden">
                {story.bias.left > 0 && (
                  <div className="bg-bias-left" style={{ width: `${story.bias.left}%` }} />
                )}
                {story.bias.center > 0 && (
                  <div className="bg-bias-center" style={{ width: `${story.bias.center}%` }} />
                )}
                {story.bias.right > 0 && (
                  <div className="bg-bias-right" style={{ width: `${story.bias.right}%` }} />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {coverageText}: {story.sourcesCount} surse
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
