import { describe, expect, it } from 'vitest';
import {
    parseListQuery,
    projectStories,
    sortByImportance,
    storyCacheControl,
    ARCHIVED_STORY_CACHE_CONTROL,
    DEFAULT_LIST_LIMIT,
    LIST_CACHE_CONTROL,
    LIVE_STORY_CACHE_CONTROL,
    MAX_LIST_LIMIT,
} from './newsResponse';

const story = (id: string, sourcesCount: number, publishedAt: string) => ({
    id,
    title: id,
    description: '',
    sources: [{ link: `https://x/${id}`, title: id, source: { id: 's', name: 'S', url: 'https://s', bias: 'center' as const, rssUrl: 'r' } }],
    sourcesCount,
    bias: { left: 0, center: 100, right: 0 },
    mainCategory: 'Actualitate',
    publishedAt,
    timeAgo: '',
});

describe('parseListQuery', () => {
    it('defaults to the full view and the legacy limit', () => {
        expect(parseListQuery({})).toEqual({ view: 'full', limit: DEFAULT_LIST_LIMIT });
        expect(parseListQuery({ limit: 'abc', view: 'weird' })).toEqual({ view: 'full', limit: DEFAULT_LIST_LIMIT });
    });

    it('accepts the card view and clamps the limit', () => {
        expect(parseListQuery({ view: 'card', limit: '100' })).toEqual({ view: 'card', limit: 100 });
        expect(parseListQuery({ limit: '30' })).toEqual({ view: 'full', limit: 30 });
        expect(parseListQuery({ limit: '5000' }).limit).toBe(MAX_LIST_LIMIT);
        expect(parseListQuery({ limit: '-3' }).limit).toBe(DEFAULT_LIST_LIMIT);
        expect(parseListQuery({ limit: ['20', '40'], view: ['card'] })).toEqual({ view: 'card', limit: 20 });
    });
});

describe('projectStories', () => {
    const stories = [story('a', 3, '2026-09-30T10:00:00Z'), story('b', 2, '2026-09-30T09:00:00Z')];

    it('returns the full shape untouched for the default view', () => {
        expect(projectStories(stories, 'full', 1)).toEqual([stories[0]]);
    });

    it('returns card projections for view=card', () => {
        const [card] = projectStories(stories, 'card', 1);
        expect(card.sources[0]).toEqual({ source: { id: 's', name: 'S', url: 'https://s', bias: 'center' } });
    });
});

describe('storyCacheControl', () => {
    const now = Date.parse('2026-10-01T00:00:00Z');

    it('keeps live stories short-lived so new sources show up', () => {
        expect(storyCacheControl({ publishedAt: '2026-09-30T20:00:00Z' }, 'redis', now)).toBe(LIVE_STORY_CACHE_CONTROL);
        expect(storyCacheControl({}, 'redis', now)).toBe(LIVE_STORY_CACHE_CONTROL);
    });

    it('caches old and Postgres-archived stories for longer', () => {
        expect(storyCacheControl({ publishedAt: '2026-09-01T00:00:00Z' }, 'redis', now)).toBe(ARCHIVED_STORY_CACHE_CONTROL);
        expect(storyCacheControl({ publishedAt: '2026-09-30T20:00:00Z' }, 'db', now)).toBe(ARCHIVED_STORY_CACHE_CONTROL);
    });

    it('lets list responses live 5 minutes at the edge', () => {
        expect(LIST_CACHE_CONTROL).toContain('s-maxage=300');
    });
});

describe('sortByImportance', () => {
    it('ranks by coverage and freshness', () => {
        const now = Date.parse('2026-10-01T00:00:00Z');
        const fresh = story('fresh', 3, '2026-09-30T23:00:00Z');
        const big = story('big', 12, '2026-09-30T20:00:00Z');
        const old = story('old', 12, '2026-09-27T00:00:00Z');
        expect(sortByImportance([old, fresh, big], now).map(s => s.id)).toEqual(['big', 'fresh', 'old']);
    });
});
