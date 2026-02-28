import { RSSNewsItem, AggregatedStory, NEWS_SOURCES, BIAS_WEIGHT_MAP, NewsSource } from '@/types/news';
import { createStoryIdFromSources } from '@/utils/storyId';

// CORS proxies - folosim mai multe pentru redundanță și viteză
// Format: ${proxy}${encodeURIComponent(url)} — toți trebuie să accepte ?url=<encoded>
// /api/rss este proxy-ul nostru propriu pe Vercel (Frankfurt) — cel mai fiabil în producție
const CORS_PROXIES = [
    '/api/rss?url=',
    'https://api.allorigins.win/raw?url=',
];

// Cache keys pentru localStorage
const CACHE_KEY = 'clarstiri_news_cache';
const AGGREGATED_CACHE_KEY = 'clarstiri_aggregated_cache_v2';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minute

// Timeout pentru fetch (în milisecunde)
const FETCH_TIMEOUT = 8000; // 8 secunde — proxy-urile CORS au latență mai mare din România

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
        if (['anm', 'meteo', 'zodii', 'berbec', 'taur', 'rac', 'leu', 'pesti'].includes(keyword)) {
            return new RegExp(`\\b${keyword}\\b`, 'i').test(text);
        }
        return text.includes(keyword);
    });
}

interface CachedNews {
    timestamp: number;
    news: RSSNewsItem[];
}

interface CachedAggregated {
    timestamp: number;
    stories: AggregatedStory[];
}

/**
 * Salvează știrile brute în cache local
 */
function saveToCache(news: RSSNewsItem[]): void {
    try {
        const cacheData: CachedNews = { timestamp: Date.now(), news };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
        console.warn('Failed to save news to cache:', e);
    }
}

/**
 * Salvează știrile agregate direct în cache local pentru redare instant
 */
function saveAggregatedToCache(stories: AggregatedStory[]): void {
    try {
        // Store serialisable form (Date → string)
        const serialisable = stories.map(s => ({
            ...s,
            publishedAt: s.publishedAt instanceof Date ? s.publishedAt.toISOString() : s.publishedAt,
        }));
        const cacheData: CachedAggregated = { timestamp: Date.now(), stories: serialisable as unknown as AggregatedStory[] };
        localStorage.setItem(AGGREGATED_CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
        console.warn('Failed to save aggregated news to cache:', e);
    }
}

/**
 * Încarcă știrile agregate direct din cache
 */
function loadAggregatedFromCache(): AggregatedStory[] | null {
    try {
        const cached = localStorage.getItem(AGGREGATED_CACHE_KEY);
        if (!cached) return null;
        const cacheData: CachedAggregated = JSON.parse(cached);
        if (!cacheData.stories?.length) return null;
        return cacheData.stories.map(s => ({ ...s, publishedAt: new Date(s.publishedAt) }));
    } catch (e) {
        console.warn('Failed to load aggregated news from cache:', e);
        return null;
    }
}

/**
 * Încarcă știrile din cache local
 */
function loadFromCache(): RSSNewsItem[] | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const cacheData: CachedNews = JSON.parse(cached);
        if (cacheData.news && cacheData.news.length > 0) {
            return cacheData.news;
        }

        return null;
    } catch (e) {
        console.warn('Failed to load news from cache:', e);
        return null;
    }
}

/**
 * Verifică dacă cache-ul e proaspăt
 */
function isCacheFresh(): boolean {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return false;
        const cacheData: CachedNews = JSON.parse(cached);
        return Date.now() - cacheData.timestamp < CACHE_DURATION;
    } catch {
        return false;
    }
}

/**
 * Parsează un XML RSS feed în obiecte JavaScript
 */
function parseRSSXML(xmlString: string, source: NewsSource): RSSNewsItem[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const items = xmlDoc.querySelectorAll('item');
    const newsItems: RSSNewsItem[] = [];

    items.forEach((item, index) => {
        const rawTitle = item.querySelector('title')?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
        const rawDescription = item.querySelector('description')?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
        const link = item.querySelector('link')?.textContent?.trim() || '';
        const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
        const author = item.querySelector('dc\\:creator')?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ||
            item.querySelector('creator')?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ||
            item.querySelector('author')?.textContent?.trim();

        // Extrage categoria
        const categoryEl = item.querySelector('category');
        const category = categoryEl?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, '').trim();

        // Extrage imaginea din enclosure sau media:content
        let imageUrl = item.querySelector('enclosure')?.getAttribute('url') || '';
        if (!imageUrl) {
            const mediaContent = item.querySelector('media\\:content, media\\:thumbnail');
            imageUrl = mediaContent?.getAttribute('url') || mediaContent?.getAttribute('href') || '';
        }
        // Fallback: caută în description pentru taguri img
        if (!imageUrl && rawDescription) {
            const imgMatch = rawDescription.match(/<img[^>]+src=["']([^"']+)["']/i);
            imageUrl = imgMatch?.[1] || '';
        }

        // Decode HTML entities din titlu și descriere
        const title = decodeHtmlEntities(rawTitle);
        const description = decodeHtmlEntities(stripHtml(rawDescription));

        // Filter out weather, horoscope news, etc.
        if (shouldFilterNews(title, description)) {
            return;
        }

        if (title && link) {
            newsItems.push({
                id: `${source.id}-${index}-${Date.now()}`,
                title,
                description,
                link,
                pubDate,
                imageUrl,
                source,
                category,
                author,
            });
        }
    });

    return newsItems;
}

// Mapare statică a celor mai frecvente HTML entities — fără DOM overhead
const HTML_ENTITIES: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
    '&apos;': "'", '&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–',
    '&laquo;': '«', '&raquo;': '»', '&icirc;': 'î', '&Icirc;': 'Î',
    '&acirc;': 'â', '&Acirc;': 'Â', '&scedil;': 'ș', '&Scedil;': 'Ș',
    '&tcedil;': 'ț', '&Tcedil;': 'Ț', '&atilde;': 'ã', '&Atilde;': 'Ã',
    '&hellip;': '…', '&rsquo;': '\'', '&lsquo;': '\'', '&rdquo;': '"', '&ldquo;': '"',
};
const ENTITY_RE = /&[a-zA-Z#][a-zA-Z0-9]{1,6};/g;

/**
 * Decodează HTML entities (&quot;, &amp;, &icirc;, etc.) fără overhead DOM
 */
function decodeHtmlEntities(text: string): string {
    if (!text) return '';
    return text.replace(ENTITY_RE, match => HTML_ENTITIES[match] ?? match);
}

/**
 * Elimină tagurile HTML dintr-un string
 */
function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Fetch cu timeout - returnează [] dacă durează prea mult
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/rss+xml, application/xml, text/xml',
            },
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Fetch RSS feed de la o sursă cu timeout
 */
async function fetchRSSFeed(source: NewsSource, proxyIndex = 0): Promise<RSSNewsItem[]> {
    const proxy = CORS_PROXIES[proxyIndex % CORS_PROXIES.length];

    try {
        const response = await fetchWithTimeout(
            `${proxy}${encodeURIComponent(source.rssUrl)}`,
            FETCH_TIMEOUT
        );

        if (!response.ok) {
            // Încearcă alt proxy
            if (proxyIndex < CORS_PROXIES.length - 1) {
                return fetchRSSFeed(source, proxyIndex + 1);
            }
            console.warn(`Failed to fetch RSS from ${source.name}: ${response.status}`);
            return [];
        }

        const xmlText = await response.text();
        return parseRSSXML(xmlText, source);
    } catch (error) {
        // Dacă e timeout, încearcă alt proxy
        if (proxyIndex < CORS_PROXIES.length - 1) {
            return fetchRSSFeed(source, proxyIndex + 1);
        }
        console.warn(`Timeout/Error fetching RSS from ${source.name}`);
        return [];
    }
}

/**
 * Fetch toate știrile de la toate sursele în paralel
 * Returnează rezultate pe măsură ce vin, nu așteaptă toate sursele
 */
export async function fetchAllNews(): Promise<RSSNewsItem[]> {
    // Prioritizează sursele cele mai rapide/fiabile - extinse pentru încărcare mai rapidă
    const priorityIds = [
        'digi24', 'hotnews', 'g4media', 'mediafax', 'agerpres',
        'libertatea', 'protv', 'adevarul', 'recorder', 'observator'
    ];
    const prioritySources = NEWS_SOURCES.filter(s => priorityIds.includes(s.id));
    const otherSources = NEWS_SOURCES.filter(s => !priorityIds.includes(s.id));

    // Fetch sursele prioritare mai întâi
    const priorityPromises = prioritySources.map(source => fetchRSSFeed(source));
    const priorityResults = await Promise.allSettled(priorityPromises);

    const allNews: RSSNewsItem[] = [];

    priorityResults.forEach((result) => {
        if (result.status === 'fulfilled') {
            allNews.push(...result.value);
        }
    });

    // Apoi fetch-uiește restul surselor în background (fără a bloca)
    Promise.allSettled(otherSources.map(source => fetchRSSFeed(source)))
        .then(results => {
            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value.length > 0) {
                    // Adaugă la cache dar nu bloca UI-ul
                    const currentCache = loadFromCache() || [];
                    const newNews = result.value.filter(
                        n => !currentCache.some(c => c.link === n.link)
                    );
                    if (newNews.length > 0) {
                        saveToCache([...currentCache, ...newNews]);
                    }
                }
            });
        });

    // Sortează după data publicării (cele mai recente primele)
    allNews.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        return dateB - dateA;
    });

    // Salvează în cache
    if (allNews.length > 0) {
        saveToCache(allNews);
    }

    return allNews;
}

/**
 * Fetch rapid - returnează cache-ul instant, apoi actualizează în background
 */
export async function fetchNewsWithCache(): Promise<{
    news: RSSNewsItem[];
    fromCache: boolean;
    isStale: boolean;
}> {
    const cachedNews = loadFromCache();
    const isFresh = isCacheFresh();

    // Dacă avem cache, returnează-l instant
    if (cachedNews && cachedNews.length > 0) {
        // Dacă cache-ul e stale, actualizează în background
        if (!isFresh) {
            fetchAllNews().catch(console.error);
        }

        return {
            news: cachedNews,
            fromCache: true,
            isStale: !isFresh,
        };
    }

    // Dacă nu avem cache, fetch normal
    const news = await fetchAllNews();
    return {
        news,
        fromCache: false,
        isStale: false,
    };
}

/**
 * Calculează timpul relativ (acum X ore) pentru o dată
 */
export function getTimeAgo(pubDate: string): string {
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

/**
 * Calculează distribuția de bias pentru un set de surse
 * Asigură că suma procentelor este exact 100%
 */
function calculateBiasDistribution(sources: RSSNewsItem[]): { left: number; center: number; right: number } {
    if (sources.length === 0) {
        return { left: 33, center: 34, right: 33 };
    }

    let totalLeft = 0;
    let totalCenter = 0;
    let totalRight = 0;

    sources.forEach(item => {
        const weights = BIAS_WEIGHT_MAP[item.source.bias];
        totalLeft += weights.left;
        totalCenter += weights.center;
        totalRight += weights.right;
    });

    const total = totalLeft + totalCenter + totalRight;

    // Calculează procentele brute
    const leftRaw = (totalLeft / total) * 100;
    const centerRaw = (totalCenter / total) * 100;
    const rightRaw = (totalRight / total) * 100;

    // Rotunjire inițială
    let left = Math.floor(leftRaw);
    let center = Math.floor(centerRaw);
    let right = Math.floor(rightRaw);

    // Calculează restul pentru a ajunge la 100%
    const remainder = 100 - (left + center + right);

    // Distribuie restul celor cu cea mai mare parte fracționară
    const fractions = [
        { key: 'left', fraction: leftRaw - left },
        { key: 'center', fraction: centerRaw - center },
        { key: 'right', fraction: rightRaw - right },
    ].sort((a, b) => b.fraction - a.fraction);

    for (let i = 0; i < remainder; i++) {
        const key = fractions[i % 3].key;
        if (key === 'left') left++;
        else if (key === 'center') center++;
        else right++;
    }

    return { left, center, right };
}

/**
 * Grupează știrile similare folosind un algoritm hibrid: 
 * Jaccard (cuvinte) + Entity matching + Context (bigrame).
 */
function findSimilarStories(news: RSSNewsItem[], threshold = 0.22, maxTimeDiffMs = 48 * 60 * 60 * 1000): Map<string, RSSNewsItem[]> {
    const stopwords = new Set(['care', 'fost', 'este', 'sunt', 'după', 'pentru', 'prin', 'aceasta', 'acest', 'cele', 'această', 'către', 'după', 'până', 'decât', 'atunci']);

    const extractEntities = (title: string) => {
        return title.split(/\s+/)
            .filter(w => w.length > 3 && /^[A-Z]/.test(w))
            .map(w => normalizeTitle(w));
    };

    const itemData = news.map(item => {
        const normalized = normalizeTitle(item.title);
        const words = normalized.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
        const bigrams = [];
        for (let i = 0; i < words.length - 1; i++) {
            bigrams.push(`${words[i]}_${words[i + 1]}`);
        }

        return {
            item,
            tokens: new Set(words),
            bigrams: new Set(bigrams),
            entities: new Set(extractEntities(item.title)),
            time: new Date(item.pubDate).getTime(),
        };
    });

    const storyGroups = new Map<string, RSSNewsItem[]>();
    const processed = new Set<string>();

    itemData.forEach((dataI, i) => {
        if (processed.has(dataI.item.id)) return;

        const group: RSSNewsItem[] = [dataI.item];
        processed.add(dataI.item.id);

        for (let j = i + 1; j < itemData.length; j++) {
            const dataJ = itemData[j];
            if (processed.has(dataJ.item.id)) continue;
            if (dataI.item.source.id === dataJ.item.source.id) continue;

            if (Math.abs(dataI.time - dataJ.time) > maxTimeDiffMs) continue;

            // 1. Similitudine Cuvinte
            const intersectWords = new Set([...dataI.tokens].filter(x => dataJ.tokens.has(x)));
            const unionWords = new Set([...dataI.tokens, ...dataJ.tokens]);
            const wordScore = intersectWords.size / (unionWords.size || 1);

            // 2. Similitudine Entități
            const intersectEntities = new Set([...dataI.entities].filter(x => dataJ.entities.has(x)));
            const entityScore = intersectEntities.size > 0 ?
                intersectEntities.size / (Math.max(dataI.entities.size, dataJ.entities.size) || 1) : 0;

            // 3. Similitudine Bigrame
            const intersectBigrams = new Set([...dataI.bigrams].filter(x => dataJ.bigrams.has(x)));
            const bigramScore = intersectBigrams.size > 0 ?
                intersectBigrams.size / (Math.max(dataI.bigrams.size, dataJ.bigrams.size) || 1) : 0;

            // Pondere crescută pentru cuvinte și bigrame pentru a evita potriviri doar pe o singură entitate generică (ex: "România")
            const finalScore = (wordScore * 0.45) + (entityScore * 0.35) + (bigramScore * 0.2);

            // Threshold mai strict
            const baseThreshold = 0.28;

            // Dacă au entități comune, threshold-ul poate fi puțin mai mic, dar nu exagerat
            const hasSharedSignificantEntities = intersectEntities.size >= 2 ||
                (intersectEntities.size === 1 && wordScore > 0.15);

            const effectiveThreshold = hasSharedSignificantEntities ? baseThreshold * 0.85 : baseThreshold;

            if (finalScore >= effectiveThreshold) {
                group.push(dataJ.item);
                processed.add(dataJ.item.id);
            }
        }

        storyGroups.set(`story-${dataI.item.id}`, group);
    });

    return storyGroups;
}

/**
 * Calculează similaritatea între două titluri (simplificat - bazat pe cuvinte comune)
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
    const words1 = normalizeTitle(title1).split(/\s+/);
    const words2 = normalizeTitle(title2).split(/\s+/);

    // Exclude cuvinte comune/stopwords din română
    const stopwords = new Set(['de', 'la', 'în', 'și', 'a', 'pe', 'cu', 'din', 'pentru', 'un', 'o', 'că', 'care', 'să']);

    const set1 = new Set(words1.filter(w => w.length > 2 && !stopwords.has(w)));
    const set2 = new Set(words2.filter(w => w.length > 2 && !stopwords.has(w)));

    if (set1.size === 0 || set2.size === 0) return 0;

    let intersection = 0;
    set1.forEach(word => {
        if (set2.has(word)) intersection++;
    });

    // Jaccard similarity
    const union = set1.size + set2.size - intersection;
    return intersection / union;
}

/**
 * Normalizează un titlu pentru comparație
 */
function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Elimină diacriticele
        .replace(/[^\w\s]/g, '')
        .trim();
}

/**
 * Agregă știrile într-o listă de povești
 */
function filterRecentNews(news: RSSNewsItem[]): RSSNewsItem[] {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 zile
    return news.filter(item => {
        const date = new Date(item.pubDate).getTime();
        return isNaN(date) || date > cutoff;
    });
}

// Client-side fallback uses a lower threshold (2) because CORS proxies
// fetch fewer sources than the server — show something rather than nothing.
// The server API already enforces 3 sources on the fast path.
const MIN_SOURCES_THRESHOLD = 2;

export function aggregateNews(news: RSSNewsItem[]): AggregatedStory[] {
    const storyGroups = findSimilarStories(filterRecentNews(news));
    const aggregatedStories: AggregatedStory[] = [];

    storyGroups.forEach((sources) => {
        if (sources.length < MIN_SOURCES_THRESHOLD) return;
        // Ia prima știre ca reprezentativă (cea cu cea mai devreme publicare)
        const primary = sources.reduce((earliest, current) => {
            const earliestDate = new Date(earliest.pubDate).getTime();
            const currentDate = new Date(current.pubDate).getTime();
            return currentDate > earliestDate ? current : earliest;
        });

        // Preferă o imagine de la o sursă care are imagine și are factuality ridicată
        const imageSource = sources.find(s => s.imageUrl && s.source.factuality === 'high') ||
            sources.find(s => s.imageUrl) ||
            primary;

        const bias = calculateBiasDistribution(sources);

        // Calculează blindspot
        let blindspot: 'left' | 'right' | 'none' = 'none';
        if (sources.length >= 3) {
            if (bias.left < 8 && bias.right > 25) blindspot = 'left';
            else if (bias.right < 8 && bias.left > 25) blindspot = 'right';
        }

        aggregatedStories.push({
            id: createStoryIdFromSources(sources),
            title: primary.title,
            description: primary.description,
            image: imageSource.imageUrl,
            sources,
            sourcesCount: sources.length,
            bias,
            blindspot,
            mainCategory: primary.category || 'Actualitate',
            publishedAt: new Date(primary.pubDate),
            timeAgo: getTimeAgo(primary.pubDate),
        });
    });

    // Sort: coverage-first cu freshness decay
    // score = sourcesCount × e^(-hoursOld / 18)
    const now = Date.now();
    aggregatedStories.sort((a, b) => {
        const hoursA = (now - a.publishedAt.getTime()) / 3_600_000;
        const hoursB = (now - b.publishedAt.getTime()) / 3_600_000;
        const scoreA = Math.pow(a.sourcesCount, 1.5) * Math.exp(-hoursA / 18);
        const scoreB = Math.pow(b.sourcesCount, 1.5) * Math.exp(-hoursB / 18);
        return scoreB - scoreA;
    });

    return aggregatedStories;
}

/**
 * Obține primele N știri de la o sursă specifică
 */
export async function fetchNewsFromSource(sourceId: string, limit = 10): Promise<RSSNewsItem[]> {
    const source = NEWS_SOURCES.find(s => s.id === sourceId);
    if (!source) return [];

    const news = await fetchRSSFeed(source);
    return news.slice(0, limit);
}

/**
 * Obține știrile grupate și agregate - cu cache pentru încărcare instant
 */
export async function getAggregatedNews(limit = 20): Promise<AggregatedStory[]> {
    const { news } = await fetchNewsWithCache();
    const aggregated = aggregateNews(news);
    // Salvează rezultatul agregat pentru acces instant la următoarea vizită
    saveAggregatedToCache(aggregated);
    return aggregated.slice(0, limit);
}

/**
 * Obține știri din cache sincron (pentru SSR/instant display).
 * Folosește cache-ul de știri agregate direct, fără a re-rula agregarea.
 */
export function getCachedAggregatedNews(limit = 20): AggregatedStory[] | null {
    // Încearcă mai întâi cache-ul de știri agregate (mult mai rapid)
    const aggregatedCache = loadAggregatedFromCache();
    if (aggregatedCache && aggregatedCache.length > 0) {
        return aggregatedCache.slice(0, limit);
    }

    // Fallback: re-agregare din cache-ul brut
    const cachedNews = loadFromCache();
    if (!cachedNews || cachedNews.length === 0) return null;
    const aggregated = aggregateNews(cachedNews);
    return aggregated.slice(0, limit);
}
