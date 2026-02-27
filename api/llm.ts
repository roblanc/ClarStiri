import { RSSNewsItem } from './shared.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';

function getFactualityScore(factuality: string): number {
    if (factuality === 'high') return 3;
    if (factuality === 'mixed') return 2;
    return 1;
}

async function callGroq(prompt: string): Promise<string | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 60,
            }),
            signal: controller.signal as RequestInit['signal'],
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error('Groq API error:', response.status, await response.text());
            return null;
        }

        const data = await response.json();
        const text: string | undefined = data.choices?.[0]?.message?.content;
        return text?.trim() ?? null;
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Groq call failed:', error);
        return null;
    }
}

async function callGemini(prompt: string): Promise<string | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 60 },
            }),
            signal: controller.signal as RequestInit['signal'],
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error('Gemini API error:', response.status, await response.text());
            return null;
        }

        const data = await response.json();
        const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return text?.trim() ?? null;
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Gemini call failed:', error);
        return null;
    }
}

export async function generateAggregatedTitle(articles: RSSNewsItem[]): Promise<string> {
    const sortedByFactuality = [...articles].sort((a, b) =>
        getFactualityScore(b.source.factuality) - getFactualityScore(a.source.factuality)
    );
    const fallbackTitle = sortedByFactuality[0]?.title || 'Știre Fără Titlu';

    if (articles.length === 0) return fallbackTitle;
    if (!GROQ_API_KEY && !GEMINI_API_KEY) return fallbackTitle;

    const titlesList = articles.map(a => `- ${a.title}`).join('\n');
    const prompt = `Ești un editor de știri neutru, strict și imparțial pentru o agenție de presă globală (stil Reuters/Ground News).
Mai jos ai un grup de titluri care acoperă exact același eveniment din perspective jurnalistice diferite.

SARCINA TA:
Scrie un (1) singur titlu neutru, pur informațional, care să reprezinte acest eveniment și să fie adevărat pentru toate sursele.

REGULI STRICTE:
1. Obiectivitate absolută: Elimina 100% cuvintele emoționale, jignitoare, exagerările și speculațiile.
2. Claritate: Folosește structuri de tipul "Subiect + Acțiune + Context scurt".
3. Persoane și Entități: Folosește numele lor complete/oficiale.
4. Formă: Titlul să nu depășească 15 cuvinte. Fără CAPS LOCK excesiv. Nu pune ghilimele la început sau sfârșit. Nu pune punct la final.
5. Strict output: Returnează DOAR varianta ta de titlu, niciun alt comentariu.

TITLURI SURSĂ:
${titlesList}`;

    // Try Groq first (30 RPM, fast), fall back to Gemini
    let text: string | null = null;

    if (GROQ_API_KEY) {
        text = await callGroq(prompt);
    }

    if (!text && GEMINI_API_KEY) {
        text = await callGemini(prompt);
    }

    if (!text) return fallbackTitle;

    text = text.replace(/^["']|["']$/g, ''); // strip surrounding quotes
    if (text.length > 200 || text.length === 0) return fallbackTitle;

    return text;
}
