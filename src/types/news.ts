// Tipuri pentru știri reale din RSS feeds

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  rssUrl: string;
  logo?: string;
  bias: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
  category: 'mainstream' | 'independent' | 'tabloid' | 'public';
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
  mainCategory: string;
  publishedAt: Date;
  timeAgo: string;
}

// Configurația surselor de știri românești
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'digi24',
    name: 'Digi24',
    url: 'https://www.digi24.ro',
    rssUrl: 'https://www.digi24.ro/rss',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'hotnews',
    name: 'HotNews',
    url: 'https://hotnews.ro',
    rssUrl: 'https://hotnews.ro/feed',
    bias: 'center-left',
    category: 'independent',
  },
  {
    id: 'g4media',
    name: 'G4Media',
    url: 'https://www.g4media.ro',
    rssUrl: 'https://www.g4media.ro/feed',
    bias: 'center-left',
    category: 'independent',
  },
  {
    id: 'mediafax',
    name: 'Mediafax',
    url: 'https://www.mediafax.ro',
    rssUrl: 'https://www.mediafax.ro/rss',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'adevarul',
    name: 'Adevărul',
    url: 'https://adevarul.ro',
    rssUrl: 'https://adevarul.ro/rss',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'protv',
    name: 'Știrile ProTV',
    url: 'https://stirileprotv.ro',
    rssUrl: 'https://stirileprotv.ro/rss',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'romania-libera',
    name: 'România Liberă',
    url: 'https://romanialibera.ro',
    rssUrl: 'https://romanialibera.ro/feed',
    bias: 'center-right',
    category: 'mainstream',
  },
  {
    id: 'agerpres',
    name: 'Agerpres',
    url: 'https://www.agerpres.ro',
    rssUrl: 'https://www.agerpres.ro/rss/actualitate',
    bias: 'center',
    category: 'public',
  },
  {
    id: 'libertatea',
    name: 'Libertatea',
    url: 'https://www.libertatea.ro',
    rssUrl: 'https://www.libertatea.ro/feed',
    bias: 'center-left',
    category: 'mainstream',
  },
  {
    id: 'observator',
    name: 'Observator',
    url: 'https://observatornews.ro',
    rssUrl: 'https://observatornews.ro/rss',
    bias: 'center',
    category: 'mainstream',
  },
];

// Mapare bias la procente pentru calculul distribuției
export const BIAS_WEIGHT_MAP: Record<NewsSource['bias'], { left: number; center: number; right: number }> = {
  'left': { left: 80, center: 15, right: 5 },
  'center-left': { left: 55, center: 35, right: 10 },
  'center': { left: 20, center: 60, right: 20 },
  'center-right': { left: 10, center: 35, right: 55 },
  'right': { left: 5, center: 15, right: 80 },
};
