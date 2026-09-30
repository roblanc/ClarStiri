import { beforeEach, describe, expect, it, vi } from 'vitest';

// Fake postgres.js client: a tagged template that answers by table name.
const queries: string[] = [];
let storyRows: unknown[] = [];
let sourceRows: unknown[] = [];

vi.mock('postgres', () => ({
    default: () => {
        const sql = (strings: TemplateStringsArray | unknown[], ..._values: unknown[]) => {
            if (!Array.isArray(strings) || !('raw' in strings)) return { __helper: strings };
            const text = strings.join('?');
            queries.push(text);
            if (text.includes('from thesite.story_sources')) return Promise.resolve(sourceRows);
            if (text.includes('from thesite.stories')) return Promise.resolve(storyRows);
            return Promise.resolve([]);
        };
        return sql;
    },
}));

process.env.THESITE_DATABASE_URL = 'postgres://fake';
const { loadRecentArchivedStories } = await import('./storyArchive');

const at = (iso: string) => new Date(iso);

beforeEach(() => {
    queries.length = 0;
    storyRows = [];
    sourceRows = [];
});

describe('loadRecentArchivedStories', () => {
    it('returns nothing when the archive is empty', async () => {
        await expect(loadRecentArchivedStories(100)).resolves.toEqual([]);
        expect(queries).toHaveLength(1); // no sources query
    });

    it('rebuilds stories with their sources in one round trip per table', async () => {
        storyRows = [
            { id: 's1', title: 'Unu', description: 'd1', image: null, main_category: 'Politică', blindspot: null, published_at: at('2026-09-30T10:00:00Z'), first_seen_at: at('2026-09-30T10:05:00Z') },
            { id: 's2', title: 'Doi', description: 'd2', image: 'img2', main_category: null, blindspot: null, published_at: null, first_seen_at: at('2026-09-30T09:00:00Z') },
        ];
        sourceRows = [
            { story_id: 's1', link: 'https://zf.ro/a', source_id: 'zf', title: 'A', description: '', image_url: null, pub_date: at('2026-09-30T10:00:00Z'), first_seen_at: at('2026-09-30T10:05:00Z') },
            { story_id: 's2', link: 'https://g4media.ro/b', source_id: 'g4media', title: 'B', description: '', image_url: 'x', pub_date: null, first_seen_at: at('2026-09-30T09:00:00Z') },
            { story_id: 's1', link: 'https://necunoscut.ro/c', source_id: 'necunoscut', title: 'C', description: '', image_url: null, pub_date: at('2026-09-30T09:30:00Z'), first_seen_at: at('2026-09-30T10:05:00Z') },
        ];

        const stories = await loadRecentArchivedStories(100);

        expect(queries).toHaveLength(2);
        expect(stories.map(s => s.id)).toEqual(['s1', 's2']);
        const [s1, s2] = stories;
        expect(s1.sourcesCount).toBe(2);
        expect(s1.sources.map(s => s.link)).toEqual(['https://zf.ro/a', 'https://necunoscut.ro/c']);
        expect(s1.sources[0].source.name).toBe('Ziarul Financiar');
        expect(s1.sources[1].source).toMatchObject({ id: 'necunoscut', bias: 'center' });
        expect(s1.publishedAt).toBe('2026-09-30T10:00:00.000Z');
        expect(s1.mainCategory).toBe('Politică');
        expect(s2.mainCategory).toBe('Actualitate');
        expect(s2.publishedAt).toBe('2026-09-30T09:00:00.000Z');
        expect(s2.image).toBe('img2');
        expect(s1.bias.left + s1.bias.center + s1.bias.right).toBeGreaterThan(95);
    });
});
