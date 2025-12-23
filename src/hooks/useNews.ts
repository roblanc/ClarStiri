import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAggregatedNews, fetchAllNews, getCachedAggregatedNews, aggregateNews } from '@/services/newsService';
import { AggregatedStory, RSSNewsItem } from '@/types/news';
import { useEffect, useState } from 'react';

/**
 * Hook pentru a obține știrile agregate cu încărcare rapidă din cache
 */
export function useAggregatedNews(limit = 20) {
    const [initialData, setInitialData] = useState<AggregatedStory[] | undefined>(undefined);

    // Încarcă din cache sincron la mount
    useEffect(() => {
        const cached = getCachedAggregatedNews(limit);
        if (cached) {
            setInitialData(cached);
        }
    }, [limit]);

    const query = useQuery<AggregatedStory[], Error>({
        queryKey: ['aggregatedNews', limit],
        queryFn: () => getAggregatedNews(limit),
        staleTime: 2 * 60 * 1000, // 2 minute
        gcTime: 30 * 60 * 1000, // 30 minute
        refetchOnWindowFocus: false,
        retry: 1,
        // Folosește datele din cache ca placeholder
        placeholderData: initialData,
    });

    return {
        ...query,
        // Dacă avem date din cache, nu suntem în "loading" propriu-zis
        isLoading: query.isLoading && !initialData,
        // Indica dacă datele sunt din cache și se actualizează în background
        isRefreshing: query.isFetching && !!initialData,
    };
}

/**
 * Hook pentru a obține toate știrile raw (neagregate)
 */
export function useAllNews() {
    return useQuery<RSSNewsItem[], Error>({
        queryKey: ['allNews'],
        queryFn: fetchAllNews,
        staleTime: 2 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}

/**
 * Hook pentru a obține știrile de top (cele cu cele mai multe surse)
 */
export function useTopStories(limit = 5) {
    const { data: stories, ...rest } = useAggregatedNews(50);

    // Filtrează doar știrile cu mai mult de o sursă și ia primele N
    const topStories = stories
        ?.filter(story => story.sourcesCount >= 1)
        ?.slice(0, limit)
        ?.map(story => ({
            id: story.id,
            title: story.title,
            bias: story.bias,
            sourcesCount: story.sourcesCount,
        }));

    return {
        data: topStories,
        ...rest,
    };
}

/**
 * Hook pentru a obține detaliile unei știri specifice
 */
export function useStoryDetail(storyId: string) {
    const { data: stories, ...rest } = useAggregatedNews(50);

    const story = stories?.find(s => s.id === storyId);

    return {
        data: story,
        ...rest,
    };
}

/**
 * Hook pentru a forța refresh-ul știrilor
 */
export function useRefreshNews() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ['aggregatedNews'] });
        queryClient.invalidateQueries({ queryKey: ['allNews'] });
    };
}
