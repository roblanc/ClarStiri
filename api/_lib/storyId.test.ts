import { describe, expect, it } from 'vitest';
import { createStoryId } from './storyId';

describe('createStoryId', () => {
    const sources = [
        { title: 'Guvernul a adoptat bugetul pe 2027', pubDate: '2026-09-30T08:00:00Z' },
        { title: 'Bugetul pe 2027, adoptat de Guvern', pubDate: '2026-09-30T09:30:00Z' },
    ];

    it('is deterministic for the same sources', () => {
        expect(createStoryId(sources)).toBe(createStoryId([...sources]));
    });

    it('embeds the earliest publication date', () => {
        expect(createStoryId(sources)).toMatch(/^story-20260930-[0-9a-z]+$/);
    });

    it('differs for unrelated stories', () => {
        const other = [{ title: 'Echipa națională câștigă în deplasare', pubDate: '2026-09-30T08:00:00Z' }];
        expect(createStoryId(other)).not.toBe(createStoryId(sources));
    });
});
