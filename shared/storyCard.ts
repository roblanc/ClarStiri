import { decodeHtmlEntities } from './htmlEntities.js';
import type { SourceBias } from './newsSources.js';

/**
 * Slim "card" projection of an aggregated story, served by `GET /api/news?view=card`.
 *
 * Listing pages (homepage, search) only render the story headline, image, bias bar and the
 * list of outlets, so they don't need each article's text, link, image or bias analysis — that
 * is ~80% of the full payload. The story page fetches the full story via `/api/news?id=<id>`.
 *
 * To expose another per-source field on cards (e.g. a new bias score), add its key to
 * STORY_CARD_SOURCE_FIELDS; to expose another story field, add it to STORY_CARD_FIELDS.
 */

export const STORY_CARD_FIELDS = [
    'id',
    'title',
    'description',
    'image',
    'sourcesCount',
    'independentCount',
    'bias',
    'blindspot',
    'mainCategory',
    'publishedAt',
    'timeAgo',
] as const;

export const STORY_CARD_SOURCE_FIELDS = ['id', 'name', 'url', 'bias'] as const;

export interface StoryCardSource {
    id: string;
    name: string;
    url: string;
    bias: SourceBias;
}

export interface StoryCard<TDate = string> {
    id: string;
    title: string;
    description: string;
    image?: string;
    sourcesCount: number;
    /** Reports after collapsing wire copies (see shared/coverage.ts). */
    independentCount?: number;
    bias: { left: number; center: number; right: number };
    blindspot?: 'left' | 'right' | 'none';
    mainCategory: string;
    publishedAt: TDate;
    timeAgo: string;
    /** One entry per article, in the same order as the full story; only the outlet is kept. */
    sources: Array<{ source: StoryCardSource }>;
}

/** Structural subset of the server's AggregatedStory that the projection reads. */
export interface StoryCardInput {
    id: string;
    title: string;
    description?: string;
    image?: string;
    sources: Array<{ imageUrl?: string; source?: Partial<StoryCardSource> }>;
    sourcesCount: number;
    independentCount?: number;
    bias: { left: number; center: number; right: number };
    blindspot?: 'left' | 'right' | 'none';
    mainCategory?: string;
    publishedAt: string;
    timeAgo: string;
}

function pick<T extends object, K extends string>(obj: T | undefined, keys: readonly K[]): Record<K, unknown> {
    const out = {} as Record<K, unknown>;
    if (!obj) return out;
    for (const key of keys) {
        const value = (obj as Record<string, unknown>)[key];
        if (value !== undefined) out[key] = value;
    }
    return out;
}

export function toStoryCard(story: StoryCardInput): StoryCard {
    const card = pick(story, STORY_CARD_FIELDS) as unknown as StoryCard;
    card.title = decodeHtmlEntities(story.title || '');
    card.description = decodeHtmlEntities(story.description || '');
    card.mainCategory = decodeHtmlEntities(story.mainCategory || '');
    // The client used to fall back to the first article image; do it here since cards drop articles.
    const image = story.image || story.sources.find((item) => item.imageUrl)?.imageUrl;
    if (image) card.image = image;
    else delete card.image;
    card.sources = story.sources.map((item) => ({
        source: pick(item.source, STORY_CARD_SOURCE_FIELDS) as unknown as StoryCardSource,
    }));
    return card;
}

/** True when a story from the client cache is only a card (its articles have no title/link). */
export function isStoryCard(story: { sources: ReadonlyArray<object> }): boolean {
    return story.sources.some((item) => !('link' in item));
}
