import type { NewsSource } from '@/types/news';
import { getSourceProfile, scoreToBiasCategory, type SourceProfile } from '@/data/sourceProfiles';
import { NEWS_SOURCES_BASE } from '../../shared/newsSources';

type SourceCatalogEntry = Omit<NewsSource, 'logo' | 'profile'> & { logo?: string };

const SOURCE_CATALOG_BASE: SourceCatalogEntry[] = NEWS_SOURCES_BASE.map((source) => ({ ...source }));

function inferFactualityFromProfile(
  profile: SourceProfile | undefined,
  fallback: NewsSource['factuality'],
): NewsSource['factuality'] {
  if (!profile?.factualityRationale) return fallback;

  const normalized = profile.factualityRationale.toLowerCase();
  if (normalized.includes('scăzut')) return 'low';
  if (normalized.includes('mixt')) return 'mixed';
  if (normalized.includes('foarte ridicat') || normalized.includes('ridicată') || normalized.includes('ridicat')) {
    return 'high';
  }

  return fallback;
}

function enrichSource(source: SourceCatalogEntry): NewsSource {
  const profile = getSourceProfile(source.id);

  return {
    ...source,
    bias: profile ? scoreToBiasCategory(profile.biasScore) : source.bias,
    factuality: inferFactualityFromProfile(profile, source.factuality),
    profile,
  };
}

export const SOURCE_CATALOG: NewsSource[] = SOURCE_CATALOG_BASE.map(enrichSource);
export const SOURCE_CATALOG_BY_ID: Record<string, NewsSource> = Object.fromEntries(
  SOURCE_CATALOG.map((source) => [source.id, source]),
);
