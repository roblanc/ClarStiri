import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import {
    RSSNewsItem,
    NEWS_SOURCES,
    fetchRSSFeed
} from './shared.js';
import { aggregateNewsBuildTopics, AggregatedStory, calculateBiasDistribution, getTimeAgo, resolveStoryImageFromSources } from './aggregation.js';
import { setCorsHeaders } from './cors.js';

// Cache key și durata
const CACHE_KEY = 'aggregated_news';
const CACHE_KEY_TS = 'aggregated_news_ts';
const CACHE_TTL = 25 * 60 * 60; // 25h — outlasts daily Vercel Hobby cron
const STALE_AFTER = 10 * 60;
const MIN_SOURCES_THRESHOLD = 2;

async function fetchAllNews(): Promise<RSSNewsItem[]> {
    const results = await Promise.allSettled(NEWS_SOURCES.map(s => fetchRSSFeed(s)));
    const allNews: RSSNewsItem[] = [];
    results.forEach(result => {
        if (result.status === 'fulfilled') allNews.push(...result.value);
    });
    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    return allNews;
}

/** Fallback: when aggregation produces 0 groups, return top articles as individual stories */
async function buildFallbackStories(allNews: RSSNewsItem[], limit: number): Promise<AggregatedStory[]> {
    return Promise.all(
        allNews.slice(0, limit).map(async (item) => ({
            id: `single-${item.id}`,
            title: item.title,
            description: item.description,
            image: await resolveStoryImageFromSources([item]),
            sources: [item],
            sourcesCount: 1,
            bias: calculateBiasDistribution([item]),
            mainCategory: item.category || 'Actualitate',
            publishedAt: item.pubDate,
            timeAgo: getTimeAgo(item.pubDate),
        }))
    );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // Redis init inside handler — prevents module-level crash if env vars are missing
    let redis: Redis | null = null;
    try {
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            let url = process.env.UPSTASH_REDIS_REST_URL;
            if (!url.startsWith('http')) url = `https://${url}`;

            redis = new Redis({
                url: url,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });
        }
    } catch (e) {
        console.error('Redis init failed:', e);
    }

    try {
        const limit = parseInt(req.query.limit as string) || 50;

        // Redis read — graceful if unavailable
        let cached: AggregatedStory[] | null = null;
        let tsRaw: number | null = null;
        if (redis) {
            try {
                [cached, tsRaw] = await Promise.all([
                    redis.get<AggregatedStory[]>(CACHE_KEY),
                    redis.get<number>(CACHE_KEY_TS),
                ]);
            } catch (e) {
                console.error('Redis read failed:', e);
                // Non-fatal, just continue to fetch fresh
            }
        }

        const cacheAge = tsRaw ? (Date.now() - tsRaw) / 1000 : Infinity;
        const isStale = cacheAge > STALE_AFTER;

        if (cached && cached.length > 0) {
            // Instant delivery via Vercel Edge Cache
            res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
            res.status(200).json({
                success: true,
                data: cached.slice(0, limit),
                fromCache: true,
                stale: isStale,
                cacheAgeSeconds: Math.round(cacheAge),
            });

            if (isStale && redis) {
                fetchAllNews().then(async news => {
                    const agg = await aggregateNewsBuildTopics(news, MIN_SOURCES_THRESHOLD);
                    const toStore = agg.length > 0 ? agg : await buildFallbackStories(news, 50);
                    if (toStore.length > 0 && redis) {
                        try {
                            await Promise.all([
                                redis.set(CACHE_KEY, toStore, { ex: CACHE_TTL }),
                                redis.set(CACHE_KEY_TS, Date.now(), { ex: CACHE_TTL }),
                            ]);
                        } catch (e) { console.error('Background Redis write failed:', e); }
                    }
                }).catch(err => console.error('Background refresh failed:', err));
            }
            return;
        }

        // Cache miss — fetch fresh
        console.log('Cache miss — fetching fresh news');
        let allNews: RSSNewsItem[] = [];
        try {
            allNews = await fetchAllNews();
        } catch (e) {
            throw new Error(`fetchAllNews failed: ${e instanceof Error ? e.message : String(e)}`);
        }

        console.log(`RSS fetched: ${allNews.length} items`);

        let aggregated: AggregatedStory[] = [];
        try {
            aggregated = await aggregateNewsBuildTopics(allNews, MIN_SOURCES_THRESHOLD);
        } catch (e) {
            throw new Error(`aggregateNewsBuildTopics failed: ${e instanceof Error ? e.message : String(e)}`);
        }

        console.log(`Aggregated: ${aggregated.length} stories`);

        // Fallback: if aggregation produced nothing but we have articles, show them individually
        if (aggregated.length === 0 && allNews.length > 0) {
            console.log('Aggregation returned 0, using individual article fallback');
            aggregated = await buildFallbackStories(allNews, limit);
        }

        if (aggregated.length > 0 && redis) {
            try {
                await Promise.all([
                    redis.set(CACHE_KEY, aggregated, { ex: CACHE_TTL }),
                    redis.set(CACHE_KEY_TS, Date.now(), { ex: CACHE_TTL }),
                ]);
            } catch (e) {
                console.error('Redis write failed (returning data anyway):', e);
            }
        }

        // Don't let Vercel CDN cache empty responses
        if (aggregated.length === 0) {
            res.setHeader('Cache-Control', 'no-store');
        }

        return res.status(200).json({
            success: true,
            data: aggregated.slice(0, limit),
            fromCache: false,
            fetchedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error in news API:', error);
        const isDevelopment = process.env.NODE_ENV !== 'production';
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch news',
            ...(isDevelopment
                ? {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    name: error instanceof Error ? error.name : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                }
                : {}),
        });
    }
}
