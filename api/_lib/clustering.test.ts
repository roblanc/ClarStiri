import { describe, expect, it } from 'vitest';
import { clusterArticles, normalizeText, tokenize } from './clustering';
import { clusterIndex, evaluateClusters, loadFixture, toRssItem } from './__fixtures__/clusterEval';

const fixture = loadFixture('clustering-2026-09-30.json');
const items = fixture.map(toRssItem);
const groups = clusterArticles(items);
const where = clusterIndex(groups);
const ids = (s: string) => s.split(' ').map(x => `a${x}`);

function signature(result: { id: string }[][]): string {
    return result.map(g => g.map(x => x.id).sort().join(',')).sort().join(';');
}

function shuffled<T>(list: T[], seed: number): T[] {
    const out = [...list];
    let s = seed;
    for (let i = out.length - 1; i > 0; i--) {
        s = (s * 16807) % 2147483647;
        const j = s % (i + 1);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

describe('clusterArticles on the labelled 30 Sep snapshot', () => {
    it('keeps precision high and recall well above the old greedy clusterer', () => {
        const m = evaluateClusters(groups, fixture);
        // Old seed-only clusterer on the same snapshot: precision 0.78, strict 0.47, recall 0.40.
        expect(m.precision).toBeGreaterThanOrEqual(0.95);
        expect(m.strictPrecision).toBeGreaterThanOrEqual(0.8);
        expect(m.recall).toBeGreaterThanOrEqual(0.6);
    });

    it('does not depend on input order', () => {
        const expected = signature(groups);
        expect(signature(clusterArticles([...items].reverse()))).toBe(expected);
        expect(signature(clusterArticles(shuffled(items, 7)))).toBe(expected);
        expect(signature(clusterArticles(shuffled(items, 42)))).toBe(expected);
    });

    it('never drops an article: every input lands in exactly one group', () => {
        const seen = groups.flat().map(x => x.id);
        expect(seen.length).toBe(items.length);
        expect(new Set(seen).size).toBe(items.length);
    });

    it('keeps at most one article per outlet in a group', () => {
        for (const group of groups) {
            const outlets = group.map(x => x.source.id);
            expect(new Set(outlets).size).toBe(outlets.length);
        }
    });

    it.each([
        ['diesel excise cut extended', ids('281 260 253 240 231 214 161 135')],
        ['Bolojan on a "cynical" Grindeanu premiership', ids('279 208 205 177 172 159 153 146 137 40')],
        ['Turkey shuts down T24', ids('461 426 329 321 190')],
        ['Xi Jinping on Taiwan', ids('553 541 527 488 464')],
        ['EIB-funded regional hospitals delayed', ids('441 420 378 292 249 213')],
        ['Carmistin takes over Aaylex One', ids('746 735 729 698 654')],
    ])('groups one event across outlets: %s', (_, members) => {
        const clusters = new Set(members.map(id => where.get(id)));
        expect(clusters.size).toBe(1);
    });

    it.each([
        // The live site merged these two China stories on 30 Sep.
        ['China AI bioweapons vs. China warning the EU', 'a655', 'a752'],
        ['Fritz leaving Timișoara vs. Fritz asking for early elections', 'a756', 'a599'],
        ['Moldova drone crash vs. motion to suspend Maia Sandu', 'a691', 'a361'],
        ['Trump AI accord vs. Trump on Iraq', 'a362', 'a100'],
        ['a fact-check about a Mureșan deepfake vs. Mureșan after the vote', 'a843', 'a601'],
        ['Rutte on Russian nukes vs. Zaharova on arms factories', 'a481', 'a255'],
    ])('does not merge unrelated stories: %s', (_, a, b) => {
        expect(where.get(a)).not.toBe(where.get(b));
    });
});

describe('clusterArticles on small batches', () => {
    const at = (h: number) => new Date(Date.UTC(2026, 8, 30, h)).toISOString();
    const article = (id: string, source: string, title: string, h = 10, description = '') =>
        ({ id, title, description, pubDate: at(h), source: { id: source } });

    const batch = [
        article('1', 'digi24', 'Acciza la motorină rămâne redusă cu 25% și în octombrie'),
        article('2', 'hotnews', 'Ministerul Finanțelor: acciza la motorină, redusă cu 25% până la 15 octombrie', 11),
        article('3', 'g4media', 'Incendiu de vegetație în Parcul Național Domogled'),
        article('4', 'adevarul', 'Trump semnează un acord pentru inteligența artificială'),
        article('5', 'observator', 'Premierul Bulgariei, despre riscul nuclear'),
        article('6', 'mediafax', 'Echipa de salvare montană a găsit turiștii rătăciți în Bucegi'),
    ];

    it('groups the same event and leaves unrelated articles alone', () => {
        const result = clusterArticles(batch);
        const index = clusterIndex(result);
        expect(index.get('1')).toBe(index.get('2'));
        expect(result.filter(g => g.length > 1)).toHaveLength(1);
    });

    it('ignores articles more than 48h apart', () => {
        const late = [batch[0], { ...batch[1], pubDate: at(10 + 49) }, ...batch.slice(2)];
        const index = clusterIndex(clusterArticles(late));
        expect(index.get('1')).not.toBe(index.get('2'));
    });

    it('releases a second article from the same outlet instead of dropping it', () => {
        const withDuplicate = [...batch, article('7', 'digi24', 'Motorina: acciza redusă cu 25% se prelungește în octombrie', 12)];
        const result = clusterArticles(withDuplicate);
        const index = clusterIndex(result);
        expect(result.flat()).toHaveLength(withDuplicate.length);
        const story = result[index.get('2')!];
        expect(story.filter(x => x.source.id === 'digi24')).toHaveLength(1);
    });

    it('keeps the embedding layer semantics: strong semantic match links, weak one dampens', () => {
        const pair = [
            article('a', 'digi24', 'Guvernul a adoptat bugetul pe anul viitor'),
            article('b', 'hotnews', 'Executivul a aprobat legea finanțelor publice'),
        ];
        const same = [[1, 0, 0], [0.99, 0.05, 0]];
        expect(clusterArticles(pair).filter(g => g.length > 1)).toHaveLength(0);
        expect(clusterArticles(pair, { embeddings: same }).filter(g => g.length > 1)).toHaveLength(1);

        const lexicalPair = batch.slice(0, 2);
        const orthogonal = [[1, 0, 0], [0, 1, 0]];
        expect(clusterArticles(lexicalPair).filter(g => g.length > 1)).toHaveLength(1);
        expect(clusterArticles(lexicalPair, { embeddings: orthogonal }).filter(g => g.length > 1)).toHaveLength(0);
    });
});

describe('text normalisation', () => {
    it('treats cedilla and comma-below diacritics alike', () => {
        expect(normalizeText('Mureşan, Ţiriac')).toBe(normalizeText('Mureșan, Țiriac'));
        expect(normalizeText('Mureșan')).toBe('muresan');
    });

    it('stems common Romanian inflections to the same token', () => {
        expect(tokenize('Guvernului')).toEqual(tokenize('Guvernul'));
        expect(tokenize('Rusiei')).toEqual(tokenize('Rusia'));
        expect(tokenize('consultările')).toEqual(tokenize('consultări'));
    });

    it('drops stopwords, years and newsroom boilerplate', () => {
        expect(tokenize('VIDEO Update: după ședința din 2026')).toEqual(['sedint']);
    });
});
