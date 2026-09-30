/**
 * How a story's coverage is scored: the left/centre/right bar, wire-copy detection and
 * blindspots. Pure functions, shared by the server (api/_lib) and the site (StoryDetail), so
 * both always use the same definitions. The method is described for readers on /metodologie;
 * keep that page in sync when a constant here changes.
 */
import { getBiasScore, scoreToBiasCategory, type SourceBias } from './newsSources.js';

export type Side = 'left' | 'center' | 'right';
export type Blindspot = 'left' | 'right' | 'none';
export interface BiasSplit { left: number; center: number; right: number }

// ─── 1. Score → share of the bar ─────────────────────────────────────────────

/** |score| up to this counts entirely as centre, so centrist outlets add nothing to either side. */
export const BIAS_SHARE_DEAD_ZONE = 5;
/** |score| from this on counts entirely to its side. */
export const BIAS_SHARE_FULL_AT = 55;

/**
 * Splits one outlet's report between left, centre and right (fractions summing to 1).
 * Continuous and monotonic: 0 on a side up to |score| = 5, then rising linearly to 1 at 75.
 * Examples: -25 → 29% left / 71% centre; 35 → 43% right; 55 → 71% right; ±75 and beyond → 100%.
 */
export function biasShares(score: number): BiasSplit {
    const s = Math.max(-100, Math.min(100, Number.isFinite(score) ? score : 0));
    const t = Math.max(0, Math.min(1, (Math.abs(s) - BIAS_SHARE_DEAD_ZONE) / (BIAS_SHARE_FULL_AT - BIAS_SHARE_DEAD_ZONE)));
    return s < 0 ? { left: t, center: 1 - t, right: 0 } : { left: 0, center: 1 - t, right: t };
}

/** Score used for an outlet that only has a category (e.g. an unknown id in an old payload). */
export const CATEGORY_REPRESENTATIVE_SCORE: Record<SourceBias, number> = {
    left: -70,
    'center-left': -35,
    center: 0,
    'center-right': 35,
    right: 70,
};

/**
 * Side used for counting outlets, filters and blindspots: the category grouping
 * (left + center-left → left, center-right + right → right), i.e. score ≤ -20 or ≥ 20.
 */
export function sideOfScore(score: number): Side {
    const category = scoreToBiasCategory(score);
    if (category === 'left' || category === 'center-left') return 'left';
    if (category === 'right' || category === 'center-right') return 'right';
    return 'center';
}

export interface CoverageSource { id: string; bias?: SourceBias; biasScore?: number }
export interface CoverageItem {
    /** Missing on listing "cards", which keep only the outlet. */
    title?: string;
    description?: string;
    pubDate?: string;
    link?: string;
    source: CoverageSource;
    /** Set by the server: this item republishes wire copy counted under another report. */
    syndicated?: boolean;
}

/** The registry score wins; the embedded one and the category are fallbacks for unknown ids. */
export function scoreOfSource(source: CoverageSource): number {
    return getBiasScore(source.id)
        ?? (typeof source.biasScore === 'number' ? source.biasScore : undefined)
        ?? (source.bias ? CATEGORY_REPRESENTATIVE_SCORE[source.bias] : 0);
}

// ─── 2. Wire copies ───────────────────────────────────────────────────────────

/** News agencies whose copy Romanian outlets republish, keyed by their source id. */
export const WIRE_AGENCIES: Record<string, string> = {
    agerpres: 'Agerpres',
    newsro: 'News.ro',
    mediafax: 'Mediafax',
};

const AGENCY_PATTERN: Record<string, string> = {
    agerpres: 'agerpres',
    newsro: 'news\\.ro',
    mediafax: 'mediafax',
};

// Explicit credits only. A photo credit ("Foto: Agerpres") is not a text credit and is ignored.
const attributionRegexes = Object.entries(AGENCY_PATTERN).map(([id, name]) => ({
    id,
    re: new RegExp(
        [
            `\\(\\s*${name}\\s*\\)`,                          // (Agerpres)
            `/\\s*${name}\\s*/`,                              // Bucureşti, 30 sep /Agerpres/ -
            `${name}\\s*/\\s*\\(`,                            // AGERPRES/(AS - autor: ...)
            `surs[aă]\\s*[:\\-–]\\s*${name}`,                 // Sursa: News.ro
            `(?:transmite|informeaz[aă]|relateaz[aă]|anun[tțţ][aă]|potrivit|conform|citat[aă]? de|citeaz[aă])\\s+(?:agen[tțţ]iei?\\s+|agen[tțţ]ia\\s+)?${name}\\b`,
        ].join('|'),
        'i',
    ),
}));

/** Agency id credited in the text, or null. */
export function detectWireAttribution(text: string): string | null {
    if (!text) return null;
    for (const { id, re } of attributionRegexes) if (re.test(text)) return id;
    return null;
}

/**
 * Quoted speech is left out before comparing: independent reports quote the same statement
 * word for word, which says nothing about whether they share wire copy.
 */
const QUOTED = /[„“"”«][^„“"”«»]{0,600}[”"“»]/g;

function normalizeWords(text?: string): string[] {
    return (text || '')
        .replace(QUOTED, ' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean);
}

/** Titles: at least this many words and this Jaccard overlap → same wire headline. */
const TITLE_MIN_WORDS = 8;
const TITLE_MIN_JACCARD = 0.8;
/** Descriptions: word 4-grams over the first 60 words, containment of the shorter one. */
const DESC_SHINGLE = 4;
const DESC_MAX_WORDS = 60;
const DESC_MIN_SHINGLES = 12;
const DESC_MIN_CONTAINMENT = 0.6;

function shingles(words: string[]): Set<string> {
    const out = new Set<string>();
    const w = words.slice(0, DESC_MAX_WORDS);
    for (let i = 0; i + DESC_SHINGLE <= w.length; i++) out.add(w.slice(i, i + DESC_SHINGLE).join(' '));
    return out;
}

function overlap(a: Set<string>, b: Set<string>): number {
    let n = 0;
    for (const x of a) if (b.has(x)) n++;
    return n;
}

/** True when two items carry the same wire text (near-identical title or lead). */
export function isNearDuplicate(a: CoverageItem, b: CoverageItem): boolean {
    const ta = normalizeWords(a.title);
    const tb = normalizeWords(b.title);
    if (ta.length >= TITLE_MIN_WORDS && tb.length >= TITLE_MIN_WORDS) {
        const sa = new Set(ta);
        const sb = new Set(tb);
        const inter = overlap(sa, sb);
        if (inter / (sa.size + sb.size - inter) >= TITLE_MIN_JACCARD) return true;
    }
    const da = shingles(normalizeWords(a.description || ''));
    const db = shingles(normalizeWords(b.description || ''));
    const smaller = Math.min(da.size, db.size);
    if (smaller < DESC_MIN_SHINGLES) return false;
    return overlap(da, db) / smaller >= DESC_MIN_CONTAINMENT;
}

/**
 * One independent report: a group of items with the same wire text, or credited to the
 * same agency, or from the same outlet. It counts once in the bar and in the ranking.
 */
export interface ReportUnit {
    /** Indexes into the item list. */
    members: number[];
    /** Index of the item treated as the original, or -1 when that is an agency not in the story. */
    original: number;
    /** Agency the text comes from, when known. */
    agency: string | null;
    /** Score the unit contributes with: the agency's, else the original outlet's. */
    score: number;
}

function timeOf(item: CoverageItem): number {
    const t = Date.parse(item.pubDate ?? '');
    return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

/** Groups a story's items into independent reports (see ReportUnit). */
export function groupReports(items: CoverageItem[]): ReportUnit[] {
    const parent = items.map((_, i) => i);
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const union = (a: number, b: number) => { parent[find(a)] = find(b); };

    // Which agency each item comes from: the agency itself, or an explicit credit in the text.
    const agencyOf = items.map((it) =>
        WIRE_AGENCIES[it.source.id] ? it.source.id : detectWireAttribution(`${it.title ?? ''} ${it.description ?? ''}`));

    const firstByKey = new Map<string, number>();
    items.forEach((it, i) => {
        for (const key of [`src:${it.source.id}`, agencyOf[i] ? `agency:${agencyOf[i]}` : '']) {
            if (!key) continue;
            const first = firstByKey.get(key);
            if (first === undefined) firstByKey.set(key, i);
            else union(i, first);
        }
    });
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            if (find(i) !== find(j) && isNearDuplicate(items[i], items[j])) union(i, j);
        }
    }

    const groups = new Map<number, number[]>();
    items.forEach((_, i) => {
        const root = find(i);
        const g = groups.get(root);
        if (g) g.push(i); else groups.set(root, [i]);
    });

    return [...groups.values()].map((members) => {
        const agencies = members.map((i) => agencyOf[i]).filter((a): a is string => !!a);
        const agency = agencies[0] ?? null;
        const agencyItem = agency ? members.find((i) => items[i].source.id === agency) : undefined;
        let original: number;
        if (agencyItem !== undefined) original = agencyItem;
        else if (agency) original = -1;
        else original = members.reduce((best, i) => (timeOf(items[i]) < timeOf(items[best]) ? i : best), members[0]);
        const score = agency
            ? getBiasScore(agency) ?? 0
            : scoreOfSource(items[original].source);
        return { members, original, agency, score };
    });
}

function syndicationFlags(items: CoverageItem[], units: ReportUnit[]): boolean[] {
    const flags = new Array<boolean>(items.length).fill(false);
    for (const u of units) {
        const originalId = u.original >= 0 ? items[u.original].source.id : null;
        for (const i of u.members) flags[i] = items[i].source.id !== originalId;
    }
    return flags;
}

/** Marks republished copies. Items from the original outlet (and the agency itself) stay unmarked. */
export function markSyndicated<T extends CoverageItem>(items: T[]): T[] {
    const flags = syndicationFlags(items, groupReports(items));
    return items.map((it, i) => {
        if (flags[i]) return it.syndicated ? it : { ...it, syndicated: true };
        if (it.syndicated === undefined) return it;
        const { syndicated: _drop, ...rest } = it;
        return rest as T;
    });
}

// ─── 3. Summary: bar + counts ─────────────────────────────────────────────────

export interface SideCount {
    /** Distinct outlets from this side that carried the story, copies included. */
    outlets: number;
    /** Independent reports whose original is on this side. */
    independent: number;
}

export interface CoverageSummary {
    /** Distinct outlets listed. */
    outlets: number;
    /** Independent reports (wire copies of one text count once). */
    independent: number;
    /** Outlets whose only item on the story is a republished copy. */
    syndicatedOutlets: number;
    sides: Record<Side, SideCount>;
    /** Bar percentages (integers summing to 100), from the independent reports. */
    bias: BiasSplit;
}

/** Integer percentages that sum to 100 (largest remainder). */
export function toPercentages(split: BiasSplit): BiasSplit {
    const total = split.left + split.center + split.right;
    if (total <= 0) return { left: 0, center: 100, right: 0 };
    const keys: Side[] = ['left', 'center', 'right'];
    const raw = keys.map((k) => (split[k] / total) * 100);
    const floors = raw.map(Math.floor);
    let rest = 100 - floors.reduce((a, b) => a + b, 0);
    const order = raw.map((r, i) => ({ i, frac: r - floors[i] })).sort((a, b) => b.frac - a.frac);
    for (const { i } of order) { if (rest <= 0) break; floors[i]++; rest--; }
    return { left: floors[0], center: floors[1], right: floors[2] };
}

/** Bar, counts and wire-copy totals for one story, all from the same grouping. */
export function summarizeCoverage(items: CoverageItem[]): CoverageSummary {
    const units = groupReports(items);
    const flags = syndicationFlags(items, units);
    const sides: Record<Side, SideCount> = {
        left: { outlets: 0, independent: 0 },
        center: { outlets: 0, independent: 0 },
        right: { outlets: 0, independent: 0 },
    };

    const outletIds = new Set<string>();
    const outletHasOriginal = new Map<string, boolean>();
    items.forEach((it, i) => {
        const id = it.source.id;
        if (!outletIds.has(id)) {
            outletIds.add(id);
            sides[sideOfScore(scoreOfSource(it.source))].outlets++;
        }
        outletHasOriginal.set(id, (outletHasOriginal.get(id) ?? false) || !flags[i]);
    });

    const sum: BiasSplit = { left: 0, center: 0, right: 0 };
    for (const u of units) {
        const s = biasShares(u.score);
        sum.left += s.left; sum.center += s.center; sum.right += s.right;
        sides[sideOfScore(u.score)].independent++;
    }

    return {
        outlets: outletIds.size,
        independent: units.length,
        syndicatedOutlets: [...outletHasOriginal.values()].filter((v) => !v).length,
        sides,
        bias: units.length ? toPercentages(sum) : { left: 0, center: 100, right: 0 },
    };
}

// ─── 4. Blindspots ───────────────────────────────────────────────────────────

/** Smallest story (in independent reports) that can be a blindspot. */
export const BLINDSPOT_MIN_REPORTS = 4;
/** The side that did cover it needs at least this many independent reports. */
export const BLINDSPOT_MIN_OTHER_SIDE = 3;
/** Absence is flagged only when it would happen by chance at most this often (see below). */
export const BLINDSPOT_MAX_CHANCE = 0.15;
/** A side is judged only if at least this share of its feeds returned articles in the refresh. */
export const BLINDSPOT_MIN_FEED_HEALTH = 0.6;

/**
 * What the current refresh looked like: the share of fetched articles from each side and the
 * share of each side's feeds that answered. Built by `buildCoverageContext`.
 */
export interface CoverageContext {
    articleShare: Record<Side, number>;
    feedHealth: Record<Side, number>;
}

/** Context from the configured outlets alone, for when no refresh data is at hand. */
export function staticCoverageContext(sources: ReadonlyArray<CoverageSource>): CoverageContext {
    const counts: Record<Side, number> = { left: 0, center: 0, right: 0 };
    sources.forEach((s) => { counts[sideOfScore(scoreOfSource(s))]++; });
    const total = sources.length || 1;
    return {
        articleShare: { left: counts.left / total, center: counts.center / total, right: counts.right / total },
        feedHealth: { left: 1, center: 1, right: 1 },
    };
}

/**
 * Context for one refresh: `items` are all articles fetched in the run, `sources` all configured
 * outlets. A feed counts as healthy when it returned at least one article (fetchRSSFeed returns
 * [] on failure, so an empty feed is indistinguishable from a broken one).
 */
export function buildCoverageContext(
    items: ReadonlyArray<{ source: CoverageSource }>,
    sources: ReadonlyArray<CoverageSource>,
): CoverageContext {
    const articles: Record<Side, number> = { left: 0, center: 0, right: 0 };
    const answered = new Set<string>();
    items.forEach((it) => {
        articles[sideOfScore(scoreOfSource(it.source))]++;
        answered.add(it.source.id);
    });
    const configured: Record<Side, number> = { left: 0, center: 0, right: 0 };
    const healthy: Record<Side, number> = { left: 0, center: 0, right: 0 };
    sources.forEach((s) => {
        const side = sideOfScore(scoreOfSource(s));
        configured[side]++;
        if (answered.has(s.id)) healthy[side]++;
    });
    const total = items.length;
    if (total === 0) return staticCoverageContext(sources);
    const ratio = (side: Side) => (configured[side] ? healthy[side] / configured[side] : 0);
    return {
        articleShare: { left: articles.left / total, center: articles.center / total, right: articles.right / total },
        feedHealth: { left: ratio('left'), center: ratio('center'), right: ratio('right') },
    };
}

/**
 * A story is a blindspot for side X when all of these hold:
 * 1. it has at least BLINDSPOT_MIN_REPORTS independent reports;
 * 2. no outlet from side X carried it at all (not even a republished copy);
 * 3. the other side has at least BLINDSPOT_MIN_OTHER_SIDE independent reports on it;
 * 4. X's absence is unlikely to be chance: if X publishes a share p of all articles in the
 *    refresh, the chance that none of n independent reports comes from X is (1 − p)^n, and it
 *    must be ≤ BLINDSPOT_MAX_CHANCE. This normalises for a thin side: with fewer articles from
 *    the left, more coverage is needed before the left's silence means anything;
 * 5. at least BLINDSPOT_MIN_FEED_HEALTH of X's feeds answered in the refresh, so a broken feed
 *    is never read as an editorial choice.
 */
export function computeBlindspot(summary: CoverageSummary, context: CoverageContext): Blindspot {
    const n = summary.independent;
    if (n < BLINDSPOT_MIN_REPORTS) return 'none';
    const check = (absent: 'left' | 'right', other: 'left' | 'right'): boolean => {
        if (summary.sides[absent].outlets > 0) return false;
        if (summary.sides[other].independent < BLINDSPOT_MIN_OTHER_SIDE) return false;
        if (context.feedHealth[absent] < BLINDSPOT_MIN_FEED_HEALTH) return false;
        const p = context.articleShare[absent];
        return Math.pow(1 - p, n) <= BLINDSPOT_MAX_CHANCE;
    };
    if (check('left', 'right')) return 'left';
    if (check('right', 'left')) return 'right';
    return 'none';
}

// ─── 5. Ranking ──────────────────────────────────────────────────────────────

/**
 * Feed order: independentReports^1.5 × e^(-hoursOld / 18). Wire copies count once, so a story
 * republished by many outlets from one agency text no longer outranks broader coverage.
 * Stories stored before `independentCount` existed fall back to `sourcesCount`.
 */
export function storyRankScore(
    story: { sourcesCount: number; independentCount?: number; publishedAt: string },
    now = Date.now(),
): number {
    const hours = (now - new Date(story.publishedAt).getTime()) / 3_600_000;
    return Math.pow(story.independentCount ?? story.sourcesCount, 1.5) * Math.exp(-hours / 18);
}

// ─── 6. View for the site ────────────────────────────────────────────────────

export interface CoverageView {
    bias: BiasSplit;
    /** Independent reports behind the bar. */
    independent: number;
    /** Distinct outlets listed. */
    outlets: number;
    /** Distinct outlets per side (same grouping as filters and blindspots). */
    outletsBySide: Record<Side, number>;
    /** Per item: republished copy? */
    syndicated: boolean[];
    /** Per item: side of its outlet. */
    sides: Side[];
}

/**
 * What a story page shows. Uses the server's figures (bar, independent count, copy flags)
 * when the story carries them, so the page matches the cards; stories cached before those
 * fields existed are recomputed here with the same functions.
 */
export function coverageView(story: { sources: CoverageItem[]; bias?: BiasSplit; independentCount?: number }): CoverageView {
    const items = story.sources;
    const sides = items.map((it) => sideOfScore(scoreOfSource(it.source)));
    const outletsBySide: Record<Side, number> = { left: 0, center: 0, right: 0 };
    const seen = new Set<string>();
    items.forEach((it, i) => {
        if (seen.has(it.source.id)) return;
        seen.add(it.source.id);
        outletsBySide[sides[i]]++;
    });

    // Server figures, or a listing card (outlets only, no text to detect copies in).
    const isCard = items.every((it) => it.title === undefined);
    if (story.bias && (typeof story.independentCount === 'number' || isCard)) {
        return {
            bias: story.bias,
            independent: story.independentCount ?? seen.size,
            outlets: seen.size,
            outletsBySide,
            syndicated: items.map((it) => it.syndicated === true),
            sides,
        };
    }
    const units = groupReports(items);
    const summary = summarizeCoverage(items);
    return {
        bias: summary.bias,
        independent: summary.independent,
        outlets: seen.size,
        outletsBySide,
        syndicated: syndicationFlags(items, units),
        sides,
    };
}
