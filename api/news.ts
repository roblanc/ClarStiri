import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import {
    RSSNewsItem,
    BiasAnalysis,
    NEWS_SOURCES,
    BIAS_WEIGHT_MAP,
    fetchRSSFeed
} from './shared';

// Inițializare Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache key și durata
const CACHE_KEY = 'aggregated_news';
const CACHE_TTL = 5 * 60; // 5 minute în secunde

interface AggregatedStory {
    id: string;
    title: string;
    description: string;
    image?: string;
    sources: RSSNewsItem[];
    sourcesCount: number;
    bias: { left: number; center: number; right: number };
    contentBias?: BiasAnalysis;
    mainCategory: string;
    publishedAt: string;
    timeAgo: string;
}

async function fetchAllNews(): Promise<RSSNewsItem[]> {
    const priorityIds = ['digi24', 'hotnews', 'g4media', 'mediafax', 'agerpres', 'libertatea', 'protv', 'adevarul', 'recorder', 'observator'];
    const prioritySources = NEWS_SOURCES.filter(s => priorityIds.includes(s.id));
    const otherSources = NEWS_SOURCES.filter(s => !priorityIds.includes(s.id));

    // Fetch priority sources first
    const priorityResults = await Promise.allSettled(prioritySources.map(s => fetchRSSFeed(s)));
    let allNews: RSSNewsItem[] = [];

    priorityResults.forEach(result => {
        if (result.status === 'fulfilled') {
            allNews.push(...result.value);
        }
    });

    // Then fetch other sources
    const otherResults = await Promise.allSettled(otherSources.map(s => fetchRSSFeed(s)));
    otherResults.forEach(result => {
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
    if (sources.length === 0) return { left: 33, center: 34, right: 33 };

    let totalLeft = 0, totalCenter = 0, totalRight = 0;

    sources.forEach(item => {
        const weights = BIAS_WEIGHT_MAP[item.source.bias];
        totalLeft += weights.left;
        totalCenter += weights.center;
        totalRight += weights.right;
    });

    const total = totalLeft + totalCenter + totalRight;
    let left = Math.floor((totalLeft / total) * 100);
    let center = Math.floor((totalCenter / total) * 100);
    let right = Math.floor((totalRight / total) * 100);

    // Ensure sum is 100
    const remainder = 100 - (left + center + right);
    center += remainder;

    return { left, center, right };
}

function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .trim();
}

function calculateTitleSimilarity(title1: string, title2: string): number {
    const stopwords = new Set(['de', 'la', 'în', 'și', 'a', 'pe', 'cu', 'din', 'pentru', 'un', 'o', 'că', 'care', 'să']);

    const words1 = normalizeTitle(title1).split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
    const words2 = normalizeTitle(title2).split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    if (set1.size === 0 || set2.size === 0) return 0;

    let intersection = 0;
    set1.forEach(word => { if (set2.has(word)) intersection++; });

    const union = set1.size + set2.size - intersection;
    return intersection / union;
}

function aggregateNews(news: RSSNewsItem[]): AggregatedStory[] {
    const storyGroups = new Map<string, RSSNewsItem[]>();
    const processed = new Set<string>();
    const threshold = 0.4;

    news.forEach(item => {
        if (processed.has(item.id)) return;

        const group: RSSNewsItem[] = [item];
        processed.add(item.id);

        news.forEach(other => {
            if (processed.has(other.id)) return;
            if (item.source.id === other.source.id) return;

            const similarity = calculateTitleSimilarity(item.title, other.title);
            if (similarity >= threshold) {
                group.push(other);
                processed.add(other.id);
            }
        });

        storyGroups.set(`story-${item.id}`, group);
    });

    const aggregatedStories: AggregatedStory[] = [];

    storyGroups.forEach((sources, groupId) => {
        const primary = sources.reduce((earliest, current) => {
            return new Date(current.pubDate).getTime() > new Date(earliest.pubDate).getTime() ? current : earliest;
        });

        const imageSource = sources.find(s => s.imageUrl) || primary;

        // Aggregate content bias from all sources
        const sourcesWithBias = sources.filter(s => s.biasAnalysis);
        let contentBias: BiasAnalysis | undefined;

        if (sourcesWithBias.length > 0) {
            // Merge all bias analyses
            const allEntities = new Map<string, number>();
            let totalKeywordScore = 0;
            let totalConfidence = 0;
            const allIndicators: string[] = [];

            sourcesWithBias.forEach(source => {
                if (source.biasAnalysis) {
                    source.biasAnalysis.detectedEntities.forEach(e => {
                        allEntities.set(e.entity, (allEntities.get(e.entity) || 0) + e.count);
                    });
                    totalKeywordScore += source.biasAnalysis.keywordScore;
                    totalConfidence += source.biasAnalysis.confidence;
                    allIndicators.push(...source.biasAnalysis.indicators);
                }
            });

            const avgKeywordScore = totalKeywordScore / sourcesWithBias.length;
            const avgConfidence = totalConfidence / sourcesWithBias.length;

            contentBias = {
                detectedEntities: Array.from(allEntities.entries()).map(([entity, count]) => ({ entity, count })),
                keywordScore: avgKeywordScore,
                entityScore: 0,
                overallBias: avgKeywordScore,
                confidence: avgConfidence,
                indicators: Array.from(new Set(allIndicators)).slice(0, 5)
            };
        }

        aggregatedStories.push({
            id: groupId,
            title: primary.title,
            description: primary.description,
            image: imageSource.imageUrl,
            sources,
            sourcesCount: sources.length,
            bias: calculateBiasDistribution(sources),
            contentBias,
            mainCategory: primary.category || 'Actualitate',
            publishedAt: primary.pubDate,
            timeAgo: getTimeAgo(primary.pubDate),
        });
    });

    // Sort by sources count, then by date
    aggregatedStories.sort((a, b) => {
        if (b.sourcesCount !== a.sourcesCount) return b.sourcesCount - a.sourcesCount;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return aggregatedStories;
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

        // Always serve from cache - cron job keeps it fresh
        const cached = await redis.get<AggregatedStory[]>(CACHE_KEY);

        if (cached) {
            console.log('Returning cached news');
            return res.status(200).json({
                success: true,
                data: cached.slice(0, limit),
                fromCache: true,
                cachedAt: new Date().toISOString(),
            });
        }

        // Cache is empty - this should only happen on first deploy
        // Instead of waiting for slow RSS fetch, return empty with message
        // The cron job will populate the cache within 2 minutes
        console.log('Cache empty, waiting for cron to populate...');

        // Try a quick fetch of just priority sources as fallback
        const priorityIds = ['digi24', 'hotnews', 'g4media', 'mediafax', 'agerpres'];
        const prioritySources = NEWS_SOURCES.filter(s => priorityIds.includes(s.id));

        // Quick fetch with shorter timeout
        const results = await Promise.allSettled(
            prioritySources.map(s => fetchRSSFeed(s))
        );

        let quickNews: RSSNewsItem[] = [];
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                quickNews.push(...result.value);
            }
        });

        if (quickNews.length > 0) {
            const aggregated = aggregateNews(quickNews);
            // Cache for 2 min until cron runs
            await redis.set(CACHE_KEY, aggregated, { ex: 120 });

            return res.status(200).json({
                success: true,
                data: aggregated.slice(0, limit),
                fromCache: false,
                isPartial: true,
                message: 'Partial data - full refresh coming soon',
                fetchedAt: new Date().toISOString(),
            });
        }

        return res.status(200).json({
            success: true,
            data: [],
            fromCache: false,
            message: 'Cache warming up, please refresh in 1-2 minutes',
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

