/**
 * Image Optimizer using wsrv.nl
 * 
 * Optimizează imaginile externe prin:
 * - Conversie la WebP (reducere 30-80% dimensiune)
 * - Redimensionare la dimensiunea necesară
 * - Compresie cu quality control
 * - CDN caching global
 */

// Dimensiuni predefinite pentru diferite contexte
export const IMAGE_SIZES = {
    featured: { width: 800, height: 600 },    // FeaturedStory - prioritate mare
    thumbnail: { width: 400, height: 300 },   // NewsListItem, liste, poster desktop
    cardThumb: { width: 260, height: 194 },   // Mobile card thumbnails (124px * 2x retina)
    small: { width: 200, height: 150 },       // DailyBriefing
    favicon: { width: 32, height: 32 },       // Source favicons
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

interface OptimizeOptions {
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

function isExternalHttpUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Verifică dacă un URL este o imagine externă care trebuie optimizată
 */
function shouldOptimize(url: string): boolean {
    if (!url) return false;

    // Nu optimiza imagini deja optimize sau locale
    if (url.includes('wsrv.nl')) return false;
    if (url.startsWith('/api/image')) return false;
    if (url.startsWith('/')) return false;
    if (url.startsWith('data:')) return false;

    // Optimizează doar imagini externe HTTP(S)
    return isExternalHttpUrl(url);
}

function extractOriginalImageUrl(url: string): string {
    if (!url) return '';

    if (url.startsWith('/api/image')) {
        return url;
    }

    if (url.includes('wsrv.nl')) {
        try {
            const parsed = new URL(url);
            return parsed.searchParams.get('url') || '';
        } catch {
            return '';
        }
    }

    return isExternalHttpUrl(url) ? url : '';
}

export function getImageProxyUrl(url: string | undefined): string {
    const originalUrl = extractOriginalImageUrl(url || '');
    if (!originalUrl || originalUrl.startsWith('/api/image')) {
        return originalUrl;
    }

    return `/api/image?url=${encodeURIComponent(originalUrl)}`;
}

/**
 * Optimizează un URL de imagine folosind wsrv.nl
 * 
 * @param url - URL-ul imaginii originale
 * @param size - Dimensiunea predefinită sau opțiuni custom
 * @returns URL optimizat sau original dacă nu poate fi optimizat
 */
export function optimizeImageUrl(
    url: string | undefined,
    size: ImageSize | OptimizeOptions = 'thumbnail'
): string {
    if (!url || !shouldOptimize(url)) {
        return url || '';
    }

    // Determină dimensiunile
    const options: OptimizeOptions = typeof size === 'string'
        ? {
            width: IMAGE_SIZES[size].width,
            height: IMAGE_SIZES[size].height,
            quality: size === 'featured' ? 80 : 75, // Featured = higher quality
            fit: 'cover'
        }
        : size;

    const { width, height, quality = 75, fit = 'cover' } = options;

    // Construiește URL-ul wsrv.nl
    const params = new URLSearchParams();
    params.set('url', url);

    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('fit', fit);
    params.set('output', 'webp'); // Conversie WebP automată

    return `https://wsrv.nl/?${params.toString()}`;
}

/**
 * Generează srcset pentru imagini responsive: câte o redare wsrv.nl pentru
 * fiecare lățime, toate decupate la același raport (înălțime / lățime), ca
 * browserul să aleagă după `sizes` și densitatea ecranului.
 * Returnează '' pentru imagini care nu trec prin wsrv.nl (locale, placeholder).
 */
export function getResponsiveSrcSet(
    url: string | undefined,
    widths: readonly number[],
    aspectRatio: number,
    quality = 75
): string {
    if (!url || !shouldOptimize(url)) return '';

    return widths
        .map((width) => {
            const height = Math.round(width * aspectRatio);
            return `${optimizeImageUrl(url, { width, height, quality, fit: 'cover' })} ${width}w`;
        })
        .join(', ');
}

/**
 * Poster card (desktop/tablet grid): the box is ~270–460 CSS px wide × 256 px.
 * 400w is the old single rendition (keeps wsrv's CDN cache warm); 660w / 800w
 * cover 2x screens. Same 4:3 crop as IMAGE_SIZES.thumbnail.
 */
export const POSTER_IMAGE = {
    widths: [400, 660, 800],
    aspectRatio: IMAGE_SIZES.thumbnail.height / IMAGE_SIZES.thumbnail.width,
    sizes: '(min-width: 1280px) 330px, (min-width: 1024px) 30vw, (min-width: 768px) 46vw, 100vw',
} as const;

/**
 * Mobile card thumbnail, shown at 124×82 CSS px. 260w is the old single
 * rendition (2x); 130w / 390w serve 1x and 3x screens.
 */
export const CARD_THUMB_IMAGE = {
    widths: [130, 260, 390],
    aspectRatio: IMAGE_SIZES.cardThumb.height / IMAGE_SIZES.cardThumb.width,
    sizes: '124px',
} as const;

/**
 * Helper pentru Featured Story (LCP element)
 * Prioritizează încărcarea rapidă
 */
export function getFeaturedImageUrl(url: string | undefined): string {
    return optimizeImageUrl(url, 'featured');
}

/**
 * Helper pentru thumbnail-uri în liste
 */
export function getThumbnailUrl(url: string | undefined): string {
    return optimizeImageUrl(url, 'thumbnail');
}

/**
 * Helper pentru thumbnail-uri mici în carduri mobile (124px container * 2x retina)
 */
export function getCardThumbUrl(url: string | undefined): string {
    return optimizeImageUrl(url, 'cardThumb');
}

/**
 * Helper pentru imagini mici (sidebar, briefing)
 */
export function getSmallImageUrl(url: string | undefined): string {
    return optimizeImageUrl(url, 'small');
}
