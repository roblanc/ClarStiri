import { RSSNewsItem, AggregatedStory, NEWS_SOURCES, BIAS_WEIGHT_MAP, NewsSource } from '@/types/news';

// CORS proxy pentru a accesa RSS feeds din browser
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Parsează un XML RSS feed în obiecte JavaScript
 */
function parseRSSXML(xmlString: string, source: NewsSource): RSSNewsItem[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const items = xmlDoc.querySelectorAll('item');
    const newsItems: RSSNewsItem[] = [];

    items.forEach((item, index) => {
        const title = item.querySelector('title')?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
        const description = item.querySelector('description')?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
        const link = item.querySelector('link')?.textContent?.trim() || '';
        const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
        const author = item.querySelector('creator')?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ||
            item.querySelector('author')?.textContent?.trim();

        // Extrage categoria
        const categoryEl = item.querySelector('category');
        const category = categoryEl?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, '').trim();

        // Extrage imaginea din enclosure sau media:content
        let imageUrl = item.querySelector('enclosure')?.getAttribute('url') || '';
        if (!imageUrl) {
            const mediaContent = item.querySelector('content');
            imageUrl = mediaContent?.getAttribute('url') || '';
        }
        // Fallback: caută în description pentru taguri img
        if (!imageUrl && description) {
            const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
            imageUrl = imgMatch?.[1] || '';
        }

        if (title && link) {
            newsItems.push({
                id: `${source.id}-${index}-${Date.now()}`,
                title,
                description: stripHtml(description),
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

/**
 * Elimină tagurile HTML dintr-un string
 */
function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Fetch RSS feed de la o sursă
 */
async function fetchRSSFeed(source: NewsSource): Promise<RSSNewsItem[]> {
    try {
        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(source.rssUrl)}`, {
            headers: {
                'Accept': 'application/rss+xml, application/xml, text/xml',
            },
        });

        if (!response.ok) {
            console.warn(`Failed to fetch RSS from ${source.name}: ${response.status}`);
            return [];
        }

        const xmlText = await response.text();
        return parseRSSXML(xmlText, source);
    } catch (error) {
        console.error(`Error fetching RSS from ${source.name}:`, error);
        return [];
    }
}

/**
 * Fetch toate știrile de la toate sursele
 */
export async function fetchAllNews(): Promise<RSSNewsItem[]> {
    const allPromises = NEWS_SOURCES.map(source => fetchRSSFeed(source));
    const results = await Promise.allSettled(allPromises);

    const allNews: RSSNewsItem[] = [];

    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            allNews.push(...result.value);
        }
    });

    // Sortează după data publicării (cele mai recente primele)
    allNews.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        return dateB - dateA;
    });

    return allNews;
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
    let remainder = 100 - (left + center + right);

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
 * Grupează știrile similare într-o poveste agregată
 * Folosește similaritatea titlurilor pentru a detecta aceeași știre de la surse diferite
 */
function findSimilarStories(news: RSSNewsItem[], threshold = 0.4): Map<string, RSSNewsItem[]> {
    const storyGroups = new Map<string, RSSNewsItem[]>();
    const processed = new Set<string>();

    news.forEach((item) => {
        if (processed.has(item.id)) return;

        // Creează un grup pentru această știre
        const group: RSSNewsItem[] = [item];
        processed.add(item.id);

        // Caută știri similare
        news.forEach((other) => {
            if (processed.has(other.id)) return;
            if (item.source.id === other.source.id) return; // Nu grupa de la aceeași sursă

            const similarity = calculateTitleSimilarity(item.title, other.title);

            if (similarity >= threshold) {
                group.push(other);
                processed.add(other.id);
            }
        });

        // Generează un ID pentru grup bazat pe primul titlu
        const groupId = `story-${item.id}`;
        storyGroups.set(groupId, group);
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
export function aggregateNews(news: RSSNewsItem[]): AggregatedStory[] {
    const storyGroups = findSimilarStories(news);
    const aggregatedStories: AggregatedStory[] = [];

    storyGroups.forEach((sources, groupId) => {
        // Ia prima știre ca reprezentativă (cea cu cea mai devreme publicare)
        const primary = sources.reduce((earliest, current) => {
            const earliestDate = new Date(earliest.pubDate).getTime();
            const currentDate = new Date(current.pubDate).getTime();
            return currentDate > earliestDate ? current : earliest;
        });

        // Preferă o imagine de la o sursă care are imagine
        const imageSource = sources.find(s => s.imageUrl) || primary;

        aggregatedStories.push({
            id: groupId,
            title: primary.title,
            description: primary.description,
            image: imageSource.imageUrl,
            sources,
            sourcesCount: sources.length,
            bias: calculateBiasDistribution(sources),
            mainCategory: primary.category || 'Actualitate',
            publishedAt: new Date(primary.pubDate),
            timeAgo: getTimeAgo(primary.pubDate),
        });
    });

    // Sortează după numărul de surse (cele mai populare primele)
    aggregatedStories.sort((a, b) => {
        // Prioritizează știrile cu mai multe surse
        if (b.sourcesCount !== a.sourcesCount) {
            return b.sourcesCount - a.sourcesCount;
        }
        // La număr egal de surse, sortează după dată
        return b.publishedAt.getTime() - a.publishedAt.getTime();
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
 * Obține știrile grupate și agregate
 */
export async function getAggregatedNews(limit = 20): Promise<AggregatedStory[]> {
    const allNews = await fetchAllNews();
    const aggregated = aggregateNews(allNews);
    return aggregated.slice(0, limit);
}
