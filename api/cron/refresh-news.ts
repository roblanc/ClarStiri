import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import {
    RSSNewsItem,
    NEWS_SOURCES,
    fetchRSSFeed
} from '../shared.js';
import { aggregateNewsBuildTopics, AggregatedStory, getTimeAgo, calculateBiasDistribution, calculateBlindspot } from '../aggregation.js';

const CACHE_KEY = 'aggregated_news_v2';
const CACHE_KEY_TS = 'aggregated_news_v2_ts';
const CACHE_TTL = 25 * 60 * 60; // 25h — outlasts daily Vercel Hobby cron (runs max 1x/day)
const MIN_SOURCES_THRESHOLD = 2; // matches frontend filter (sourcesCount > 1) — single-source stories are filtered out anyway
const MAX_STORY_AGE_MS = 7 * 24 * 60 * 60 * 1000; // Expire stories older than 7 days
const MAX_STORIES = 100;

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
 * Găsește o poveste existentă care se referă la același eveniment ca o poveste proaspătă.
 * Criteriu: ≥1 URL de sursă comun → același eveniment.
 */
function findMatchingExistingStory(
    freshStory: AggregatedStory,
    existingStories: AggregatedStory[]
): AggregatedStory | null {
    // Caută mai întâi după ID exact (dacă clusterul a produs același hash)
    const byId = existingStories.find(s => s.id === freshStory.id);
    if (byId) return byId;

    // Altfel, caută overlap de URL-uri de surse
    const freshUrls = new Set(freshStory.sources.map(s => s.link));
    return existingStories.find(s =>
        s.sources.some(src => freshUrls.has(src.link))
    ) ?? null;
}

/**
 * Îmbogățește o poveste proaspătă cu sursele din varianta anterioară care nu mai apar în RSS.
 * Sursele noi (fresh) primează — le păstrăm pe toate. Adăugăm și cele vechi absente.
 */
function mergeWithExistingSources(
    freshStory: AggregatedStory,
    existingStory: AggregatedStory
): AggregatedStory {
    const freshUrls = new Set(freshStory.sources.map(s => s.link));
    // Surse din rularea anterioară care nu mai sunt în RSS-ul curent
    const droppedSources = existingStory.sources.filter(s => !freshUrls.has(s.link));

    if (droppedSources.length === 0) return freshStory; // nimic nou de adăugat

    const mergedSources = [...freshStory.sources, ...droppedSources];
    const bias = calculateBiasDistribution(mergedSources);
    const blindspot = calculateBlindspot(bias, mergedSources.length);

    return {
        ...freshStory,
        sources: mergedSources,
        sourcesCount: mergedSources.length,
        bias,
        blindspot,
    };
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

        // 4. Merge: pentru fiecare poveste proaspătă, adaugă sursele căzute din RSS
        const now = Date.now();
        const mergedFreshStories = freshStories.map(fresh => {
            const existing = findMatchingExistingStory(fresh, existingStories);
            if (!existing) return fresh;
            const merged = mergeWithExistingSources(fresh, existing);
            if (merged.sourcesCount > fresh.sourcesCount) {
                console.log(`[CRON] "${fresh.title.slice(0, 50)}" acumulat ${merged.sourcesCount - fresh.sourcesCount} surse extra`);
            }
            return merged;
        });

        // 5. Carry-forward: păstrează poveștile existente care NU au apărut în rularea curentă
        //    (nu mai sunt în RSS dar sunt < 7 zile — nu vrem să le pierdem)
        const freshStoryIds = new Set(mergedFreshStories.map(s => s.id));
        const freshSourceUrls = new Set(mergedFreshStories.flatMap(s => s.sources.map(src => src.link)));

        const carryForwardStories = existingStories
            .filter(existing => {
                // Expirat?
                const age = now - new Date(existing.publishedAt).getTime();
                if (age > MAX_STORY_AGE_MS) return false;
                // Deja inclus în fresh (prin ID sau URL overlap)?
                if (freshStoryIds.has(existing.id)) return false;
                if (existing.sources.some(src => freshSourceUrls.has(src.link))) return false;
                return true;
            })
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
        Promise.allSettled(
            allStories.map(story => redis!.set(`story:${story.id}`, story, { ex: STORY_ARCHIVE_TTL }))
        ).catch(e => console.error('[CRON] Story archive write failed:', e));

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
    }
}
