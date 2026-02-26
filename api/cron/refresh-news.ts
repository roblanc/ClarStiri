import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import {
    RSSNewsItem,
    NEWS_SOURCES,
    BIAS_WEIGHT_MAP,
    fetchRSSFeed
} from '../shared.js';

// Initialize Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CACHE_KEY = 'aggregated_news';
const CACHE_TTL = 10 * 60; // 10 minutes (cron runs every 2 min, so always fresh)

interface AggregatedStory {
    id: string;
    title: string;
    description: string;
    image?: string;
    sources: RSSNewsItem[];
    sourcesCount: number;
    bias: { left: number; center: number; right: number };
    mainCategory: string;
    publishedAt: string;
    timeAgo: string;
}

async function fetchAllNews(): Promise<RSSNewsItem[]> {
    // Fetch all sources in parallel — no reason to wait for "priority" batch first in the cron
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

function getTimeAgo(pubDate: string): string {
    const now = new Date();
    const published = new Date(pubDate);
    const diffMs = now.getTime() - published.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'acum';
    if (diffMins < 60) return `acum ${diffMins} min`;
    if (diffHours < 24) return `acum ${diffHours} ${diffHours === 1 ? 'oră' : 'ore'}`;
    if (diffDays < 7) return `acum ${diffDays} ${diffDays === 1 ? 'zi' : 'zile'}`;

    return published.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
}

function calculateBiasDistribution(sources: RSSNewsItem[]): { left: number; center: number; right: number } {
    if (!sources.length) return { left: 33, center: 34, right: 33 };

    let leftSum = 0, centerSum = 0, rightSum = 0;

    sources.forEach(s => {
        const weights = BIAS_WEIGHT_MAP[s.source.bias] || BIAS_WEIGHT_MAP['center'];
        leftSum += weights.left;
        centerSum += weights.center;
        rightSum += weights.right;
    });

    const total = leftSum + centerSum + rightSum;
    return {
        left: Math.round((leftSum / total) * 100),
        center: Math.round((centerSum / total) * 100),
        right: Math.round((rightSum / total) * 100)
    };
}

function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .slice(0, 6)
        .join(' ');
}

function aggregateNews(newsItems: RSSNewsItem[], limit: number = 20): AggregatedStory[] {
    const groups: Map<string, RSSNewsItem[]> = new Map();

    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentItems = newsItems.filter(item => {
        const date = new Date(item.pubDate).getTime();
        return isNaN(date) || date > cutoff;
    });

    recentItems.forEach(item => {
        const normalizedTitle = normalizeTitle(item.title);
        const existingKey = Array.from(groups.keys()).find(key => {
            const similarity = calculateSimilarity(key, normalizedTitle);
            return similarity > 0.3;
        });

        if (existingKey) {
            groups.get(existingKey)!.push(item);
        } else {
            groups.set(normalizedTitle, [item]);
        }
    });

    const aggregated: AggregatedStory[] = [];

    groups.forEach((sources, key) => {
        const primarySource = sources[0];
        const uniqueSources = sources.filter((s, i, arr) =>
            arr.findIndex(x => x.source.id === s.source.id) === i
        );

        aggregated.push({
            id: Buffer.from(key).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20),
            title: primarySource.title,
            description: primarySource.description || '',
            image: primarySource.imageUrl,
            sources: uniqueSources,
            sourcesCount: uniqueSources.length,
            bias: calculateBiasDistribution(uniqueSources),
            mainCategory: primarySource.category || 'General',
            publishedAt: primarySource.pubDate,
            timeAgo: getTimeAgo(primarySource.pubDate)
        });
    });

    return aggregated
        .sort((a, b) => {
            const dateA = new Date(a.publishedAt).getTime();
            const dateB = new Date(b.publishedAt).getTime();
            const dateDiff = dateB - dateA;
            // Data prima; source count tie-breaker in aceeasi fereastra de 6h
            if (Math.abs(dateDiff) > 6 * 60 * 60 * 1000) return dateDiff;
            return b.sourcesCount - a.sourcesCount;
        })
        .slice(0, limit);
}

function calculateSimilarity(s1: string, s2: string): number {
    const words1 = new Set(s1.split(' '));
    const words2 = new Set(s2.split(' '));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
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
        const aggregatedStories = aggregateNews(allNews, 30);
        console.log(`[CRON] Aggregated into ${aggregatedStories.length} stories`);

        // Store in Redis cache
        await redis.set(CACHE_KEY, JSON.stringify(aggregatedStories), { ex: CACHE_TTL });

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
