import { AggregatedStory, calculateBiasDistribution, calculateBlindspot } from './aggregation.js';
import { linkSet, matchStories } from './storyMatch.js';

/**
 * Merging a fresh aggregation run with the stories already in the cache.
 *
 * The previous rule ("same event if they share ≥1 source link", then re-add every
 * old source) let clusters snowball: a fresh cluster touching a big old one inherited
 * all of its sources, several fresh clusters could inherit the same old one, and after
 * two days a single "story" held 100+ articles about different events.
 *
 * Rules now:
 * - A fresh story matches an old one only on substantial link overlap, one-to-one
 *   (see ./storyMatch.ts).
 * - Only old sources published close to the fresh cluster's time window are re-added, and
 *   only for outlets the fresh cluster does not already have: one article per outlet.
 * - The matched story keeps its original id, so /stire/<id> links stay stable.
 */

const REATTACH_WINDOW_MS = 24 * 60 * 60 * 1000;

function timeOf(pubDate: string): number {
    const t = Date.parse(pubDate);
    return Number.isNaN(t) ? NaN : t;
}

function mergeSources(fresh: AggregatedStory, existing: AggregatedStory): AggregatedStory {
    const freshLinks = linkSet(fresh);
    const outlets = new Set(fresh.sources.map(s => s.source?.id));
    const freshTimes = fresh.sources.map(s => timeOf(s.pubDate)).filter(t => !Number.isNaN(t));
    const windowStart = freshTimes.length ? Math.min(...freshTimes) - REATTACH_WINDOW_MS : -Infinity;
    const windowEnd = freshTimes.length ? Math.max(...freshTimes) + REATTACH_WINDOW_MS : Infinity;

    const dropped = existing.sources.filter(s => {
        if (freshLinks.has(s.link)) return false;
        const outlet = s.source?.id;
        if (outlet !== undefined && outlets.has(outlet)) return false;
        const t = timeOf(s.pubDate);
        if (!Number.isNaN(t) && (t < windowStart || t > windowEnd)) return false;
        outlets.add(outlet);
        return true;
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
    const freshToExisting = matchStories(fresh, existing);
    const takenExisting = new Set(freshToExisting.values());

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
