/**
 * Offline evaluation helpers for story clustering (used by the vitest suites, not at runtime).
 *
 * The fixture is a hand-labelled snapshot of real RSS input. Every article may carry:
 * - `event`: the specific news event it reports. Two articles from different outlets with the
 *   same event must end up in the same story.
 * - `topic`: a broader topic (e.g. the 30 Sep government crisis). Grouping two different events
 *   of one topic is "neutral": not rewarded, not counted as a wrong merge by the main metric.
 * Articles with neither are unrelated to everything else in the snapshot.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { NEWS_SOURCES, type RSSNewsItem } from '../shared.js';

export interface FixtureItem {
    id: string;
    source: string;
    pubDate: string;
    title: string;
    description: string;
    link: string;
    event?: string;
    topic?: string;
}

export function loadFixture(name: string): FixtureItem[] {
    const path = fileURLToPath(new URL(`./${name}`, import.meta.url));
    return JSON.parse(readFileSync(path, 'utf8')).items as FixtureItem[];
}

const SOURCES_BY_ID = new Map(NEWS_SOURCES.map(s => [s.id, s]));

export function toRssItem(item: FixtureItem): RSSNewsItem {
    const source = SOURCES_BY_ID.get(item.source) ?? {
        id: item.source, name: item.source, url: '', rssUrl: '', bias: 'center', factuality: 'mixed', category: 'mainstream',
    };
    return {
        id: item.id,
        title: item.title,
        description: item.description,
        link: item.link,
        pubDate: item.pubDate,
        source,
    } as RSSNewsItem;
}

export interface PairMetrics {
    /** Clusters with at least two outlets (what the site can show). */
    clusters: number;
    /** Articles that ended up in such a cluster. */
    clustered: number;
    /** Same-event cross-outlet pairs grouped together. */
    truePairs: number;
    /** Pairs grouped together although they share neither event nor topic. */
    wrongPairs: number;
    /** Pairs of different events of one topic grouped together. */
    neutralPairs: number;
    /** truePairs / (truePairs + wrongPairs). */
    precision: number;
    /** truePairs / (truePairs + wrongPairs + neutralPairs). */
    strictPrecision: number;
    /** Share of labelled (event, outlet-pair) links that some cluster covers. */
    recall: number;
    f1: number;
    /** Largest cluster, in outlets. */
    largest: number;
}

function pairKey(a: string, b: string): string {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function evaluateClusters(groups: RSSNewsItem[][], fixture: FixtureItem[]): PairMetrics {
    const byId = new Map(fixture.map(f => [f.id, f]));
    let truePairs = 0, wrongPairs = 0, neutralPairs = 0, clusters = 0, clustered = 0, largest = 0;
    const covered = new Set<string>();

    for (const group of groups) {
        const members = group.map(g => byId.get(g.id)).filter((f): f is FixtureItem => !!f);
        if (new Set(members.map(m => m.source)).size < 2) continue;
        clusters++;
        clustered += members.length;
        largest = Math.max(largest, new Set(members.map(m => m.source)).size);
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                const a = members[i], b = members[j];
                if (a.source === b.source) continue;
                if (a.event && a.event === b.event) {
                    truePairs++;
                    covered.add(`${a.event}#${pairKey(a.source, b.source)}`);
                } else if (a.topic && a.topic === b.topic) {
                    neutralPairs++;
                } else {
                    wrongPairs++;
                }
            }
        }
    }

    // Gold links: for every event, every pair of distinct outlets that covered it.
    const outletsByEvent = new Map<string, Set<string>>();
    for (const f of fixture) {
        if (!f.event) continue;
        if (!outletsByEvent.has(f.event)) outletsByEvent.set(f.event, new Set());
        outletsByEvent.get(f.event)!.add(f.source);
    }
    let goldLinks = 0;
    for (const outlets of outletsByEvent.values()) goldLinks += (outlets.size * (outlets.size - 1)) / 2;

    const precision = truePairs / Math.max(1, truePairs + wrongPairs);
    const strictPrecision = truePairs / Math.max(1, truePairs + wrongPairs + neutralPairs);
    const recall = covered.size / Math.max(1, goldLinks);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    return { clusters, clustered, truePairs, wrongPairs, neutralPairs, precision, strictPrecision, recall, f1, largest };
}

/** Which cluster (index) each fixture id landed in, for "must group" / "must not group" assertions. */
export function clusterIndex(groups: RSSNewsItem[][]): Map<string, number> {
    const index = new Map<string, number>();
    groups.forEach((group, i) => group.forEach(item => index.set(item.id, i)));
    return index;
}
