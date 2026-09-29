import { AggregatedStory, calculateBiasDistribution, calculateBlindspot } from './aggregation.js';

/**
 * Merging a fresh aggregation run with the stories already in the cache.
 *
 * The previous rule ("same event if they share ≥1 source link", then re-add every
 * old source) let clusters snowball: a fresh cluster touching a big old one inherited
 * all of its sources, several fresh clusters could inherit the same old one, and after
 * two days a single "story" held 100+ articles about different events.
 *
 * Rules now:
 * - A fresh story matches an old one only on substantial link overlap, measured against
 *   both sides, so a small fresh cluster can no longer latch onto a bloated old one.
 * - Matching is one-to-one: each old story is inherited by at most one fresh story.
 * - Only old sources published close to the fresh cluster's time window are re-added.
 * - The matched story keeps its original id, so /stire/<id> links stay stable.
 */

const MIN_OVERLAP_OF_SMALLER = 0.5;
const MIN_OVERLAP_OF_LARGER = 0.25;
const REATTACH_WINDOW_MS = 24 * 60 * 60 * 1000;

function linkSet(story: AggregatedStory): Set<string> {
    return new Set(story.sources.map(s => s.link));
}

function overlapScore(fresh: Set<string>, existing: Set<string>): number {
    let shared = 0;
    for (const link of fresh) if (existing.has(link)) shared++;
    if (shared === 0) return 0;
    // A single shared link is only enough when one side is tiny (2-source stories).
    if (shared < 2 && Math.min(fresh.size, existing.size) > 2) return 0;
    const ofSmaller = shared / Math.min(fresh.size, existing.size);
    const ofLarger = shared / Math.max(fresh.size, existing.size);
    if (ofSmaller < MIN_OVERLAP_OF_SMALLER || ofLarger < MIN_OVERLAP_OF_LARGER) return 0;
    return shared / (fresh.size + existing.size - shared); // Jaccard, used to rank candidates
}

function timeOf(pubDate: string): number {
    const t = Date.parse(pubDate);
    return Number.isNaN(t) ? NaN : t;
}

function mergeSources(fresh: AggregatedStory, existing: AggregatedStory): AggregatedStory {
    const freshLinks = linkSet(fresh);
    const freshTimes = fresh.sources.map(s => timeOf(s.pubDate)).filter(t => !Number.isNaN(t));
    const windowStart = freshTimes.length ? Math.min(...freshTimes) - REATTACH_WINDOW_MS : -Infinity;
    const windowEnd = freshTimes.length ? Math.max(...freshTimes) + REATTACH_WINDOW_MS : Infinity;

    const dropped = existing.sources.filter(s => {
        if (freshLinks.has(s.link)) return false;
        const t = timeOf(s.pubDate);
        return Number.isNaN(t) || (t >= windowStart && t <= windowEnd);
    });

    const sources = dropped.length ? [...fresh.sources, ...dropped] : fresh.sources;
    const bias = dropped.length ? calculateBiasDistribution(sources) : fresh.bias;
    return {
        ...fresh,
        id: existing.id,
        sources,
        sourcesCount: sources.length,
        bias,
        blindspot: dropped.length ? calculateBlindspot(bias, sources.length) : fresh.blindspot,
    };
}

export interface MergeResult {
    merged: AggregatedStory[];
    /** Old stories that no fresh story inherited and that share no link with the fresh run. */
    unmatched: AggregatedStory[];
}

export function mergeWithExisting(fresh: AggregatedStory[], existing: AggregatedStory[]): MergeResult {
    const existingLinks = existing.map(linkSet);

    // Score every plausible pair, then assign greedily from the strongest overlap down.
    const pairs: { f: number; e: number; score: number }[] = [];
    fresh.forEach((story, f) => {
        const links = linkSet(story);
        existingLinks.forEach((other, e) => {
            const score = overlapScore(links, other);
            if (score > 0) pairs.push({ f, e, score });
        });
    });
    pairs.sort((a, b) => b.score - a.score);

    const freshToExisting = new Map<number, number>();
    const takenExisting = new Set<number>();
    for (const { f, e } of pairs) {
        if (freshToExisting.has(f) || takenExisting.has(e)) continue;
        freshToExisting.set(f, e);
        takenExisting.add(e);
    }

    const usedIds = new Set<string>();
    const merged = fresh.map((story, f) => {
        const e = freshToExisting.get(f);
        const result = e === undefined ? story : mergeSources(story, existing[e]);
        // Guard against id collisions between a fresh id and an inherited one.
        let id = result.id;
        for (let n = 2; usedIds.has(id); n++) id = `${result.id}-${n}`;
        usedIds.add(id);
        return id === result.id ? result : { ...result, id };
    });

    const mergedLinks = new Set(merged.flatMap(s => s.sources.map(src => src.link)));
    const unmatched = existing.filter((story, e) =>
        !takenExisting.has(e) &&
        !usedIds.has(story.id) &&
        !story.sources.some(src => mergedLinks.has(src.link))
    );

    return { merged, unmatched };
}
