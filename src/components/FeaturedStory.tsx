import { Link } from "react-router-dom";
import { SourceFaviconGroup } from "./SourceFavicon";
import { getFeaturedImageUrl } from "@/utils/imageOptimizer";

interface FeaturedStoryProps {
  story: {
    id: string;
    title: string;
    image: string;
    bias: { left: number; center: number; right: number };
    category?: string;
    location?: string;
    sources?: Array<{ name: string; url: string; bias?: string }>;
    sourcesCount?: number;
  };
}

export function FeaturedStory({ story }: FeaturedStoryProps) {
  return (
    <Link to={`/stire/${story.id}`} className="block group">
      <article className="relative rounded-lg overflow-hidden">
        <div className="aspect-[4/3] relative">
          <img
            src={getFeaturedImageUrl(story.image)}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight mb-4 group-hover:underline decoration-2 underline-offset-2">
              {story.title}
            </h2>

            {/* Row with Source Logos and Bias Bar */}
            <div className="flex items-center gap-4">
              {/* Source Logos */}
              {story.sources && story.sources.length > 0 && (
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                  <SourceFaviconGroup
                    sources={story.sources}
                    maxVisible={5}
                    size="sm"
                  />
                  <span className="text-xs text-white/80">
                    {story.sources.length} surse
                  </span>
                </div>
              )}

              {/* Bias Bar with labels on bar */}
              <div className="flex-1 flex h-7 rounded overflow-hidden text-xs font-medium">
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
          </div>
        </div>
      </article>
    </Link>
  );
}
