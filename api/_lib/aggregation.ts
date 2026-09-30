import { RSSNewsItem, BiasAnalysis, BIAS_WEIGHT_MAP, shouldFilterNews } from './shared.js';
import { createStoryId } from './storyId.js';
import { clusterArticles, DEFAULT_CLUSTER_THRESHOLD } from './clustering.js';
import { fallbackHeadline, generateHeadline, getEmbeddingsBatch, llmHeadlinesAvailable } from './llm.js';
import { matchStories } from './storyMatch.js';

const ogImageCache = new Map<string, { image: string; expires: number }>();
const OG_CACHE_TTL = 30 * 60 * 1000; // 30 min cache

async function fetchOgImage(url: string): Promise<string> {
    if (!url) return '';
    const cached = ogImageCache.get(url);
    if (cached && cached.expires > Date.now()) {
        return cached.image;
    }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; thesite-bot/1.0)' },
        });
        clearTimeout(timeout);
        if (!res.ok) return '';
        const html = await res.text();
        const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        const image = match?.[1] || '';
        ogImageCache.set(url, { image, expires: Date.now() + OG_CACHE_TTL });
        if (ogImageCache.size > 1200) {
            const first = ogImageCache.keys().next().value;
            if (first) ogImageCache.delete(first);
        }
        return image;
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
    /**
     * How the current title was produced: for how many sources, and whether an LLM wrote it.
     * Lets later refreshes keep the title instead of regenerating it every run.
     */
    titleBasis?: TitleBasis;
}

export interface TitleBasis {
    sourcesCount: number;
    generated: boolean;
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
        const weights = item.source.customWeights || BIAS_WEIGHT_MAP[item.source.bias] || BIAS_WEIGHT_MAP['center'];
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

function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let k = 0; k < a.length; k++) {
        dot += a[k] * b[k];
        normA += a[k] * a[k];
        normB += b[k] * b[k];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

/**
 * Obține embeddings pentru o listă de titluri, în chunk-uri de 96
 * pentru a respecta limitele Groq. Returnează null dacă API-ul nu e disponibil.
 */
async function getEmbeddingsSafe(titles: string[]): Promise<number[][] | null> {
    const CHUNK_SIZE = 96;
    const allEmbeddings: number[][] = [];
    for (let i = 0; i < titles.length; i += CHUNK_SIZE) {
        const chunk = titles.slice(i, i + CHUNK_SIZE);
        const result = await getEmbeddingsBatch(chunk);
        if (!result) return null; // dacă un chunk eșuează, dezactivăm semantic complet
        allEmbeddings.push(...result);
    }
    return allEmbeddings;
}

function filterRecentNews(news: RSSNewsItem[]): RSSNewsItem[] {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 zile
    return news.filter(item => {
        const date = new Date(item.pubDate).getTime();
        if (!isNaN(date) && date <= cutoff) return false;
        if (shouldFilterNews(item.title, item.description ?? '', item.link)) return false;
        return true;
    });
}

/**
 * Groups articles about the same event across outlets (see ./clustering.ts for the algorithm).
 * Order-independent; at most one article per outlet per group; single-article groups included.
 * The Groq embedding layer, when available, keeps its semantics: cosine >= 0.78 links two
 * articles, < 0.52 dampens a lexical match.
 */
export async function findSimilarStories(news: RSSNewsItem[], threshold = DEFAULT_CLUSTER_THRESHOLD, maxTimeDiffMs = 48 * 60 * 60 * 1000): Promise<RSSNewsItem[][]> {
    const embeddings = await getEmbeddingsSafe(news.map(item => item.title));
    return clusterArticles(news, { threshold, maxTimeDiffMs, embeddings });
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
// llama-3.1-8b-instant e ~0.3-0.5s/call → 30 stories în batch 10 = 3 runde ≈ 1.5s.
// Embeddings adaugă ~1.5s → total ~3s, bine sub limita Vercel de 10s.
// Stories that keep their previous headline do not count (see planHeadlines).
const MAX_LLM_STORIES = 30;

/**
 * Ranking used for the feed: coverage first, with a freshness decay.
 * score = sourcesCount^1.5 × e^(-hoursOld / 18)
 */
export function storyScore(sourcesCount: number, publishedAt: string, now = Date.now()): number {
    const hours = (now - new Date(publishedAt).getTime()) / 3_600_000;
    return Math.pow(sourcesCount, 1.5) * Math.exp(-(Number.isNaN(hours) ? 0 : hours) / 18);
}

/** A story's headline is rewritten only once it has at least doubled (and grown by 3+ sources). */
export function headlineOutgrown(basis: TitleBasis, sourcesCount: number): boolean {
    return sourcesCount >= 2 * basis.sourcesCount && sourcesCount - basis.sourcesCount >= 3;
}

interface HeadlinePlan {
    /** Title (and basis) of the matching story from the previous refresh, if any. */
    previous?: { title: string; titleBasis: TitleBasis };
    /** Keep the previous title as is. */
    keep: boolean;
    /** Ask the LLM for a (new) headline. */
    useLlm: boolean;
}

/**
 * Decides per story whether to keep the previous refresh's headline, ask the LLM, or use the
 * fallback. Headlines stay put while a story grows modestly, so the title users (and social
 * posts) saw does not churn every 15 minutes, and LLM calls go only to new or outgrown stories,
 * most important first.
 */
export function planHeadlines(groups: RSSNewsItem[][], previous: AggregatedStory[], now = Date.now()): HeadlinePlan[] {
    const matches = matchStories(groups.map(sources => ({ sources })), previous);
    const llmAvailable = llmHeadlinesAvailable();
    const order = groups
        .map((sources, i) => ({ i, score: storyScore(sources.length, pickPrimarySource(sources).pubDate, now) }))
        .sort((a, b) => b.score - a.score || a.i - b.i);

    const plans: HeadlinePlan[] = new Array(groups.length);
    let budget = MAX_LLM_STORIES;
    for (const { i } of order) {
        const sourcesCount = groups[i].length;
        const match = matches.get(i);
        const prev = match === undefined ? undefined : previous[match];
        if (prev?.title) {
            // Stories cached before titleBasis existed: assume their title fit their size then.
            const titleBasis = prev.titleBasis ?? { sourcesCount: prev.sourcesCount, generated: true };
            const wantsNew = headlineOutgrown(titleBasis, sourcesCount) || (!titleBasis.generated && llmAvailable);
            const useLlm = wantsNew && budget > 0;
            if (useLlm) budget--;
            plans[i] = { previous: { title: prev.title, titleBasis }, keep: !useLlm, useLlm };
        } else {
            const useLlm = budget > 0;
            if (useLlm) budget--;
            plans[i] = { keep: false, useLlm };
        }
    }
    return plans;
}

async function resolveHeadline(sources: RSSNewsItem[], plan: HeadlinePlan): Promise<{ title: string; titleBasis: TitleBasis }> {
    if (plan.keep && plan.previous) return plan.previous;
    if (plan.useLlm) {
        const { title, generated } = await generateHeadline(sources);
        // A failed regeneration must not replace a good headline with the fallback one.
        if (!generated && plan.previous) return plan.previous;
        return { title, titleBasis: { sourcesCount: sources.length, generated } };
    }
    return { title: fallbackHeadline(sources), titleBasis: { sourcesCount: sources.length, generated: false } };
}

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

/**
 * @param previous stories from the previous refresh (the cache). A fresh story that continues one
 *   of them keeps its headline unless it grew a lot (see planHeadlines). Optional.
 */
export async function aggregateNewsBuildTopics(news: RSSNewsItem[], minSourcesParam: number = 3, previous: AggregatedStory[] = []): Promise<AggregatedStory[]> {
    const recent = filterRecentNews(news);
    
    // Declanșăm arhivarea pentru toate știrile noi găsite în acest run
    recent.forEach(item => triggerWaybackArchive(item.link));

    const storyGroups = (await findSimilarStories(recent)).filter(sources => sources.length >= minSourcesParam);
    const headlinePlans = planHeadlines(storyGroups, previous);

    const aggregatedStoryTasks: Array<() => Promise<AggregatedStory>> = [];
    const usesLlm: boolean[] = [];
    const idCounts = new Map<string, number>();

    storyGroups.forEach((sources, groupIndex) => {
        const plan = headlinePlans[groupIndex];

        // Ids are assigned here, synchronously and in the clusterer's deterministic order, so a
        // rare base-id collision always gives the same story the "-2" suffix.
        const baseId = createStoryId(sources);
        const count = (idCounts.get(baseId) || 0) + 1;
        idCounts.set(baseId, count);
        const storyId = count === 1 ? baseId : `${baseId}-${count}`;

        const promise = async () => {
            const primary = pickPrimarySource(sources);
            // OG image fetching deferred to /api/story (lazy, per-story, cached).
            // Using only images already embedded in RSS feeds keeps aggregation fast.
            const resolvedImage = sources.find(s => s.imageUrl)?.imageUrl;

            // Previous headline, a new LLM headline, or the best-source fallback (see planHeadlines).
            const { title: aggregatedTitle, titleBasis } = await resolveHeadline(sources, plan);

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
                titleBasis,
            };
        };

        aggregatedStoryTasks.push(promise);
        usesLlm.push(plan.useLlm);
    });

    // LLM tasks (at most MAX_LLM_STORIES) run in batches of 10 to respect RPM limits.
    // No-LLM tasks run in parallel since they are instant (no API calls).
    const llmTasks = aggregatedStoryTasks.filter((_, i) => usesLlm[i]);
    const noLlmTasks = aggregatedStoryTasks.filter((_, i) => !usesLlm[i]);

    const [llmStories, noLlmStories] = await Promise.all([
        runInBatches(llmTasks, 10),
        Promise.all(noLlmTasks.map(t => t())),
    ]);
    const aggregatedStories = [...llmStories, ...noLlmStories];

    // Sort: coverage-first cu freshness decay (storyScore)
    // O știre cu mai multe surse rămâne sus ~18h înainte ca una mai proaspătă să o depășească
    const now = Date.now();
    aggregatedStories.sort((a, b) => storyScore(b.sourcesCount, b.publishedAt, now) - storyScore(a.sourcesCount, a.publishedAt, now));

    return aggregatedStories;
}
