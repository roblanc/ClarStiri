import { useState } from "react";
import { NewsSource } from "@/types/news";

interface SourceFaviconProps {
    source: NewsSource | { name: string; url: string; bias?: string };
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showRing?: boolean;
}

export function SourceFavicon({ source, size = 'md', showRing = true }: SourceFaviconProps) {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        xs: 'w-4 h-4 text-[6px]',
        sm: 'w-5 h-5 text-[7px]',
        md: 'w-6 h-6 text-[8px]',
        lg: 'w-8 h-8 text-[10px]',
    };

    const bias = 'bias' in source ? source.bias : 'center';

    const getBiasRingColor = (bias?: string) => {
        if (bias === 'left' || bias === 'center-left') return 'ring-blue-400';
        if (bias === 'right' || bias === 'center-right') return 'ring-red-400';
        return 'ring-gray-300';
    };

    const getBiasBgColor = (bias?: string) => {
        if (bias === 'left' || bias === 'center-left') return 'bg-gradient-to-br from-blue-500 to-blue-600';
        if (bias === 'right' || bias === 'center-right') return 'bg-gradient-to-br from-red-500 to-red-600';
        return 'bg-gradient-to-br from-gray-400 to-gray-500';
    };

    // Folosim favicon-ul de pe site-ul sursei via Google
    let faviconUrl: string | null = null;
    try {
        if (source.url) {
            const hostname = new URL(source.url).hostname;
            faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
        }
    } catch {
        faviconUrl = null;
    }

    const ringClasses = showRing ? `ring-1 ring-offset-1 ring-offset-background ${getBiasRingColor(bias)}` : '';

    if (faviconUrl && !imageError) {
        return (
            <div
                className={`${sizeClasses[size]} rounded-full overflow-hidden ${ringClasses} bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer flex-shrink-0`}
                title={source.name}
            >
                <img
                    src={faviconUrl}
                    alt={source.name}
                    className="w-full h-full object-contain p-0.5"
                    onError={() => setImageError(true)}
                    loading="lazy"
                />
            </div>
        );
    }

    // Fallback cu inițiale
    return (
        <div
            className={`${sizeClasses[size]} rounded-full ${getBiasBgColor(bias)} flex items-center justify-center ${ringClasses} shadow-sm hover:scale-110 transition-transform cursor-pointer flex-shrink-0`}
            title={source.name}
        >
            <span className="font-bold text-white drop-shadow-sm">{source.name.substring(0, 2).toUpperCase()}</span>
        </div>
    );
}

// Componenta pentru a afișa mai multe favicons într-un grup comprimat
interface SourceFaviconGroupProps {
    sources: Array<{ name: string; url: string; bias?: string }>;
    maxVisible?: number;
    size?: 'xs' | 'sm' | 'md';
}

export function SourceFaviconGroup({ sources, maxVisible = 4, size = 'sm' }: SourceFaviconGroupProps) {
    const visible = sources.slice(0, maxVisible);
    const remaining = sources.length - maxVisible;

    return (
        <div className="flex items-center -space-x-1.5">
            {visible.map((source, index) => (
                <SourceFavicon
                    key={`${source.name}-${index}`}
                    source={source}
                    size={size}
                    showRing={false}
                />
            ))}
            {remaining > 0 && (
                <div
                    className={`${size === 'xs' ? 'w-4 h-4 text-[6px]' : size === 'sm' ? 'w-5 h-5 text-[7px]' : 'w-6 h-6 text-[8px]'} rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground font-medium flex-shrink-0`}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}
