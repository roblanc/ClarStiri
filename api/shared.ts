import type { VercelRequest, VercelResponse } from '@vercel/node';

// Tipuri
export interface NewsSource {
    id: string;
    name: string;
    url: string;
    rssUrl: string;
    logo?: string;
    bias: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
    factuality: 'high' | 'mixed' | 'low';
    category: 'mainstream' | 'independent' | 'tabloid' | 'public';
}

export interface BiasAnalysis {
    detectedEntities: Array<{ entity: string; count: number }>;
    keywordScore: number;
    entityScore: number;
    overallBias: number;
    confidence: number;
    indicators: string[];
}

export interface RSSNewsItem {
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

// Configurația surselor de știri românești
export const NEWS_SOURCES: NewsSource[] = [
    // === CENTRU ===
    { id: 'agerpres', name: 'Agerpres', url: 'https://www.agerpres.ro', rssUrl: 'https://www.agerpres.ro/rss', bias: 'center', factuality: 'high', category: 'public' },
    { id: 'mediafax', name: 'Mediafax', url: 'https://www.mediafax.ro', rssUrl: 'https://www.mediafax.ro/rss', bias: 'center', factuality: 'high', category: 'mainstream' },
    { id: 'protv', name: 'ProTV', url: 'https://stirileprotv.ro', rssUrl: 'https://rss.stirileprotv.ro/', bias: 'center', factuality: 'high', category: 'mainstream' },
    { id: 'tvr', name: 'TVR', url: 'https://stiri.tvr.ro', rssUrl: 'https://stiri.tvr.ro/rss.xml', bias: 'center', factuality: 'high', category: 'public' },
    { id: 'bursa', name: 'Bursa', url: 'https://www.bursa.ro', rssUrl: 'https://www.bursa.ro/rss', bias: 'center', factuality: 'high', category: 'mainstream' },
    { id: 'biziday', name: 'Biziday', url: 'https://www.biziday.ro', rssUrl: 'https://www.biziday.ro/feed/', bias: 'center', factuality: 'high', category: 'independent' },
    // === CENTRU-STÂNGA ===
    { id: 'digi24', name: 'Digi24', url: 'https://www.digi24.ro', rssUrl: 'https://www.digi24.ro/rss', bias: 'center-left', factuality: 'high', category: 'mainstream' },
    { id: 'hotnews', name: 'HotNews', url: 'https://www.hotnews.ro', rssUrl: 'https://www.hotnews.ro/rss/actualitate', bias: 'center-left', factuality: 'high', category: 'mainstream' },
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
    { id: 'g4media', name: 'G4Media', url: 'https://www.g4media.ro', rssUrl: 'https://www.g4media.ro/feed', bias: 'left', factuality: 'high', category: 'independent' },
    { id: 'criticatac', name: 'CriticAtac', url: 'https://www.criticatac.ro', rssUrl: 'https://www.criticatac.ro/feed/', bias: 'left', factuality: 'mixed', category: 'independent' },
    // === CENTRU-DREAPTA ===
    { id: 'ziare', name: 'Ziare.com', url: 'https://www.ziare.com', rssUrl: 'https://www.ziare.com/rss/news.xml', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
    { id: 'gandul', name: 'Gândul', url: 'https://www.gandul.ro', rssUrl: 'https://www.gandul.ro/rss', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
    { id: 'capital', name: 'Capital', url: 'https://www.capital.ro', rssUrl: 'https://www.capital.ro/feed/', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
    { id: 'europafm', name: 'Europa FM', url: 'https://www.europafm.ro', rssUrl: 'https://www.europafm.ro/feed/', bias: 'center-right', factuality: 'high', category: 'mainstream' },
    { id: 'profit', name: 'Profit.ro', url: 'https://www.profit.ro', rssUrl: 'https://www.profit.ro/rss', bias: 'center-right', factuality: 'high', category: 'mainstream' },
    { id: 'zf', name: 'Ziarul Financiar', url: 'https://www.zf.ro', rssUrl: 'https://www.zf.ro/rss', bias: 'center-right', factuality: 'high', category: 'mainstream' },
    { id: 'romanialibera', name: 'România Liberă', url: 'https://romanialibera.ro', rssUrl: 'https://romanialibera.ro/feed/', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
    { id: 'observator', name: 'Observator', url: 'https://observatornews.ro', rssUrl: 'https://observatornews.ro/rss', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
    // === DREAPTA ===
    { id: 'antena3', name: 'Antena 3', url: 'https://www.antena3.ro', rssUrl: 'https://www.antena3.ro/rss', bias: 'right', factuality: 'low', category: 'mainstream' },
    { id: 'romaniatv', name: 'România TV', url: 'https://www.romaniatv.net', rssUrl: 'https://www.romaniatv.net/rss', bias: 'right', factuality: 'low', category: 'mainstream' },
    { id: 'dcnews', name: 'DCNews', url: 'https://www.dcnews.ro', rssUrl: 'https://www.dcnews.ro/rss/', bias: 'right', factuality: 'low', category: 'mainstream' },
    { id: 'flux24', name: 'Flux24', url: 'https://flux24.ro', rssUrl: 'https://flux24.ro/feed/', bias: 'right', factuality: 'mixed', category: 'independent' },
    { id: 'activenews', name: 'ActiveNews', url: 'https://www.activenews.ro', rssUrl: 'https://www.activenews.ro/rss', bias: 'right', factuality: 'low', category: 'independent' },
    { id: 'epochtimes', name: 'Epoch Times România', url: 'https://epochtimes-romania.com', rssUrl: 'https://epochtimes-romania.com/feed/', bias: 'right', factuality: 'low', category: 'independent' },
    // === SURSE NOI (Satiră & Investigații) ===
    { id: 'defapt', name: 'Defapt.ro', url: 'https://defapt.ro', rssUrl: 'https://defapt.ro/feed/', bias: 'center-right', factuality: 'high', category: 'independent' },
    { id: 'catavencii', name: 'Cațavencii', url: 'https://www.catavencii.ro', rssUrl: 'https://www.catavencii.ro/feed/', bias: 'center', factuality: 'mixed', category: 'independent' }, // Satiră
    { id: 'academiacatavencu', name: 'Academia Cațavencu', url: 'https://academiacatavencu.com', rssUrl: 'https://academiacatavencu.com/feed/', bias: 'center', factuality: 'mixed', category: 'independent' }, // Satiră
    { id: 'dailybusiness', name: 'Daily Business', url: 'https://www.dailybusiness.ro', rssUrl: 'https://www.dailybusiness.ro/feed/', bias: 'center-right', factuality: 'high', category: 'mainstream' },
    { id: 'wowbiz', name: 'WOWbiz', url: 'https://www.wowbiz.ro', rssUrl: 'https://www.wowbiz.ro/feed/', bias: 'center', factuality: 'mixed', category: 'tabloid' },
    { id: 'actualitate', name: 'Actualitate.net', url: 'https://actualitate.net', rssUrl: 'https://actualitate.net/feed/', bias: 'center', factuality: 'mixed', category: 'independent' },
    { id: 'factual', name: 'Factual.ro', url: 'https://www.factual.ro', rssUrl: 'https://www.factual.ro/feed/', bias: 'center', factuality: 'high', category: 'independent' },
    { id: 'jurnalul', name: 'Jurnalul.ro', url: 'https://jurnalul.ro', rssUrl: 'https://jurnalul.ro/feed/', bias: 'center', factuality: 'mixed', category: 'mainstream' },
];

export const BIAS_WEIGHT_MAP: Record<string, { left: number; center: number; right: number }> = {
    'left': { left: 91, center: 9, right: 0 },
    'center-left': { left: 58, center: 42, right: 0 },
    'center': { left: 2, center: 96, right: 2 },
    'center-right': { left: 0, center: 38, right: 62 },
    'right': { left: 0, center: 12, right: 88 },
};

const FETCH_TIMEOUT = 4000;

const POLITICAL_KEYWORDS = {
    left: ['USR', 'REPER', 'progresist', 'anticorupție', 'transparență', 'pro-european', 'reforme'],
    right: ['AUR', 'SOS', 'Georgescu', 'tradițional', 'suveranist', 'patriot', 'anti-UE', 'ortodox'],
    entities: ['USR', 'PSD', 'PNL', 'AUR', 'SOS', 'REPER', 'Simion', 'Ciolacu', 'Ciucă', 'Georgescu']
};

export function quickBiasAnalysis(title: string, description: string = ''): BiasAnalysis {
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

export async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const response = await fetch(url, {
        signal: AbortSignal.timeout(timeout),
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml',
        }
    });
    return response;
}

export function parseRSSXML(xmlString: string, source: NewsSource): RSSNewsItem[] {
    const items: RSSNewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    let index = 0;
    const MAX_ITEMS_PER_SOURCE = 15; // Limită pentru a reduce load-ul de procesare (N^2 în agreagare)

    while ((match = itemRegex.exec(xmlString)) !== null && index < MAX_ITEMS_PER_SOURCE) {
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
                biasAnalysis: biasAnalysis.confidence > 0.1 ? biasAnalysis : undefined,
            });
            index++;
        }
    }

    return items;
}

const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
];

export async function fetchRSSFeed(source: NewsSource, proxyIndex = -1): Promise<RSSNewsItem[]> {
    try {
        const urlToFetch = proxyIndex >= 0
            ? `${CORS_PROXIES[proxyIndex]}${encodeURIComponent(source.rssUrl)}`
            : source.rssUrl;

        const response = await fetchWithTimeout(urlToFetch, FETCH_TIMEOUT);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const xmlText = await response.text();
        const items = parseRSSXML(xmlText, source);

        if (items.length === 0 && xmlText.toLowerCase().includes('<html')) {
            throw new Error('Returned HTML instead of XML');
        }

        return items;
    } catch (error) {
        if (proxyIndex < CORS_PROXIES.length - 1) {
            return fetchRSSFeed(source, proxyIndex + 1);
        }
        console.warn(`Failed to fetch ${source.name} after proxies:`, error instanceof Error ? error.message : error);
        return [];
    }
}
