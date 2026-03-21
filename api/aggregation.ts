import { RSSNewsItem, BiasAnalysis, BIAS_WEIGHT_MAP } from './shared.js';
import { createStoryId } from './storyId.js';
import { generateAggregatedTitle } from './llm.js';

async function fetchOgImage(url: string): Promise<string> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; thesite-bot/1.0)' },
        });
        clearTimeout(timeout);
        if (!res.ok) return '';
        const html = await res.text();
        const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        return match?.[1] || '';
    } catch {
        return '';
    }
}

function pickPrimarySource(sources: RSSNewsItem[]): RSSNewsItem {
    return sources.reduce((latest, current) => {
        return new Date(current.pubDate).getTime() > new Date(latest.pubDate).getTime() ? current : latest;
    });
}

export async function resolveStoryImageFromSources(sources: RSSNewsItem[]): Promise<string | undefined> {
    if (sources.length === 0) return undefined;

    const primary = pickPrimarySource(sources);
    const imageSource = sources.find(s => s.imageUrl) || primary;
    let resolvedImage = imageSource.imageUrl;

    if (!resolvedImage) {
        const candidateUrls = [primary.link, ...sources.map(s => s.link)].filter(Boolean);
        for (const url of candidateUrls.slice(0, 3)) {
            resolvedImage = await fetchOgImage(url);
            if (resolvedImage) break;
        }
    }

    return resolvedImage;
}

export interface AggregatedStory {
    id: string;
    title: string; // The aggregated title
    description: string;
    image?: string;
    sources: RSSNewsItem[];
    sourcesCount: number;
    bias: { left: number; center: number; right: number };
    contentBias?: BiasAnalysis;
    blindspot?: 'left' | 'right' | 'none';
    mainCategory: string;
    publishedAt: string;
    timeAgo: string;
}

export function getTimeAgo(pubDate: string): string {
    const now = new Date();
    const published = new Date(pubDate);
    if (isNaN(published.getTime())) return '';
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

export function calculateBlindspot(bias: { left: number; center: number; right: number }, sourcesCount: number): 'left' | 'right' | 'none' {
    // Only flag blindspots for stories with a decent amount of coverage (at least 3 sources)
    if (sourcesCount < 3) return 'none';

    // If Left is missing or very low while other sides are present
    if (bias.left < 8 && (bias.right > 25)) return 'left';
    
    // If Right is missing or very low while other sides are present
    if (bias.right < 8 && (bias.left > 25)) return 'right';

    return 'none';
}

export function calculateBiasDistribution(sources: RSSNewsItem[]): { left: number; center: number; right: number } {
    if (sources.length === 0) return { left: 33, center: 34, right: 33 };

    let totalLeft = 0, totalCenter = 0, totalRight = 0;

    sources.forEach(item => {
        const weights = BIAS_WEIGHT_MAP[item.source.bias] || BIAS_WEIGHT_MAP['center'];
        totalLeft += weights.left;
        totalCenter += weights.center;
        totalRight += weights.right;
    });

    const total = totalLeft + totalCenter + totalRight;
    const rawLeft = (totalLeft / total) * 100;
    const rawCenter = (totalCenter / total) * 100;
    const rawRight = (totalRight / total) * 100;

    const left = Math.floor(rawLeft);
    let center = Math.floor(rawCenter);
    const right = Math.floor(rawRight);

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

function filterRecentNews(news: RSSNewsItem[]): RSSNewsItem[] {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 zile
    return news.filter(item => {
        const date = new Date(item.pubDate).getTime();
        return isNaN(date) || date > cutoff;
    });
}

// Clusterizare avansată Ground News style
export function findSimilarStories(news: RSSNewsItem[], threshold = 0.32, maxTimeDiffMs = 48 * 60 * 60 * 1000): RSSNewsItem[][] {
    const stopwords = new Set([
        'care', 'fost', 'este', 'sunt', 'după', 'pentru', 'prin', 'aceasta', 'acest', 'cele', 'această', 'către', 'după', 'până', 'decât', 'atunci', 'întreg', 'când', 'cum', 'dacă', 'doar', 'după', 'unde', 'nici', 'acestuia', 'acestea', 'acele',
        'și', 'sau', 'dar', 'iar', 'încă', 'tot', 'mai', 'chiar', 'atât', 'încât', 'deci', 'însă', 'ori', 'fie', 'nici',
        'un', 'o', 'unui', 'unei', 'unor', 'niște', 'al', 'ai', 'ale', 'lor', 'lui', 'ei', 'nostru', 'vostru', 'său', 'sa',
        'pe', 'la', 'în', 'din', 'de', 'cu', 'spre', 'prin', 'sub', 'peste', 'între', 'fără', 'contra', 'asupra', 'împotriva',
        'cine', 'ce', 'care', 'cineva', 'ceva', 'oricine', 'orice', 'nimeni', 'nimic', 'unde', 'când', 'cum', 'cât', 'câți', 'câte',
        'eu', 'tu', 'el', 'ea', 'noi', 'voi', 'ei', 'ele', 'mie', 'ție', 'îi', 'îl', 'le', 'ne', 'vă', 'l-a', 's-a'
    ]);

    const genericEntities = new Set([
        'foto', 'video', 'romania', 'astazi', 'ieri', 'maine', 'azi', 'update', 'breaking', 'news',
        'bucuresti', 'echipa', 'oficial', 'surse', 'ziua', 'lumea', 'omul', 'femeia', 'copilul',
        'tara', 'guvernul', 'premierul', 'presedintele'
    ]);

    const extractEntities = (title: string) => {
        return title.split(/\s+/)
            .filter(w => w.length > 3 && /^[^\p{L}]*\p{Lu}/u.test(w))
            .map(w => normalizeTitle(w))
            .filter(w => !genericEntities.has(w));
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

    const groups: RSSNewsItem[][] = [];
    const processed = new Set<string>();

    itemData.forEach((dataI, i) => {
        if (processed.has(dataI.item.id)) return;

        const group: RSSNewsItem[] = [dataI.item];
        processed.add(dataI.item.id);

        for (let j = i + 1; j < itemData.length; j++) {
            const dataJ = itemData[j];
            if (processed.has(dataJ.item.id)) continue;
            if (Math.abs(dataI.time - dataJ.time) > maxTimeDiffMs) continue;

            const intersectWords = new Set([...dataI.tokens].filter(x => dataJ.tokens.has(x)));
            const wordScore = intersectWords.size / (Math.min(dataI.tokens.size, dataJ.tokens.size) || 1);

            const intersectEntities = new Set([...dataI.entities].filter(x => dataJ.entities.has(x)));
            const entityScore = intersectEntities.size > 0
                ? intersectEntities.size / (Math.max(dataI.entities.size, dataJ.entities.size) || 1)
                : 0;

            const intersectBigrams = new Set([...dataI.bigrams].filter(x => dataJ.bigrams.has(x)));
            const bigramScore = intersectBigrams.size > 0
                ? intersectBigrams.size / (Math.max(dataI.bigrams.size, dataJ.bigrams.size) || 1)
                : 0;

            let finalScore = (wordScore * 0.45) + (entityScore * 0.35) + (bigramScore * 0.2);

            if (dataI.entities.size > 0 && dataJ.entities.size > 0) {
                const uniqueToI = [...dataI.entities].filter(e => !dataJ.entities.has(e));
                const uniqueToJ = [...dataJ.entities].filter(e => !dataI.entities.has(e));

                if (uniqueToI.length >= 1 && uniqueToJ.length >= 1 && intersectEntities.size === 0) {
                    finalScore *= 0.5;
                }
            }

            const hasSignificantOverlap = intersectEntities.size >= 2 ||
                (intersectEntities.size === 1 && wordScore > 0.4);
            const effectiveThreshold = hasSignificantOverlap ? threshold * 0.8 : threshold;

            if (finalScore >= effectiveThreshold) {
                group.push(dataJ.item);
                processed.add(dataJ.item.id);
            }
        }

        groups.push(group);
    });

    return groups.map(group => {
        const seen = new Set<string>();
        return group.filter(item => {
            if (seen.has(item.source.id)) return false;
            seen.add(item.source.id);
            return true;
        });
    });
}

/** Run tasks in sequential batches to avoid hitting provider RPM limits. */
async function runInBatches<T>(tasks: Array<() => Promise<T>>, batchSize: number): Promise<T[]> {
    const results: T[] = [];
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(task => task()));
        results.push(...batchResults);
    }
    return results;
}

// Max stories that receive an LLM-generated title per request.
// Keeps total LLM time ≤ 2 × batch-round × ~2s ≈ 4s, well within Vercel's 10s limit.
const MAX_LLM_STORIES = 16;

/**
 * Trimite un semnal către Wayback Machine pentru a arhiva URL-ul.
 * Fiind un proces extern, nu așteptăm răspunsul pentru a nu bloca API-ul.
 */
function triggerWaybackArchive(url: string) {
    try {
        // Folosim un fetch fără await (fire and forget)
        fetch(`https://web.archive.org/save/${url}`).catch(() => {});
    } catch (e) {
        // Ignorăm erorile de rețea pentru arhivare
    }
}

export async function aggregateNewsBuildTopics(news: RSSNewsItem[], minSourcesParam: number = 3): Promise<AggregatedStory[]> {
    const recent = filterRecentNews(news);
    
    // Declanșăm arhivarea pentru toate știrile noi găsite în acest run
    recent.forEach(item => triggerWaybackArchive(item.link));

    const storyGroups = findSimilarStories(recent);

    const aggregatedStoryTasks: Array<() => Promise<AggregatedStory>> = [];
    const idCounts = new Map<string, number>();
    let taskIndex = 0;

    storyGroups.forEach((sources) => {
        if (sources.length < minSourcesParam) return;

        const useLlm = taskIndex < MAX_LLM_STORIES;
        taskIndex++;

        const promise = async () => {
            const primary = pickPrimarySource(sources);
            // OG image fetching deferred to /api/story (lazy, per-story, cached).
            // Using only images already embedded in RSS feeds keeps aggregation fast.
            const resolvedImage = sources.find(s => s.imageUrl)?.imageUrl;

            // Generate Title via LLM only for top stories; rest use best-source fallback.
            const aggregatedTitle = useLlm
                ? await generateAggregatedTitle(sources)
                : (sources.sort((a, b) => {
                      const order = { high: 2, mixed: 1, low: 0 } as Record<string, number>;
                      return (order[b.source.factuality] ?? 0) - (order[a.source.factuality] ?? 0);
                  })[0]?.title ?? primary.title);

            let contentBias: BiasAnalysis | undefined;
            const sourcesWithBias = sources.filter(s => s.biasAnalysis);

            if (sourcesWithBias.length > 0) {
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

            const baseId = createStoryId(sources);
            const count = (idCounts.get(baseId) || 0) + 1;
            idCounts.set(baseId, count);
            const storyId = count === 1 ? baseId : `${baseId}-${count}`;

            const bias = calculateBiasDistribution(sources);
            const blindspot = calculateBlindspot(bias, sources.length);

            return {
                id: storyId,
                title: aggregatedTitle,
                description: primary.description,
                image: resolvedImage,
                sources,
                sourcesCount: sources.length,
                bias,
                contentBias,
                blindspot,
                mainCategory: primary.category || 'Actualitate',
                publishedAt: primary.pubDate,
                timeAgo: getTimeAgo(primary.pubDate),
            };
        };

        aggregatedStoryTasks.push(promise);
    });

    // LLM tasks (first MAX_LLM_STORIES) run in batches of 8 to respect RPM limits.
    // No-LLM tasks (beyond cap) run in parallel since they are instant (no API calls).
    const llmTasks = aggregatedStoryTasks.slice(0, MAX_LLM_STORIES);
    const noLlmTasks = aggregatedStoryTasks.slice(MAX_LLM_STORIES);

    const [llmStories, noLlmStories] = await Promise.all([
        runInBatches(llmTasks, 8),
        Promise.all(noLlmTasks.map(t => t())),
    ]);
    const aggregatedStories = [...llmStories, ...noLlmStories];

    // Sort: coverage-first cu freshness decay
    // score = sourcesCount × e^(-hoursOld / 18)
    // O știre cu mai multe surse rămâne sus ~18h înainte ca una mai proaspătă să o depășească
    const now = Date.now();
    aggregatedStories.sort((a, b) => {
        const hoursA = (now - new Date(a.publishedAt).getTime()) / 3_600_000;
        const hoursB = (now - new Date(b.publishedAt).getTime()) / 3_600_000;
        const scoreA = Math.pow(a.sourcesCount, 1.5) * Math.exp(-hoursA / 18);
        const scoreB = Math.pow(b.sourcesCount, 1.5) * Math.exp(-hoursB / 18);
        return scoreB - scoreA;
    });

    return aggregatedStories;
}
