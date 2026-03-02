import { Link } from "react-router-dom";
import { SourceFaviconGroup } from "./SourceFavicon";
import { getFeaturedImageUrl } from "@/utils/imageOptimizer";
import { NewsImage } from "./NewsImage";
import { EyeOff, AlertTriangle } from "lucide-react";

interface FeaturedStoryProps {
  story: {
    id: string;
    title: string;
    description?: string;
    timeAgo?: string;
    image: string;
    bias: { left: number; center: number; right: number };
    category?: string;
    location?: string;
    sources?: Array<{ name: string; url: string; bias?: string }>;
    sourcesCount?: number;
    blindspot?: 'left' | 'right' | 'none';
  };
}

export function FeaturedStory({ story }: FeaturedStoryProps) {
  const getBlindspotLabel = (blindspot: string | undefined) => {
    if (blindspot === 'left') return 'Punct Orbit Stânga';
    if (blindspot === 'right') return 'Punct Orbit Dreapta';
    return null;
  };

  const blindspotLabel = getBlindspotLabel(story.blindspot);

  return (
    <Link to={`/stire/${story.id}`} className="block group mb-12 relative overflow-hidden rounded-xl bg-black min-h-[450px] md:min-h-[550px] shadow-sm">
      {/* Background Image */}
      <div className="absolute inset-0">
        <NewsImage
          src={getFeaturedImageUrl(story.image)}
          seed={story.title}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10 transition-opacity" />
      </div>

      {blindspotLabel && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-sm shadow-xl border-none">
            <EyeOff className="text-[#135bec] w-4 h-4" />
            <span className="text-[#135bec] text-xs font-bold font-title tracking-wide uppercase">
              Punct Orbit: {blindspotLabel}
            </span>
          </div>
        </div>
      )}

      {/* Content attached to bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 flex flex-col justify-end z-20">

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="bg-[#e6d5b8] text-black text-[12px] md:text-[13px] font-bold px-3 py-1 rounded-sm tracking-wide">
            Top Story
          </span>
          {story.category && (
            <span className="bg-[#1a1a1a]/90 backdrop-blur-md text-white/90 text-[12px] md:text-[13px] font-bold px-3 py-1 rounded-sm tracking-wide">
              {story.category}
            </span>
          )}
          <div className="bg-white/95 text-black flex items-center gap-2 text-[12px] md:text-[13px] font-bold px-3 py-1 rounded-sm tracking-wide shadow-sm">
            {story.sources && story.sources.length > 0 && (
              <div className="hidden md:flex items-center">
                <SourceFaviconGroup
                  sources={story.sources}
                  maxVisible={3}
                  size="sm"
                />
              </div>
            )}
            <span>{story.sourcesCount} surse</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="font-title font-bold text-white text-[28px] md:text-[40px] leading-[1.15] mb-4 group-hover:text-gray-200 transition-colors shadow-sm max-w-4xl">
          {story.title}
        </h2>

        {story.description && (
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 line-clamp-2 max-w-3xl">
            {story.description}
          </p>
        )}

        {/* Inline Bias Bar (Ground-News Style) */}
        <div className="w-full flex h-8 md:h-10 text-[12px] md:text-[14px] font-bold tracking-tight text-white rounded-sm overflow-hidden shadow-sm">
          {story.bias.left > 0 && (
            <div
              className={`h-full flex items-center px-3 overflow-hidden ${story.bias.left > story.bias.right && story.bias.left > story.bias.center ? 'justify-center' : 'justify-start'}`}
              style={{ width: `${story.bias.left}%`, backgroundColor: '#1d4ed8' }} // Ground News Blue
            >
              {(story.bias.left > 8) && <span className="truncate">S {story.bias.left}%</span>}
            </div>
          )}
          {story.bias.center > 0 && (
            <div
              className="h-full flex items-center justify-center px-3 text-black overflow-hidden"
              style={{ width: `${story.bias.center}%`, backgroundColor: '#ffffff' }} // Ground News White
            >
              {(story.bias.center > 8) && <span className="truncate">C {story.bias.center}%</span>}
            </div>
          )}
          {story.bias.right > 0 && (
            <div
              className={`h-full flex items-center px-3 overflow-hidden ${story.bias.right > story.bias.left && story.bias.right > story.bias.center ? 'justify-center' : 'justify-end'}`}
              style={{ width: `${story.bias.right}%`, backgroundColor: '#7f1d1d' }} // Ground News Dark Red
            >
              {(story.bias.right > 8) && <span className="truncate">D {story.bias.right}%</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
