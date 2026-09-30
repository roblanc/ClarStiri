import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    fetchNewsList,
    fetchStoryById,
    newsListUrl,
    NewsUnavailableError,
    NEWS_FETCH_TIMEOUT_MS,
    NEWS_LIST_LIMIT,
} from './newsApiService';

function mockFetch(impl: (url: string, init?: RequestInit) => Promise<Response>) {
    const fn = vi.fn(impl);
    vi.stubGlobal('fetch', fn);
    return fn;
}

const json = (body: unknown, status = 200) =>
    Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

describe('newsListUrl', () => {
    it('uses one shared limit and the card view for listing pages', () => {
        expect(newsListUrl('card')).toMatch(/\/api\/news\?view=card&limit=100$/);
        expect(newsListUrl('full')).toMatch(/\/api\/news\?limit=100$/);
        expect(NEWS_LIST_LIMIT).toBe(100);
    });
});

describe('fetchNewsList', () => {
    it('returns the stories from the API', async () => {
        const fetchSpy = mockFetch(() => json({ success: true, data: [{ id: 'a' }] }));
        await expect(fetchNewsList('card')).resolves.toEqual([{ id: 'a' }]);
        expect(fetchSpy.mock.calls[0][0]).toBe(newsListUrl('card'));
    });

    it('treats an empty list (cache being rebuilt) as unavailable', async () => {
        mockFetch(() => json({ success: true, data: [] }));
        await expect(fetchNewsList('card')).rejects.toBeInstanceOf(NewsUnavailableError);
    });

    it('fails with a Romanian message on HTTP and network errors', async () => {
        mockFetch(() => json({ success: false }, 500));
        await expect(fetchNewsList('full')).rejects.toThrow(/Știrile nu sunt disponibile/);
        mockFetch(() => Promise.reject(new TypeError('Failed to fetch')));
        await expect(fetchNewsList('full')).rejects.toBeInstanceOf(NewsUnavailableError);
    });

    it('gives up after the client timeout instead of waiting for the server', async () => {
        vi.useFakeTimers();
        mockFetch((_url, init) => new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }));
        const pending = fetchNewsList('card');
        const assertion = expect(pending).rejects.toBeInstanceOf(NewsUnavailableError);
        await vi.advanceTimersByTimeAsync(NEWS_FETCH_TIMEOUT_MS);
        await assertion;
        expect(NEWS_FETCH_TIMEOUT_MS).toBeLessThanOrEqual(10_000);
    });
});

describe('fetchStoryById', () => {
    it('returns the archived story', async () => {
        const fetchSpy = mockFetch(() => json({ success: true, data: { id: 'story-1', sources: [] } }));
        await expect(fetchStoryById('story-1')).resolves.toEqual({ id: 'story-1', sources: [] });
        expect(fetchSpy.mock.calls[0][0]).toMatch(/\/api\/news\?id=story-1$/);
    });

    it('returns null when the story does not exist', async () => {
        mockFetch(() => json({ success: false }, 404));
        await expect(fetchStoryById('missing')).resolves.toBeNull();
    });

    it('throws on server errors so the page can offer a retry', async () => {
        mockFetch(() => json({ success: false }, 500));
        await expect(fetchStoryById('x')).rejects.toBeInstanceOf(NewsUnavailableError);
    });
});
