import type { NewsSource } from '@/types/news';
import { getSourceProfile, scoreToBiasCategory, type SourceProfile } from '@/data/sourceProfiles';
import { NEWS_SOURCES_BASE } from '../../shared/newsSources';
import { getFactuality } from '@/data/sourceFactuality';

type SourceCatalogEntry = Omit<NewsSource, 'logo' | 'profile'> & { logo?: string };

const SOURCE_CATALOG_BASE: SourceCatalogEntry[] = NEWS_SOURCES_BASE.map((source) => ({ ...source }));

function enrichSource(source: SourceCatalogEntry): NewsSource {
  const profile = getSourceProfile(source.id);

  return {
    ...source,
    bias: profile ? scoreToBiasCategory(profile.biasScore) : source.bias,
    // Evidence-based rating (src/data/sourceFactuality.ts), never guessed from profile text.
    factuality: getFactuality(source.id).rating,
    profile,
  };
}

export const SOURCE_CATALOG: NewsSource[] = SOURCE_CATALOG_BASE.map(enrichSource);
export const SOURCE_CATALOG_BY_ID: Record<string, NewsSource> = Object.fromEntries(
  SOURCE_CATALOG.map((source) => [source.id, source]),
);
