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
    thumbnail: { width: 400, height: 300 },   // NewsListItem, liste
    small: { width: 200, height: 150 },       // BlindspotCard, DailyBriefing
    favicon: { width: 32, height: 32 },       // Source favicons
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

interface OptimizeOptions {
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Verifică dacă un URL este o imagine externă care trebuie optimizată
 */
function shouldOptimize(url: string): boolean {
    if (!url) return false;

    // Nu optimiza imagini deja optimize sau locale
    if (url.includes('wsrv.nl')) return false;
    if (url.startsWith('/')) return false;
    if (url.startsWith('data:')) return false;

    // Optimizează doar imagini externe HTTP(S)
    return url.startsWith('http://') || url.startsWith('https://');
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
    params.set('default', 'placeholder'); // Placeholder dacă imaginea nu există

    return `https://wsrv.nl/?${params.toString()}`;
}

/**
 * Generează srcset pentru imagini responsive
 */
export function getResponsiveSrcSet(
    url: string | undefined,
    baseWidth: number = 400
): string {
    if (!url) return '';

    const sizes = [1, 1.5, 2]; // 1x, 1.5x, 2x pentru retina displays

    return sizes
        .map(multiplier => {
            const width = Math.round(baseWidth * multiplier);
            const optimized = optimizeImageUrl(url, { width, quality: multiplier > 1 ? 70 : 75 });
            return `${optimized} ${width}w`;
        })
        .join(', ');
}

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
 * Helper pentru imagini mici (sidebar, briefing)
 */
export function getSmallImageUrl(url: string | undefined): string {
    return optimizeImageUrl(url, 'small');
}
