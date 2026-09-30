import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const llm = vi.hoisted(() => ({
    available: true,
    generated: true,
    calls: 0,
}));

vi.mock('./llm.js', () => ({
    getEmbeddingsBatch: async () => null,
    llmHeadlinesAvailable: () => llm.available,
    fallbackHeadline: (articles: { title: string }[]) => articles[0]?.title ?? '',
    generateHeadline: async (articles: { title: string }[]) => {
        llm.calls++;
        return llm.generated
            ? { title: `LLM: ${articles.length} surse`, generated: true }
            : { title: articles[0]?.title ?? '', generated: false };
    },
}));

import { aggregateNewsBuildTopics, headlineOutgrown, planHeadlines, storyStartedAt, type AggregatedStory } from './aggregation';
import type { RSSNewsItem } from './shared';

const HOUR = 3_600_000;

function article(outlet: string, title: string, hoursAgo = 1): RSSNewsItem {
    return {
        id: `${outlet}-${title.length}`,
        title,
        description: '',
        link: `https://${outlet}.ro/${encodeURIComponent(title)}`,
        pubDate: new Date(Date.now() - hoursAgo * HOUR).toISOString(),
        source: { id: outlet, name: outlet, url: '', rssUrl: '', bias: 'center', factuality: 'high', category: 'mainstream' },
    } as RSSNewsItem;
}

const exciseTitles: [string, string][] = [
    ['digi24', 'Acciza la motorină rămâne redusă cu 25% și în octombrie'],
    ['hotnews', 'Ministerul Finanțelor: acciza la motorină, redusă cu 25% până la 15 octombrie'],
    ['g4media', 'Reducerea accizei la motorină cu 25% se prelungește în octombrie'],
    ['adevarul', 'Acciza la motorină va rămâne redusă cu 25% și în prima jumătate a lui octombrie'],
    ['protv', 'Vești bune pentru șoferi: acciza la motorină rămâne redusă cu 25% în octombrie'],
    ['gds', 'Acciza la motorină rămâne redusă cu 25% în următoarele două săptămâni din octombrie'],
    ['b1tv', 'Finanțele prelungesc reducerea de 25% a accizei la motorină în octombrie'],
];
const excise = (n: number) => exciseTitles.slice(0, n).map(([outlet, title]) => article(outlet, title));

function cached(sources: RSSNewsItem[], extra: Partial<AggregatedStory> = {}): AggregatedStory {
    return {
        id: 'story-cached',
        title: 'Titlul păstrat',
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

beforeEach(() => {
    llm.available = true;
    llm.generated = true;
    llm.calls = 0;
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('no network in tests'))));
});
afterEach(() => vi.unstubAllGlobals());

describe('storyStartedAt', () => {
    it('is when the second outlet reported the story, not the first or the latest article', () => {
        const sources = [
            article('digi24', 'a', 1),
            article('hotnews', 'b', 5),
            article('digi24', 'c', 9), // an early precursor from an outlet already counted
            article('g4media', 'd', 3),
        ];
        expect(storyStartedAt(sources)).toBe(sources[1].pubDate);
    });

    it('does not move when later articles join', () => {
        const base = [article('digi24', 'a', 6), article('hotnews', 'b', 5)];
        expect(storyStartedAt([...base, article('rfi', 'c', 0.1)])).toBe(storyStartedAt(base));
    });
});

describe('headlineOutgrown', () => {
    it('asks for a new headline only after the story at least doubled and grew by 3+', () => {
        expect(headlineOutgrown({ sourcesCount: 2, generated: true }, 4)).toBe(false);
        expect(headlineOutgrown({ sourcesCount: 2, generated: true }, 5)).toBe(true);
        expect(headlineOutgrown({ sourcesCount: 5, generated: true }, 9)).toBe(false);
        expect(headlineOutgrown({ sourcesCount: 5, generated: true }, 10)).toBe(true);
    });
});

describe('planHeadlines', () => {
    it('keeps the headline of a story that grew modestly', () => {
        const [plan] = planHeadlines([excise(4)], [cached(excise(3), { titleBasis: { sourcesCount: 3, generated: true } })]);
        expect(plan).toMatchObject({ keep: true, useLlm: false, previous: { title: 'Titlul păstrat' } });
    });

    it('regenerates the headline of a story that outgrew it', () => {
        const [plan] = planHeadlines([excise(7)], [cached(excise(3), { titleBasis: { sourcesCount: 3, generated: true } })]);
        expect(plan).toMatchObject({ keep: false, useLlm: true });
    });

    it('treats cached stories without titleBasis as titled for their current size', () => {
        const [plan] = planHeadlines([excise(5)], [cached(excise(3))]);
        expect(plan.keep).toBe(true);
    });

    it('upgrades a fallback headline when an LLM is configured, keeps it otherwise', () => {
        const prev = [cached(excise(3), { titleBasis: { sourcesCount: 3, generated: false } })];
        expect(planHeadlines([excise(3)], prev)[0].useLlm).toBe(true);
        llm.available = false;
        expect(planHeadlines([excise(3)], prev)[0]).toMatchObject({ keep: true, useLlm: false });
    });

    it('spends the LLM budget on new stories, most important first', () => {
        const groups = Array.from({ length: 35 }, (_, i) => [
            article(`a${i}`, `Subiect ${i} unu`, i),
            article(`b${i}`, `Subiect ${i} doi`, i),
        ]);
        const plans = planHeadlines(groups, []);
        expect(plans.filter(p => p.useLlm)).toHaveLength(30);
        expect(plans[0].useLlm).toBe(true); // freshest
        expect(plans[34].useLlm).toBe(false); // oldest
    });
});

describe('aggregateNewsBuildTopics headlines', () => {
    it('reuses the cached headline without calling the LLM', async () => {
        const prev = cached(excise(3), { titleBasis: { sourcesCount: 3, generated: true } });
        const [story] = await aggregateNewsBuildTopics(excise(4), 2, [prev]);
        expect(story.title).toBe('Titlul păstrat');
        expect(story.titleBasis).toEqual({ sourcesCount: 3, generated: true });
        expect(llm.calls).toBe(0);
    });

    it('writes a new headline for a new story and records its basis', async () => {
        const [story] = await aggregateNewsBuildTopics(excise(4), 2);
        expect(story.title).toBe('LLM: 4 surse');
        expect(story.titleBasis).toEqual({ sourcesCount: 4, generated: true });
        expect(llm.calls).toBe(1);
    });

    it('keeps the old headline when regenerating fails', async () => {
        llm.generated = false;
        const prev = cached(excise(3), { titleBasis: { sourcesCount: 3, generated: true } });
        const [story] = await aggregateNewsBuildTopics(excise(7), 2, [prev]);
        expect(llm.calls).toBe(1);
        expect(story.title).toBe('Titlul păstrat');
        expect(story.titleBasis).toEqual({ sourcesCount: 3, generated: true });
    });

    it('does not reorder the sources when picking a fallback headline', async () => {
        llm.available = false;
        llm.generated = false;
        const input = excise(4);
        const [story] = await aggregateNewsBuildTopics(input, 2);
        const again = await aggregateNewsBuildTopics(input, 2);
        expect(story.sources.map(s => s.id)).toEqual(again[0].sources.map(s => s.id));
        expect(story.id).toBe(again[0].id);
    });
});
