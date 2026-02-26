import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import {
    RSSNewsItem,
    NEWS_SOURCES,
    BIAS_WEIGHT_MAP,
    fetchRSSFeed
} from '../shared.js';
import { createStoryId } from '../storyId.js';
import { aggregateNewsBuildTopics } from '../aggregation.js';

// Initialize Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CACHE_KEY = 'aggregated_news';
const CACHE_KEY_TS = 'aggregated_news_ts';
const CACHE_TTL = 2 * 60 * 60; // 2 ore — suprapunere cu cron-ul orar
const MIN_SOURCES_THRESHOLD = 1; // Arată toate știrile; scoring-ul sortează natural

// Removed local Aggregation functions, imported from aggregation.js

async function fetchAllNews(): Promise<RSSNewsItem[]> {
    // Fetch în batch-uri de 10 pentru stabilitatea conexiunii de ieșire a serverless funcțiilor
    const BATCH_SIZE = 10;
    const allNews: RSSNewsItem[] = [];

    for (let i = 0; i < NEWS_SOURCES.length; i += BATCH_SIZE) {
        const batch = NEWS_SOURCES.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(batch.map(s => fetchRSSFeed(s)));

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allNews.push(...result.value);
            }
        });
    }

    // Sort by date
    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return allNews;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Verify this is a cron request from Vercel
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow without auth in development or if CRON_SECRET not set
        if (process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        console.log('[CRON] Starting news refresh...');
        const startTime = Date.now();

        // Fetch all news
        const allNews = await fetchAllNews();
        console.log(`[CRON] Fetched ${allNews.length} news items`);

        // Aggregate stories
        const aggregatedStories = (await aggregateNewsBuildTopics(allNews, MIN_SOURCES_THRESHOLD)).slice(0, 30);
        console.log(`[CRON] Aggregated into ${aggregatedStories.length} stories`);

        // Store in Redis cache (no JSON.stringify — Upstash client handles serialization)
        await Promise.all([
            redis.set(CACHE_KEY, aggregatedStories, { ex: CACHE_TTL }),
            redis.set(CACHE_KEY_TS, Date.now(), { ex: CACHE_TTL }),
        ]);

        const duration = Date.now() - startTime;
        console.log(`[CRON] Cache refreshed in ${duration}ms`);

        res.status(200).json({
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
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
