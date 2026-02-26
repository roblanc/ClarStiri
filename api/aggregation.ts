import { RSSNewsItem, BiasAnalysis, BIAS_WEIGHT_MAP } from './shared.js';
import { createStoryId } from './storyId.js';
import { generateAggregatedTitle } from './llm.js';

export interface AggregatedStory {
    id: string;
    title: string; // The aggregated title
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

// Clusterizare Ground News style
export function findSimilarStories(news: RSSNewsItem[], threshold = 0.25, maxTimeDiffMs = 48 * 60 * 60 * 1000): RSSNewsItem[][] {
    const stopwords = new Set(['de', 'la', 'in', 'si', 'a', 'pe', 'cu', 'din', 'pentru', 'un', 'o', 'ca', 'care', 'sa', 'este', 'sunt', 'din', 'spre']);

    // Sort cronologic descrescator (cel mai nou primul)
    const sortedNews = [...news].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    const itemTokens: Array<{ item: RSSNewsItem; tokens: Set<string>; time: number }> = sortedNews.map(item => ({
        item,
        tokens: new Set(
            normalizeTitle(item.title)
                .split(/\s+/)
                .filter(w => w.length > 2 && !stopwords.has(w))
        ),
        time: new Date(item.pubDate).getTime(),
    }));

    const invertedIndex = new Map<string, number[]>();
    itemTokens.forEach(({ tokens }, idx) => {
        tokens.forEach(token => {
            const list = invertedIndex.get(token);
            if (list) list.push(idx);
            else invertedIndex.set(token, [idx]);
        });
    });

    const groups: RSSNewsItem[][] = [];
    const processed = new Set<number>();

    itemTokens.forEach(({ item, tokens, time }, i) => {
        if (processed.has(i)) return;

        const group: RSSNewsItem[] = [item];
        processed.add(i);

        const candidateOverlap = new Map<number, number>();
        tokens.forEach(token => {
            invertedIndex.get(token)?.forEach(j => {
                if (j !== i) candidateOverlap.set(j, (candidateOverlap.get(j) || 0) + 1);
            });
        });

        candidateOverlap.forEach((overlap, j) => {
            if (processed.has(j)) return;
            const { item: other, tokens: otherTokens, time: otherTime } = itemTokens[j];

            // Prevent clustering duplicate sources in same topic directly if possible, or allow it but filter later.
            // We allow clustering but we enforce maxTimeDiffMs and similarity.
            if (isNaN(time) || isNaN(otherTime) || Math.abs(time - otherTime) > maxTimeDiffMs) return;

            const union = tokens.size + otherTokens.size - overlap;
            if (union > 0 && overlap / union >= threshold) {
                group.push(other);
                processed.add(j);
            }
        });

        groups.push(group);
    });

    // Remove duplicates from same source in a single group (keep the first/newest one)
    const cleanGroups = groups.map(group => {
        const seenSources = new Set<string>();
        return group.filter(item => {
            if (seenSources.has(item.source.id)) return false;
            seenSources.add(item.source.id);
            return true;
        });
    });

    return cleanGroups;
}

export async function aggregateNewsBuildTopics(news: RSSNewsItem[], minSourcesParam: number = 3): Promise<AggregatedStory[]> {
    const recent = filterRecentNews(news);
    const storyGroups = findSimilarStories(recent);

    const aggregatedStoriesPromises: Promise<AggregatedStory>[] = [];
    const idCounts = new Map<string, number>();

    storyGroups.forEach((sources) => {
        if (sources.length < minSourcesParam) return;

        const promise = async () => {
            const primary = sources.reduce((earliest, current) => {
                return new Date(current.pubDate).getTime() > new Date(earliest.pubDate).getTime() ? current : earliest;
            });

            const imageSource = sources.find(s => s.imageUrl) || primary;

            // Generate Title via LLM
            const aggregatedTitle = await generateAggregatedTitle(sources);

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

            return {
                id: storyId,
                title: aggregatedTitle,
                description: primary.description,
                image: imageSource.imageUrl,
                sources,
                sourcesCount: sources.length,
                bias: calculateBiasDistribution(sources),
                contentBias,
                mainCategory: primary.category || 'Actualitate',
                publishedAt: primary.pubDate,
                timeAgo: getTimeAgo(primary.pubDate),
            };
        };

        aggregatedStoriesPromises.push(promise());
    });

    // Execute LLM generators concurrently
    const aggregatedStories = await Promise.all(aggregatedStoriesPromises);

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
