import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Sets Access-Control-Allow-Origin to the request's origin when it matches an
 * allowed origin, rather than using a wildcard.
 *
 * Allowed origins:
 *  1. The value of the SITE_URL environment variable (production domain)
 *  2. Any localhost origin (development)
 *
 * Falls back to '*' only in development when SITE_URL is not configured.
 * In production, unknown origins are blocked.
 */
export function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
    const origin = req.headers.origin as string | undefined;
    const siteUrl = process.env.SITE_URL;
    const isProduction = process.env.NODE_ENV === 'production';

    const isLocalhost = origin ? /^https?:\/\/localhost(:\d+)?$/.test(origin) : false;
    const isAllowedOrigin = origin && siteUrl && origin === siteUrl;

    if (isAllowedOrigin || isLocalhost) {
        res.setHeader('Access-Control-Allow-Origin', origin as string);
        res.setHeader('Vary', 'Origin');
    } else if (!siteUrl && !isProduction) {
        // Keep permissive behaviour only in development.
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    // In production, if SITE_URL is missing or doesn't match, we intentionally
    // do not set ACAO, so browsers block unknown cross-origin requests.

    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
