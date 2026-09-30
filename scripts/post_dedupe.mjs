import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Keeps the same news event from being posted twice, even when it comes back under a new
// story id or a reworded title. A candidate counts as a repeat when, compared with what
// was already posted, it has:
//   - the same story id or the exact same title, or
//   - a similar title (≥50% shared significant words), or
//   - shared source articles (≥2 links, or ≥30% of the smaller story).
// Source links are kept in posted_links.json and only count once the id is in the post history.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LINKS_FILE = path.join(__dirname, '..', 'social_export', 'posted_links.json');

const TITLE_WINDOW = 60;
const TITLE_SIMILARITY = 0.5;
const STOPWORDS = new Set([
  'care', 'este', 'sunt', 'fost', 'pentru', 'dupa', 'despre', 'acest', 'aceasta', 'acum', 'doar',
  'mult', 'mai', 'cele', 'celor', 'prin', 'intre', 'spre', 'lui', 'unei', 'unui', 'noua', 'nou',
  'spune', 'anunta', 'cand', 'unde', 'cine', 'cum', 'avea', 'are', 'vrea', 'fara',
]);

function tokens(title = '') {
  return new Set(
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !STOPWORDS.has(w)),
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  return shared / (a.size + b.size - shared);
}

function readLinks() {
  try {
    return JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

/** Remember a story's source links; call when the story is chosen for a post. */
export function recordPostedLinks(story) {
  try {
    const all = readLinks();
    all[story.id] = { at: new Date().toISOString(), links: (story.sources || []).map(s => s.link).filter(Boolean) };
    const trimmed = Object.fromEntries(
      Object.entries(all).sort((a, b) => (a[1].at < b[1].at ? 1 : -1)).slice(0, 300),
    );
    fs.mkdirSync(path.dirname(LINKS_FILE), { recursive: true });
    fs.writeFileSync(LINKS_FILE, JSON.stringify(trimmed), 'utf8');
  } catch (e) {
    console.warn('⚠️ Nu am putut salva posted_links.json:', e.message);
  }
}

/**
 * Returns the reason a story would repeat an earlier post, or null if it is new.
 * `postedLinks` defaults to social_export/posted_links.json ({ [storyId]: { links } }).
 */
export function repeatReason(story, history, postedLinks = readLinks()) {
  const ids = new Set(history.map(h => h.id));
  if (ids.has(story.id)) return 'același id';

  const title = (story.title || '').trim().toLowerCase();
  const recent = history.slice(-TITLE_WINDOW);
  if (recent.some(h => (h.title || '').trim().toLowerCase() === title)) return 'același titlu';

  const own = tokens(story.title);
  const similar = recent.find(h => jaccard(own, tokens(h.title)) >= TITLE_SIMILARITY);
  if (similar) return `titlu asemănător cu „${(similar.title || '').slice(0, 60)}”`;

  const links = new Set((story.sources || []).map(s => s.link).filter(Boolean));
  if (links.size) {
    for (const [id, entry] of Object.entries(postedLinks)) {
      if (!ids.has(id)) continue; // chosen but never actually posted
      const posted = entry.links || [];
      const shared = posted.filter(l => links.has(l)).length;
      if (shared >= 2 || (shared > 0 && shared / Math.min(links.size, posted.length) >= 0.3)) {
        return `${shared} articole comune cu o postare anterioară`;
      }
    }
  }
  return null;
}

/** Stories not yet posted, logging why each skipped one counts as a repeat. */
export function filterUnposted(stories, history, postedLinks = readLinks()) {
  return stories.filter(s => {
    const reason = repeatReason(s, history, postedLinks);
    if (reason) console.log(`   ↷ sar peste „${(s.title || '').slice(0, 50)}”: ${reason}`);
    return !reason;
  });
}

/** Editorial priority for social posts: blindspot stories first (+10), then source count. */
export function socialScore(story) {
  const blindspot = story.blindspot && story.blindspot !== 'none' ? 10 : 0;
  return blindspot + (story.sourcesCount || story.sources?.length || 0);
}

/**
 * The story to post next: the highest-priority one that does not repeat an earlier post
 * (ties keep the API's order). `story` is null when everything was already posted; callers
 * must then skip the post rather than repeat one.
 */
export function pickStoryToPost(stories, history, postedLinks = readLinks()) {
  const unposted = filterUnposted(stories, history, postedLinks);
  const story = [...unposted].sort((a, b) => socialScore(b) - socialScore(a))[0] ?? null;
  return { story, unposted };
}
