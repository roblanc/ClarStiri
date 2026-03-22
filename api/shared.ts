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
    // Horoscop / Astrologie
    'horoscop', 'zodiac', 'zodii', 'astrologie', 'berbec', 'taur', 'gemeni',
    'rac', 'leu', 'fecioara', 'balanta', 'scorpion', 'sagetator', 'capricorn',
    'varsator', 'pesti', 'previziuni astrale', 'compatibilitate zodie',
    // Sănătate / Medicină lifestyle (nu știri de sănătate publică)
    'slabesti', 'slabire', 'dieta', 'diete', 'regim alimentar', 'cura de slabire',
    'kilograme in plus', 'pierdere in greutate', 'burtă',
    'remedii naturiste', 'remedii acasa', 'retete naturiste',
    'plante medicinale', 'ceai de', 'ulei esential',
    'semne ca suferi', 'simptome pe care', 'alimente care',
    'ce sa mananci', 'ce sa bei', 'beneficiile', 'miracol pentru sanatate',
    'trucuri pentru', 'sfaturi pentru sanatate',
    'cate calorii', 'nutritionist', 'fitbit',
    'sfornait', 'sforait', 'sforaitul',
    // Relații / Lifestyle / Sex
    'relatii de cuplu', 'viata de cuplu', 'cum sa iti',
    'cum sa fii', 'cum sa devii', 'secretul unui',
    'semne ca el', 'semne ca ea', 'semne ca partenerul',
    'barbatii care', 'femeile care', 'cum iti dai seama',
    'viata sexuala', 'viata intima', 'sfaturi in dragoste',
    'cum sa cuceresti', 'cum sa atragi',
    // Rețete / Mâncare / Gătit
    'reteta', 'retete', 'ingrediente', 'mod de preparare',
    'cum se face', 'cum se prepara', 'delicioase', 'gustoase',
    // Celebrity / Showbiz / Monden
    'vedete', 'showbiz', 'monden', 'cancan', 'paparazzi',
    'divorteaza', 's-a despartit', 's-au despartit', 'nunta vedetei',
    'look-ul', 'tinuta', 'rochie de', 'stilul lui', 'stilul ei',
    'cel mai frumos', 'cea mai frumoasa', 'miss romania', 'miss univers',
    'cel mai sexy', 'cea mai sexy',
    // Sport entertainment (nu știri de politică sportivă)
    'golul lui', 'golul saptamanii', 'transferul lui',
    'meciul de', 'scor final', 'meci amical',
    // Clickbait / Dezvoltare personală
    'te va surprinde', 'nu vei crede', 'nimeni nu stia',
    'secretul pe care', 'metoda garantata', 'rezultate uimitoare',
    'motivatie zilnica', 'gandire pozitiva', 'lege a atractiei',
    'succes garantat', 'devino bogat', 'independenta financiara in',
    // Animale / Diverse
    'pisica lui', 'cainele lui', 'animale de companie',
    'rasa de caini', 'rasa de pisici',
];

/** URL path segments that indicate non-news content — filtered regardless of title */
const FORBIDDEN_URL_SEGMENTS = [
    '/lifestyle', '/life-style', '/sanatate', '/dieta', '/diete',
    '/retete', '/recipe', '/beauty', '/frumusete', '/moda', '/fashion',
    '/horoscop', '/zodiac', '/astrologie', '/meteo', '/vreme',
    '/showbiz', '/vedete', '/monden', '/cancan', '/entertainment',
    '/sport/fotbal/stiri', '/auto', '/travel', '/calatorii',
    '/fun', '/viral', '/bizar', '/curiozitati',
];

/**
 * Verifică dacă o știre trebuie filtrată.
 * Filtrează: lifestyle, horoscop, vreme, rețete, vedete, clickbait.
 */
export function shouldFilterNews(title: string, description: string = '', url: string = ''): boolean {
    const text = `${title} ${description}`.toLowerCase();

    // URL-based filter — path segments are reliable signals
    if (url) {
        const urlLower = url.toLowerCase();
        if (FORBIDDEN_URL_SEGMENTS.some(seg => urlLower.includes(seg))) return true;
    }

    return FORBIDDEN_KEYWORDS.some(keyword => {
        // Whole-word match for short keywords that could appear inside other words
        if (['anm', 'meteo', 'zodii', 'berbec', 'taur', 'rac', 'leu', 'pesti', 'dieta'].includes(keyword)) {
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

function extractFirstImageFromHtml(html: string): string {
    if (!html) return '';

    const imgMatch = html.match(/<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["']/i);
    return decodeHtmlEntities(imgMatch?.[1] || '');
}

function extractImageUrl(itemXml: string, rawDescription: string, rawContentEncoded: string): string {
    const patterns = [
        /<enclosure[^>]+url=["']([^"']+)["']/i,
        /<media:content[^>]+url=["']([^"']+)["']/i,
        /<media:thumbnail[^>]+url=["']([^"']+)["']/i,
        /<media:thumbnail[^>]+href=["']([^"']+)["']/i,
    ];

    for (const pattern of patterns) {
        const match = itemXml.match(pattern);
        const candidate = decodeHtmlEntities(match?.[1] || '');
        if (candidate) return candidate;
    }

    return extractFirstImageFromHtml(rawDescription) || extractFirstImageFromHtml(rawContentEncoded);
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

        const rawDescription = getTagContent('description');
        const rawContentEncoded = getTagContent('content:encoded');
        const title = decodeHtmlEntities(getTagContent('title'));
        const description = decodeHtmlEntities(
            rawDescription.replace(/<[^>]*>/g, '')
        ).substring(0, 500);
        const link = getTagContent('link');
        const pubDate = getTagContent('pubDate');
        const category = decodeHtmlEntities(getTagContent('category')) || undefined;

        // Filter out weather, horoscope news, etc.
        if (shouldFilterNews(title, description)) {
            continue;
        }

        // Extract image
        const imageUrl = extractImageUrl(itemXml, rawDescription, rawContentEncoded);

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
