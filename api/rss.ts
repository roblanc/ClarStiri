import type { VercelRequest, VercelResponse } from '@vercel/node';
import { NEWS_SOURCES } from './shared.js';
import { setCorsHeaders } from './cors.js';

// Build an allowlist from the known RSS feed hostnames — no arbitrary URLs accepted
const ALLOWED_RSS_HOSTS = new Set([
    ...NEWS_SOURCES.map(s => new URL(s.rssUrl).hostname),
    'news.google.com', // used by analyze-voice
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    try {
        const decoded = decodeURIComponent(url);

        // Validate against the allowlist before fetching
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(decoded);
        } catch {
            return res.status(400).json({ error: 'Invalid URL' });
        }
        if (!ALLOWED_RSS_HOSTS.has(parsedUrl.hostname)) {
            return res.status(403).json({ error: 'URL not allowed' });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(decoded, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
            },
            signal: controller.signal as RequestInit['signal'],
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return res.status(response.status).end();
        }

        const content = await response.text();
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return res.status(200).send(content);
    } catch (error) {
        return res.status(500).json({ error: 'Proxy failed', detail: error instanceof Error ? error.message : 'unknown' });
    }
}
