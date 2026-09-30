import { describe, expect, it } from 'vitest';
import type { AggregatedStory } from '@/types/news';
import { newsListQueryKey, normalizeCards, normalizeFullStory } from './useNews';

describe('newsListQueryKey', () => {
    it('shares one cache entry per view regardless of the page', () => {
        expect(newsListQueryKey('card')).toEqual(['aggregatedNews', 'card', 100]);
        expect(newsListQueryKey('full')).toEqual(['aggregatedNews', 'full', 100]);
    });
});

describe('normalizeCards', () => {
    it('only parses dates (text is decoded server-side)', () => {
        const [card] = normalizeCards([
            {
                id: 'a',
                title: 'A &amp; B',
                description: '',
                sourcesCount: 2,
                bias: { left: 0, center: 100, right: 0 },
                mainCategory: 'Actualitate',
                publishedAt: '2026-09-30T20:00:00.000Z',
                timeAgo: 'acum 1 oră',
                sources: [],
            },
        ]);
        expect(card.publishedAt).toBeInstanceOf(Date);
        expect(card.publishedAt.toISOString()).toBe('2026-09-30T20:00:00.000Z');
        expect(card.title).toBe('A &amp; B');
    });
});

describe('normalizeFullStory', () => {
    it('decodes RSS text and falls back to the first article image', () => {
        const story = normalizeFullStory({
            id: 'a',
            title: 'Titlu &#8222;x&#8221;',
            description: 'D &amp; E',
            mainCategory: 'Politic&#259;',
            publishedAt: '2026-09-30T20:00:00.000Z' as unknown as Date,
            sources: [
                { id: 's', title: 'T &amp; U', description: '', link: 'l', pubDate: 'p', imageUrl: 'img', source: {} as never },
            ],
            sourcesCount: 1,
            bias: { left: 0, center: 100, right: 0 },
            timeAgo: '',
        } as AggregatedStory);
        expect(story.title).toBe('Titlu „x”');
        expect(story.description).toBe('D & E');
        expect(story.mainCategory).toBe('Politică');
        expect(story.sources[0].title).toBe('T & U');
        expect(story.image).toBe('img');
        expect(story.publishedAt).toBeInstanceOf(Date);
    });
});
