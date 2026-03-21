import type { VercelRequest, VercelResponse } from '@vercel/node';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { setCorsHeaders } from './cors.js';

const MAX_REDIRECTS = 4;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function isPrivateIpAddress(address: string): boolean {
    if (address.includes(':')) {
        const normalized = address.toLowerCase();
        return normalized === '::1'
            || normalized.startsWith('fc')
            || normalized.startsWith('fd')
            || normalized.startsWith('fe8')
            || normalized.startsWith('fe9')
            || normalized.startsWith('fea')
            || normalized.startsWith('feb');
    }

    const parts = address.split('.').map(part => Number.parseInt(part, 10));
    if (parts.length !== 4 || parts.some(Number.isNaN)) return true;

    const [a, b] = parts;
    return a === 0
        || a === 10
        || a === 127
        || (a === 169 && b === 254)
        || (a === 172 && b >= 16 && b <= 31)
        || (a === 192 && b === 168)
        || (a === 100 && b >= 64 && b <= 127)
        || (a === 198 && (b === 18 || b === 19));
}

async function assertSafeUrl(rawUrl: string): Promise<URL> {
    let parsed: URL;
    try {
        parsed = new URL(rawUrl);
    } catch {
        throw new Error('Invalid URL');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Unsupported protocol');
    }

    if (!parsed.hostname || parsed.hostname === 'localhost' || parsed.hostname.endsWith('.local')) {
        throw new Error('Blocked hostname');
    }

    if (isIP(parsed.hostname) && isPrivateIpAddress(parsed.hostname)) {
        throw new Error('Blocked IP');
    }

    const addresses = await lookup(parsed.hostname, { all: true });
    if (!addresses.length || addresses.some(result => isPrivateIpAddress(result.address))) {
        throw new Error('Blocked host resolution');
    }

    return parsed;
}

async function fetchImageWithRedirects(initialUrl: URL): Promise<Response> {
    let currentUrl = initialUrl;

    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
        await assertSafeUrl(currentUrl.toString());

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const response = await fetch(currentUrl.toString(), {
                method: 'GET',
                redirect: 'manual',
                signal: controller.signal as RequestInit['signal'],
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; thesite-image-proxy/1.0)',
                    'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Referer': currentUrl.origin,
                },
            });

            clearTimeout(timeoutId);

            if (response.status >= 300 && response.status < 400) {
                const location = response.headers.get('location');
                if (!location) throw new Error('Redirect without location');
                currentUrl = new URL(location, currentUrl);
                continue;
            }

            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    throw new Error('Too many redirects');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const url = req.query.url as string | undefined;
    if (!url) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        const targetUrl = await assertSafeUrl(decodeURIComponent(url));
        const upstream = await fetchImageWithRedirects(targetUrl);

        if (!upstream.ok) {
            return res.status(upstream.status).end();
        }

        const contentType = upstream.headers.get('content-type') || '';
        if (!contentType.startsWith('image/')) {
            return res.status(415).json({ error: 'Upstream resource is not an image' });
        }

        const body = Buffer.from(await upstream.arrayBuffer());
        if (!body.length) {
            return res.status(502).json({ error: 'Empty image response' });
        }

        if (body.length > MAX_IMAGE_BYTES) {
            return res.status(413).json({ error: 'Image too large' });
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');

        const etag = upstream.headers.get('etag');
        if (etag) res.setHeader('ETag', etag);

        res.setHeader('Content-Length', body.length.toString());

        return res.status(200).send(body);
    } catch (error) {
        const isDevelopment = process.env.NODE_ENV !== 'production';
        return res.status(500).json({
            error: 'Image proxy failed',
            ...(isDevelopment ? { detail: error instanceof Error ? error.message : 'unknown' } : {}),
        });
    }
}
