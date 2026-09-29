import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import type { AggregatedStory } from './_lib/aggregation.js';
import { loadArchivedStory } from './_lib/storyArchive.js';

/**
 * Server-side meta injection for /stire/:id, served only to crawlers and link-preview bots
 * (see the `has: user-agent` rewrite in vercel.json). Humans keep getting the plain SPA.
 *
 * The SPA is client-rendered, so without this bots only ever see the homepage title,
 * description and OG image for every story. Injected tags carry data-rh="true" so
 * react-helmet-async adopts and replaces them once the app hydrates (Googlebot renders JS).
 */

const SITE = 'https://thesite.ro';
const CACHE_KEY = 'aggregated_news_v2';
const DEFAULT_IMAGE = `${SITE}/og-image.png`;
const INDEX_TTL_MS = 5 * 60 * 1000;

let indexCache: { html: string; fetchedAt: number } | null = null;

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function truncate(value: string, max: number): string {
    const clean = value.replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

async function loadIndexHtml(host: string): Promise<string | null> {
    if (indexCache && Date.now() - indexCache.fetchedAt < INDEX_TTL_MS) return indexCache.html;
    try {
        const response = await fetch(`https://${host}/index.html`, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) return indexCache?.html ?? null;
        const html = await response.text();
        if (!html.includes('id="root"')) return indexCache?.html ?? null;
        indexCache = { html, fetchedAt: Date.now() };
        return html;
    } catch (e) {
        console.error('[story-page] index.html fetch failed:', e);
        return indexCache?.html ?? null;
    }
}

async function findStory(id: string): Promise<AggregatedStory | null> {
    const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;
    if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
        const url = UPSTASH_REDIS_REST_URL.startsWith('http') ? UPSTASH_REDIS_REST_URL : `https://${UPSTASH_REDIS_REST_URL}`;
        const redis = new Redis({ url, token: UPSTASH_REDIS_REST_TOKEN });
        try {
            const archived = await redis.get<AggregatedStory>(`story:${id}`);
            if (archived) return archived;
            const latest = await redis.get<AggregatedStory[]>(CACHE_KEY);
            const found = latest?.find(s => s.id === id);
            if (found) return found;
        } catch (e) {
            console.error('[story-page] Redis read failed:', e);
        }
    }
    try {
        return await loadArchivedStory(id);
    } catch (e) {
        console.error('[story-page] Permanent archive read failed:', e);
        return null;
    }
}

function buildHead(story: AggregatedStory, id: string): string {
    const pageUrl = `${SITE}/stire/${encodeURIComponent(id)}`;
    const title = `${story.title} | thesite.ro`;
    const description = truncate(
        story.description || `${story.title}. Vezi cum relatează ${story.sourcesCount} surse din toate perspectivele.`,
        200
    );
    const image = story.image && /^https?:\/\//.test(story.image) ? story.image : DEFAULT_IMAGE;
    const published = story.publishedAt ? new Date(story.publishedAt) : null;
    const publishedIso = published && !isNaN(published.getTime()) ? published.toISOString() : null;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: truncate(story.title, 110),
        description,
        image: [image],
        ...(publishedIso ? { datePublished: publishedIso, dateModified: publishedIso } : {}),
        author: [{ '@type': 'Organization', name: 'thesite.ro', url: SITE }],
        publisher: {
            '@type': 'Organization',
            name: 'thesite.ro',
            logo: { '@type': 'ImageObject', url: `${SITE}/ethics-logo.png` },
        },
        inLanguage: 'ro-RO',
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    };

    const t = escapeHtml(title);
    const d = escapeHtml(description);
    const u = escapeHtml(pageUrl);
    const i = escapeHtml(image);
    // Escape "<" so story text can never close the script tag.
    const jsonLd = JSON.stringify(schema).replace(/</g, '\\u003c');

    return [
        `<title data-rh="true">${t}</title>`,
        `<meta data-rh="true" name="description" content="${d}" />`,
        `<link data-rh="true" rel="canonical" href="${u}" />`,
        `<meta data-rh="true" property="og:type" content="article" />`,
        `<meta data-rh="true" property="og:title" content="${t}" />`,
        `<meta data-rh="true" property="og:description" content="${d}" />`,
        `<meta data-rh="true" property="og:image" content="${i}" />`,
        `<meta data-rh="true" property="og:url" content="${u}" />`,
        publishedIso ? `<meta data-rh="true" property="article:published_time" content="${publishedIso}" />` : '',
        `<meta data-rh="true" name="twitter:title" content="${t}" />`,
        `<meta data-rh="true" name="twitter:description" content="${d}" />`,
        `<meta data-rh="true" name="twitter:image" content="${i}" />`,
        `<script data-rh="true" type="application/ld+json">${jsonLd}</script>`,
    ].filter(Boolean).join('\n  ');
}

function injectHead(html: string, head: string): string {
    const stripped = html
        .replace(/<title>[\s\S]*?<\/title>/i, '')
        .replace(/<meta\s+name="description"[\s\S]*?\/>/i, '')
        .replace(/<meta\s+(?:property="og:(?:type|title|description|image|url)"|name="twitter:(?:title|description|image)")[\s\S]*?\/>/gi, '');
    return stripped.replace('</head>', `  ${head}\n</head>`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return res.status(405).send('Method not allowed');
    }

    const id = typeof req.query.id === 'string' ? req.query.id : '';
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'thesite.ro';

    const [html, story] = await Promise.all([
        loadIndexHtml(host),
        id ? findStory(id) : Promise.resolve(null),
    ]);

    if (!html) {
        res.setHeader('Retry-After', '30');
        return res.status(503).send('Temporarily unavailable');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Vary', 'User-Agent');

    if (!story) {
        // Unknown or expired story: serve the plain shell, let the SPA render its own fallback.
        res.setHeader('Cache-Control', 'public, s-maxage=60');
        return res.status(200).send(html);
    }

    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
    return res.status(200).send(injectHead(html, buildHead(story, id)));
}
