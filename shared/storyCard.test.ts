import { describe, expect, it } from 'vitest';
import { isStoryCard, toStoryCard, STORY_CARD_SOURCE_FIELDS } from './storyCard';

const fullStory = {
    id: 'story-20260930-abc',
    title: 'Guvernul &amp; Parlamentul',
    description: 'Descriere &#8222;test&#8221;',
    sources: [
        {
            id: 'zf-1',
            title: 'Titlu ZF',
            description: 'x'.repeat(500),
            link: 'https://www.zf.ro/a',
            pubDate: 'Wed, 30 Sep 2026 21:07:00 GMT',
            imageUrl: 'https://img.example/zf.jpg',
            category: 'Eveniment',
            biasAnalysis: { overallBias: 1 },
            source: {
                id: 'zf',
                name: 'Ziarul Financiar',
                url: 'https://www.zf.ro',
                rssUrl: 'https://www.zf.ro/rss',
                bias: 'center-right' as const,
                factuality: 'high',
                category: 'mainstream',
            },
        },
        {
            id: 'g4-1',
            title: 'Titlu G4',
            description: 'y',
            link: 'https://www.g4media.ro/b',
            pubDate: 'Wed, 30 Sep 2026 20:00:00 GMT',
            source: { id: 'g4media', name: 'G4Media', url: 'https://www.g4media.ro', rssUrl: 'r', bias: 'center-left' as const },
        },
    ],
    sourcesCount: 2,
    bias: { left: 40, center: 20, right: 40 },
    contentBias: { overallBias: 3 },
    blindspot: 'none' as const,
    mainCategory: 'Politică',
    publishedAt: '2026-09-30T20:00:00.000Z',
    timeAgo: 'acum 2 ore',
};

describe('toStoryCard', () => {
    it('keeps only the story fields listing pages render', () => {
        const card = toStoryCard(fullStory);
        expect(Object.keys(card).sort()).toEqual(
            ['bias', 'blindspot', 'description', 'id', 'image', 'mainCategory', 'publishedAt', 'sources', 'sourcesCount', 'timeAgo', 'title'].sort(),
        );
        expect(card).not.toHaveProperty('contentBias');
        expect(card.sourcesCount).toBe(2);
        expect(card.bias).toEqual({ left: 40, center: 20, right: 40 });
    });

    it('keeps one outlet entry per article with only the card source fields', () => {
        const card = toStoryCard(fullStory);
        expect(card.sources).toEqual([
            { source: { id: 'zf', name: 'Ziarul Financiar', url: 'https://www.zf.ro', bias: 'center-right' } },
            { source: { id: 'g4media', name: 'G4Media', url: 'https://www.g4media.ro', bias: 'center-left' } },
        ]);
        expect(Object.keys(card.sources[0].source)).toEqual([...STORY_CARD_SOURCE_FIELDS]);
    });

    it('decodes HTML entities in story text server-side', () => {
        const card = toStoryCard(fullStory);
        expect(card.title).toBe('Guvernul & Parlamentul');
        expect(card.description).toBe('Descriere „test”');
    });

    it('falls back to the first article image when the story has none', () => {
        expect(toStoryCard(fullStory).image).toBe('https://img.example/zf.jpg');
        expect(toStoryCard({ ...fullStory, image: 'https://img.example/story.jpg' }).image).toBe('https://img.example/story.jpg');
        const noImages = { ...fullStory, sources: fullStory.sources.map(({ imageUrl: _drop, ...rest }) => rest) };
        expect(toStoryCard(noImages)).not.toHaveProperty('image');
    });

    it('is much smaller than the full story', () => {
        const full = JSON.stringify(fullStory).length;
        const card = JSON.stringify(toStoryCard(fullStory)).length;
        expect(card).toBeLessThan(full / 2);
    });
});

describe('isStoryCard', () => {
    it('distinguishes cards from full stories', () => {
        expect(isStoryCard(toStoryCard(fullStory))).toBe(true);
        expect(isStoryCard(fullStory)).toBe(false);
        expect(isStoryCard({ sources: [] })).toBe(false);
    });
});
