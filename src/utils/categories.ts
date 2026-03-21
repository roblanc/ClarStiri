/**
 * Category System for ClarStiri
 * 
 * Maps and normalizes categories from different RSS sources
 * Uses keyword matching when explicit category is missing
 */

export interface Category {
    slug: string;
    name: string;
    keywords: string[];  // Keywords to match in title/description
    rssCategories: string[];  // How different RSS sources might name this category
    icon?: string;
}

export const CATEGORIES: Category[] = [
    {
        slug: 'politica',
        name: 'Politică',
        keywords: [
            'guvern', 'parlament', 'ministru', 'premier', 'președinte', 'alegeri',
            'psd', 'pnl', 'usr', 'aur', 'udmr', 'partid', 'coaliție', 'opoziție',
            'lege', 'vot', 'deputat', 'senator', 'politică', 'politic', 'campaign',
            'iohannis', 'ciolacu', 'ciucă', 'lasconi', 'simion', 'șoșoacă'
        ],
        rssCategories: ['politica', 'politics', 'politic', 'politică', 'alegeri', 'news'],
        icon: '🏛️',
    },
    {
        slug: 'economie',
        name: 'Economie',
        keywords: [
            'economie', 'banca', 'bnr', 'inflație', 'curs', 'euro', 'leu', 'dolar',
            'buget', 'taxe', 'impozit', 'investiții', 'afaceri', 'business', 'profit',
            'pib', 'creștere economică', 'salariu', 'pensie', 'prețuri', 'scumpire',
            'bursa', 'acțiuni', 'startup', 'fintech', 'bursă'
        ],
        rssCategories: ['economie', 'economy', 'business', 'finanțe', 'finance', 'bani'],
        icon: '💰',
    },
    {
        slug: 'sanatate',
        name: 'Sănătate',
        keywords: [
            'sănătate', 'spital', 'medic', 'doctor', 'pacient', 'medicament',
            'vaccin', 'covid', 'coronavirus', 'virus', 'boală', 'tratament',
            'urgență', 'ambulanță', 'operație', 'chirurgie', 'cancer', 'diabet',
            'oms', 'ms', 'ministerul sănătății', 'asigurări de sănătate', 'cnas'
        ],
        rssCategories: ['sanatate', 'health', 'sănătate', 'medical', 'medicina'],
        icon: '🏥',
    },
    {
        slug: 'tehnologie',
        name: 'Tehnologie',
        keywords: [
            'tehnologie', 'tech', 'it', 'software', 'hardware', 'computer',
            'smartphone', 'iphone', 'android', 'samsung', 'apple', 'google', 'microsoft',
            'ai', 'inteligență artificială', 'robot', 'internet', 'cybersecurity',
            'hack', 'startup', 'aplicație', 'app', 'digital', 'online'
        ],
        rssCategories: ['tehnologie', 'technology', 'tech', 'it', 'gadget', 'digital'],
        icon: '💻',
    },
    {
        slug: 'mediu',
        name: 'Mediu',
        keywords: [
            'mediu', 'climă', 'climat', 'poluare', 'ecologie', 'verde', 'sustenabil',
            'reciclare', 'deșeuri', 'emisii', 'carbon', 'energie verde', 'solar',
            'eolian', 'biodiversitate', 'natură', 'parc natural', 'inundații',
            'secetă', 'încălzire globală', 'anpm', 'garda de mediu'
        ],
        rssCategories: ['mediu', 'environment', 'ecologie', 'natura', 'climate'],
        icon: '🌿',
    },
    {
        slug: 'sport',
        name: 'Sport',
        keywords: [
            'sport', 'fotbal', 'tenis', 'handbal', 'baschet', 'volei', 'atletism',
            'olimpiadă', 'campionat', 'liga', 'meci', 'echipa', 'antrenor', 'jucător',
            'fcsb', 'dinamo', 'cfr', 'rapid', 'simona halep', 'hagi', 'România U21',
            'uefa', 'fifa', 'federație', 'sportiv', 'medalie', 'campion'
        ],
        rssCategories: ['sport', 'sports', 'fotbal', 'football', 'tenis'],
        icon: '⚽',
    },
    {
        slug: 'cultura',
        name: 'Cultură',
        keywords: [
            'cultură', 'film', 'muzică', 'concert', 'teatru', 'festival', 'artă',
            'carte', 'scriitor', 'artist', 'expoziție', 'muzeu', 'operă', 'balet',
            'cinema', 'premieră', 'tiff', 'enescu', 'untold', 'neversea',
            'premiu nobel', 'literatură', 'poezie', 'român', 'patrimoniu'
        ],
        rssCategories: ['cultura', 'culture', 'entertainment', 'art', 'artă', 'muzica'],
        icon: '🎭',
    },
    {
        slug: 'international',
        name: 'Internațional',
        keywords: [
            'internațional', 'mondial', 'global', 'extern', 'ue', 'uniunea europeană',
            'nato', 'sua', 'america', 'china', 'rusia', 'ucraina', 'război',
            'conflict', 'diplomație', 'ambasador', 'summit', 'g7', 'g20',
            'onu', 'trump', 'biden', 'putin', 'zelensky', 'von der leyen'
        ],
        rssCategories: ['international', 'world', 'extern', 'lume', 'global', 'foreign'],
        icon: '🌍',
    },
];

/**
 * Normalize text for matching (lowercase, remove diacritics)
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
}

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
    return CATEGORIES.find(c => c.slug === normalizeText(slug));
}

/**
 * Detect category from RSS category string
 */
export function detectCategoryFromRSS(rssCategory: string | undefined): Category | undefined {
    if (!rssCategory) return undefined;

    const normalized = normalizeText(rssCategory);

    return CATEGORIES.find(cat =>
        cat.rssCategories.some(rc => normalized.includes(normalizeText(rc)))
    );
}

/**
 * Detect category from title and description using keywords
 */
export function detectCategoryFromContent(title: string, description?: string): Category | undefined {
    const content = normalizeText(`${title} ${description || ''}`);

    // Find category with most keyword matches
    let bestMatch: { category: Category; score: number } | null = null;

    for (const category of CATEGORIES) {
        let score = 0;
        for (const keyword of category.keywords) {
            if (content.includes(normalizeText(keyword))) {
                score++;
            }
        }

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { category, score };
        }
    }

    return bestMatch?.category;
}

/**
 * Get category for a news item (tries RSS category first, then content analysis)
 */
export function getCategoryForNews(
    rssCategory: string | undefined,
    title: string,
    description?: string
): Category | undefined {
    // First try RSS category
    const fromRSS = detectCategoryFromRSS(rssCategory);
    if (fromRSS) return fromRSS;

    // Fallback to content analysis
    return detectCategoryFromContent(title, description);
}

/**
 * Check if a news item matches a specific category
 */
export function matchesCategory(
    categorySlug: string,
    rssCategory: string | undefined,
    title: string,
    description?: string
): boolean {
    const targetCategory = getCategoryBySlug(categorySlug);
    if (!targetCategory) return false;

    const newsCategory = getCategoryForNews(rssCategory, title, description);
    return newsCategory?.slug === targetCategory.slug;
}
