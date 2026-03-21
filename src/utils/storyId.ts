import type { RSSNewsItem } from '@/types/news';

const STOPWORDS = new Set([
  'de', 'la', 'in', 'si', 'a', 'pe', 'cu', 'din', 'pentru', 'un', 'o', 'ca', 'care', 'sa',
]);

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function extractTokens(title: string): string[] {
  return normalizeTitle(title)
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function getEarliestDateKey(sources: RSSNewsItem[]): string {
  const times = sources
    .map(s => Date.parse(s.pubDate))
    .filter(t => !Number.isNaN(t));

  if (times.length === 0) return 'nodate';

  const earliest = Math.min(...times);
  return new Date(earliest).toISOString().slice(0, 10);
}

function getTokenKey(sources: RSSNewsItem[]): string {
  const counts = new Map<string, number>();
  sources.forEach(s => {
    extractTokens(s.title).forEach(token => {
      counts.set(token, (counts.get(token) || 0) + 1);
    });
  });

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return sorted.slice(0, 10).map(([token]) => token).join(' ');
}

function getRepresentativeTitle(sources: RSSNewsItem[]): string {
  const counts = new Map<string, number>();
  sources.forEach(s => {
    const t = normalizeTitle(s.title);
    if (!t) return;
    counts.set(t, (counts.get(t) || 0) + 1);
  });

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return sorted[0]?.[0] || '';
}

function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function createStoryIdFromSources(sources: RSSNewsItem[]): string {
  const dateKey = getEarliestDateKey(sources);
  const tokenKey = getTokenKey(sources);
  const repTitle = getRepresentativeTitle(sources);
  const base = `${dateKey}|${tokenKey}|${repTitle}`;
  const datePart = dateKey === 'nodate' ? 'nodate' : dateKey.replace(/-/g, '');
  return `story-${datePart}-${fnv1a32(base)}`;
}

