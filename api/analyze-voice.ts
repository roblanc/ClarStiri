import type { VercelRequest, VercelResponse } from '@vercel/node';
import Parser from 'rss-parser';
import { Redis } from '@upstash/redis';
import { NEWS_SOURCES, fetchRSSFeed } from './shared.js';
import { setCorsHeaders } from './cors.js';

const parser = new Parser();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';

// ... (tipuri neschimbate)

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { name, slug } = req.query;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Missing name parameter' });
    }

    // Initialize Redis
    let redis: Redis | null = null;
    try {
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            let url = process.env.UPSTASH_REDIS_REST_URL;
            if (!url.startsWith('http')) url = `https://${url}`;
            redis = new Redis({ url, token: process.env.UPSTASH_REDIS_REST_TOKEN });
        }
    } catch (e) { console.error('Redis init failed:', e); }

    try {
        // 0. Fetch Augmented Data from Redis (Instagram OCR results)
        let augmentedStatements: any[] = [];
        if (redis && slug && typeof slug === 'string') {
            try {
                const redisKey = `profile:statements:${slug}`;
                const cached = await redis.get<any[]>(redisKey);
                if (cached) augmentedStatements = cached;
            } catch (e) { console.error('Redis read failed:', e); }
        }

        console.log(`Starting analysis for: ${name}`);
        // ... (logică existentă de fetch știri)

        // 1. Fetch Google News RSS for the person (last 7 days)
        const encodedName = encodeURIComponent(name);
        const googleFeedUrl = `https://news.google.com/rss/search?q=${encodedName}+when:7d&hl=ro&gl=RO&ceid=RO:ro`;

        const googlePromise = parser.parseURL(googleFeedUrl).then(feed =>
            feed.items.map(item => ({
                title: item.title || '',
                link: item.link || '',
                snippet: item.contentSnippet || item.content || '',
                date: item.pubDate || '',
                source: item.creator || 'Google News'
            }))
        ).catch(err => {
            console.error('Google News fetch failed:', err);
            return [];
        });

        // 2. Fetch specific Romanian sources that might not be in Google News immediately
        // We fetch all sources and filter by name - parallel execution
        const internalSourcesPromise = Promise.all(
            NEWS_SOURCES.map(source => fetchRSSFeed(source))
        ).then(results => {
            const allItems = results.flat();
            const lowerName = name.toLowerCase();
            // Filter items that mention the name in title or description
            return allItems.filter(item =>
                item.title.toLowerCase().includes(lowerName) ||
                item.description.toLowerCase().includes(lowerName)
            ).map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.description,
                date: item.pubDate,
                source: item.source.name
            }));
        }).catch(err => {
            console.error('Internal sources fetch failed:', err);
            return [];
        });

        // Wait for both
        const [googleArticles, internalArticles] = await Promise.all([googlePromise, internalSourcesPromise]);

        // Combine and deduplicate by link
        const allArticles = [...internalArticles, ...googleArticles];
        const uniqueArticles = Array.from(new Map(allArticles.map(item => [item.link, item])).values());

        // Take top 15 most relevant/recent
        const articles = uniqueArticles.slice(0, 15);

        console.log(`Found ${articles.length} articles for ${name}`);

        if (articles.length === 0) {
            return res.status(200).json({ statements: [] });
        }

        // 3. Prepare prompt for Gemini
        const articlesText = articles.map((a, i) => `[${i + 1}] Sursa: ${a.source}\nTitlu: ${a.title}\nSnippet: ${a.snippet}`).join('\n\n');

        const prompt = `
        Analizează următoarele articole de știri recente despre ${name}.
        Scopul este să extragi 2-3 declarații recente, controversate sau semnificative (sau acțiuni/poziționări recente) ale acestei persoane.

        Articole:
        ${articlesText}

        Returnează un JSON valid cu un array "statements". Fiecare obiect trebuie să aibă:
        - "text": Citatul exact sau o parafrazare scurtă și percutantă a ce a zis/făcut (max 20 cuvinte). Fii direct.
        - "topic": Subiectul (ex: "Politică", "Social", "Război", "Monden").
        - "date": Data aproximativă (din articol) sau "Recent".
        - "sourceUrl": Link-ul către articolul care menționează asta (alege din lista furnizată, folosește indexul sau linkul).
        - "impact": "high" (scandal, viral), "medium" sau "low".
        - "bias": "left", "right" sau "center" (orientarea declarației/acțiunii, nu a sursei).

        Dacă nu există declarații clare, extrage cele mai importante evenimente recente legate de persoană.
        Nu inventa informații. Dacă nu sunt date relevante, returnează array gol.
        Format JSON pur, fără markdown.
        `;

        if (!GEMINI_API_KEY) {
            console.error('Missing Gemini API Key');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // 4. Call Gemini
        const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    response_mime_type: "application/json"
                }
            })
        });

        if (!geminiResponse.ok) {
            const err = await geminiResponse.text();
            console.error('Gemini API Error:', err);
            throw new Error('Gemini API failed');
        }

        const data = await geminiResponse.json();
        let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) {
            throw new Error('Empty response from AI');
        }

        // Clean markdown if present
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

        const resultUnknown: unknown = JSON.parse(jsonText);
        const result: GeminiResult = isRecord(resultUnknown) ? (resultUnknown as GeminiResult) : {};

        const rawStatements = Array.isArray(result.statements) ? (result.statements as unknown[]) : [];

        // Enrich with fallback URLs if missing + normalize shape
        const statements = rawStatements.map((raw, index) => {
            // ... normalization logic (unchanged)
            return {
                id: asString(s.id, `ai-${index}`),
                text,
                topic,
                date,
                sourceUrl,
                impact: asImpact(s.impact),
                bias: asBias(s.bias),
            };
        }).filter(s => s.text.length > 0);

        // Combine with Instagram OCR results
        const finalStatements = [...augmentedStatements, ...statements];

        return res.status(200).json({ statements: finalStatements });

    } catch (error) {
        console.error('Error analyzing voice:', error);
        return res.status(500).json({ error: 'Failed to analyze voice', details: String(error) });
    }
}
