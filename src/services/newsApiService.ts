import type { AggregatedStory } from '@/types/news';
import type { StoryCard } from '../../shared/storyCard';

// URL pentru API - folosește path relativ pentru producție, localhost pentru development
const API_URL = import.meta.env.DEV
    ? 'http://localhost:3000/api/news' // Vercel dev
    : '/api/news'; // Production

/**
 * One list size for every listing page, so the homepage, search, category and story pages share
 * a single CDN entry and a single react-query cache per view. The cron stores at most 100 stories.
 */
export const NEWS_LIST_LIMIT = 100;

/**
 * The server answers from Redis/CDN (or a Postgres snapshot on a cache miss) and never rebuilds
 * the feed while a visitor waits, so anything slower than this is a failure, not a slow success.
 */
export const NEWS_FETCH_TIMEOUT_MS = 8000;

export type NewsView = 'card' | 'full';

/** Exact homepage request (`view=card`) — keep in sync with any `<link rel="preload">` for it. */
export function newsListUrl(view: NewsView, limit = NEWS_LIST_LIMIT): string {
    return view === 'card' ? `${API_URL}?view=card&limit=${limit}` : `${API_URL}?limit=${limit}`;
}

export class NewsUnavailableError extends Error {
    constructor(message = 'Știrile nu sunt disponibile momentan. Încearcă din nou în câteva momente.') {
        super(message);
        this.name = 'NewsUnavailableError';
    }
}

interface NewsListResponse<T> {
    success: boolean;
    data: T[];
    error?: string;
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<{ status: number; body: T | null }> {
    // Own controller instead of AbortSignal.timeout/any, which older Safari versions lack.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), NEWS_FETCH_TIMEOUT_MS);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort);
    try {
        const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
        if (!response.ok) return { status: response.status, body: null };
        return { status: response.status, body: (await response.json()) as T };
    } catch (error) {
        if (signal?.aborted) throw error;
        throw new NewsUnavailableError();
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
    }
}

export function fetchNewsList(view: 'card', signal?: AbortSignal): Promise<StoryCard[]>;
export function fetchNewsList(view: 'full', signal?: AbortSignal): Promise<AggregatedStory[]>;
export async function fetchNewsList(view: NewsView, signal?: AbortSignal): Promise<Array<StoryCard | AggregatedStory>> {
    const { body } = await getJson<NewsListResponse<StoryCard | AggregatedStory>>(newsListUrl(view), signal);
    // An empty list means the server cache is being rebuilt; treat it as a (retryable) failure so
    // the UI keeps showing the last copy it has instead of an empty page.
    if (!body?.success || !Array.isArray(body.data) || body.data.length === 0) {
        throw new NewsUnavailableError();
    }
    return body.data;
}

/** Full story (with every article) from the Redis/Postgres archive; null when it doesn't exist. */
export async function fetchStoryById(id: string, signal?: AbortSignal): Promise<AggregatedStory | null> {
    const { status, body } = await getJson<{ success: boolean; data?: AggregatedStory }>(
        `${API_URL}?id=${encodeURIComponent(id)}`,
        signal,
    );
    if (status === 404) return null;
    if (!body?.success || !body.data) throw new NewsUnavailableError();
    return body.data;
}
