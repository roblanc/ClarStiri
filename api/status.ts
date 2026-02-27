import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const out: Record<string, unknown> = {};

    // Vercel region
    out.region = process.env.VERCEL_REGION ?? process.env.AWS_REGION ?? 'unknown';

    // Redis
    try {
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        const [cache, ts] = await Promise.all([
            redis.get<unknown[]>('aggregated_news'),
            redis.get<number>('aggregated_news_ts'),
        ]);
        out.redis = {
            status: 'ok',
            hasCache: cache !== null,
            cacheItems: Array.isArray(cache) ? cache.length : 0,
            cacheAgeSeconds: ts ? Math.round((Date.now() - ts) / 1000) : null,
        };
    } catch (e) {
        out.redis = { status: 'error', message: String(e) };
    }

    // RSS direct fetch test (digi24)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const r = await fetch('https://www.digi24.ro/rss', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml',
            },
            signal: controller.signal as RequestInit['signal'],
        });
        clearTimeout(timeoutId);
        const body = await r.text();
        out.rss_digi24 = {
            status: r.ok ? 'ok' : 'http_error',
            httpStatus: r.status,
            isXML: body.trimStart().startsWith('<') && !body.toLowerCase().startsWith('<html'),
            bodyLength: body.length,
        };
    } catch (e) {
        out.rss_digi24 = { status: 'fetch_error', message: String(e) };
    }

    // RSS via allorigins.win
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const r = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.digi24.ro/rss'), {
            signal: controller.signal as RequestInit['signal'],
        });
        clearTimeout(timeoutId);
        const body = await r.text();
        out.rss_digi24_via_allorigins = {
            status: r.ok ? 'ok' : 'http_error',
            httpStatus: r.status,
            isXML: body.trimStart().startsWith('<') && !body.toLowerCase().startsWith('<html'),
            bodyLength: body.length,
        };
    } catch (e) {
        out.rss_digi24_via_allorigins = { status: 'fetch_error', message: String(e) };
    }

    return res.status(200).json(out);
}
