import { SITE_URL } from '../../shared/ogImage.js';

export interface SitemapStory {
    id: string;
    /** Any parseable date; invalid or missing values fall back to "now". */
    lastmod?: string | Date | null;
}

const MAX_URLS = 50_000; // sitemap protocol limit per file

const escapeXml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function isoDate(value: SitemapStory['lastmod'], fallback: string): string {
    if (!value) return fallback;
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime()) ? fallback : date.toISOString();
}

export function buildSitemapIndex(now: Date = new Date()): string {
    const lastmod = now.toISOString();
    const entries = ['sitemap-pages.xml', 'sitemap-stories.xml']
        .map(file => `  <sitemap>\n    <loc>${SITE_URL}/${file}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`)
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

/** De-duplicates by id (first occurrence wins, so pass live stories before archived ones). */
export function buildStorySitemap(stories: SitemapStory[], now: Date = new Date()): string {
    const fallback = now.toISOString();
    const seen = new Set<string>();
    const entries: string[] = [];
    for (const story of stories) {
        if (!story?.id || seen.has(story.id)) continue;
        seen.add(story.id);
        entries.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/stire/${encodeURIComponent(story.id)}`)}</loc>
    <lastmod>${isoDate(story.lastmod, fallback)}</lastmod>
  </url>`);
        if (entries.length >= MAX_URLS) break;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;
}
