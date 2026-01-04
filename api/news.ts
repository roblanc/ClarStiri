import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Inițializare Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache key și durata
const CACHE_KEY = 'aggregated_news';
const CACHE_TTL = 5 * 60; // 5 minute în secunde

// Tipuri
interface NewsSource {
    id: string;
    name: string;
    url: string;
    rssUrl: string;
    logo?: string;
    bias: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
    factuality: 'high' | 'mixed' | 'low';
    category: 'mainstream' | 'independent' | 'tabloid' | 'public';
}

interface BiasAnalysis {
    detectedEntities: Array<{ entity: string; count: number }>;
    keywordScore: number;
    entityScore: number;
    overallBias: number;
    confidence: number;
    indicators: string[];
}

interface RSSNewsItem {
    id: string;
    title: string;
    description: string;
    link: string;
    pubDate: string;
    imageUrl?: string;
    source: NewsSource;
    category?: string;
    author?: string;
    biasAnalysis?: BiasAnalysis;
}

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

// Lista completă de surse (copiată din types/news.ts)
const NEWS_SOURCES: NewsSource[] = [
    // === CENTRU ===
    { id: 'digi24', name: 'Digi24', url: 'https://www.digi24.ro', rssUrl: 'https://www.digi24.ro/rss', bias: 'center', factuality: 'high', category: 'mainstream' },
    { id: 'agerpres', name: 'Agerpres', url: 'https://www.agerpres.ro', rssUrl: 'https://www.agerpres.ro/rss', bias: 'center', factuality: 'high', category: 'public' },
    { id: 'mediafax', name: 'Mediafax', url: 'https://www.mediafax.ro', rssUrl: 'https://www.mediafax.ro/rss', bias: 'center', factuality: 'high', category: 'mainstream' },
    { id: 'hotnews', name: 'HotNews', url: 'https://www.hotnews.ro', rssUrl: 'https://www.hotnews.ro/rss/actualitate', bias: 'center', factuality: 'high', category: 'mainstream' },
    { id: 'protv', name: 'ProTV', url: 'https://stirileprotv.ro', rssUrl: 'https://rss.stirileprotv.ro/', bias: 'center', factuality: 'high', category: 'mainstream' },
    { id: 'observator', name: 'Observator', url: 'https://observatornews.ro', rssUrl: 'https://observatornews.ro/rss', bias: 'center', factuality: 'mixed', category: 'mainstream' },
    { id: 'tvr', name: 'TVR', url: 'https://stiri.tvr.ro', rssUrl: 'https://stiri.tvr.ro/rss.xml', bias: 'center', factuality: 'high', category: 'public' },
    { id: 'bursa', name: 'Bursa', url: 'https://www.bursa.ro', rssUrl: 'https://www.bursa.ro/rss', bias: 'center', factuality: 'high', category: 'mainstream' },
    { id: 'biziday', name: 'Biziday', url: 'https://www.biziday.ro', rssUrl: 'https://www.biziday.ro/feed/', bias: 'center', factuality: 'high', category: 'independent' },
    // === CENTRU-STÂNGA ===
    { id: 'g4media', name: 'G4Media', url: 'https://www.g4media.ro', rssUrl: 'https://www.g4media.ro/feed', bias: 'center-left', factuality: 'high', category: 'independent' },
    { id: 'recorder', name: 'Recorder', url: 'https://recorder.ro', rssUrl: 'https://recorder.ro/feed/', bias: 'center-left', factuality: 'high', category: 'independent' },
    { id: 'libertatea', name: 'Libertatea', url: 'https://www.libertatea.ro', rssUrl: 'https://www.libertatea.ro/rss', bias: 'center-left', factuality: 'mixed', category: 'mainstream' },
    { id: 'adevarul', name: 'Adevărul', url: 'https://adevarul.ro', rssUrl: 'https://adevarul.ro/rss/', bias: 'center-left', factuality: 'mixed', category: 'mainstream' },
    { id: 'newsweek', name: 'Newsweek România', url: 'https://newsweek.ro', rssUrl: 'https://newsweek.ro/rss', bias: 'center-left', factuality: 'high', category: 'mainstream' },
    { id: 'snoop', name: 'Snoop.ro', url: 'https://snoop.ro', rssUrl: 'https://snoop.ro/rss', bias: 'center-left', factuality: 'high', category: 'independent' },
    { id: 'spotmedia', name: 'Spotmedia', url: 'https://spotmedia.ro', rssUrl: 'https://spotmedia.ro/feed', bias: 'center-left', factuality: 'high', category: 'independent' },
    { id: 'paginademedia', name: 'Pagina de Media', url: 'https://www.paginademedia.ro', rssUrl: 'https://www.paginademedia.ro/feed/', bias: 'center-left', factuality: 'high', category: 'independent' },
    { id: 'vice', name: 'Vice România', url: 'https://www.vice.com/ro', rssUrl: 'https://www.vice.com/ro/rss', bias: 'center-left', factuality: 'mixed', category: 'independent' },
    { id: 'scena9', name: 'Scena9', url: 'https://www.scena9.ro', rssUrl: 'https://www.scena9.ro/feed', bias: 'center-left', factuality: 'high', category: 'independent' },
    // === STÂNGA ===
    { id: 'criticatac', name: 'CriticAtac', url: 'https://www.criticatac.ro', rssUrl: 'https://www.criticatac.ro/feed/', bias: 'left', factuality: 'mixed', category: 'independent' },
    // === CENTRU-DREAPTA ===
    { id: 'ziare', name: 'Ziare.com', url: 'https://www.ziare.com', rssUrl: 'https://www.ziare.com/rss/news.xml', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
    { id: 'gandul', name: 'Gândul', url: 'https://www.gandul.ro', rssUrl: 'https://www.gandul.ro/rss', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
    { id: 'capital', name: 'Capital', url: 'https://www.capital.ro', rssUrl: 'https://www.capital.ro/feed/', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
    { id: 'europafm', name: 'Europa FM', url: 'https://www.europafm.ro', rssUrl: 'https://www.europafm.ro/feed/', bias: 'center-right', factuality: 'high', category: 'mainstream' },
    { id: 'profit', name: 'Profit.ro', url: 'https://www.profit.ro', rssUrl: 'https://www.profit.ro/rss', bias: 'center-right', factuality: 'high', category: 'mainstream' },
    { id: 'zf', name: 'Ziarul Financiar', url: 'https://www.zf.ro', rssUrl: 'https://www.zf.ro/rss', bias: 'center-right', factuality: 'high', category: 'mainstream' },
    { id: 'evz', name: 'Evenimentul Zilei', url: 'https://evz.ro', rssUrl: 'https://evz.ro/feed', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
    { id: 'romanialibera', name: 'România Liberă', url: 'https://romanialibera.ro', rssUrl: 'https://romanialibera.ro/feed/', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
    // === DREAPTA ===
    { id: 'antena3', name: 'Antena 3', url: 'https://www.antena3.ro', rssUrl: 'https://www.antena3.ro/rss', bias: 'right', factuality: 'mixed', category: 'mainstream' },
    { id: 'romaniatv', name: 'România TV', url: 'https://www.romaniatv.net', rssUrl: 'https://www.romaniatv.net/rss', bias: 'right', factuality: 'low', category: 'mainstream' },
    { id: 'dcnews', name: 'DCNews', url: 'https://www.dcnews.ro', rssUrl: 'https://www.dcnews.ro/rss/', bias: 'right', factuality: 'low', category: 'mainstream' },
    { id: 'flux24', name: 'Flux24', url: 'https://flux24.ro', rssUrl: 'https://flux24.ro/feed/', bias: 'right', factuality: 'mixed', category: 'independent' },
    { id: 'activenews', name: 'ActiveNews', url: 'https://www.activenews.ro', rssUrl: 'https://www.activenews.ro/rss', bias: 'right', factuality: 'low', category: 'independent' },
    { id: 'epochtimes', name: 'Epoch Times România', url: 'https://epochtimes-romania.com', rssUrl: 'https://epochtimes-romania.com/feed/', bias: 'right', factuality: 'low', category: 'independent' },
];

const BIAS_WEIGHT_MAP: Record<string, { left: number; center: number; right: number }> = {
    'left': { left: 1.0, center: 0, right: 0 },
    'center-left': { left: 0.6, center: 0.4, right: 0 },
    'center': { left: 0, center: 1.0, right: 0 },
    'center-right': { left: 0, center: 0.4, right: 0.6 },
    'right': { left: 0, center: 0, right: 1.0 },
};

// Fetch timeout
const FETCH_TIMEOUT = 3000;

// Simplified bias detection (lightweight version for serverless)
const POLITICAL_KEYWORDS = {
    left: ['USR', 'REPER', 'progresist', 'anticorupție', 'transparență', 'pro-european', 'reforme'],
    right: ['AUR', 'SOS', 'Georgescu', 'tradițional', 'suveranist', 'patriot', 'anti-UE', 'ortodox'],
    entities: ['USR', 'PSD', 'PNL', 'AUR', 'SOS', 'REPER', 'Simion', 'Ciolacu', 'Ciucă', 'Georgescu']
};

function quickBiasAnalysis(title: string, description: string = ''): BiasAnalysis {
    const text = `${title} ${description}`.toLowerCase();
    const detectedEntities: Array<{ entity: string; count: number }> = [];
    let keywordScore = 0;
    let entityCount = 0;
    const indicators: string[] = [];

    // Detect entities
    POLITICAL_KEYWORDS.entities.forEach(entity => {
        const regex = new RegExp(`\\b${entity.toLowerCase()}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
            detectedEntities.push({ entity, count: matches.length });
            entityCount += matches.length;
        }
    });

    // Score keywords
    POLITICAL_KEYWORDS.left.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
            keywordScore -= 20;
            indicators.push(`left: ${keyword}`);
        }
    });

    POLITICAL_KEYWORDS.right.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
            keywordScore += 20;
            indicators.push(`right: ${keyword}`);
        }
    });

    const overallBias = keywordScore;
    const confidence = Math.min(1, (entityCount + indicators.length) / 5);

    return {
        detectedEntities,
        keywordScore,
        entityScore: 0,
        overallBias,
        confidence,
        indicators: indicators.slice(0, 3)
    };
}

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

function parseRSSXML(xmlString: string, source: NewsSource): RSSNewsItem[] {
    // Simple XML parsing without DOMParser (not available in Node)
    const items: RSSNewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    let index = 0;

    while ((match = itemRegex.exec(xmlString)) !== null) {
        const itemXml = match[1];

        const getTagContent = (tag: string): string => {
            const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
            const m = itemXml.match(regex);
            return (m?.[1] || m?.[2] || '').trim();
        };

        const title = getTagContent('title');
        const description = getTagContent('description').replace(/<[^>]*>/g, '').substring(0, 500);
        const link = getTagContent('link');
        const pubDate = getTagContent('pubDate');

        // Extract image
        let imageUrl = '';
        const enclosureMatch = itemXml.match(/enclosure[^>]+url=["']([^"']+)["']/i);
        if (enclosureMatch) imageUrl = enclosureMatch[1];

        if (!imageUrl) {
            const mediaMatch = itemXml.match(/media:content[^>]+url=["']([^"']+)["']/i);
            if (mediaMatch) imageUrl = mediaMatch[1];
        }

        if (title && link) {
            // Perform bias analysis on article content
            const biasAnalysis = quickBiasAnalysis(title, description);

            items.push({
                id: `${source.id}-${index}-${Date.now()}`,
                title,
                description,
                link,
                pubDate,
                imageUrl,
                source,
                category: getTagContent('category') || undefined,
                biasAnalysis: biasAnalysis.confidence > 0.1 ? biasAnalysis : undefined, // Only include if confident enough
            });
            index++;
        }
    }

    return items;
}

async function fetchRSSFeed(source: NewsSource): Promise<RSSNewsItem[]> {
    try {
        const response = await fetchWithTimeout(source.rssUrl, FETCH_TIMEOUT);
        if (!response.ok) return [];

        const xmlText = await response.text();
        return parseRSSXML(xmlText, source);
    } catch (error) {
        console.warn(`Failed to fetch ${source.name}:`, error);
        return [];
    }
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

        // Check cache first
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

        // Cache miss - fetch fresh data
        console.log('Cache miss, fetching fresh news...');
        const news = await fetchAllNews();
        const aggregated = aggregateNews(news);

        // Save to cache
        await redis.set(CACHE_KEY, aggregated, { ex: CACHE_TTL });

        return res.status(200).json({
            success: true,
            data: aggregated.slice(0, limit),
            fromCache: false,
            fetchedAt: new Date().toISOString(),
            totalStories: aggregated.length,
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
