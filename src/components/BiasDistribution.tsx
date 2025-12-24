import { RSSNewsItem, NewsSource } from "@/types/news";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

interface BiasDistributionProps {
    sources: RSSNewsItem[];
    bias: {
        left: number;
        center: number;
        right: number;
    };
}

// Componenta pentru logo-ul sursei
const SourceLogo = ({
    source,
    size = 'md'
}: {
    source: NewsSource;
    size?: 'sm' | 'md' | 'lg';
}) => {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        sm: 'w-6 h-6 text-[8px]',
        md: 'w-8 h-8 text-[10px]',
        lg: 'w-10 h-10 text-xs',
    };

    const getBiasRingColor = (bias: string) => {
        if (bias === 'left' || bias === 'center-left') return 'ring-blue-400';
        if (bias === 'right' || bias === 'center-right') return 'ring-red-400';
        return 'ring-gray-400';
    };

    const getBiasBgColor = (bias: string) => {
        if (bias === 'left' || bias === 'center-left') return 'bg-gradient-to-br from-blue-500 to-blue-600';
        if (bias === 'right' || bias === 'center-right') return 'bg-gradient-to-br from-red-500 to-red-600';
        return 'bg-gradient-to-br from-gray-400 to-gray-500';
    };

    // Folosim favicon-ul de pe site-ul sursei
    const faviconUrl = source.url ? `https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=64` : null;

    if (faviconUrl && !imageError) {
        return (
            <div
                className={`${sizeClasses[size]} rounded-full overflow-hidden ring-2 ring-offset-1 ring-offset-background ${getBiasRingColor(source.bias)} bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer`}
                title={source.name}
            >
                <img
                    src={faviconUrl}
                    alt={source.name}
                    className="w-full h-full object-contain p-0.5"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    // Fallback cu inițiale
    return (
        <div
            className={`${sizeClasses[size]} rounded-full ${getBiasBgColor(source.bias)} flex items-center justify-center ring-2 ring-offset-1 ring-offset-background ${getBiasRingColor(source.bias)} shadow-sm hover:scale-110 transition-transform cursor-pointer`}
            title={source.name}
        >
            <span className="font-bold text-white drop-shadow-sm">{source.name.substring(0, 2).toUpperCase()}</span>
        </div>
    );
};

export function BiasDistribution({ sources, bias }: BiasDistributionProps) {
    // Grupează sursele după bias
    const leftSources = sources.filter(s => s.source.bias === 'left' || s.source.bias === 'center-left');
    const centerSources = sources.filter(s => s.source.bias === 'center');
    const rightSources = sources.filter(s => s.source.bias === 'right' || s.source.bias === 'center-right');

    // Numărul maxim de logouri de afișat per categorie
    const MAX_VISIBLE = 6;

    const renderSourceGrid = (
        sources: RSSNewsItem[],
        maxVisible: number,
        biasType: 'left' | 'center' | 'right'
    ) => {
        const visible = sources.slice(0, maxVisible);
        const remaining = sources.length - maxVisible;

        return (
            <div className="flex flex-wrap gap-1.5">
                {visible.map((source) => (
                    <SourceLogo key={source.id} source={source.source} size="md" />
                ))}
                {remaining > 0 && (
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${biasType === 'left' ? 'border-blue-300 text-blue-600 bg-blue-50' :
                            biasType === 'right' ? 'border-red-300 text-red-600 bg-red-50' :
                                'border-gray-300 text-gray-600 bg-gray-50'
                            }`}
                    >
                        +{remaining}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Distribuție Bias</h3>
                <ExternalLink className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                • {Math.max(bias.left, bias.center, bias.right)}% din surse sunt de{' '}
                {bias.center >= bias.left && bias.center >= bias.right ? 'Centru' :
                    bias.left > bias.right ? 'Stânga' : 'Dreapta'}
            </p>

            {/* Bias Bar cu labels direct pe bară */}
            <div className="mb-6">
                <div className="h-7 rounded overflow-hidden flex text-xs font-medium">
                    {bias.left > 0 && (
                        <div
                            className="bg-bias-left flex items-center justify-center text-white transition-all duration-300"
                            style={{ width: `${bias.left}%` }}
                        >
                            {bias.left >= 15 && `S ${bias.left}%`}
                        </div>
                    )}
                    {bias.center > 0 && (
                        <div
                            className="bg-bias-center flex items-center justify-center text-white transition-all duration-300"
                            style={{ width: `${bias.center}%` }}
                        >
                            {bias.center >= 15 && `C ${bias.center}%`}
                        </div>
                    )}
                    {bias.right > 0 && (
                        <div
                            className="bg-bias-right flex items-center justify-center text-white transition-all duration-300"
                            style={{ width: `${bias.right}%` }}
                        >
                            {bias.right >= 15 && `D ${bias.right}%`}
                        </div>
                    )}
                </div>
            </div>

            {/* Source Logos Grid - 3 coloane */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                {/* Coloana Stânga */}
                <div>
                    <div className="text-xs text-blue-600 font-medium mb-2 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Stânga ({leftSources.length})
                    </div>
                    {renderSourceGrid(leftSources, MAX_VISIBLE, 'left')}
                </div>

                {/* Coloana Centru */}
                <div>
                    <div className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        Centru ({centerSources.length})
                    </div>
                    {renderSourceGrid(centerSources, MAX_VISIBLE, 'center')}
                </div>

                {/* Coloana Dreapta */}
                <div>
                    <div className="text-xs text-red-600 font-medium mb-2 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Dreapta ({rightSources.length})
                    </div>
                    {renderSourceGrid(rightSources, MAX_VISIBLE, 'right')}
                </div>
            </div>
        </div>
    );
}
