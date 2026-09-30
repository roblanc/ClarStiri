import { beforeEach, describe, expect, it, vi } from 'vitest';
import { filterUnposted, pickStoryToPost, repeatReason, socialScore } from './post_dedupe.mjs';

const story = (id, title, { links = [], sourcesCount, blindspot } = {}) => ({
  id,
  title,
  blindspot,
  sourcesCount: sourcesCount ?? links.length,
  sources: links.map(link => ({ link, title })),
});

const posted = (id, title) => ({ id, title, postedAt: '2026-09-29T10:00:00Z' });

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('repeatReason', () => {
  const history = [posted('story-1', 'Guvernul a adoptat bugetul pe 2027')];

  it('flags the same story id', () => {
    expect(repeatReason(story('story-1', 'Alt titlu complet diferit'), history, {})).toBe('același id');
  });

  it('flags the exact same title under a new id (case and whitespace insensitive)', () => {
    expect(repeatReason(story('story-2', '  guvernul a adoptat BUGETUL pe 2027 '), history, {})).toBe('același titlu');
  });

  it('flags a reworded title about the same event', () => {
    const reason = repeatReason(story('story-3', 'Bugetul pe 2027, adoptat de Guvernul României'), history, {});
    expect(reason).toMatch(/^titlu asemănător/);
  });

  it('lets an unrelated story through', () => {
    expect(repeatReason(story('story-4', 'Echipa națională câștigă în deplasare'), history, {})).toBeNull();
  });

  it('ignores diacritics and short/stop words when comparing titles', () => {
    const h = [posted('a', 'Președintele promulgă legea pensiilor speciale')];
    expect(repeatReason(story('b', 'Presedintele promulga legea pensiilor speciale azi'), h, {})).toMatch(/^titlu asemănător/);
  });

  it('only compares titles within the recent window', () => {
    const old = posted('old', 'Guvernul a adoptat bugetul pe 2027');
    const filler = Array.from({ length: 60 }, (_, i) => posted(`f${i}`, `Subiect fără legătură numărul ${i} zzz${i}`));
    expect(repeatReason(story('new', 'Guvernul a adoptat bugetul pe 2027'), [old, ...filler], {})).toBeNull();
  });

  describe('shared source articles', () => {
    const links = { 'story-1': { at: '2026-09-29T10:00:00Z', links: ['https://a.ro/1', 'https://b.ro/2', 'https://c.ro/3'] } };

    it('flags a story that shares 2+ source links with a posted one', () => {
      const s = story('story-9', 'Titlu nou fără cuvinte comune xyz', { links: ['https://a.ro/1', 'https://b.ro/2', 'https://z.ro/9'] });
      expect(repeatReason(s, history, links)).toBe('2 articole comune cu o postare anterioară');
    });

    it('flags one shared link when it is >=30% of the smaller story', () => {
      const s = story('story-9', 'Titlu nou fără cuvinte comune xyz', { links: ['https://a.ro/1', 'https://z.ro/8', 'https://z.ro/9'] });
      expect(repeatReason(s, history, links)).toBe('1 articole comune cu o postare anterioară');
    });

    it('allows one shared link when it is a small share of a big story', () => {
      const big = { 'story-1': { links: Array.from({ length: 10 }, (_, i) => `https://a.ro/${i}`) } };
      const s = story('story-9', 'Titlu nou fără cuvinte comune xyz', {
        links: ['https://a.ro/0', ...Array.from({ length: 9 }, (_, i) => `https://z.ro/${i}`)],
      });
      expect(repeatReason(s, history, big)).toBeNull();
    });

    it('ignores links of stories that were chosen but never actually posted', () => {
      const s = story('story-9', 'Titlu nou fără cuvinte comune xyz', { links: ['https://a.ro/1', 'https://b.ro/2'] });
      expect(repeatReason(s, [], links)).toBeNull();
    });
  });
});

describe('filterUnposted', () => {
  it('drops repeats and keeps new stories in order', () => {
    const history = [posted('story-1', 'Guvernul a adoptat bugetul pe 2027')];
    const stories = [
      story('story-5', 'Echipa națională câștigă în deplasare'),
      story('story-1', 'Guvernul a adoptat bugetul pe 2027'),
      story('story-6', 'Ploi abundente în Moldova, cod galben'),
    ];
    expect(filterUnposted(stories, history, {}).map(s => s.id)).toEqual(['story-5', 'story-6']);
  });
});

describe('pickStoryToPost', () => {
  it('prefers blindspot stories, then more sources', () => {
    const stories = [
      story('many', 'Știre acoperită de multe redacții', { sourcesCount: 9 }),
      story('blind', 'Știre ignorată de o tabără', { sourcesCount: 3, blindspot: 'right' }),
      story('few', 'Știre cu puține surse', { sourcesCount: 2 }),
    ];
    expect(pickStoryToPost(stories, [], {}).story?.id).toBe('blind');
    expect(socialScore(stories[1])).toBe(13);
    expect(socialScore({ blindspot: 'none', sources: [{}, {}] })).toBe(2);
  });

  it('never returns a story that was already posted', () => {
    const stories = [
      story('top', 'Cea mai importantă știre a zilei', { sourcesCount: 20 }),
      story('next', 'A doua știre despre altceva', { sourcesCount: 4 }),
    ];
    const { story: chosen, unposted } = pickStoryToPost(stories, [posted('top', 'Cea mai importantă știre a zilei')], {});
    expect(chosen?.id).toBe('next');
    expect(unposted).toHaveLength(1);
  });

  it('returns null when everything was already posted, so callers skip instead of repeating', () => {
    const stories = [story('a', 'Prima știre de test'), story('b', 'Altă poveste diferită')];
    const history = [posted('a', 'Prima știre de test'), posted('b', 'Altă poveste diferită')];
    expect(pickStoryToPost(stories, history, {})).toEqual({ story: null, unposted: [] });
  });

  it('keeps API order for equal scores and does not mutate the input', () => {
    const stories = [story('first', 'Primul subiect distinct'), story('second', 'Al doilea subiect separat')];
    const copy = [...stories];
    expect(pickStoryToPost(stories, [], {}).story?.id).toBe('first');
    expect(stories).toEqual(copy);
  });
});
