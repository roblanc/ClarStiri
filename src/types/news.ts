import type { BiasAnalysis } from '@/utils/biasDetection';
import type { SourceProfile } from '@/data/sourceProfiles';
import {
  BIAS_WEIGHT_MAP as SHARED_BIAS_WEIGHT_MAP,
  NEWS_SOURCES_BASE,
} from '../../shared/newsSources';

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  rssUrl: string;
  logo?: string;
  bias: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
  factuality: 'high' | 'mixed' | 'low';
  category: 'mainstream' | 'independent' | 'tabloid' | 'public';
  profile?: SourceProfile;
}

export interface RSSNewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  imageUrl?: string;
  source: NewsSource;
  category?: string;
  author?: string;
  biasAnalysis?: BiasAnalysis;
}

export interface AggregatedStory {
  id: string;
  title: string;
  description: string;
  image?: string;
  sources: RSSNewsItem[];
  sourcesCount: number;
  bias: {
    left: number;
    center: number;
    right: number;
  };
  blindspot?: 'left' | 'right' | 'none';
  contentBias?: BiasAnalysis;
  mainCategory: string;
  publishedAt: Date;
  timeAgo: string;
}

export const NEWS_SOURCES: NewsSource[] = NEWS_SOURCES_BASE.map((source) => ({ ...source }));

export const BIAS_WEIGHT_MAP: Record<NewsSource['bias'], { left: number; center: number; right: number }> =
  SHARED_BIAS_WEIGHT_MAP;
