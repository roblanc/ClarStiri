import { Link } from "react-router-dom";
import { BiasBar } from "./BiasBar";

interface FeaturedStoryProps {
  story: {
    id: string;
    title: string;
    image: string;
    bias: { left: number; center: number; right: number };
    category?: string;
    location?: string;
  };
}

export function FeaturedStory({ story }: FeaturedStoryProps) {
  return (
    <Link to={`/stire/${story.id}`} className="block group">
      <article className="relative rounded-lg overflow-hidden">
        <div className="aspect-[4/3] relative">
          <img 
            src={story.image} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight mb-4 group-hover:underline decoration-2 underline-offset-2">
              {story.title}
            </h2>
            
            {/* Bias Bar with labels on bar */}
            <div className="flex h-7 rounded overflow-hidden text-xs font-medium">
              {story.bias.left > 0 && (
                <div 
                  className="bg-bias-left flex items-center justify-center text-white"
                  style={{ width: `${story.bias.left}%` }}
                >
                  {story.bias.left >= 15 && `Stânga ${story.bias.left}%`}
                </div>
              )}
              {story.bias.center > 0 && (
                <div 
                  className="bg-bias-center flex items-center justify-center text-white"
                  style={{ width: `${story.bias.center}%` }}
                >
                  {story.bias.center >= 15 && `Centru ${story.bias.center}%`}
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
      </article>
    </Link>
  );
}
