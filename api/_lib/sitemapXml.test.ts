import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildSitemapIndex, buildStorySitemap } from './sitemapXml';

describe('buildSitemapIndex', () => {
    it('points at the static pages sitemap and the live story sitemap', () => {
        const xml = buildSitemapIndex(new Date('2026-10-01T00:00:00Z'));
        expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
        expect(xml).toContain('<loc>https://thesite.ro/sitemap-pages.xml</loc>');
        expect(xml).toContain('<loc>https://thesite.ro/sitemap-stories.xml</loc>');
    });
});

describe('buildStorySitemap', () => {
    it('lists /stire/:id once per story with a valid lastmod', () => {
        const xml = buildStorySitemap([
            { id: 'story-1', lastmod: '2026-09-30T21:55:59Z' },
            { id: 'story-1', lastmod: '2020-01-01T00:00:00Z' },
            { id: 'story-2', lastmod: 'garbage' },
        ], new Date('2026-10-01T00:00:00Z'));
        expect(xml.match(/<url>/g)).toHaveLength(2);
        expect(xml).toContain('<loc>https://thesite.ro/stire/story-1</loc>\n    <lastmod>2026-09-30T21:55:59.000Z</lastmod>');
        expect(xml).toContain('<loc>https://thesite.ro/stire/story-2</loc>\n    <lastmod>2026-10-01T00:00:00.000Z</lastmod>');
    });
});

describe('static sitemap location', () => {
    it('is not public/sitemap.xml (a static file there would shadow the /sitemap.xml rewrite on Vercel)', () => {
        const publicDir = path.join(__dirname, '..', '..', 'public');
        expect(existsSync(path.join(publicDir, 'sitemap.xml'))).toBe(false);
    });
});
