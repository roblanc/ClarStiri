import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storyOgVersion } from '../../shared/ogImage';

const story = {
    id: 'story-20260930-abc',
    title: 'Guvernul a adoptat bugetul pe 2027 după o ședință de noapte',
    description: 'Descriere',
    image: '',
    sources: [],
    sourcesCount: 9,
    bias: { left: 20, center: 50, right: 30 },
    mainCategory: 'Politică',
    publishedAt: '2026-09-30T08:00:00Z',
    timeAgo: '',
};

vi.mock('./storyArchive.js', () => ({
    loadArchivedStory: vi.fn(async (id: string) => (id === story.id ? story : null)),
}));

const INDEX_HTML = `<!doctype html><html lang="ro"><head>
<title>thesite.ro</title>
<meta name="description" content="site" />
<meta property="og:image" content="https://thesite.ro/og-image.png" />
</head><body><div id="root"></div></body></html>`;

function mockRes() {
    const res = {
        statusCode: 200,
        headers: {} as Record<string, string>,
        body: undefined as unknown,
        redirectedTo: '',
        setHeader(k: string, v: string) { this.headers[k.toLowerCase()] = v; return this; },
        status(code: number) { this.statusCode = code; return this; },
        send(body: unknown) { this.body = body; return this; },
        end() { return this; },
        redirect(code: number, url: string) { this.statusCode = code; this.redirectedTo = url; return this; },
    };
    return res;
}

async function call(query: Record<string, string>) {
    const { default: handler } = await import('../story-page');
    const res = mockRes();
    await handler({ method: 'GET', query, headers: { host: 'thesite.ro' } } as unknown as VercelRequest, res as unknown as VercelResponse);
    return res;
}

describe('api/story-page', () => {
    beforeEach(() => {
        delete process.env.UPSTASH_REDIS_REST_URL;
        const realFetch = globalThis.fetch;
        // Only intercept the index.html fetch; satori loads its wasm through fetch(data:...).
        vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, init?: RequestInit) =>
            String(input).startsWith('http') ? new Response(INDEX_HTML, { status: 200 }) : realFetch(input, init)));
    });
    afterEach(() => vi.unstubAllGlobals());

    it('injects the per-story card as og:image for bots', async () => {
        const res = await call({ id: story.id });
        const html = String(res.body);
        expect(html).toContain(`property="og:image" content="https://thesite.ro/api/story-page?id=${story.id}&amp;og=1&amp;v=${storyOgVersion(story)}"`);
        expect(html).toContain('property="og:image:width" content="1200"');
        expect(html).not.toContain('property="og:image" content="https://thesite.ro/og-image.png"');
        expect(html).toContain('"@type":"NewsArticle"');
    });

    it('redirects stale or random card versions to the current one', async () => {
        const res = await call({ id: story.id, og: '1', v: 'nope' });
        expect(res.statusCode).toBe(302);
        expect(res.redirectedTo).toBe(`/api/story-page?id=${story.id}&og=1&v=${storyOgVersion(story)}`);
    });

    it('renders the card as a cacheable PNG', async () => {
        const res = await call({ id: story.id, og: '1', v: storyOgVersion(story) });
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toBe('image/png');
        expect(res.headers['cache-control']).toContain('s-maxage=604800');
        expect(Buffer.isBuffer(res.body)).toBe(true);
    }, 30_000);

    it('falls back to the site image for unknown stories', async () => {
        const res = await call({ id: 'story-missing', og: '1', v: 'x' });
        expect(res.statusCode).toBe(302);
        expect(res.redirectedTo).toBe('https://thesite.ro/og-image.png');
    });
});
