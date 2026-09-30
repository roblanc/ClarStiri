/**
 * Groups articles from different outlets into stories (pure, synchronous, order-independent).
 *
 * Pipeline:
 * 1. Every article becomes a bag of light-stemmed, diacritic-free title tokens, weighted by how
 *    rare the token is in the current batch (IDF): "Kaliningrad" says much more than "Guvernul".
 *    The first sentence of the description adds a small bonus, never enough on its own.
 * 2. Pairwise similarity = IDF-weighted overlap of titles, 0 for articles > 48h apart. The optional
 *    embedding layer keeps its old semantics: cosine >= 0.78 forces a link, < 0.52 dampens one.
 * 3. Average-linkage agglomerative clustering: two groups merge only while the MEAN similarity of
 *    all their cross pairs stays above the threshold. Unlike the old seed-only greedy pass this does
 *    not depend on input order, and unlike single-linkage it does not chain unrelated stories
 *    through one ambiguous headline.
 * 4. One article per outlet per story: the most representative one stays, the others are released
 *    and may join another story (or stay alone) instead of silently disappearing.
 */

export interface ClusterInput {
    id: string;
    title: string;
    description?: string;
    pubDate: string;
    source: { id: string };
}

export interface ClusterOptions {
    threshold?: number;
    maxTimeDiffMs?: number;
    /** One embedding per input item (same order), or null when the semantic layer is unavailable. */
    embeddings?: number[][] | null;
}

export const DEFAULT_CLUSTER_THRESHOLD = 0.25;
const DEFAULT_MAX_TIME_DIFF_MS = 48 * 60 * 60 * 1000;
const SEMANTIC_FORCE = 0.78;
const SEMANTIC_DAMPEN = 0.52;
/** Weight of the description-overlap bonus relative to the title similarity. */
const DESCRIPTION_WEIGHT = 0.25;
/** Titles sharing a single token only get half credit ("Nicușor Dan", "Rusia" are not a story). */
const SINGLE_TOKEN_FACTOR = 0.5;
/**
 * Minimum IDF mass two titles must share, as a fraction of the IDF of a word seen only once in the
 * batch: roughly one unique word, or two moderately rare ones.
 */
const MIN_SHARED_FRACTION = 0.9;

// Romanian function words + newsroom boilerplate, already without diacritics.
const STOPWORDS = new Set((
    'care fost este sunt era erau fie fiind vor vom va avea are aveau avut poate pot putea trebuie ' +
    'dupa pentru prin catre pana decat atunci cand cum daca doar unde nici acest aceasta aceste acesta acestei acestui ' +
    'acestea acestia acela aceea acele acei cel cea cei cele celor celui celei ' +
    'sau dar iar inca tot toti toate mai chiar atat incat deci insa ori fie nici ' +
    'unui unei unor niste ale lor lui nostru noastra vostru sau sale sai ' +
    'spre sub peste intre fara contra asupra impotriva langa despre din dintre printre ' +
    'cine ceva cineva orice oricine nimeni nimic cat cati cate ' +
    'noi voi ele mie tie lui ne va le ii il isi si ' +
    'acum azi ieri maine astazi inca deja foarte mult multi multe mare mari nou noua noi ' +
    'video foto live update breaking exclusiv surse oficial ultima ora stiri stire news audio galerie ' +
    'anunta anuntat spune spus declarat afirma cere cerut explica dezvaluie arata ' +
    'the and for with from'
).split(/\s+/));

const SUFFIXES = ['urilor', 'ilor', 'elor', 'ului', 'iile', 'uri', 'iei', 'ele', 'ile', 'ul', 'ii', 'ei', 'ea', 'ia', 'ie', 'le', 'a', 'e', 'i', 'u'];

export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function stem(token: string): string {
    if (/^\d+$/.test(token)) return token;
    for (const suffix of SUFFIXES) {
        if (token.endsWith(suffix) && token.length - suffix.length >= 4) {
            return token.slice(0, token.length - suffix.length);
        }
    }
    return token;
}

export function tokenize(text: string): string[] {
    const out: string[] = [];
    for (const raw of normalizeText(text).split(' ')) {
        if (raw.length < 3 && !/^\d{2,}$/.test(raw)) continue;
        if (STOPWORDS.has(raw)) continue;
        if (/^(19|20)\d\d$/.test(raw)) continue; // years say nothing about which event
        out.push(stem(raw));
    }
    return out;
}

/** The start of the description; feeds often repeat or extend the headline there. */
function descriptionLead(description: string | undefined): string {
    if (!description) return '';
    const text = description.replace(/\s+/g, ' ').trim();
    return text.slice(0, 160);
}

interface Features {
    /** Token -> IDF weight. */
    title: Map<string, number>;
    titleWeight: number;
    desc: Map<string, number>;
    descWeight: number;
    time: number;
}

function weigh(tokens: Iterable<string>, idf: Map<string, number>): { bag: Map<string, number>; total: number } {
    const bag = new Map<string, number>();
    for (const t of tokens) bag.set(t, idf.get(t) ?? 0);
    let total = 0;
    for (const w of bag.values()) total += w;
    return { bag, total };
}

function overlap(a: Map<string, number>, b: Map<string, number>): { shared: number; count: number } {
    const [small, large] = a.size <= b.size ? [a, b] : [b, a];
    let shared = 0, count = 0;
    for (const [t, w] of small) {
        if (large.has(t)) { shared += w; count++; }
    }
    return { shared, count };
}

function cosine(a: number[], b: number[]): number {
    let dot = 0, na = 0, nb = 0;
    for (let k = 0; k < a.length; k++) { dot += a[k] * b[k]; na += a[k] * a[k]; nb += b[k] * b[k]; }
    const d = Math.sqrt(na) * Math.sqrt(nb);
    return d === 0 ? 0 : dot / d;
}

function buildFeatures(items: ClusterInput[]): { features: Features[]; minShared: number } {
    const titleTokens = items.map(i => new Set(tokenize(i.title)));
    const descTokens = items.map((i, k) => {
        const own = titleTokens[k];
        return new Set(tokenize(descriptionLead(i.description)).filter(t => !own.has(t)));
    });

    const df = new Map<string, number>();
    items.forEach((_, k) => {
        for (const t of new Set([...titleTokens[k], ...descTokens[k]])) df.set(t, (df.get(t) ?? 0) + 1);
    });
    const n = Math.max(items.length, 20); // keeps IDF sane for tiny batches
    const idf = new Map<string, number>();
    for (const [t, c] of df) idf.set(t, Math.log(1 + n / c));

    const features = items.map((item, k) => {
        const title = weigh(titleTokens[k], idf);
        const desc = weigh(descTokens[k], idf);
        const time = Date.parse(item.pubDate);
        return { title: title.bag, titleWeight: title.total, desc: desc.bag, descWeight: desc.total, time };
    });
    return { features, minShared: MIN_SHARED_FRACTION * Math.log(1 + n) };
}

/** Lexical similarity of two articles in [0, 1.25]. */
function lexicalSimilarity(a: Features, b: Features, minShared: number): number {
    if (a.titleWeight === 0 || b.titleWeight === 0) return 0;
    const t = overlap(a.title, b.title);
    if (t.count === 0 || t.shared < minShared) return 0;
    const minWeight = Math.min(a.titleWeight, b.titleWeight);
    const maxWeight = Math.max(a.titleWeight, b.titleWeight);
    const ofSmaller = t.shared / minWeight;
    const ofLarger = t.shared / maxWeight;
    let sim = 0.5 * ofSmaller + 0.5 * ofLarger;
    if (t.count < 2) sim *= SINGLE_TOKEN_FACTOR;

    if (a.descWeight > 0 && b.descWeight > 0) {
        // Bonus only: two ledes that agree make a borderline title match more credible, but
        // descriptions alone never link articles (feeds pad them with boilerplate).
        const d = overlap(a.desc, b.desc);
        const bonus = d.count >= 2 ? d.shared / Math.min(a.descWeight, b.descWeight) : 0;
        sim += DESCRIPTION_WEIGHT * Math.min(bonus, 1) * Math.min(1, sim * 3);
    }
    return sim;
}

/**
 * Sparse similarity graph between items. Only positive edges are kept; everything else counts as
 * zero in the average linkage, which is what stops chaining.
 */
function similarityGraph(
    features: Features[],
    minShared: number,
    threshold: number,
    maxTimeDiffMs: number,
    embeddings: number[][] | null,
): Map<number, Map<number, number>> {
    const graph = new Map<number, Map<number, number>>();
    const add = (i: number, j: number, s: number) => {
        if (!graph.has(i)) graph.set(i, new Map());
        if (!graph.has(j)) graph.set(j, new Map());
        graph.get(i)!.set(j, s);
        graph.get(j)!.set(i, s);
    };
    for (let i = 0; i < features.length; i++) {
        for (let j = i + 1; j < features.length; j++) {
            const ti = features[i].time, tj = features[j].time;
            if (!Number.isNaN(ti) && !Number.isNaN(tj) && Math.abs(ti - tj) > maxTimeDiffMs) continue;
            let s = lexicalSimilarity(features[i], features[j], minShared);
            if (embeddings) {
                const semantic = cosine(embeddings[i], embeddings[j]);
                if (semantic >= SEMANTIC_FORCE) s = Math.max(s, threshold + 0.05);
                else if (semantic < SEMANTIC_DAMPEN && s >= threshold) s *= semantic / SEMANTIC_DAMPEN;
            }
            if (s > 0) add(i, j, s);
        }
    }
    return graph;
}

/**
 * Average-linkage agglomeration over the sparse graph. Deterministic: ties are broken by the
 * clusters' canonical keys, never by input position.
 */
function agglomerate(n: number, graph: Map<number, Map<number, number>>, threshold: number, keyOf: (i: number) => string): number[][] {
    const members = new Map<number, number[]>();
    const key = new Map<number, string>();
    // sums.get(a).get(b) = sum of pairwise similarities between clusters a and b
    const sums = new Map<number, Map<number, number>>();
    for (let i = 0; i < n; i++) {
        members.set(i, [i]);
        key.set(i, keyOf(i));
        sums.set(i, new Map(graph.get(i) ?? []));
    }

    for (;;) {
        let best: { a: number; b: number; score: number; tie: string } | null = null;
        for (const [a, row] of sums) {
            const sizeA = members.get(a)!.length;
            for (const [b, sum] of row) {
                if (b <= a) continue;
                const score = sum / (sizeA * members.get(b)!.length);
                if (score < threshold) continue;
                const tie = key.get(a)! < key.get(b)! ? `${key.get(a)}|${key.get(b)}` : `${key.get(b)}|${key.get(a)}`;
                if (!best || score > best.score + 1e-12 || (Math.abs(score - best.score) <= 1e-12 && tie < best.tie)) {
                    best = { a, b, score, tie };
                }
            }
        }
        if (!best) break;

        const { a, b } = best;
        const rowA = sums.get(a)!, rowB = sums.get(b)!;
        for (const [c, s] of rowB) {
            if (c === a) continue;
            const merged = (rowA.get(c) ?? 0) + s;
            rowA.set(c, merged);
            sums.get(c)!.set(a, merged);
            sums.get(c)!.delete(b);
        }
        rowA.delete(b);
        sums.delete(b);
        members.set(a, [...members.get(a)!, ...members.get(b)!]);
        members.delete(b);
        const kb = key.get(b)!, ka = key.get(a)!;
        key.set(a, ka < kb ? ka : kb);
        key.delete(b);
    }
    return [...members.values()];
}

function pairSim(graph: Map<number, Map<number, number>>, i: number, j: number): number {
    return graph.get(i)?.get(j) ?? 0;
}

function meanSim(graph: Map<number, Map<number, number>>, i: number, others: number[]): number {
    const rest = others.filter(o => o !== i);
    if (rest.length === 0) return 0;
    return rest.reduce((sum, o) => sum + pairSim(graph, i, o), 0) / rest.length;
}

/**
 * Returns groups of articles about the same story, largest (in outlets) first. Each group has at
 * most one article per outlet; single-article groups are included.
 */
export function clusterArticles<T extends ClusterInput>(input: T[], options: ClusterOptions = {}): T[][] {
    const threshold = options.threshold ?? DEFAULT_CLUSTER_THRESHOLD;
    const maxTimeDiffMs = options.maxTimeDiffMs ?? DEFAULT_MAX_TIME_DIFF_MS;
    if (input.length === 0) return [];

    // Canonical order so nothing downstream depends on the caller's ordering.
    const order = input.map((_, k) => k).sort((x, y) => {
        const a = input[x], b = input[y];
        return a.id < b.id ? -1 : a.id > b.id ? 1 : x - y;
    });
    const items = order.map(k => input[k]);
    const embeddings = options.embeddings && options.embeddings.length === input.length
        ? order.map(k => options.embeddings![k])
        : null;

    const { features, minShared } = buildFeatures(items);
    const graph = similarityGraph(features, minShared, threshold, maxTimeDiffMs, embeddings);
    const clusters = agglomerate(items.length, graph, threshold, i => items[i].id);

    // One article per outlet: keep the most representative, release the rest.
    const kept: number[][] = [];
    const released: number[] = [];
    for (const cluster of clusters) {
        const byOutlet = new Map<string, number[]>();
        for (const i of cluster) {
            const outlet = items[i].source.id;
            if (!byOutlet.has(outlet)) byOutlet.set(outlet, []);
            byOutlet.get(outlet)!.push(i);
        }
        const keep: number[] = [];
        for (const candidates of byOutlet.values()) {
            if (candidates.length === 1) { keep.push(candidates[0]); continue; }
            const ranked = [...candidates].sort((x, y) =>
                meanSim(graph, y, cluster) - meanSim(graph, x, cluster) ||
                features[x].time - features[y].time ||
                (items[x].id < items[y].id ? -1 : 1));
            keep.push(ranked[0]);
            released.push(...ranked.slice(1));
        }
        kept.push(keep);
    }

    // A released article may still belong with another story that lacks its outlet.
    for (const i of released.sort((x, y) => (items[x].id < items[y].id ? -1 : 1))) {
        let bestCluster = -1, bestScore = threshold;
        kept.forEach((cluster, c) => {
            if (cluster.some(m => items[m].source.id === items[i].source.id)) return;
            const score = meanSim(graph, i, cluster);
            if (score >= bestScore && (bestCluster === -1 || score > bestScore)) { bestCluster = c; bestScore = score; }
        });
        if (bestCluster >= 0) kept[bestCluster].push(i);
        else kept.push([i]);
    }

    const latest = (cluster: number[]) => Math.max(...cluster.map(i => features[i].time).filter(t => !Number.isNaN(t)), 0);
    return kept
        .map(cluster => cluster.sort((x, y) => (features[y].time || 0) - (features[x].time || 0) || (items[x].id < items[y].id ? -1 : 1)))
        .sort((a, b) => b.length - a.length || latest(b) - latest(a) || (items[a[0]].id < items[b[0]].id ? -1 : 1))
        .map(cluster => cluster.map(i => items[i]));
}
