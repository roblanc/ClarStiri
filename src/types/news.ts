import type { SourceProfile } from '@/data/sourceProfiles';
import { NEWS_SOURCES_BASE } from '../../shared/newsSources';

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  rssUrl: string;
  logo?: string;
  bias: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
  /** -100 (far left) … +100 (far right); `bias` is derived from it. See shared/newsSources.ts. */
  biasScore?: number;
  biasConfidence?: 'high' | 'medium' | 'low';
  factuality: 'high' | 'mixed' | 'low' | 'insufficient';
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
  /** Set by the server: this item republishes agency/wire copy counted under another report. */
  syndicated?: boolean;
}

export interface AggregatedStory {
  id: string;
  title: string;
  description: string;
  image?: string;
  sources: RSSNewsItem[];
  sourcesCount: number;
  /** Reports after collapsing wire copies; missing on stories cached before it existed. */
  independentCount?: number;
  bias: {
    left: number;
    center: number;
    right: number;
  };
  blindspot?: 'left' | 'right' | 'none';
  mainCategory: string;
  publishedAt: Date;
  timeAgo: string;
}

export const NEWS_SOURCES: NewsSource[] = NEWS_SOURCES_BASE.map((source) => ({ ...source }));

