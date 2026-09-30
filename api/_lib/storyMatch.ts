/**
 * Which story from the previous refresh does a freshly built cluster continue?
 *
 * Shared by the merge step (inherit the old id and sources) and by headline generation (keep the
 * old headline instead of paying for a new one), so both always agree.
 *
 * - A fresh story matches an old one only on substantial link overlap, measured against both
 *   sides, so a small fresh cluster cannot latch onto a bloated old one.
 * - A single shared link is enough only when one side has at most two links.
 * - Matching is one-to-one, strongest overlap (Jaccard) first.
 */

export interface LinkedStory {
    sources: { link: string }[];
}

const MIN_OVERLAP_OF_SMALLER = 0.5;
const MIN_OVERLAP_OF_LARGER = 0.25;

export function linkSet(story: LinkedStory): Set<string> {
    return new Set(story.sources.map(s => s.link));
}

export function overlapScore(fresh: Set<string>, existing: Set<string>): number {
    let shared = 0;
    for (const link of fresh) if (existing.has(link)) shared++;
    if (shared === 0) return 0;
    if (shared < 2 && Math.min(fresh.size, existing.size) > 2) return 0;
    const ofSmaller = shared / Math.min(fresh.size, existing.size);
    const ofLarger = shared / Math.max(fresh.size, existing.size);
    if (ofSmaller < MIN_OVERLAP_OF_SMALLER || ofLarger < MIN_OVERLAP_OF_LARGER) return 0;
    return shared / (fresh.size + existing.size - shared);
}

/** Map from fresh index to existing index, one-to-one. */
export function matchStories(fresh: LinkedStory[], existing: LinkedStory[]): Map<number, number> {
    const existingLinks = existing.map(linkSet);
    const pairs: { f: number; e: number; score: number }[] = [];
    fresh.forEach((story, f) => {
        const links = linkSet(story);
        existingLinks.forEach((other, e) => {
            const score = overlapScore(links, other);
            if (score > 0) pairs.push({ f, e, score });
        });
    });
    // Ties broken by position so the result is deterministic.
    pairs.sort((a, b) => b.score - a.score || a.f - b.f || a.e - b.e);

    const freshToExisting = new Map<number, number>();
    const takenExisting = new Set<number>();
    for (const { f, e } of pairs) {
        if (freshToExisting.has(f) || takenExisting.has(e)) continue;
        freshToExisting.set(f, e);
        takenExisting.add(e);
    }
    return freshToExisting;
}
