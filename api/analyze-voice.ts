import type { VercelRequest, VercelResponse } from '@vercel/node';
import Parser from 'rss-parser';
import { Redis } from '@upstash/redis';
import { NEWS_SOURCES, fetchRSSFeed } from './shared.js';
import { setCorsHeaders } from './cors.js';

const parser = new Parser();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';

type Impact = 'high' | 'medium' | 'low';
type Bias = 'left' | 'center-left' | 'center' | 'center-right' | 'right';

interface VoiceStatement {
    id: string;
    text: string;
    date: string;
    sourceUrl: string;
    topic: string;
    impact: Impact;
    bias: Bias;
    articleUrl?: string;
}

interface FeedArticle {
    title: string;
    link: string;
    snippet: string;
    date: string;
    source: string;
}

interface GeminiResult {
    statements?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function asString(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
}

function asImpact(value: unknown): Impact {
    return value === 'high' || value === 'medium' || value === 'low' ? value : 'medium';
}

function asBias(value: unknown): Bias {
    return value === 'left' || value === 'center-left' || value === 'center' || value === 'center-right' || value === 'right'
        ? value
        : 'center';
}

function asUrl(value: unknown, fallback: string): string {
    const candidate = asString(value, '').trim();
    if (!candidate) return fallback;
    try {
        const parsed = new URL(candidate);
        return parsed.toString();
    } catch {
        return fallback;
    }
}

function parseGeminiJson(rawText: string): GeminiResult {
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed: unknown = JSON.parse(cleaned);
    return isRecord(parsed) ? (parsed as GeminiResult) : {};
}

function normalizeStatement(raw: unknown, index: number, fallbackUrl: string): VoiceStatement | null {
    if (!isRecord(raw)) return null;

    const text = asString(raw.text, '').trim();
    if (!text) return null;

    return {
        id: asString(raw.id, `ai-${index}`),
        text,
        topic: asString(raw.topic, 'General'),
        date: asString(raw.date, 'Recent'),
        sourceUrl: asUrl(raw.sourceUrl, fallbackUrl),
        impact: asImpact(raw.impact),
        bias: asBias(raw.bias),
        articleUrl: asString(raw.articleUrl, '') || undefined,
    };
}

function dedupeStatements(statements: VoiceStatement[]): VoiceStatement[] {
    const seen = new Set<string>();
    return statements.filter((statement) => {
        const key = `${statement.text.toLowerCase()}|${statement.sourceUrl}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function sortArticlesByDateDesc(articles: FeedArticle[]): FeedArticle[] {
    return [...articles].sort((a, b) => {
        const timeA = Date.parse(a.date);
        const timeB = Date.parse(b.date);
        const safeA = Number.isNaN(timeA) ? 0 : timeA;
        const safeB = Number.isNaN(timeB) ? 0 : timeB;
        return safeB - safeA;
    });
}

async function loadAugmentedStatements(redis: Redis | null, slug: string | undefined): Promise<VoiceStatement[]> {
    if (!redis || !slug) return [];

    try {
        const redisKey = `profile:statements:${slug}`;
        const cached = await redis.get<unknown[]>(redisKey);
        if (!Array.isArray(cached)) return [];

        return cached
            .map((item, index) => normalizeStatement(item, index, 'https://news.google.com'))
            .filter((item): item is VoiceStatement => item !== null);
    } catch (error) {
        console.error('Redis read failed:', error);
        return [];
    }
}

async function fetchGoogleNews(name: string): Promise<FeedArticle[]> {
    const encodedName = encodeURIComponent(name);
    const googleFeedUrl = `https://news.google.com/rss/search?q=${encodedName}+when:7d&hl=ro&gl=RO&ceid=RO:ro`;

    try {
        const feed = await parser.parseURL(googleFeedUrl);
        return feed.items.map((item) => ({
            title: item.title || '',
            link: item.link || '',
            snippet: item.contentSnippet || item.content || '',
            date: item.pubDate || '',
            source: item.creator || 'Google News',
        }));
    } catch (error) {
        console.error('Google News fetch failed:', error);
        return [];
    }
}

async function fetchInternalNews(name: string): Promise<FeedArticle[]> {
    const lowerName = name.toLowerCase();
    const results = await Promise.allSettled(NEWS_SOURCES.map((source) => fetchRSSFeed(source)));

    return results
        .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchRSSFeed>>> => result.status === 'fulfilled')
        .flatMap((result) => result.value)
        .filter((item) => item.title.toLowerCase().includes(lowerName) || item.description.toLowerCase().includes(lowerName))
        .map((item) => ({
            title: item.title,
            link: item.link,
            snippet: item.description,
            date: item.pubDate,
            source: item.source.name,
        }));
}

async function generateStatementsWithGemini(name: string, articles: FeedArticle[]): Promise<VoiceStatement[]> {
    if (!GEMINI_API_KEY || articles.length === 0) return [];

    const articlesText = articles
        .map((article, index) => `[${index + 1}] Sursa: ${article.source}\nTitlu: ${article.title}\nSnippet: ${article.snippet}\nLink: ${article.link}`)
        .join('\n\n');

    const prompt = `Analizează următoarele articole de știri recente despre ${name}.
Scopul este să extragi 2-3 declarații recente, controversate sau semnificative (sau acțiuni/poziționări recente) ale acestei persoane.

Articole:
${articlesText}

Returnează un JSON valid cu cheia "statements" (array). Fiecare element trebuie să aibă:
- text: max 20 cuvinte
- topic: ex. Politică, Social, Extern
- date: data aproximativă sau "Recent"
- sourceUrl: URL complet către articol
- impact: high | medium | low
- bias: left | center-left | center | center-right | right

Nu inventa informații. Dacă datele sunt insuficiente, returnează "statements": [].`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 600,
                    response_mime_type: 'application/json',
                },
            }),
            signal: controller.signal as RequestInit['signal'],
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error('Gemini API Error:', response.status, await response.text());
            return [];
        }

        const data: unknown = await response.json();
        let jsonText = '';
        if (isRecord(data)) {
            const candidates = data.candidates;
            if (Array.isArray(candidates) && candidates.length > 0 && isRecord(candidates[0])) {
                const content = candidates[0].content;
                if (isRecord(content) && Array.isArray(content.parts) && content.parts.length > 0 && isRecord(content.parts[0])) {
                    jsonText = asString(content.parts[0].text, '');
                }
            }
        }

        if (!jsonText) return [];

        const parsed = parseGeminiJson(jsonText);
        const rawStatements = Array.isArray(parsed.statements) ? parsed.statements : [];
        const fallbackUrl = articles[0]?.link || 'https://news.google.com';

        return rawStatements
            .map((item, index) => normalizeStatement(item, index, fallbackUrl))
            .filter((item): item is VoiceStatement => item !== null);
    } catch (error) {
        console.error('Gemini call failed:', error);
        return [];
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { name, slug } = req.query;
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Missing name parameter' });
    }

    let redis: Redis | null = null;
    try {
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            let url = process.env.UPSTASH_REDIS_REST_URL;
            if (!url.startsWith('http')) url = `https://${url}`;
            redis = new Redis({ url, token: process.env.UPSTASH_REDIS_REST_TOKEN });
        }
    } catch (error) {
        console.error('Redis init failed:', error);
    }

    try {
        const safeSlug = typeof slug === 'string' ? slug : undefined;
        const augmentedStatements = await loadAugmentedStatements(redis, safeSlug);

        const [googleArticles, internalArticles] = await Promise.all([
            fetchGoogleNews(name),
            fetchInternalNews(name),
        ]);

        const uniqueArticles = Array.from(
            new Map([...internalArticles, ...googleArticles].map((article) => [article.link, article])).values(),
        );

        const articles = sortArticlesByDateDesc(uniqueArticles).slice(0, 15);
        const aiStatements = await generateStatementsWithGemini(name, articles);

        const statements = dedupeStatements([...augmentedStatements, ...aiStatements]);
        return res.status(200).json({ statements });
    } catch (error) {
        console.error('Error analyzing voice:', error);
        return res.status(500).json({ error: 'Failed to analyze voice', details: String(error) });
    }
}
