import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Sets Access-Control-Allow-Origin to the request's origin when it matches an
 * allowed origin, rather than using a wildcard.
 *
 * Allowed origins:
 *  1. The value of the SITE_URL environment variable (production domain)
 *  2. Any localhost origin (development)
 *
 * Falls back to '*' only when SITE_URL is not configured, so behaviour is
 * unchanged for existing deployments that haven't set the variable yet.
 */
export function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
    const origin = req.headers.origin as string | undefined;
    const siteUrl = process.env.SITE_URL;

    const isLocalhost = origin ? /^https?:\/\/localhost(:\d+)?$/.test(origin) : false;
    const isAllowedOrigin = origin && siteUrl && origin === siteUrl;

    if (isAllowedOrigin || isLocalhost) {
        res.setHeader('Access-Control-Allow-Origin', origin as string);
        res.setHeader('Vary', 'Origin');
    } else if (!siteUrl) {
        // SITE_URL not yet configured — keep existing behaviour
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    // If SITE_URL is set and origin doesn't match, no ACAO header is set,
    // which causes browsers to block cross-origin requests from unknown sites.

    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
