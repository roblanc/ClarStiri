import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAggregatedNews, fetchAllNews, getCachedAggregatedNews, aggregateNews } from '@/services/newsService';
import { fetchAggregatedNewsFromAPI } from '@/services/newsApiService';
import { AggregatedStory, RSSNewsItem } from '@/types/news';
import { useEffect, useState, useMemo } from 'react';

/**
 * Funcție care încearcă API-ul serverless, cu fallback la client-side fetch.
 * Tratează un array gol ca eșec (cache Redis gol / cron încă nu a rulat).
 */
async function fetchNewsWithFallback(limit: number): Promise<AggregatedStory[]> {
    try {
        const stories = await fetchAggregatedNewsFromAPI(limit);
        if (stories.length > 0) {
            console.log('✅ Fetched from API (fast path)');
            return stories;
        }
        // API a returnat [] — Redis gol sau cron-ul încă nu a rulat
        throw new Error('API returned empty list');
    } catch (apiError) {
        console.warn('⚠️ API unavailable or empty, falling back to client-side fetch');
        return getAggregatedNews(limit);
    }
}

/**
 * Hook pentru a obține știrile agregate cu încărcare rapidă din cache
 */
export function useAggregatedNews(limit = 20) {
    const queryClient = useQueryClient();

    const query = useQuery<AggregatedStory[], Error>({
        queryKey: ['aggregatedNews', limit],
        queryFn: () => fetchNewsWithFallback(limit),
        staleTime: 15 * 60 * 1000, // 15 minute (mai lung pentru viteză)
        gcTime: 24 * 60 * 60 * 1000, // 24 ore persistat în memorie
        refetchOnWindowFocus: false,
        refetchInterval: 5 * 60 * 1000,
        retry: 1,
    });

    // Sincronizare cu LocalStorage pentru încărcare INSTANT la revenire
    useEffect(() => {
        if (query.data && query.data.length > 0) {
            localStorage.setItem(`last_news_${limit}`, JSON.stringify({
                data: query.data,
                ts: Date.now()
            }));
        }
    }, [query.data, limit]);

    // Încercăm să luăm datele din localStorage ca placeholder
    const cachedLocal = useMemo(() => {
        try {
            const saved = localStorage.getItem(`last_news_${limit}`);
            if (saved) return JSON.parse(saved).data as AggregatedStory[];
        } catch (e) { return undefined; }
        return undefined;
    }, [limit]);

    return {
        ...query,
        data: query.data || cachedLocal,
        isLoading: query.isLoading && !cachedLocal,
        isRefreshing: query.isFetching && !!query.data,
    };
}

/**
 * Hook pentru a obține toate știrile raw (neagregate)
 */
export function useAllNews() {
    return useQuery<RSSNewsItem[], Error>({
        queryKey: ['allNews'],
        queryFn: fetchAllNews,
        staleTime: 10 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
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
