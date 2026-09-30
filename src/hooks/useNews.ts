import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { fetchNewsList, NEWS_LIST_LIMIT, type NewsView } from '@/services/newsApiService';
import type { AggregatedStory } from '@/types/news';
import type { StoryCard } from '../../shared/storyCard';
import { decodeHtmlEntities } from '../../shared/htmlEntities';

/** Slim story used by listing pages (`/api/news?view=card`), with publishedAt parsed. */
export type NewsCardStory = StoryCard<Date>;
export type NewsListData<V extends NewsView> = V extends 'card' ? NewsCardStory[] : AggregatedStory[];

export function newsListQueryKey(view: NewsView) {
    return ['aggregatedNews', view, NEWS_LIST_LIMIT] as const;
}

// Only the slim card list is persisted (~125 KB for 100 stories); the full list was up to
// ~560 KB per page size and was rewritten on every fetch.
const LAST_NEWS_CACHE_KEY = 'last_news_v3_card';
const LEGACY_CACHE_KEY_PATTERNS = [/^last_news_v2_\d+$/, /^thesite_aggregated_cache_v4_ultra$/, /^thesite_news_cache$/];

function toDate(value: unknown): Date {
    if (value instanceof Date) return value;
    const parsed = new Date(value as string);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/** Card text is decoded server-side, so only the date needs converting. */
export function normalizeCards(cards: StoryCard<string | Date>[]): NewsCardStory[] {
    return cards.map((card) => ({ ...card, publishedAt: toDate(card.publishedAt) }));
}

/** Full stories (story page, category, studios) still carry raw RSS text. */
export function normalizeFullStory(story: AggregatedStory): AggregatedStory {
    return {
        ...story,
        title: decodeHtmlEntities(story.title),
        description: decodeHtmlEntities(story.description || ''),
        mainCategory: decodeHtmlEntities(story.mainCategory || ''),
        publishedAt: toDate(story.publishedAt),
        sources: story.sources.map((source) => ({
            ...source,
            title: decodeHtmlEntities(source.title),
            description: decodeHtmlEntities(source.description || ''),
            category: decodeHtmlEntities(source.category || '') || undefined,
        })),
        image: story.image || story.sources.find((source) => source.imageUrl)?.imageUrl,
    };
}

let legacyCleanupDone = false;
function removeLegacyCaches(): void {
    if (legacyCleanupDone) return;
    legacyCleanupDone = true;
    try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && LEGACY_CACHE_KEY_PATTERNS.some((re) => re.test(key))) localStorage.removeItem(key);
        }
    } catch {
        // Storage unavailable (private mode, blocked) — nothing to clean.
    }
}

let localCardsMemo: NewsCardStory[] | null | undefined;
/** Last card list saved in this browser, parsed once per page load. */
export function readCachedCards(): NewsCardStory[] | undefined {
    if (localCardsMemo === undefined) {
        localCardsMemo = null;
        try {
            const raw = localStorage.getItem(LAST_NEWS_CACHE_KEY);
            const parsed = raw ? (JSON.parse(raw).data as StoryCard[] | undefined) : undefined;
            if (Array.isArray(parsed) && parsed.length > 0) localCardsMemo = normalizeCards(parsed);
        } catch {
            localCardsMemo = null;
        }
    }
    return localCardsMemo ?? undefined;
}

function scheduleIdle(task: () => void): void {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(task, { timeout: 3000 });
    else window.setTimeout(task, 1000);
}

function persistCards(cards: StoryCard[]): void {
    scheduleIdle(() => {
        try {
            localStorage.setItem(LAST_NEWS_CACHE_KEY, JSON.stringify({ data: cards, ts: Date.now() }));
            localCardsMemo = normalizeCards(cards);
        } catch {
            // Quota exceeded or storage blocked — the in-memory cache still works.
        }
    });
}

export async function fetchNormalizedNewsList<V extends NewsView>(view: V, signal?: AbortSignal): Promise<NewsListData<V>> {
    if (view === 'card') {
        const cards = await fetchNewsList('card', signal);
        persistCards(cards);
        return normalizeCards(cards) as NewsListData<V>;
    }
    const stories = await fetchNewsList('full', signal);
    return stories.map(normalizeFullStory) as NewsListData<V>;
}

interface UseAggregatedNewsOptions {
    enabled?: boolean;
}

/**
 * Știrile agregate pentru paginile de listă.
 * - 'card' (homepage, căutare, pagina de știre): payload mic, păstrat și în localStorage pentru
 *   afișare instant la revenire.
 * - 'full' (categorii, studio, editorial): toate articolele fiecărei povești.
 * Ambele cer mereu NEWS_LIST_LIMIT povești, deci paginile împart același cache.
 */
export function useAggregatedNews<V extends NewsView = 'card'>(view: V = 'card' as V, options: UseAggregatedNewsOptions = {}) {
    useEffect(removeLegacyCaches, []);

    const query = useQuery<NewsListData<V>, Error>({
        queryKey: newsListQueryKey(view),
        // No abort signal on purpose: pages remount on every URL change (App keys the error
        // boundary on path+search), and cancelling would throw away an in-flight request.
        queryFn: () => fetchNormalizedNewsList(view),
        enabled: options.enabled ?? true,
        staleTime: 2 * 60 * 1000,     // verifică noutăți mai des, dar profită de cache-ul edge
        gcTime: 24 * 60 * 60 * 1000, // 24 ore persistat în memorie
        refetchOnWindowFocus: true,   // refetch când userul revine pe tab (critic pe mobile)
        refetchInterval: 12 * 60 * 1000,
        retry: 1,
        retryDelay: 1000,
    });

    // Ultima listă salvată local, afișată cât timp se încarcă (sau dacă a eșuat) cererea.
    const cachedLocal = useMemo(
        () => (view === 'card' ? (readCachedCards() as NewsListData<V> | undefined) : undefined),
        [view]
    );
    const fresh = query.data?.length ? query.data : undefined;

    return {
        ...query,
        data: fresh || cachedLocal,
        isLoading: query.isLoading && !cachedLocal,
        isRefreshing: query.isFetching && !!fresh,
        isLoadingFresh: query.isFetching && !fresh && !!cachedLocal,
    };
}

/**
 * Hook pentru a forța refresh-ul știrilor
 */
export function useRefreshNews() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ['aggregatedNews'] });
    };
}
