import { describe, expect, it } from 'vitest';
import { biasPercentages, buildStoryOgImageUrl, storyOgVersion } from './ogImage';

describe('biasPercentages', () => {
    it('normalises counts to percentages that sum to 100', () => {
        const p = biasPercentages({ left: 1, center: 1, right: 1 });
        expect(p.left + p.center + p.right).toBe(100);
        expect(p).toEqual({ left: 34, center: 33, right: 33 });
    });

    it('keeps already-normalised splits unchanged', () => {
        expect(biasPercentages({ left: 17, center: 58, right: 25 })).toEqual({ left: 17, center: 58, right: 25 });
    });

    it('returns zeros for missing data', () => {
        expect(biasPercentages(null)).toEqual({ left: 0, center: 0, right: 0 });
        expect(biasPercentages({ left: 0, center: 0, right: 0 })).toEqual({ left: 0, center: 0, right: 0 });
    });
});

describe('buildStoryOgImageUrl', () => {
    const story = { id: 'story-20260930-1xhclo', title: 'Nicuşor Dan, despre rectificarea bugetară', bias: { left: 18, center: 67, right: 15 }, sourcesCount: 12 };

    it('points at the story-page card renderer with a version tag', () => {
        const url = new URL(buildStoryOgImageUrl(story));
        expect(url.origin + url.pathname).toBe('https://thesite.ro/api/story-page');
        expect(url.searchParams.get('id')).toBe(story.id);
        expect(url.searchParams.get('og')).toBe('1');
        expect(url.searchParams.get('v')).toBe(storyOgVersion(story));
    });

    it('changes version when anything drawn on the card changes', () => {
        const v = storyOgVersion(story);
        expect(storyOgVersion({ ...story })).toBe(v);
        expect(storyOgVersion({ ...story, title: `${story.title}!` })).not.toBe(v);
        expect(storyOgVersion({ ...story, bias: { left: 20, center: 65, right: 15 } })).not.toBe(v);
        expect(storyOgVersion({ ...story, sourcesCount: 13 })).not.toBe(v);
    });
});
