import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import {
    RSSNewsItem,
    BiasAnalysis,
    NEWS_SOURCES,
    BIAS_WEIGHT_MAP,
    fetchRSSFeed
} from './shared.js';
import { createStoryId } from './storyId.js';
import { aggregateNewsBuildTopics, AggregatedStory } from './aggregation.js';

// Inițializare Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache key și durata
const CACHE_KEY = 'aggregated_news';
const CACHE_KEY_TS = 'aggregated_news_ts'; // timestamp fetch
const CACHE_TTL = 2 * 60 * 60; // 2 ore — suprapunere cu cron-ul orar
const STALE_AFTER = 55 * 60; // după 55 min → refresh în background, dar servim stale imediat
const MIN_SOURCES_THRESHOLD = 1; // Arată toate știrile; scoring-ul (sourcesCount × decay) sortează natural

// Removed local Aggregation functions, imported from aggregation.js

async function fetchAllNews(): Promise<RSSNewsItem[]> {
    // Fetch toate sursele în paralel — mult mai rapid decât batch-uri secvențiale
    const results = await Promise.allSettled(NEWS_SOURCES.map(s => fetchRSSFeed(s)));
    const allNews: RSSNewsItem[] = [];

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allNews.push(...result.value);
        }
    });

    // Sort by date
    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return allNews;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const limit = parseInt(req.query.limit as string) || 50;

        // Fetch cache + timestamp în paralel
        const [cached, tsRaw] = await Promise.all([
            redis.get<AggregatedStory[]>(CACHE_KEY),
            redis.get<number>(CACHE_KEY_TS),
        ]);

        const cacheAge = tsRaw ? (Date.now() - tsRaw) / 1000 : Infinity;
        const isStale = cacheAge > STALE_AFTER;

        if (cached && cached.length > 0) {
            // Servim cache-ul imediat — utilizatorul nu așteaptă
            res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
            res.status(200).json({
                success: true,
                data: cached.slice(0, limit),
                fromCache: true,
                stale: isStale,
                cacheAgeSeconds: Math.round(cacheAge),
            });

            // Dacă e stale, refresh în background (fără a bloca răspunsul)
            if (isStale) {
                console.log(`Cache stale (${Math.round(cacheAge)}s) — refreshing in background`);
                fetchAllNews().then(async news => {
                    const aggregated = await aggregateNewsBuildTopics(news, MIN_SOURCES_THRESHOLD);
                    if (aggregated.length > 0) {
                        await Promise.all([
                            redis.set(CACHE_KEY, aggregated, { ex: CACHE_TTL }),
                            redis.set(CACHE_KEY_TS, Date.now(), { ex: CACHE_TTL }),
                        ]);
                        console.log('Background cache refresh complete');
                    }
                }).catch(err => console.error('Background refresh failed:', err));
            }
            return;
        }

        // Cache complet gol — fetch sincron (prima rulare sau după expirare)
        console.log('Cache miss — fetching fresh news from all sources');
        const allNews = await fetchAllNews();
        const aggregated = await aggregateNewsBuildTopics(allNews, MIN_SOURCES_THRESHOLD);

        if (aggregated.length > 0) {
            await Promise.all([
                redis.set(CACHE_KEY, aggregated, { ex: CACHE_TTL }),
                redis.set(CACHE_KEY_TS, Date.now(), { ex: CACHE_TTL }),
            ]);
        }

        return res.status(200).json({
            success: true,
            data: aggregated.slice(0, limit),
            fromCache: false,
            fetchedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error in news API:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch news',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
