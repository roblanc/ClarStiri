import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    try {
        const decoded = decodeURIComponent(url);

        const response = await fetch(decoded, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
            },
            signal: AbortSignal.timeout(8000),
        });

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
