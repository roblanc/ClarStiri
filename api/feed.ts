import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { setCorsHeaders } from './cors.js';
import type { AggregatedStory } from './aggregation.js';

const CACHE_KEY = 'aggregated_news_v2';

const escapeXml = (str: string = '') =>
    str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let redis: Redis | null = null;
    try {
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            let url = process.env.UPSTASH_REDIS_REST_URL;
            if (!url.startsWith('http')) url = `https://${url}`;
            redis = new Redis({ url, token: process.env.UPSTASH_REDIS_REST_TOKEN });
        }
    } catch (e) {
        console.error('[RSS Feed] Redis init failed:', e);
    }

    let stories: AggregatedStory[] = [];
    if (redis) {
        try {
            stories = (await redis.get<AggregatedStory[]>(CACHE_KEY)) || [];
        } catch (e) {
            console.error('[RSS Feed] Redis read failed:', e);
        }
    }

    const buildDate = new Date().toUTCString();

    const itemsXml = stories
        .slice(0, 50)
        .map(story => {
            const storyUrl = `https://thesite.ro/stire/${story.id}`;
            const pubDate = story.publishedAt ? new Date(story.publishedAt).toUTCString() : buildDate;
            const sourcesList = story.sources.map(s => s.source).join(', ');
            const desc = `${story.description ? escapeXml(story.description) : ''} [Acoperit de ${story.sourcesCount} surse: ${escapeXml(sourcesList)}]`;

            return `    <item>
      <title>${escapeXml(story.title)}</title>
      <link>${storyUrl}</link>
      <guid isPermaLink="true">${storyUrl}</guid>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(story.mainCategory || 'Actualitate')}</category>
      ${story.image ? `<enclosure url="${escapeXml(story.image)}" type="image/jpeg" />` : ''}
    </item>`;
        })
        .join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>thesite.ro | Știri din toate perspectivele</title>
    <link>https://thesite.ro</link>
    <description>Agregator de știri din surse multiple din România. Analiză de bias și perspective comparative.</description>
    <language>ro-RO</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="https://thesite.ro/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    res.status(200).send(rssXml);
}
