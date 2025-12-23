import { Link } from "react-router-dom";

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
  };
}

export function NewsListItem({ story }: NewsListItemProps) {
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
    <Link to={`/stire/${story.id}`} className="block group">
      <article className="py-4 border-b border-border last:border-b-0">
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
            
            {/* Inline Bias Bar */}
            <div className="flex items-center gap-2">
              <div className="flex h-2 w-24 rounded-sm overflow-hidden">
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
