import { describe, expect, it } from 'vitest';
import { biasPercents, buildTimeline, campOf, headlineSize, pickHeadlines, pickImages } from './social_v2.mjs';

const src = (name, bias, title, pubDate = '2026-09-30T08:00:00Z', extra = {}) => ({
  title,
  pubDate,
  link: `https://${name.toLowerCase().replace(/\s+/g, '')}.ro/${encodeURIComponent(title || 'x')}`,
  source: { id: name.toLowerCase(), name, url: `https://${name.toLowerCase()}.ro`, bias },
  ...extra,
});

describe('campOf', () => {
  it('folds center-left into left and center-right into right', () => {
    expect(campOf(src('A', 'left', 't'))).toBe('left');
    expect(campOf(src('A', 'center-left', 't'))).toBe('left');
    expect(campOf(src('A', 'center', 't'))).toBe('center');
    expect(campOf(src('A', 'center-right', 't'))).toBe('right');
    expect(campOf(src('A', 'right', 't'))).toBe('right');
  });

  it('treats unknown or missing bias as center', () => {
    expect(campOf({ source: { bias: 'weird' } })).toBe('center');
    expect(campOf({})).toBe('center');
  });
});

describe('pickHeadlines', () => {
  const storyTitle = 'Traian Băsescu reacționează după arestarea fostului ministru';

  it("picks, per camp, the headline closest to the story title, not the earliest one", () => {
    const story = {
      title: storyTitle,
      sources: [
        // Earlier but only related article (the arrest itself) — must not win.
        src('G4Media', 'left', 'Fostul ministru a fost reținut de DNA', '2026-09-30T06:00:00Z'),
        src('HotNews', 'center-left', 'Băsescu reacționează după arestarea fostului ministru', '2026-09-30T09:00:00Z'),
        src('Digi24', 'center', 'Traian Băsescu, reacție după arestarea fostului ministru', '2026-09-30T10:00:00Z'),
        src('Antena 3', 'right', 'Arestarea fostului ministru: ce spune Traian Băsescu', '2026-09-30T11:00:00Z'),
      ],
    };
    const h = pickHeadlines(story);
    expect(h.left).toEqual({ outlet: 'HotNews', label: 'Centru-stânga', title: story.sources[1].title });
    expect(h.center?.outlet).toBe('Digi24');
    expect(h.right).toMatchObject({ outlet: 'Antena 3', label: 'Dreapta' });
  });

  it('breaks similarity ties by earliest publication time', () => {
    const story = {
      title: 'Guvernul adoptă bugetul',
      sources: [
        src('Late', 'center', 'Guvernul adoptă bugetul', '2026-09-30T12:00:00Z'),
        src('Early', 'center', 'Guvernul adoptă bugetul', '2026-09-30T07:00:00Z'),
      ],
    };
    expect(pickHeadlines(story).center?.outlet).toBe('Early');
  });

  it('returns null for a camp with no coverage instead of borrowing another camp', () => {
    const story = { title: 'Ceva', sources: [src('Digi24', 'center', 'Ceva s-a întâmplat')] };
    const h = pickHeadlines(story);
    expect(h.left).toBeNull();
    expect(h.right).toBeNull();
    expect(h.center?.outlet).toBe('Digi24');
  });

  it('never shows the same headline twice when another one exists', () => {
    const same = 'Titlu identic preluat de agenție';
    const story = {
      title: same,
      sources: [
        src('A', 'left', same, '2026-09-30T08:00:00Z'),
        src('B', 'center', same, '2026-09-30T08:05:00Z'),
        src('C', 'center', 'Alt titlu despre aceeași știre', '2026-09-30T08:10:00Z'),
      ],
    };
    const h = pickHeadlines(story);
    expect(h.left?.title).toBe(same);
    expect(h.center?.title).toBe('Alt titlu despre aceeași știre');
  });

  it('ignores sources without a title and copes with a story without sources', () => {
    const story = { title: 'X', sources: [src('A', 'left', '')] };
    expect(pickHeadlines(story).left).toBeNull();
    expect(pickHeadlines({ title: 'X' })).toEqual({ left: null, center: null, right: null });
  });
});

describe('pickImages (cover fallback chain)', () => {
  it('lists the story image first, then each source photo, deduplicated', () => {
    const story = {
      image: 'https://a.ro/cover.jpg',
      sources: [
        { imageUrl: 'https://a.ro/cover.jpg' },
        { imageUrl: 'https://b.ro/photo.jpg' },
        { imageUrl: 'https://c.ro/photo.webp' },
      ],
    };
    expect(pickImages(story)).toEqual(['https://a.ro/cover.jpg', 'https://b.ro/photo.jpg', 'https://c.ro/photo.webp']);
  });

  it('skips videos, small thumbnails, relative and missing urls', () => {
    const story = {
      image: '/local.jpg',
      sources: [
        { imageUrl: 'https://a.ro/clip.mp4' },
        { imageUrl: 'https://a.ro/stream.m3u8?x=1' },
        { imageUrl: 'https://a.ro/photo-150x150.jpg' },
        { imageUrl: undefined },
        { imageUrl: 'https://a.ro/photo-1200x800.jpg' },
        { imageUrl: 'https://a.ro/ok.png' },
      ],
    };
    expect(pickImages(story)).toEqual(['https://a.ro/photo-1200x800.jpg', 'https://a.ro/ok.png']);
  });

  it('caps the chain at 10 candidates', () => {
    const sources = Array.from({ length: 15 }, (_, i) => ({ imageUrl: `https://x.ro/${i}.jpg` }));
    expect(pickImages({ sources })).toHaveLength(10);
  });
});

describe('biasPercents', () => {
  it('rounds like the captions and defaults to 0', () => {
    expect(biasPercents({ bias: { left: 33.4, center: 33.5, right: 33.1 } })).toEqual({ left: 33, center: 34, right: 33 });
    expect(biasPercents({})).toEqual({ left: 0, center: 0, right: 0 });
  });
});

describe('buildTimeline', () => {
  const ago = mins => new Date(Date.now() - mins * 60_000).toISOString();

  it('keeps the earliest article per outlet, sorted by time', () => {
    const story = {
      sources: [
        src('A', 'left', 't', ago(30)),
        src('A', 'left', 't2', ago(90)),
        src('B', 'center', 't', ago(60)),
        src('C', 'right', 't', ago(10)),
      ],
    };
    const tl = buildTimeline(story);
    expect(tl.valid).toBe(true);
    expect(tl.shown.map(e => e.outlet)).toEqual(['A', 'B', 'C']);
    expect(tl.shown[0].camp).toBe('left');
  });

  it('is invalid with fewer than 3 outlets and ignores future or very old timestamps', () => {
    const story = {
      sources: [
        src('A', 'left', 't', ago(30)),
        src('B', 'center', 't', new Date(Date.now() + 60 * 60_000).toISOString()),
        src('C', 'right', 't', ago(20 * 24 * 60)),
        src('D', 'right', 't', 'not a date'),
      ],
    };
    const tl = buildTimeline(story);
    expect(tl.valid).toBe(false);
    expect(tl.shown.map(e => e.outlet)).toEqual(['A']);
  });

  it('shows at most 4 outlets and counts the rest', () => {
    const story = { sources: ['A', 'B', 'C', 'D', 'E', 'F'].map((n, i) => src(n, 'center', 't', ago(60 - i))) };
    const tl = buildTimeline(story);
    expect(tl.shown).toHaveLength(4);
    expect(tl.restCount).toBe(2);
    expect(tl.lastTime).not.toBe('');
  });
});

describe('headlineSize', () => {
  it('shrinks long titles in steps', () => {
    expect(headlineSize('x'.repeat(40), 100)).toBe(100);
    expect(headlineSize('x'.repeat(60), 100)).toBe(84);
    expect(headlineSize('x'.repeat(90), 100)).toBe(72);
    expect(headlineSize('x'.repeat(150), 100)).toBe(62);
  });
});
