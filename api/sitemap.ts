import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import type { AggregatedStory } from './aggregation.js';

const CACHE_KEY = 'aggregated_news_v2';

const staticPages = [
    { loc: 'https://thesite.ro', priority: '1.0', changefreq: 'always' },
    { loc: 'https://thesite.ro/editorial', priority: '0.9', changefreq: 'hourly' },
    { loc: 'https://thesite.ro/tribuni', priority: '0.9', changefreq: 'daily' },
    { loc: 'https://thesite.ro/surse', priority: '0.8', changefreq: 'weekly' },
    { loc: 'https://thesite.ro/metodologie', priority: '0.8', changefreq: 'weekly' },
    { loc: 'https://thesite.ro/despre', priority: '0.8', changefreq: 'weekly' },
    { loc: 'https://thesite.ro/contact', priority: '0.8', changefreq: 'weekly' },
    { loc: 'https://thesite.ro/cauta', priority: '0.8', changefreq: 'daily' },

    // Categorii
    { loc: 'https://thesite.ro/categorie/politica', priority: '0.9', changefreq: 'hourly' },
    { loc: 'https://thesite.ro/categorie/economie', priority: '0.9', changefreq: 'hourly' },
    { loc: 'https://thesite.ro/categorie/sanatate', priority: '0.9', changefreq: 'hourly' },
    { loc: 'https://thesite.ro/categorie/tehnologie', priority: '0.9', changefreq: 'hourly' },
    { loc: 'https://thesite.ro/categorie/mediu', priority: '0.9', changefreq: 'hourly' },
    { loc: 'https://thesite.ro/categorie/sport', priority: '0.9', changefreq: 'hourly' },
    { loc: 'https://thesite.ro/categorie/cultura', priority: '0.9', changefreq: 'hourly' },
    { loc: 'https://thesite.ro/categorie/international', priority: '0.9', changefreq: 'hourly' },

    // Voci
    { loc: 'https://thesite.ro/voce/ctp', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/catalin-tolontan', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/mircea-badea', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/victor-ciutacu', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/dana-budeanu', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/moise-guran', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/lucian-mandruta', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/sebastian-zachmann', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/rares-bogdan', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/anca-alexandrescu', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/calin-georgescu', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/radu-banciu', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/bogdan-chirieac', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/cosmin-gusa', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/andrei-caramitru', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/ion-cristoiu', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/traian-basescu', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/dan-dungaciu', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/cristian-pirvulescu', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://thesite.ro/voce/sorin-rosca-stanescu', priority: '0.8', changefreq: 'daily' },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const today = new Date().toISOString().split('T')[0];

    let redis: Redis | null = null;
    try {
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            let url = process.env.UPSTASH_REDIS_REST_URL;
            if (!url.startsWith('http')) url = `https://${url}`;
            redis = new Redis({ url, token: process.env.UPSTASH_REDIS_REST_TOKEN });
        }
    } catch (e) {
        console.error('[Sitemap API] Redis init failed:', e);
    }

    let stories: AggregatedStory[] = [];
    if (redis) {
        try {
            stories = (await redis.get<AggregatedStory[]>(CACHE_KEY)) || [];
        } catch (e) {
            console.error('[Sitemap API] Redis read failed:', e);
        }
    }

    const storyEntries = stories.slice(0, 100).map(s => {
        const date = s.publishedAt ? new Date(s.publishedAt).toISOString().split('T')[0] : today;
        return `  <url>
    <loc>https://thesite.ro/stire/${s.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    const staticEntries = staticPages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries.join('\n')}
${storyEntries.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    res.status(200).send(xml);
}
