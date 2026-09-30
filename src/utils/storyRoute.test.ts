import { describe, expect, it } from 'vitest';
import { findStoryBySlug, toStorySlug } from './storyRoute';

describe('findStoryBySlug', () => {
    const pool = [
        { id: 'a', title: 'Guvernul a adoptat bugetul pe 2027 după o ședință de noapte' },
        { id: 'b', title: 'Echipa națională câștigă în deplasare' },
    ];

    it('matches the exact title slug', () => {
        expect(findStoryBySlug(pool, toStorySlug(pool[1].title))?.id).toBe('b');
    });

    it('falls back to the first six words when the title changed', () => {
        expect(findStoryBySlug(pool, 'guvernul-a-adoptat-bugetul-pe-2027-in-sfarsit')?.id).toBe('a');
    });

    it('returns nothing for an empty or unknown slug', () => {
        expect(findStoryBySlug(pool, '')).toBeUndefined();
        expect(findStoryBySlug(pool, 'alt-subiect-complet-diferit')).toBeUndefined();
    });
});
