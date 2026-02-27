import { RSSNewsItem } from './shared.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';

function getFactualityScore(factuality: string): number {
    if (factuality === 'high') return 3;
    if (factuality === 'mixed') return 2;
    return 1;
}

export async function generateAggregatedTitle(articles: RSSNewsItem[]): Promise<string> {
    const sortedByFactuality = [...articles].sort((a, b) =>
        getFactualityScore(b.source.factuality) - getFactualityScore(a.source.factuality)
    );
    const fallbackTitle = sortedByFactuality[0]?.title || 'Știre Fără Titlu';

    if (!GEMINI_API_KEY || articles.length === 0) {
        return fallbackTitle;
    }

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

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1, // very low for factual/neutral
                    maxOutputTokens: 60,
                }
            }),
            signal: controller.signal as RequestInit['signal'],
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error('LLM API Error during title generation', await response.text());
            return fallbackTitle;
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return fallbackTitle;
        }

        text = text.trim().replace(/^["']|["']$/g, ''); // remove quotes

        if (text.length > 200 || text === "") {
            return fallbackTitle;
        }

        return text;
    } catch (error) {
        console.error('Failed to generate LLM title:', error);
        return fallbackTitle;
    }
}
