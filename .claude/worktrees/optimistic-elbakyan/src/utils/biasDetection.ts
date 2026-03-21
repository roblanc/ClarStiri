/**
 * Political Entity and Keyword Detection for Bias Analysis
 * Detects political parties, keywords, and sentiment in Romanian news articles
 */

export interface PoliticalEntity {
  name: string;
  aliases: string[];
  leaningScore: number; // -100 (left) to +100 (right)
  category: 'party' | 'politician' | 'institution';
}

export interface BiasKeyword {
  word: string;
  leaningScore: number; // -100 (left) to +100 (right)
  weight: number; // importance weight
}

export interface EntityMention {
  entity: string;
  count: number;
  sentiment: number; // -1 (negative) to +1 (positive)
  context: string[];
}

export interface BiasAnalysis {
  detectedEntities: EntityMention[];
  keywordScore: number; // -100 (left) to +100 (right)
  entityScore: number; // -100 (left) to +100 (right)
  overallBias: number; // -100 (left) to +100 (right)
  confidence: number; // 0-1
  indicators: string[]; // what triggered the bias detection
}

// Romanian Political Parties and Figures
export const POLITICAL_ENTITIES: PoliticalEntity[] = [
  // Left / Center-Left
  {
    name: 'USR',
    aliases: ['USR', 'Uniunea Salvați România', 'Salvați România', 'useriști', 'user'],
    leaningScore: -40,
    category: 'party'
  },
  {
    name: 'REPER',
    aliases: ['REPER', 'Forța Dreptei', 'PLUS', 'Dacian Cioloș', 'Cioloș'],
    leaningScore: -35,
    category: 'party'
  },
  {
    name: 'PSD',
    aliases: ['PSD', 'Partidul Social Democrat', 'pesediști', 'Marcel Ciolacu', 'Ciolacu'],
    leaningScore: -15, // center-left economic, but varies
    category: 'party'
  },

  // Center / Center-Right
  {
    name: 'PNL',
    aliases: ['PNL', 'Partidul Național Liberal', 'liberali', 'Nicolae Ciucă', 'Ciucă'],
    leaningScore: 15,
    category: 'party'
  },

  // Right / Far-Right
  {
    name: 'AUR',
    aliases: ['AUR', 'Alianța pentru Unirea Românilor', 'George Simion', 'Simion', 'auristi'],
    leaningScore: 70,
    category: 'party'
  },
  {
    name: 'SOS România',
    aliases: ['SOS', 'SOS România', 'Diana Șoșoacă', 'Șoșoacă', 'Sosoaca'],
    leaningScore: 80,
    category: 'party'
  },
  {
    name: 'POT',
    aliases: ['POT', 'Partidul Oamenilor Tineri', 'Călin Georgescu', 'Georgescu'],
    leaningScore: 75,
    category: 'party'
  },

  // Institutions
  {
    name: 'DNA',
    aliases: ['DNA', 'Direcția Națională Anticorupție'],
    leaningScore: 0,
    category: 'institution'
  },
  {
    name: 'CCR',
    aliases: ['CCR', 'Curtea Constitutională'],
    leaningScore: 0,
    category: 'institution'
  },
  {
    name: 'Klaus Iohannis',
    aliases: ['Iohannis', 'Klaus Iohannis', 'președintele'],
    leaningScore: 10,
    category: 'politician'
  }
];

// Bias-indicating Keywords
export const BIAS_KEYWORDS: BiasKeyword[] = [
  // Left-leaning keywords
  { word: 'progresist', leaningScore: -60, weight: 2 },
  { word: 'social', leaningScore: -30, weight: 1 },
  { word: 'justiție socială', leaningScore: -70, weight: 3 },
  { word: 'anticorupție', leaningScore: -40, weight: 2 },
  { word: 'transparență', leaningScore: -30, weight: 2 },
  { word: 'pro-european', leaningScore: -40, weight: 2 },
  { word: 'reforme', leaningScore: -35, weight: 1 },
  { word: 'modernizan', leaningScore: -30, weight: 1 },
  { word: 'drepturi', leaningScore: -40, weight: 1 },
  { word: 'inclusiv', leaningScore: -50, weight: 1 },

  // Right-leaning keywords
  { word: 'tradițional', leaningScore: 60, weight: 2 },
  { word: 'suveranist', leaningScore: 75, weight: 3 },
  { word: 'patriot', leaningScore: 65, weight: 2 },
  { word: 'național', leaningScore: 50, weight: 1 },
  { word: 'conservator', leaningScore: 55, weight: 2 },
  { word: 'ortodox', leaningScore: 60, weight: 2 },
  { word: 'anti-globalist', leaningScore: 80, weight: 3 },
  { word: 'anti-UE', leaningScore: 75, weight: 3 },
  { word: 'suveranitate', leaningScore: 70, weight: 2 },
  { word: 'valorile românești', leaningScore: 65, weight: 2 },
  { word: 'familiei tradiționale', leaningScore: 70, weight: 2 },

  // Neutral/Centrist
  { word: 'echilibru', leaningScore: 0, weight: 1 },
  { word: 'moderat', leaningScore: 0, weight: 1 },
  { word: 'pragmatic', leaningScore: 0, weight: 1 },
];

// Sentiment indicators for entity mentions
const POSITIVE_SENTIMENT_WORDS = [
  'salvează', 'curajos', 'necesar', 'important', 'reușit', 'eficient',
  'bun', 'excelent', 'pozitiv', 'reușită', 'progres', 'îmbunătățire',
  'laudabil', 'remarcabil', 'performant', 'competent', 'profesionist'
];

const NEGATIVE_SENTIMENT_WORDS = [
  'controversat', 'critica', 'protest', 'eșec', 'incompetent', 'corupție',
  'scandal', 'problemă', 'necesar', 'atenție', 'îngrijorare', 'fraudă',
  'nereguli', 'abuz', 'ilegal', 'suspect', 'dubios', 'contestat'
];

/**
 * Normalize Romanian text for analysis
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .trim();
}

/**
 * Detect political entities in text
 */
export function detectEntities(text: string): EntityMention[] {
  const normalized = normalizeText(text);
  const mentions: Map<string, EntityMention> = new Map();

  POLITICAL_ENTITIES.forEach(entity => {
    entity.aliases.forEach(alias => {
      const normalizedAlias = normalizeText(alias);
      const regex = new RegExp(`\\b${normalizedAlias}\\b`, 'gi');
      const matches = text.match(regex);

      if (matches && matches.length > 0) {
        const existing = mentions.get(entity.name);
        const sentiment = calculateSentimentAroundEntity(text, alias);
        const context = extractContext(text, alias);

        if (existing) {
          existing.count += matches.length;
          existing.context.push(...context);
        } else {
          mentions.set(entity.name, {
            entity: entity.name,
            count: matches.length,
            sentiment,
            context
          });
        }
      }
    });
  });

  return Array.from(mentions.values());
}

/**
 * Calculate sentiment around entity mentions
 */
function calculateSentimentAroundEntity(text: string, entity: string): number {
  const normalized = normalizeText(text);
  const entityPos = normalized.indexOf(normalizeText(entity));

  if (entityPos === -1) return 0;

  // Get surrounding context (50 chars before and after)
  const start = Math.max(0, entityPos - 50);
  const end = Math.min(normalized.length, entityPos + entity.length + 50);
  const context = normalized.substring(start, end);

  let sentiment = 0;

  POSITIVE_SENTIMENT_WORDS.forEach(word => {
    if (context.includes(normalizeText(word))) {
      sentiment += 0.3;
    }
  });

  NEGATIVE_SENTIMENT_WORDS.forEach(word => {
    if (context.includes(normalizeText(word))) {
      sentiment -= 0.3;
    }
  });

  // Clamp between -1 and 1
  return Math.max(-1, Math.min(1, sentiment));
}

/**
 * Extract context snippets around entity
 */
function extractContext(text: string, entity: string, contextSize: number = 50): string[] {
  const contexts: string[] = [];
  const regex = new RegExp(`\\b${entity}\\b`, 'gi');
  let match;

  while ((match = regex.exec(text)) !== null) {
    const start = Math.max(0, match.index - contextSize);
    const end = Math.min(text.length, match.index + match[0].length + contextSize);
    contexts.push(text.substring(start, end).trim());
  }

  return contexts;
}

/**
 * Analyze keywords for bias indicators
 */
export function analyzeKeywords(text: string): { score: number; foundKeywords: string[] } {
  const normalized = normalizeText(text);
  let totalScore = 0;
  let totalWeight = 0;
  const foundKeywords: string[] = [];

  BIAS_KEYWORDS.forEach(({ word, leaningScore, weight }) => {
    const normalizedWord = normalizeText(word);
    if (normalized.includes(normalizedWord)) {
      totalScore += leaningScore * weight;
      totalWeight += weight;
      foundKeywords.push(word);
    }
  });

  // Normalize to -100 to +100 scale
  const score = totalWeight > 0 ? totalScore / totalWeight : 0;
  return { score, foundKeywords };
}

/**
 * Calculate entity-based bias score
 */
export function calculateEntityBias(mentions: EntityMention[]): number {
  if (mentions.length === 0) return 0;

  let totalScore = 0;
  let totalMentions = 0;

  mentions.forEach(mention => {
    const entity = POLITICAL_ENTITIES.find(e => e.name === mention.entity);
    if (entity) {
      // Weight by number of mentions and sentiment
      const sentimentMultiplier = 1 + (mention.sentiment * 0.5); // -0.5 to 1.5
      totalScore += entity.leaningScore * mention.count * sentimentMultiplier;
      totalMentions += mention.count;
    }
  });

  return totalMentions > 0 ? totalScore / totalMentions : 0;
}

/**
 * Perform comprehensive bias analysis on article
 */
export function analyzeBias(title: string, description: string = ''): BiasAnalysis {
  const fullText = `${title} ${description}`;

  // Detect entities
  const detectedEntities = detectEntities(fullText);

  // Analyze keywords
  const { score: keywordScore, foundKeywords } = analyzeKeywords(fullText);

  // Calculate entity-based score
  const entityScore = calculateEntityBias(detectedEntities);

  // Overall bias (weighted average)
  const overallBias = (keywordScore * 0.4) + (entityScore * 0.6);

  // Calculate confidence based on amount of evidence
  const evidenceCount = foundKeywords.length + detectedEntities.reduce((sum, e) => sum + e.count, 0);
  const confidence = Math.min(1, evidenceCount / 5); // Max confidence at 5+ pieces of evidence

  // Build indicators
  const indicators: string[] = [];
  if (foundKeywords.length > 0) {
    indicators.push(`Keywords detected: ${foundKeywords.slice(0, 3).join(', ')}`);
  }
  if (detectedEntities.length > 0) {
    indicators.push(`Entities: ${detectedEntities.map(e => e.entity).slice(0, 3).join(', ')}`);
  }

  return {
    detectedEntities,
    keywordScore,
    entityScore,
    overallBias,
    confidence,
    indicators
  };
}

/**
 * Convert bias score (-100 to +100) to category
 */
export function biasScoreToCategory(score: number): 'left' | 'center-left' | 'center' | 'center-right' | 'right' {
  if (score <= -50) return 'left';
  if (score <= -15) return 'center-left';
  if (score <= 15) return 'center';
  if (score <= 50) return 'center-right';
  return 'right';
}

/**
 * Get bias distribution from score
 */
export function scoreToDistribution(score: number): { left: number; center: number; right: number } {
  // Convert -100 to +100 score to percentage distribution
  const normalized = (score + 100) / 200; // 0 to 1

  if (score < -30) {
    // Left leaning
    const leftStrength = Math.min(80, 50 + Math.abs(score) / 2);
    return {
      left: Math.round(leftStrength),
      center: Math.round((100 - leftStrength) * 0.7),
      right: Math.round((100 - leftStrength) * 0.3)
    };
  } else if (score > 30) {
    // Right leaning
    const rightStrength = Math.min(80, 50 + score / 2);
    return {
      left: Math.round((100 - rightStrength) * 0.3),
      center: Math.round((100 - rightStrength) * 0.7),
      right: Math.round(rightStrength)
    };
  } else {
    // Center
    return {
      left: Math.round(20 + (score * 0.3)),
      center: 60,
      right: Math.round(20 - (score * 0.3))
    };
  }
}
