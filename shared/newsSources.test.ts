import { describe, expect, it } from 'vitest';
import { NEWS_SOURCES_BASE, NEWS_SOURCE_DEFINITIONS, effectiveFactuality, getBiasScore, scoreToBiasCategory } from './newsSources';

describe('outlet ratings', () => {
    it('gives every outlet a score in range and derives its category from it', () => {
        for (const source of NEWS_SOURCES_BASE) {
            expect(source.biasScore).toBeGreaterThanOrEqual(-100);
            expect(source.biasScore).toBeLessThanOrEqual(100);
            expect(source.bias).toBe(scoreToBiasCategory(source.biasScore));
        }
        expect(new Set(NEWS_SOURCES_BASE.map((s) => s.id)).size).toBe(NEWS_SOURCES_BASE.length);
    });

    it('keeps the documented thresholds', () => {
        expect(scoreToBiasCategory(-55)).toBe('left');
        expect(scoreToBiasCategory(-54)).toBe('center-left');
        expect(scoreToBiasCategory(-20)).toBe('center-left');
        expect(scoreToBiasCategory(-19)).toBe('center');
        expect(scoreToBiasCategory(19)).toBe('center');
        expect(scoreToBiasCategory(20)).toBe('center-right');
        expect(scoreToBiasCategory(54)).toBe('center-right');
        expect(scoreToBiasCategory(55)).toBe('right');
    });

    it('keeps Puterea.ro on the right, at the lowest score of that category', () => {
        expect(getBiasScore('puterea')).toBe(55);
        expect(NEWS_SOURCES_BASE.find((s) => s.id === 'puterea')?.bias).toBe('right');
    });

    it('returns undefined for unknown ids', () => {
        expect(getBiasScore('nu-exista')).toBeUndefined();
    });
});

describe('effectiveFactuality', () => {
    const def = (id: string) => NEWS_SOURCE_DEFINITIONS.find((s) => s.id === id)!;

    it('prefers the evidence-based rating', () => {
        expect(effectiveFactuality(def('realitatea'))).toBe('low'); // 29 CNA fines in 2025
        expect(effectiveFactuality(def('antena3'))).toBe('mixed'); // 2 CNA fines in 2025
    });

    it('falls back to the hand-set rating without usable evidence', () => {
        expect(effectiveFactuality(def('b1tv'))).toBe(def('b1tv').factuality);
        expect(effectiveFactuality(def('gandul'))).toBe(def('gandul').factuality);
    });
});
