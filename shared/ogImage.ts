/**
 * Per-story Open Graph card URL, shared by the bot meta injection (api/story-page.ts) and the
 * client-side <Helmet> tags (src/components/NewsSchema.tsx) so both point at the same image.
 *
 * The card is rendered by api/story-page.ts?og=1. The `v` param is a short hash of everything
 * drawn on the card, so the CDN can cache each version for a long time and platforms that cache
 * by URL (Facebook, WhatsApp, X) pick up a new card when the headline or bias split changes.
 */

export const SITE_URL = 'https://thesite.ro';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export interface OgStoryInput {
    id: string;
    title: string;
    bias?: { left: number; center: number; right: number } | null;
    sourcesCount?: number;
}

/** Bias split as whole percentages that always add up to 100 (or all zero when there's no data). */
export function biasPercentages(bias: OgStoryInput['bias']): { left: number; center: number; right: number } {
    const left = Math.max(0, Number(bias?.left) || 0);
    const center = Math.max(0, Number(bias?.center) || 0);
    const right = Math.max(0, Number(bias?.right) || 0);
    const total = left + center + right;
    if (total <= 0) return { left: 0, center: 0, right: 0 };

    const raw = { left: (left / total) * 100, center: (center / total) * 100, right: (right / total) * 100 };
    const rounded = { left: Math.floor(raw.left), center: Math.floor(raw.center), right: Math.floor(raw.right) };
    // Largest-remainder rounding so the three labels on the card sum to exactly 100%.
    let missing = 100 - rounded.left - rounded.center - rounded.right;
    const byRemainder = (['left', 'center', 'right'] as const)
        .slice()
        .sort((a, b) => (raw[b] - rounded[b]) - (raw[a] - rounded[a]));
    for (const key of byRemainder) {
        if (missing <= 0) break;
        rounded[key] += 1;
        missing -= 1;
    }
    return rounded;
}

/** FNV-1a 32-bit, base36. Not cryptographic; only used as a cache-busting version tag. */
function shortHash(value: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
}

export function storyOgVersion(story: OgStoryInput): string {
    const b = biasPercentages(story.bias);
    return shortHash(`${story.title}|${b.left}|${b.center}|${b.right}|${story.sourcesCount ?? ''}`);
}

export function buildStoryOgImageUrl(story: OgStoryInput, site: string = SITE_URL): string {
    const params = new URLSearchParams({ id: story.id, og: '1', v: storyOgVersion(story) });
    return `${site}/api/story-page?${params.toString()}`;
}
