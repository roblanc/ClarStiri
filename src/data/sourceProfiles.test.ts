import { describe, expect, it } from 'vitest';
import { SOURCE_PROFILES, getMissingProfileIds } from './sourceProfiles';
import { SOURCE_CATALOG_BY_ID } from './sourceCatalog';
import { NEWS_SOURCE_DEFINITIONS, scoreToBiasCategory } from '../../shared/newsSources';

describe('source profiles read the shared score', () => {
    it('uses the shared score and confidence for every profile', () => {
        for (const source of NEWS_SOURCE_DEFINITIONS) {
            const profile = SOURCE_PROFILES[source.id];
            if (!profile) continue;
            expect(profile.biasScore).toBe(source.biasScore);
            expect(profile.confidence).toBe(source.biasConfidence);
        }
    });

    it('marks outlets without a profile as low confidence', () => {
        const missing = getMissingProfileIds(NEWS_SOURCE_DEFINITIONS.map((s) => s.id));
        expect(missing.length).toBeGreaterThan(0);
        for (const id of missing) {
            expect(NEWS_SOURCE_DEFINITIONS.find((s) => s.id === id)?.biasConfidence).toBe('low');
        }
    });

    it('gives the Sources pages the same category as the server', () => {
        for (const source of NEWS_SOURCE_DEFINITIONS) {
            expect(SOURCE_CATALOG_BY_ID[source.id].bias).toBe(scoreToBiasCategory(source.biasScore));
        }
    });
});
