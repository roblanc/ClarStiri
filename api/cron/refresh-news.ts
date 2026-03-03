import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import {
    RSSNewsItem,
    NEWS_SOURCES,
    fetchRSSFeed
} from '../shared.js';
import { aggregateNewsBuildTopics } from '../aggregation.js';

const CACHE_KEY = 'aggregated_news';
const CACHE_KEY_TS = 'aggregated_news_ts';
const CACHE_TTL = 25 * 60 * 60; // 25h — outlasts daily Vercel Hobby cron (runs max 1x/day)
const MIN_SOURCES_THRESHOLD = 2; // Minimum sources required for a story to be displayed

async function fetchAllNews(): Promise<RSSNewsItem[]> {
    // Toate sursele în paralel — se termină în max 3s (timeout per sursă)
    const results = await Promise.allSettled(NEWS_SOURCES.map(s => fetchRSSFeed(s)));
    const allNews: RSSNewsItem[] = [];

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allNews.push(...result.value);
        }
    });

    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return allNews;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // Verify this is a cron request from Vercel
    const cronSecret = process.env.CRON_SECRET;
    if (process.env.NODE_ENV === 'production' && !cronSecret) {
        return res.status(500).json({ error: 'CRON_SECRET is not configured in production' });
    }
    if (cronSecret) {
        const authHeader = req.headers['authorization'];
        if (authHeader !== `Bearer ${cronSecret}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    // Initialize Redis inside handler — prevents module-level crash if env vars are missing
    // Also normalize URL to handle values without https:// prefix (same pattern as api/news.ts)
    let redis: Redis | null = null;
    try {
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            let url = process.env.UPSTASH_REDIS_REST_URL;
            if (!url.startsWith('http')) url = `https://${url}`;
            redis = new Redis({ url, token: process.env.UPSTASH_REDIS_REST_TOKEN });
        } else {
            console.warn('[CRON] Redis env vars not set — cache will not be updated');
        }
    } catch (e) {
        console.error('[CRON] Redis init failed:', e);
    }

    if (!redis) {
        return res.status(500).json({ success: false, error: 'Redis unavailable — check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars' });
    }

    try {
        console.log('[CRON] Starting news refresh...');
        const startTime = Date.now();

        const allNews = await fetchAllNews();
        console.log(`[CRON] Fetched ${allNews.length} news items`);

        const aggregatedStories = (await aggregateNewsBuildTopics(allNews, MIN_SOURCES_THRESHOLD)).slice(0, 60);
        console.log(`[CRON] Aggregated into ${aggregatedStories.length} stories`);

        await Promise.all([
            redis.set(CACHE_KEY, aggregatedStories, { ex: CACHE_TTL }),
            redis.set(CACHE_KEY_TS, Date.now(), { ex: CACHE_TTL }),
        ]);

        const duration = Date.now() - startTime;
        console.log(`[CRON] Cache refreshed in ${duration}ms`);

        return res.status(200).json({
            success: true,
            message: 'Cache refreshed successfully',
            stats: {
                newsItems: allNews.length,
                aggregatedStories: aggregatedStories.length,
                durationMs: duration,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('[CRON] Error refreshing cache:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
