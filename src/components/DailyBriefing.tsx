import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

interface DailyBriefingProps {
  briefing: {
    storiesCount: number;
    articlesCount: number;
    readTime: string;
    stories: Array<{
      title: string;
      image: string;
    }>;
    moreStories: string[];
  };
}

export function DailyBriefing({ briefing }: DailyBriefingProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h2 className="font-bold text-lg text-foreground mb-3">Rezumat Zilnic</h2>

      <div className="text-sm text-muted-foreground mb-4">
        <span>{briefing.storiesCount} știri</span>
        <span className="mx-1">•</span>
        <span>{briefing.articlesCount} articole</span>
        <span className="mx-1">•</span>
        <span>{briefing.readTime} citire</span>
      </div>

      <div className="space-y-3 mb-4">
        {briefing.stories.map((story, index) => (
          <div key={index} className="flex items-start gap-3">
            <img
              src={story.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-14 h-12 object-cover rounded flex-shrink-0"
            />
            <p className="text-sm text-foreground leading-snug line-clamp-2">
              {story.title}
            </p>
          </div>
        ))}
      </div>

      {briefing.moreStories.length > 0 && (
        <div className="text-xs text-muted-foreground mb-4">
          <span className="text-primary">+</span>{" "}
          {briefing.moreStories.map((s, i) => (
            <span key={i}>
              <Link to="#" className="underline hover:text-foreground">{s}</Link>
              {i < briefing.moreStories.length - 1 && "; "}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <Eye className="w-4 h-4 text-bias-center" />
        <span className="text-muted-foreground">
          70% din surse sunt Originale
        </span>
      </div>
    </div>
  );
}
