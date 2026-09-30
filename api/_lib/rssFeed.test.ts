import { describe, expect, it } from 'vitest';
import type { AggregatedStory } from './aggregation';
import { buildRssXml } from './rssFeed';

const story = {
    id: 'story-20260930-1xhclo',
    title: 'Nicuşor Dan despre buget: „Nu e motiv de panică" & <altele>',
    description: 'Preşedintele a vorbit\u0008 despre rectificare.',
    image: 'https://example.ro/poza.jpg?w=700&h=400',
    sources: [
        { source: { id: 'hotnews', name: 'HotNews' } },
        { source: { id: 'digi24', name: 'Digi24' } },
        { source: { id: 'hotnews', name: 'HotNews' } },
    ],
    sourcesCount: 3,
    bias: { left: 18, center: 67, right: 15 },
    mainCategory: 'Politică',
    publishedAt: '2026-09-30T21:55:59Z',
    timeAgo: '',
} as unknown as AggregatedStory;

describe('buildRssXml', () => {
    const xml = buildRssXml([story, { ...story, id: 'story-2', publishedAt: 'not a date', image: '' } as AggregatedStory], new Date('2026-10-01T00:00:00Z'));

    it('lists source names, not [object Object], and the bias split', () => {
        expect(xml).not.toContain('[object Object]');
        expect(xml).toContain('Acoperit de 3 surse: HotNews, Digi24.');
        expect(xml).toContain('Stânga 18% · Centru 67% · Dreapta 15%.');
    });

    it('links items to /stire/:id and escapes XML', () => {
        expect(xml).toContain('<link>https://thesite.ro/stire/story-20260930-1xhclo</link>');
        expect(xml).toContain('&amp; &lt;altele&gt;');
        expect(xml).toContain('<media:content url="https://example.ro/poza.jpg?w=700&amp;h=400" medium="image" />');
        expect(xml).not.toContain('<enclosure');
        expect(xml).not.toContain('\u0008');
    });

    it('never emits "Invalid Date"', () => {
        expect(xml).not.toContain('Invalid Date');
        expect(xml).toContain('<pubDate>Wed, 30 Sep 2026 21:55:59 GMT</pubDate>');
        expect(xml).toContain('<pubDate>Thu, 01 Oct 2026 00:00:00 GMT</pubDate>');
    });

    it('declares the namespaces it uses', () => {
        expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<rss version="2.0"/);
        expect(xml).toContain('xmlns:media="http://search.yahoo.com/mrss/"');
        expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    });
});
