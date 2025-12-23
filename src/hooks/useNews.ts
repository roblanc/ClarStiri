import { useQuery } from '@tanstack/react-query';
import { getAggregatedNews, fetchAllNews } from '@/services/newsService';
import { AggregatedStory, RSSNewsItem } from '@/types/news';

/**
 * Hook pentru a obține știrile agregate
 */
export function useAggregatedNews(limit = 20) {
    return useQuery<AggregatedStory[], Error>({
        queryKey: ['aggregatedNews', limit],
        queryFn: () => getAggregatedNews(limit),
        staleTime: 5 * 60 * 1000, // 5 minute - consideră datele fresh
        gcTime: 30 * 60 * 1000, // 30 minute - păstrează în cache
        refetchOnWindowFocus: false,
        retry: 2,
    });
}

/**
 * Hook pentru a obține toate știrile raw (neagregate)
 */
export function useAllNews() {
    return useQuery<RSSNewsItem[], Error>({
        queryKey: ['allNews'],
        queryFn: fetchAllNews,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
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
