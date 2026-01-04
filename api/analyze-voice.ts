import type { VercelRequest, VercelResponse } from '@vercel/node';
import Parser from 'rss-parser';

const parser = new Parser();

// Incercam sa luam cheia din ambele variante de env vars
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { name } = req.query;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Missing name parameter' });
    }

    try {
        // 1. Fetch Google News RSS for the person (last 7 days)
        const encodedName = encodeURIComponent(name);
        const feedUrl = `https://news.google.com/rss/search?q=${encodedName}+when:7d&hl=ro&gl=RO&ceid=RO:ro`;

        console.log(`Fetching RSS for ${name}: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);

        // Take top 10 articles
        const articles = feed.items.slice(0, 10).map(item => ({
            title: item.title || '',
            link: item.link || '',
            snippet: item.contentSnippet || item.content || '',
            date: item.pubDate || '',
            source: item.creator || 'Google News'
        }));

        if (articles.length === 0) {
            return res.status(200).json({ statements: [] });
        }

        // 2. Prepare prompt for Gemini
        const articlesText = articles.map((a, i) => `[${i + 1}] Titlu: ${a.title}\nSnippet: ${a.snippet}`).join('\n\n');

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

        // 3. Call Gemini
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

        // Clean markdown if present (though response_mime_type should prevent it)
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

        const result = JSON.parse(jsonText);

        // Map back source URLs if AI used textual references? Gemini might return the link if prompted correctly.
        // We will trust Gemini to pick the link from the input text if we provided it.
        // To be safe, we can try to match the sourceUrl returned by Gemini with our articles list if strictly needed,
        // but for now let's trust it returns one of the provided links or a generic placeholder if confused.

        // Enrich with fallback URLs if missing
        const statements = (result.statements || []).map((s: any) => {
            // Try to find a matching article for the link if it looks like an index
            if (typeof s.sourceUrl === 'number' || (typeof s.sourceUrl === 'string' && s.sourceUrl.match(/^\d+$/))) {
                const idx = parseInt(String(s.sourceUrl)) - 1;
                if (articles[idx]) s.sourceUrl = articles[idx].link;
            }
            // Ensure we have a link
            if (!s.sourceUrl || s.sourceUrl === '#') {
                s.sourceUrl = articles[0]?.link || '#';
            }
            return s;
        });

        return res.status(200).json({ statements });

    } catch (error) {
        console.error('Error analyzing voice:', error);
        return res.status(500).json({ error: 'Failed to analyze voice', details: String(error) });
    }
}
