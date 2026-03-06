import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
    BIAS_WEIGHT_MAP as SHARED_BIAS_WEIGHT_MAP,
    NEWS_SOURCES_BASE,
    type BaseNewsSource,
} from '../shared/newsSources.js';
import { decodeHtmlEntities } from '../shared/htmlEntities.js';

// Tipuri
export type NewsSource = BaseNewsSource;

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

export const NEWS_SOURCES: NewsSource[] = NEWS_SOURCES_BASE.map((source) => ({ ...source }));
export const BIAS_WEIGHT_MAP: Record<string, { left: number; center: number; right: number }> =
    SHARED_BIAS_WEIGHT_MAP;

const FETCH_TIMEOUT = 3000;

const FORBIDDEN_KEYWORDS = [
    // Vreme
    'vremea', 'prognoza', 'meteo', 'temperaturi', 'grade celsius', 
    'cod galben', 'cod portocaliu', 'cod rosu', 'meteorologi', 'anm',
    'precipitatii', 'ninsori', 'viscol', 'canicula',
    // Horoscop
    'horoscop', 'zodiac', 'zodii', 'astrologie', 'berbec', 'taur', 'gemeni', 
    'rac', 'leu', 'fecioara', 'balanta', 'scorpion', 'sagetator', 'capricorn', 
    'varsator', 'pesti', 'previziuni astrale'
];

/**
 * Verifică dacă o știre trebuie filtrată (vreme, horoscop etc.)
 */
export function shouldFilterNews(title: string, description: string = ''): boolean {
    const text = `${title} ${description}`.toLowerCase();
    return FORBIDDEN_KEYWORDS.some(keyword => {
        // Match whole word for critical keywords, partial for others
        if (['anm', 'meteo', 'zodii', 'berbec', 'taur', 'rac', 'leu', 'pesti'].includes(keyword)) {
            return new RegExp(`\\b${keyword}\\b`, 'i').test(text);
        }
        return text.includes(keyword);
    });
}

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            signal: controller.signal as RequestInit['signal'], // type assertion for older node versions
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml',
            }
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
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

        const title = decodeHtmlEntities(getTagContent('title'));
        const description = decodeHtmlEntities(
            getTagContent('description').replace(/<[^>]*>/g, '')
        ).substring(0, 500);
        const link = getTagContent('link');
        const pubDate = getTagContent('pubDate');
        const category = decodeHtmlEntities(getTagContent('category')) || undefined;

        // Filter out weather, horoscope news, etc.
        if (shouldFilterNews(title, description)) {
            continue;
        }

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
                category,
                biasAnalysis: biasAnalysis.confidence > 0.1 ? biasAnalysis : undefined,
            });
            index++;
        }
    }

    return items;
}

const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.org/?url=',
    'https://proxy.cors.sh/', // Might require API key, but good as fallback
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
        // On server-side (Vercel), only try one proxy fallback to stay within the 10s function timeout.
        // proxyIndex = -1 (direct) → retry once with proxy[0] → give up.
        if (proxyIndex < 0) {
            return fetchRSSFeed(source, 0);
        }
        console.warn(`Failed to fetch ${source.name}:`, error instanceof Error ? error.message : error);
        return [];
    }
}
