import { useState, useEffect, useRef } from 'react';
import { generateBiasComparison } from '@/services/geminiService';
import { RSSNewsItem } from '@/types/news';

interface UseBiasComparisonResult {
    comparison: string | null;
    error: string | null;
    isLoading: boolean;
}

/**
 * Hook pentru a genera automat comparația de bias pentru o știre
 * Se apelează automat când componenta se montează
 */
export function useBiasComparison(
    storyTitle: string,
    sources: RSSNewsItem[]
): UseBiasComparisonResult {
    const [comparison, setComparison] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const hasGenerated = useRef(false);

    useEffect(() => {
        // Evită regenerarea dacă deja am generat sau nu avem surse
        if (hasGenerated.current || !storyTitle || sources.length === 0) return;

        const generate = async () => {
            hasGenerated.current = true;
            setIsLoading(true);
            setError(null);

            try {
                const result = await generateBiasComparison(storyTitle, sources);

                if (result.error) {
                    setError(result.error);
                } else {
                    setComparison(result.comparison);
                }
            } catch (err) {
                setError('Eroare neașteptată. Încearcă din nou.');
            } finally {
                setIsLoading(false);
            }
        };

        generate();
    }, [storyTitle, sources]);

    return {
        comparison,
        error,
        isLoading
    };
}
