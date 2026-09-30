import { describe, expect, it, vi } from 'vitest';

vi.mock('./llm.js', () => ({
    getEmbeddingsBatch: async () => null,
    generateHeadline: async () => ({ title: 'LLM', generated: true }),
    fallbackHeadline: (a: { title: string }[]) => a[0]?.title ?? '',
}));

import type { AggregatedStory } from './aggregation';
import type { RSSNewsItem } from './shared';
import { mergeWithExisting } from './storyMerge';

const HOUR = 3_600_000;
const T0 = Date.UTC(2026, 8, 30, 8);

function article(outlet: string, n: number, hoursAfter = 0): RSSNewsItem {
    return {
        id: `${outlet}-${n}`,
        title: `Titlu ${outlet} ${n}`,
        description: '',
        link: `https://${outlet}.ro/${n}`,
        pubDate: new Date(T0 + hoursAfter * HOUR).toISOString(),
        source: { id: outlet, name: outlet, url: '', rssUrl: '', bias: 'center', factuality: 'high', category: 'mainstream' },
    } as RSSNewsItem;
}

function story(id: string, sources: RSSNewsItem[], extra: Partial<AggregatedStory> = {}): AggregatedStory {
    return {
        id,
        title: `Story ${id}`,
        description: '',
        sources,
        sourcesCount: sources.length,
        bias: { left: 33, center: 34, right: 33 },
        blindspot: 'none',
        mainCategory: 'Actualitate',
        publishedAt: sources[0].pubDate,
        timeAgo: '',
        ...extra,
    };
}

describe('mergeWithExisting', () => {
    it('keeps the old id and re-adds recent old sources', () => {
        const old = story('story-old', [article('digi24', 1), article('hotnews', 1), article('g4media', 1)]);
        const fresh = story('story-new', [article('digi24', 1), article('hotnews', 1), article('adevarul', 1, 2)]);
        const { merged, unmatched } = mergeWithExisting([fresh], [old]);
        expect(merged).toHaveLength(1);
        expect(merged[0].id).toBe('story-old');
        expect(merged[0].sources.map(s => s.link).sort()).toEqual([
            'https://adevarul.ro/1', 'https://digi24.ro/1', 'https://g4media.ro/1', 'https://hotnews.ro/1',
        ]);
        expect(merged[0].sourcesCount).toBe(4);
        expect(unmatched).toHaveLength(0);
    });

    it('does not re-add an old article from an outlet the fresh story already has', () => {
        // digi24 published a follow-up; the fresh cluster carries the follow-up, not the first piece.
        const old = story('story-old', [article('digi24', 1), article('hotnews', 1), article('g4media', 1)]);
        const fresh = story('story-new', [article('digi24', 2, 3), article('hotnews', 1), article('g4media', 1)]);
        const { merged } = mergeWithExisting([fresh], [old]);
        const outlets = merged[0].sources.map(s => s.source.id);
        expect(outlets.sort()).toEqual(['digi24', 'g4media', 'hotnews']);
        expect(merged[0].sources.find(s => s.source.id === 'digi24')!.link).toBe('https://digi24.ro/2');
    });

    it('collapses same-outlet duplicates carried by an old story', () => {
        const old = story('story-old', [
            article('digi24', 1), article('hotnews', 1), article('g4media', 1), article('rfi', 1), article('rfi', 2, 1),
        ]);
        const fresh = story('story-new', [article('digi24', 1), article('hotnews', 1), article('g4media', 1)]);
        const { merged } = mergeWithExisting([fresh], [old]);
        const outlets = merged[0].sources.map(s => s.source.id);
        expect(new Set(outlets).size).toBe(outlets.length);
        expect(outlets).toContain('rfi');
    });

    it('does not inherit old sources outside the 24h window', () => {
        const old = story('story-old', [article('digi24', 1), article('hotnews', 1), article('rfi', 9, -30)]);
        const fresh = story('story-new', [article('digi24', 1), article('hotnews', 1)]);
        const { merged } = mergeWithExisting([fresh], [old]);
        expect(merged[0].sources.map(s => s.source.id).sort()).toEqual(['digi24', 'hotnews']);
    });
});
