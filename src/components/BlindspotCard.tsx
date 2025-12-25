import { Link } from "react-router-dom";
import { BiasBadge } from "./BiasBadge";

interface BlindspotCardProps {
  story: {
    id: string;
    title: string;
    image: string;
    bias: { left: number; center: number; right: number };
    blindspot: 'left' | 'right';
    sourcesCount: number;
  };
}

export function BlindspotCard({ story }: BlindspotCardProps) {
  return (
    <Link to={`/stire/${story.id}`} className="block group">
      <article className="rounded-lg border border-border overflow-hidden bg-card">
        <div className="relative">
          <img
            src={story.image}
            alt=""
            loading="lazy"
            className="w-full h-36 object-cover"
          />
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary text-primary-foreground">
              Punct Orbit
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
              {story.sourcesCount} Surse
            </span>
          </div>
        </div>
        <div className="p-3">
          <h4 className="font-semibold text-sm text-foreground leading-snug mb-3 group-hover:underline line-clamp-2">
            {story.title}
          </h4>

          {/* Bias bar with labels */}
          <div className="flex h-6 rounded overflow-hidden text-[10px] font-medium">
            {story.bias.left > 0 && (
              <div
                className="bg-bias-left flex items-center justify-center text-white"
                style={{ width: `${story.bias.left}%` }}
              >
                {story.bias.left >= 15 && `S ${story.bias.left}%`}
              </div>
            )}
            {story.bias.center > 0 && (
              <div
                className="bg-bias-center flex items-center justify-center text-white"
                style={{ width: `${story.bias.center}%` }}
              >
                {story.bias.center >= 15 && `C ${story.bias.center}%`}
              </div>
            )}
            {story.bias.right > 0 && (
              <div
                className="bg-bias-right flex items-center justify-center text-white"
                style={{ width: `${story.bias.right}%` }}
              >
                {story.bias.right >= 15 && `D ${story.bias.right}%`}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
