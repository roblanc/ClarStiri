import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from './cors.js';

interface WaybackCapture {
    timestamp: string;
    original: string;
}

const MAX_RESULTS = 150;
const REQUEST_TIMEOUT_MS = 8000;

function parseDomainInput(rawInput: string): URL {
    const candidate = rawInput.trim();
    if (!candidate) throw new Error('Missing domain');

    try {
        return new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`);
    } catch {
        throw new Error('Invalid domain');
    }
}

function buildWaybackPatterns(rawInput: string): string[] {
    const parsed = parseDomainInput(rawInput);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname === '/'
        ? ''
        : parsed.pathname.replace(/\/+$/, '');

    if (!hostname) throw new Error('Invalid hostname');

    const hosts = new Set<string>([hostname, `www.${hostname}`]);
    const patterns: string[] = [];

    hosts.forEach((host) => {
        const pathPrefix = pathname ? `${pathname}/` : '/';
        patterns.push(`${host}${pathPrefix}*`);
    });

    return patterns;
}

async function fetchWaybackCaptures(pattern: string): Promise<WaybackCapture[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const apiUrl =
            `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(pattern)}` +
            `&output=json&fl=timestamp,original,statuscode,mimetype&limit=${MAX_RESULTS}` +
            '&collapse=urlkey&filter=statuscode:200&filter=mimetype:text/html';

        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json,text/plain,*/*',
                'User-Agent': 'Mozilla/5.0 (compatible; thesite-wayback/1.0)',
            },
            signal: controller.signal as RequestInit['signal'],
        });

        if (!response.ok) {
            throw new Error(`Wayback responded with ${response.status}`);
        }

        const rows = await response.json() as string[][];
        if (!Array.isArray(rows) || rows.length <= 1) return [];

        return rows
            .slice(1)
            .map((row) => ({
                timestamp: row[0],
                original: row[1],
            }))
            .filter((row) => row.timestamp && row.original);
    } finally {
        clearTimeout(timeoutId);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const rawDomain = Array.isArray(req.query.domain) ? req.query.domain[0] : req.query.domain;
    if (!rawDomain) {
        return res.status(400).json({ success: false, error: 'Missing domain parameter' });
    }

    try {
        const patterns = buildWaybackPatterns(rawDomain);
        const settled = await Promise.allSettled(patterns.map((pattern) => fetchWaybackCaptures(pattern)));

        const successful = settled.filter(
            (result): result is PromiseFulfilledResult<WaybackCapture[]> => result.status === 'fulfilled',
        );

        if (successful.length === 0) {
            const firstError = settled.find(
                (result): result is PromiseRejectedResult => result.status === 'rejected',
            );

            throw firstError?.reason instanceof Error
                ? firstError.reason
                : new Error('Wayback lookup failed');
        }

        const deduped = new Map<string, WaybackCapture>();
        successful.forEach((result) => {
            result.value.forEach((capture) => {
                const key = capture.original.toLowerCase();
                const existing = deduped.get(key);
                if (!existing || capture.timestamp > existing.timestamp) {
                    deduped.set(key, capture);
                }
            });
        });

        const captures = Array.from(deduped.values())
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            .slice(0, MAX_RESULTS);

        res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');

        return res.status(200).json({
            success: true,
            data: captures,
        });
    } catch (error) {
        const isDevelopment = process.env.NODE_ENV !== 'production';
        return res.status(502).json({
            success: false,
            error: 'Wayback lookup failed',
            ...(isDevelopment
                ? { detail: error instanceof Error ? error.message : 'unknown' }
                : {}),
        });
    }
}
