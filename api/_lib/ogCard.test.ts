import { describe, expect, it } from 'vitest';
import { clampHeadline, headlineFontSize, renderStoryCard } from './ogCard';

describe('clampHeadline', () => {
    it('leaves normal headlines alone', () => {
        expect(clampHeadline('  Guvernul   a adoptat bugetul ')).toBe('Guvernul a adoptat bugetul');
    });

    it('cuts very long headlines on a word boundary with an ellipsis', () => {
        const long = 'Cuvânt '.repeat(60);
        const out = clampHeadline(long, 100);
        expect(out.length).toBeLessThanOrEqual(101);
        expect(out.endsWith('Cuvânt…')).toBe(true);
    });
});

describe('headlineFontSize', () => {
    it('shrinks as headlines get longer', () => {
        expect(headlineFontSize('a'.repeat(40), true)).toBeGreaterThan(headlineFontSize('a'.repeat(140), true));
    });
});

describe('renderStoryCard', () => {
    it('renders a 1200x630 PNG with Romanian diacritics (no photo, no network)', async () => {
        const png = await renderStoryCard({
            title: 'Țara își șterge datoriile: ă â î ș ț, Ş Ţ',
            sourcesCount: 12,
            mainCategory: 'Economie',
            bias: { left: 18, center: 67, right: 15 },
            blindspot: 'left',
        });
        expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
        expect(png.readUInt32BE(16)).toBe(1200);
        expect(png.readUInt32BE(20)).toBe(630);
    }, 30_000);
});
