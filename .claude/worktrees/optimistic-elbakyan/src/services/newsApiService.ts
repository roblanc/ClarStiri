import { AggregatedStory } from '@/types/news';

// URL pentru API - folosește path relativ pentru producție, localhost pentru development
const API_URL = import.meta.env.DEV
    ? 'http://localhost:3000/api/news' // Vercel dev
    : '/api/news'; // Production

interface NewsAPIResponse {
    success: boolean;
    data: AggregatedStory[];
    fromCache: boolean;
    error?: string;
}

/**
 * Fetch știri agregate de la API-ul serverless
 * Aceasta e varianta rapidă care folosește caching pe server
 */
export async function fetchAggregatedNewsFromAPI(limit = 50): Promise<AggregatedStory[]> {
    try {
        const response = await fetch(`${API_URL}?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result: NewsAPIResponse = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'Invalid API response');
        }

        // Convertește datele înapoi la formatul corect (Date objects)
        return result.data.map(story => ({
            ...story,
            publishedAt: new Date(story.publishedAt),
        }));
    } catch (error) {
        console.error('Failed to fetch from API:', error);
        throw error;
    }
}

/**
 * Verifică dacă API-ul e disponibil
 */
export async function checkAPIAvailability(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}?limit=1`, { method: 'GET' });
        return response.ok;
    } catch {
        return false;
    }
}
