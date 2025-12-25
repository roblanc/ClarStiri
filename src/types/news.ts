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
  // === CENTRU ===
  {
    id: 'digi24',
    name: 'Digi24',
    url: 'https://www.digi24.ro',
    rssUrl: 'https://www.digi24.ro/rss',
    logo: 'https://www.digi24.ro/static/theme/digi24/images/digi24-logo.svg',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'mediafax',
    name: 'Mediafax',
    url: 'https://www.mediafax.ro',
    rssUrl: 'https://www.mediafax.ro/rss',
    logo: 'https://logo.clearbit.com/mediafax.ro',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'adevarul',
    name: 'Adevărul',
    url: 'https://adevarul.ro',
    rssUrl: 'https://adevarul.ro/rss',
    logo: 'https://logo.clearbit.com/adevarul.ro',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'protv',
    name: 'Știrile ProTV',
    url: 'https://stirileprotv.ro',
    rssUrl: 'https://stirileprotv.ro/rss',
    logo: 'https://logo.clearbit.com/stirileprotv.ro',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'agerpres',
    name: 'Agerpres',
    url: 'https://www.agerpres.ro',
    rssUrl: 'https://www.agerpres.ro/rss/actualitate',
    logo: 'https://logo.clearbit.com/agerpres.ro',
    bias: 'center',
    category: 'public',
  },
  {
    id: 'observator',
    name: 'Observator',
    url: 'https://observatornews.ro',
    rssUrl: 'https://observatornews.ro/rss',
    logo: 'https://logo.clearbit.com/observatornews.ro',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'ziarul-financiar',
    name: 'Ziarul Financiar',
    url: 'https://www.zf.ro',
    rssUrl: 'https://www.zf.ro/rss',
    logo: 'https://logo.clearbit.com/zf.ro',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'gandul',
    name: 'Gândul',
    url: 'https://www.gandul.ro',
    rssUrl: 'https://www.gandul.ro/rss',
    logo: 'https://logo.clearbit.com/gandul.ro',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'bursa',
    name: 'Bursa',
    url: 'https://www.bursa.ro',
    rssUrl: 'https://www.bursa.ro/rss',
    logo: 'https://logo.clearbit.com/bursa.ro',
    bias: 'center',
    category: 'mainstream',
  },
  {
    id: 'news-ro',
    name: 'News.ro',
    url: 'https://www.news.ro',
    rssUrl: 'https://www.news.ro/rss',
    logo: 'https://logo.clearbit.com/news.ro',
    bias: 'center',
    category: 'mainstream',
  },

  // === STÂNGA / CENTRU-STÂNGA ===
  {
    id: 'hotnews',
    name: 'HotNews',
    url: 'https://hotnews.ro',
    rssUrl: 'https://hotnews.ro/feed',
    logo: 'https://logo.clearbit.com/hotnews.ro',
    bias: 'center-left',
    category: 'independent',
  },
  {
    id: 'g4media',
    name: 'G4Media',
    url: 'https://www.g4media.ro',
    rssUrl: 'https://www.g4media.ro/feed',
    logo: 'https://logo.clearbit.com/g4media.ro',
    bias: 'center-left',
    category: 'independent',
  },
  {
    id: 'libertatea',
    name: 'Libertatea',
    url: 'https://www.libertatea.ro',
    rssUrl: 'https://www.libertatea.ro/feed',
    logo: 'https://logo.clearbit.com/libertatea.ro',
    bias: 'center-left',
    category: 'mainstream',
  },
  {
    id: 'recorder',
    name: 'Recorder',
    url: 'https://recorder.ro',
    rssUrl: 'https://recorder.ro/feed',
    logo: 'https://logo.clearbit.com/recorder.ro',
    bias: 'center-left',
    category: 'independent',
  },
  {
    id: 'pressone',
    name: 'PressOne',
    url: 'https://pressone.ro',
    rssUrl: 'https://pressone.ro/feed',
    logo: 'https://logo.clearbit.com/pressone.ro',
    bias: 'center-left',
    category: 'independent',
  },
  {
    id: 'republica',
    name: 'Republica',
    url: 'https://republica.ro',
    rssUrl: 'https://republica.ro/feed',
    logo: 'https://logo.clearbit.com/republica.ro',
    bias: 'left',
    category: 'independent',
  },
  {
    id: 'europa-libera',
    name: 'Europa Liberă',
    url: 'https://romania.europalibera.org',
    rssUrl: 'https://romania.europalibera.org/api/feed',
    logo: 'https://logo.clearbit.com/europalibera.org',
    bias: 'center-left',
    category: 'independent',
  },
  {
    id: 'snoop',
    name: 'Snoop.ro',
    url: 'https://snoop.ro',
    rssUrl: 'https://snoop.ro/feed',
    logo: 'https://logo.clearbit.com/snoop.ro',
    bias: 'center-left',
    category: 'independent',
  },
  {
    id: 'vice-romania',
    name: 'Vice România',
    url: 'https://www.vice.com/ro',
    rssUrl: 'https://www.vice.com/ro/feed',
    logo: 'https://logo.clearbit.com/vice.com',
    bias: 'center-left',
    category: 'independent',
  },
  {
    id: 'spotmedia',
    name: 'Spotmedia',
    url: 'https://spotmedia.ro',
    rssUrl: 'https://spotmedia.ro/feed',
    logo: 'https://logo.clearbit.com/spotmedia.ro',
    bias: 'center-left',
    category: 'independent',
  },
  {
    id: 'biziday',
    name: 'Biziday',
    url: 'https://biziday.ro',
    rssUrl: 'https://biziday.ro/feed',
    logo: 'https://logo.clearbit.com/biziday.ro',
    bias: 'center',
    category: 'independent',
  },
  {
    id: 'paginademedia',
    name: 'Pagina de Media',
    url: 'https://www.paginademedia.ro',
    rssUrl: 'https://www.paginademedia.ro/feed',
    logo: 'https://logo.clearbit.com/paginademedia.ro',
    bias: 'center',
    category: 'independent',
  },
  {
    id: 'europafm',
    name: 'EuropaFM',
    url: 'https://www.europafm.ro',
    rssUrl: 'https://www.europafm.ro/feed',
    logo: 'https://logo.clearbit.com/europafm.ro',
    bias: 'center',
    category: 'mainstream',
  },

  // === DREAPTA / CENTRU-DREAPTA ===
  {
    id: 'romania-libera',
    name: 'România Liberă',
    url: 'https://romanialibera.ro',
    rssUrl: 'https://romanialibera.ro/feed',
    logo: 'https://logo.clearbit.com/romanialibera.ro',
    bias: 'center-right',
    category: 'mainstream',
  },
  {
    id: 'realitatea',
    name: 'Realitatea',
    url: 'https://www.realitatea.net',
    rssUrl: 'https://www.realitatea.net/rss',
    logo: 'https://logo.clearbit.com/realitatea.net',
    bias: 'center-right',
    category: 'mainstream',
  },
  {
    id: 'romaniatv',
    name: 'RomâniaTV',
    url: 'https://www.romaniatv.net',
    rssUrl: 'https://www.romaniatv.net/rss',
    logo: 'https://logo.clearbit.com/romaniatv.net',
    bias: 'right',
    category: 'mainstream',
  },
  {
    id: 'b1tv',
    name: 'B1 TV',
    url: 'https://www.b1tv.ro',
    rssUrl: 'https://www.b1tv.ro/rss',
    logo: 'https://logo.clearbit.com/b1tv.ro',
    bias: 'right',
    category: 'mainstream',
  },
  {
    id: 'antena3',
    name: 'Antena 3',
    url: 'https://www.antena3.ro',
    rssUrl: 'https://www.antena3.ro/rss',
    logo: 'https://logo.clearbit.com/antena3.ro',
    bias: 'center-right',
    category: 'mainstream',
  },
  {
    id: 'dcnews',
    name: 'DCNews',
    url: 'https://www.dcnews.ro',
    rssUrl: 'https://www.dcnews.ro/rss',
    logo: 'https://logo.clearbit.com/dcnews.ro',
    bias: 'right',
    category: 'independent',
  },
  {
    id: 'activenews',
    name: 'ActiveNews',
    url: 'https://www.activenews.ro',
    rssUrl: 'https://www.activenews.ro/rss',
    logo: 'https://logo.clearbit.com/activenews.ro',
    bias: 'right',
    category: 'independent',
  },
  {
    id: 'epochtimes',
    name: 'Epoch Times',
    url: 'https://epochtimes-romania.com',
    rssUrl: 'https://epochtimes-romania.com/feed',
    logo: 'https://logo.clearbit.com/epochtimes-romania.com',
    bias: 'right',
    category: 'independent',
  },
  {
    id: 'evz',
    name: 'Evenimentul Zilei',
    url: 'https://evz.ro',
    rssUrl: 'https://evz.ro/feed',
    logo: 'https://logo.clearbit.com/evz.ro',
    bias: 'center-right',
    category: 'mainstream',
  },
  {
    id: 'cotidianul',
    name: 'Cotidianul',
    url: 'https://www.cotidianul.ro',
    rssUrl: 'https://www.cotidianul.ro/feed',
    logo: 'https://logo.clearbit.com/cotidianul.ro',
    bias: 'center-right',
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
