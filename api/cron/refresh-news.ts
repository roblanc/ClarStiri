import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import {
    RSSNewsItem,
    NEWS_SOURCES,
    fetchRSSFeed
} from '../_lib/shared.js';
import { aggregateNewsBuildTopics, AggregatedStory, getTimeAgo } from '../_lib/aggregation.js';
import { mergeWithExisting } from '../_lib/storyMerge.js';

const CACHE_KEY = 'aggregated_news_v2';
const CACHE_KEY_TS = 'aggregated_news_v2_ts';
const CACHE_TTL = 25 * 60 * 60;
const MIN_SOURCES_THRESHOLD = 2; // matches frontend filter (sourcesCount > 1) — single-source stories are filtered out anyway
const MAX_STORY_AGE_MS = 7 * 24 * 60 * 60 * 1000; // Expire stories older than 7 days
const MAX_STORIES = 100;
const REFRESH_LOCK_KEY = `${CACHE_KEY}:refresh_lock`;
const REFRESH_LOCK_TTL = 10 * 60;

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

/**
 * Re-sortează poveștile după formula: sourcesCount^1.5 × e^(-ore/18)
 * Identică cu cea din aggregation.ts pentru consistență.
 */
function sortByImportance(stories: AggregatedStory[]): AggregatedStory[] {
    const now = Date.now();
    return [...stories].sort((a, b) => {
        const hoursA = (now - new Date(a.publishedAt).getTime()) / 3_600_000;
        const hoursB = (now - new Date(b.publishedAt).getTime()) / 3_600_000;
        const scoreA = Math.pow(a.sourcesCount, 1.5) * Math.exp(-hoursA / 18);
        const scoreB = Math.pow(b.sourcesCount, 1.5) * Math.exp(-hoursB / 18);
        return scoreB - scoreA;
    });
}

async function acquireRefreshLock(redis: Redis): Promise<string | null> {
    const lockId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const result = await redis.set(REFRESH_LOCK_KEY, lockId, { nx: true, ex: REFRESH_LOCK_TTL });
    return result === 'OK' ? lockId : null;
}

async function releaseRefreshLock(redis: Redis, lockId: string): Promise<void> {
    try {
        const currentLock = await redis.get<string>(REFRESH_LOCK_KEY);
        if (currentLock === lockId) {
            await redis.del(REFRESH_LOCK_KEY);
        }
    } catch (error) {
        console.error('[CRON] Refresh lock release failed:', error);
    }
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

    const lockId = await acquireRefreshLock(redis);
    if (!lockId) {
        return res.status(200).json({
            success: true,
            skipped: true,
            message: 'Refresh already in progress',
        });
    }

    try {
        console.log('[CRON] Starting news refresh with source accumulation...');
        const startTime = Date.now();

        // 1. Fetch fresh news from RSS
        const allNews = await fetchAllNews();
        console.log(`[CRON] Fetched ${allNews.length} news items`);

        // 2. Load existing stories from Redis (pentru acumulare surse)
        const existingRaw = await redis.get<AggregatedStory[]>(CACHE_KEY);
        const existingStories: AggregatedStory[] = existingRaw ?? [];
        console.log(`[CRON] Loaded ${existingStories.length} existing stories from cache`);

        // 3. Agregă știrile proaspete
        const freshStories = (await aggregateNewsBuildTopics(allNews, MIN_SOURCES_THRESHOLD));
        console.log(`[CRON] Aggregated ${freshStories.length} fresh stories`);

        // 4. Merge with cached stories (strict overlap, one-to-one, stable ids — see _lib/storyMerge.ts)
        //    and carry forward old stories not seen in this run, as long as they are < 7 days old.
        const now = Date.now();
        const { merged: mergedFreshStories, unmatched } = mergeWithExisting(freshStories, existingStories);

        const carryForwardStories = unmatched
            .filter(existing => now - new Date(existing.publishedAt).getTime() <= MAX_STORY_AGE_MS)
            .map(s => ({
                ...s,
                timeAgo: getTimeAgo(s.publishedAt), // recalculează timeAgo
            }));

        console.log(`[CRON] Carrying forward ${carryForwardStories.length} stories not seen in current RSS`);

        // 6. Combină și sortează după importanță (sourcesCount + freshness)
        const allStories = sortByImportance([...mergedFreshStories, ...carryForwardStories])
            .slice(0, MAX_STORIES);

        const multiSourceCount = allStories.filter(s => s.sourcesCount >= 2).length;
        console.log(`[CRON] Final: ${allStories.length} stories (${multiSourceCount} cu ≥2 surse)`);

        await Promise.all([
            redis.set(CACHE_KEY, allStories, { ex: CACHE_TTL }),
            redis.set(CACHE_KEY_TS, Date.now(), { ex: CACHE_TTL }),
        ]);

        // Archive individual stories for 30 days — enables lookup even after expiry from main feed
        const STORY_ARCHIVE_TTL = 30 * 24 * 60 * 60;
        // Awaited: un-awaited writes can be dropped when the function freezes after responding.
        const archiveResults = await Promise.allSettled(
            allStories.map(story => redis!.set(`story:${story.id}`, story, { ex: STORY_ARCHIVE_TTL }))
        );
        const archiveFailures = archiveResults.filter(r => r.status === 'rejected').length;
        if (archiveFailures > 0) console.error(`[CRON] Story archive write failed for ${archiveFailures} stories`);

        const duration = Date.now() - startTime;
        console.log(`[CRON] Cache refreshed in ${duration}ms`);

        return res.status(200).json({
            success: true,
            message: 'Cache refreshed with source accumulation',
            stats: {
                newsItems: allNews.length,
                freshStories: freshStories.length,
                carryForwardStories: carryForwardStories.length,
                totalStored: allStories.length,
                multiSourceStories: multiSourceCount,
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
    } finally {
        await releaseRefreshLock(redis, lockId);
    }
}
