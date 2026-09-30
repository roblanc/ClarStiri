import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { biasPercentages, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '../../shared/ogImage.js';

/**
 * 1200x630 share card for a story (Facebook, WhatsApp, X, LinkedIn, Telegram previews), drawn
 * with Satori via @vercel/og: source photo on the right, headline in Playfair Display (the
 * homepage hero face) on the left, and the site's left/center/right coverage bar along the bottom.
 *
 * Fonts are full (unsubsetted) static TTFs of Playfair Display 800 and IBM Plex Sans 600/700 from
 * Google Fonts (SIL OFL 1.1), so ă â î ș ț and the cedilla ş ţ many outlets still use all come
 * from the same face. Satori does not merge unicode-range subsets (the @fontsource WOFFs rendered
 * latin-ext letters in a fallback face), hence the full files. They live in ./og-fonts and are
 * shipped with the function via `includeFiles` in vercel.json.
 */

export interface OgCardStory {
    title: string;
    image?: string;
    sourcesCount?: number;
    mainCategory?: string;
    bias?: { left: number; center: number; right: number } | null;
    blindspot?: 'left' | 'right' | 'none';
}

type Child = OgNode | string | null | false | undefined;
interface OgNode {
    type: string;
    props: Record<string, unknown> & { children?: Child | Child[] };
}

function el(type: string, style: Record<string, unknown>, children?: Child | Child[], extra: Record<string, unknown> = {}): OgNode {
    return { type, props: { style, children, ...extra } };
}

const COLORS = {
    ink: '#0E0E0E',
    brand: '#3BD432',
    left: '#28508a',
    center: '#FFFFFF',
    right: '#822727',
} as const;

const FONT_DIR = path.join(process.cwd(), 'api', '_lib', 'og-fonts');
const FONT_FILES = [
    { name: 'Playfair Display', weight: 800, file: 'PlayfairDisplay-ExtraBold.ttf' },
    { name: 'IBM Plex Sans', weight: 600, file: 'IBMPlexSans-SemiBold.ttf' },
    { name: 'IBM Plex Sans', weight: 700, file: 'IBMPlexSans-Bold.ttf' },
] as const;

type LoadedFont = { name: string; data: ArrayBuffer; weight: 600 | 700 | 800; style: 'normal' };
let fontsPromise: Promise<LoadedFont[]> | null = null;

function loadFonts(): Promise<LoadedFont[]> {
    if (!fontsPromise) {
        fontsPromise = Promise.all(
            FONT_FILES.map(async f => {
                const buf = await readFile(path.join(FONT_DIR, f.file));
                const data = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
                return { name: f.name, data, weight: f.weight, style: 'normal' as const };
            })
        ).catch(err => {
            fontsPromise = null;
            throw err;
        });
    }
    return fontsPromise;
}

const PHOTO_WIDTH = 440;
const BAR_HEIGHT = 96;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

async function fetchAsDataUri(url: string, timeoutMs: number): Promise<string | null> {
    try {
        const response = await fetch(url, {
            signal: AbortSignal.timeout(timeoutMs),
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; thesite-og/1.0; +https://thesite.ro)' },
        });
        if (!response.ok) return null;
        const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
        // Satori decodes PNG and JPEG reliably; anything else goes through the wsrv.nl conversion.
        if (type !== 'image/jpeg' && type !== 'image/png') return null;
        const buf = Buffer.from(await response.arrayBuffer());
        if (!buf.length || buf.length > MAX_PHOTO_BYTES) return null;
        return `data:${type};base64,${buf.toString('base64')}`;
    } catch {
        return null;
    }
}

/** Source photo cropped to the right-hand panel, as a data URI, or null (card then goes text-only). */
async function loadPhoto(imageUrl: string | undefined): Promise<string | null> {
    if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) return null;
    // wsrv.nl (already the site's image CDN) crops, resizes and converts WebP/AVIF to JPEG.
    const viaCdn = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=${PHOTO_WIDTH}&h=${OG_IMAGE_HEIGHT - BAR_HEIGHT}&fit=cover&a=attention&output=jpg&q=80`;
    return (await fetchAsDataUri(viaCdn, 3500)) ?? (await fetchAsDataUri(imageUrl, 2500));
}

export function headlineFontSize(title: string, hasPhoto: boolean): number {
    const n = title.length;
    const scale = hasPhoto ? 1 : 1.12;
    let size: number;
    if (n <= 50) size = 64;
    else if (n <= 80) size = 56;
    else if (n <= 110) size = 48;
    else if (n <= 150) size = 42;
    else size = 38;
    return Math.round(size * scale);
}

export function clampHeadline(title: string, max = 190): string {
    const clean = title.replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`;
}

function coverageBar(bias: OgCardStory['bias']): OgNode {
    const p = biasPercentages(bias);
    const segments = ([
        ['left', 'Stânga', COLORS.left, '#FFFFFF'],
        ['center', 'Centru', COLORS.center, '#111827'],
        ['right', 'Dreapta', COLORS.right, '#FFFFFF'],
    ] as const).filter(([key]) => p[key] > 0);

    if (segments.length === 0) {
        return el('div', {
            display: 'flex', height: BAR_HEIGHT, width: '100%', alignItems: 'center', justifyContent: 'center',
            background: '#1c1c1c', color: '#d4d4d4', fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 24,
        }, 'Distribuția pe perspective nu este încă disponibilă');
    }

    return el('div', { display: 'flex', height: BAR_HEIGHT, width: '100%' }, segments.map(([key, label, bg, fg]) =>
        el('div', {
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flexGrow: p[key], flexShrink: 0, flexBasis: 0, minWidth: 150, background: bg, color: fg,
            fontFamily: 'IBM Plex Sans',
        }, [
            el('div', { fontSize: 18, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', opacity: 0.8 }, label),
            el('div', { fontSize: 38, fontWeight: 700, lineHeight: 1.05 }, `${p[key]}%`),
        ])
    ));
}

export function buildCardTree(story: OgCardStory, photo: string | null): OgNode {
    const title = clampHeadline(story.title || 'thesite.ro');
    const fontSize = headlineFontSize(title, Boolean(photo));
    const sources = story.sourcesCount ?? 0;
    const blind = story.blindspot === 'left' ? 'Ignorat de Stânga' : story.blindspot === 'right' ? 'Ignorat de Dreapta' : null;
    const meta = [sources > 0 ? `${sources} ${sources === 1 ? 'sursă' : 'surse'}` : null, story.mainCategory || null]
        .filter(Boolean)
        .join('  ·  ');

    const pill = (text: string, bg: string, fg: string) => el('div', {
        display: 'flex', padding: '6px 14px', background: bg, color: fg,
        fontFamily: 'IBM Plex Sans', fontWeight: 700, fontSize: 22, letterSpacing: 0.5,
    }, text);

    const textPanel = el('div', {
        display: 'flex', flexDirection: 'column', flexGrow: 1, flexBasis: 0, height: '100%',
        padding: '44px 56px 36px 56px', background: COLORS.ink,
    }, [
        el('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
            pill('thesite.ro', COLORS.brand, '#000000'),
            blind ? pill(blind, '#FFFFFF', '#111111') : null,
        ]),
        el('div', { display: 'flex', flexGrow: 1, alignItems: 'center', paddingTop: 12, paddingBottom: 12 }, [
            el('div', {
                display: 'flex', color: '#FFFFFF', fontFamily: 'Playfair Display', fontWeight: 800,
                fontSize, lineHeight: 1.12, letterSpacing: -0.5,
            }, title),
        ]),
        el('div', {
            display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.72)',
            fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 22, letterSpacing: 1.5, textTransform: 'uppercase',
        }, [
            el('div', { display: 'flex' }, meta || 'Știri din toate perspectivele'),
            el('div', { display: 'flex', color: COLORS.brand }, 'Compară sursele →'),
        ]),
    ]);

    const photoPanel = photo
        ? el('div', { display: 'flex', width: PHOTO_WIDTH, height: '100%', position: 'relative' }, [
            el('img', { width: PHOTO_WIDTH, height: OG_IMAGE_HEIGHT - BAR_HEIGHT, objectFit: 'cover' }, undefined, {
                src: photo, width: PHOTO_WIDTH, height: OG_IMAGE_HEIGHT - BAR_HEIGHT,
            }),
            // Soft seam between photo and text panel.
            el('div', {
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 80,
                backgroundImage: `linear-gradient(90deg, ${COLORS.ink}, rgba(14,14,14,0))`,
            }),
        ])
        : null;

    return el('div', {
        display: 'flex', flexDirection: 'column', width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, background: COLORS.ink,
    }, [
        el('div', { display: 'flex', width: '100%', height: OG_IMAGE_HEIGHT - BAR_HEIGHT }, [textPanel, photoPanel]),
        coverageBar(story.bias),
    ]);
}

/** Renders the card to PNG bytes. Throws on failure so the caller can fall back to the source photo. */
export async function renderStoryCard(story: OgCardStory): Promise<Buffer> {
    const [{ ImageResponse }, fonts, photo] = await Promise.all([
        import('@vercel/og'),
        loadFonts(),
        loadPhoto(story.image),
    ]);
    const response = new ImageResponse(buildCardTree(story, photo) as unknown as ConstructorParameters<typeof ImageResponse>[0], {
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        fonts,
    });
    const png = Buffer.from(await response.arrayBuffer());
    if (png.length < 1000) throw new Error('OG render produced an empty image');
    return png;
}
