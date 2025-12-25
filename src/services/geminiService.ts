import { RSSNewsItem } from '@/types/news';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';

interface BiasComparisonResult {
    comparison: string;
    error?: string;
}

/**
 * Grupează articolele pe categorii de bias
 */
function groupSourcesByBias(sources: RSSNewsItem[]): {
    left: RSSNewsItem[];
    center: RSSNewsItem[];
    right: RSSNewsItem[];
} {
    const left: RSSNewsItem[] = [];
    const center: RSSNewsItem[] = [];
    const right: RSSNewsItem[] = [];

    sources.forEach(source => {
        const bias = source.source.bias;
        if (bias === 'left' || bias === 'center-left') {
            left.push(source);
        } else if (bias === 'center') {
            center.push(source);
        } else {
            right.push(source);
        }
    });

    return { left, center, right };
}

/**
 * Formatează articolele pentru prompt
 */
function formatArticlesForPrompt(articles: RSSNewsItem[], category: string): string {
    if (articles.length === 0) return '';

    const formatted = articles.slice(0, 3).map(a =>
        `- "${a.title}" (${a.source.name}): ${a.description?.substring(0, 200) || 'Fără descriere'}...`
    ).join('\n');

    return `\n**Surse ${category}:**\n${formatted}`;
}

/**
 * Generează comparația de bias folosind Gemini AI
 */
export async function generateBiasComparison(
    storyTitle: string,
    sources: RSSNewsItem[]
): Promise<BiasComparisonResult> {
    if (!GEMINI_API_KEY) {
        return {
            comparison: '',
            error: 'API key Gemini nu este configurat. Adaugă VITE_GEMINI_API_KEY în .env.local'
        };
    }

    const grouped = groupSourcesByBias(sources);

    // Verifică dacă avem suficiente surse pentru o comparație utilă
    const totalCategories = [grouped.left, grouped.center, grouped.right].filter(g => g.length > 0).length;
    if (totalCategories < 2) {
        return {
            comparison: '',
            error: 'Nu există suficiente perspective diferite pentru a genera o comparație. Sunt necesare surse din cel puțin 2 orientări diferite.'
        };
    }

    const articlesContext = [
        formatArticlesForPrompt(grouped.left, 'STÂNGA (progresiste, pro-UE)'),
        formatArticlesForPrompt(grouped.center, 'CENTRU (neutre)'),
        formatArticlesForPrompt(grouped.right, 'DREAPTA (conservatoare, suveraniste)')
    ].filter(Boolean).join('\n');

    const prompt = `Ești un analist media român. Analizează cum diferite tipuri de surse media prezintă aceeași știre.

**Subiectul știrii:** "${storyTitle}"

${articlesContext}

**Sarcină:** Scrie o analiză scurtă (maxim 150 de cuvinte) în română care:
1. Descrie cum diferă framing-ul și tonul între surse
2. Identifică puncte de divergență sau accentuări diferite
3. Notează dacă există consens pe anumite aspecte

Folosește un ton neutru, obiectiv. Nu cita direct din articole, ci sintetizează diferențele.
Începe direct cu analiza, fără introducere.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API error:', errorData);
            return {
                comparison: '',
                error: `Eroare API: ${errorData.error?.message || response.statusText}`
            };
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return {
                comparison: '',
                error: 'Răspunsul AI nu conține text valid.'
            };
        }

        return { comparison: text.trim() };
    } catch (error) {
        console.error('Error generating bias comparison:', error);
        return {
            comparison: '',
            error: 'Eroare la generarea analizei. Încearcă din nou.'
        };
    }
}
