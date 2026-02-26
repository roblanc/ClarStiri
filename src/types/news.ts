// Tipuri pentru știri reale din RSS feeds
import type { BiasAnalysis } from '@/utils/biasDetection';

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  rssUrl: string;
  logo?: string;
  bias: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
  factuality: 'high' | 'mixed' | 'low';
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
  biasAnalysis?: BiasAnalysis; // Content-based bias detection
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
  contentBias?: BiasAnalysis; // Content-based bias analysis
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
    bias: 'center-left', // Pro-european, critic PSD/AUR constant
    factuality: 'high',
    category: 'mainstream',
  },
  {
    id: 'mediafax',
    name: 'Mediafax',
    url: 'https://www.mediafax.ro',
    rssUrl: 'https://www.mediafax.ro/rss',
    logo: 'https://logo.clearbit.com/mediafax.ro',
    bias: 'center',
    factuality: 'high',
    category: 'mainstream',
  },
  {
    id: 'adevarul',
    name: 'Adevărul',
    url: 'https://adevarul.ro',
    rssUrl: 'https://adevarul.ro/rss',
    logo: 'https://logo.clearbit.com/adevarul.ro',
    bias: 'center-left', // Linie editorială progresistă
    factuality: 'high',
    category: 'mainstream',
  },
  {
    id: 'protv',
    name: 'Știrile ProTV',
    url: 'https://stirileprotv.ro',
    rssUrl: 'https://stirileprotv.ro/rss',
    logo: 'https://logo.clearbit.com/stirileprotv.ro',
    bias: 'center',
    factuality: 'high',
    category: 'mainstream',
  },
  {
    id: 'agerpres',
    name: 'Agerpres',
    url: 'https://www.agerpres.ro',
    rssUrl: 'https://www.agerpres.ro/rss/actualitate',
    logo: 'https://logo.clearbit.com/agerpres.ro',
    bias: 'center',
    factuality: 'high',
    category: 'public',
  },
  {
    id: 'observator',
    name: 'Observator',
    url: 'https://observatornews.ro',
    rssUrl: 'https://observatornews.ro/rss',
    logo: 'https://logo.clearbit.com/observatornews.ro',
    bias: 'center-right', // Intact Group (Dan Voiculescu), același holding ca Antena 3
    factuality: 'mixed',
    category: 'mainstream',
  },
  {
    id: 'ziarul-financiar',
    name: 'Ziarul Financiar',
    url: 'https://www.zf.ro',
    rssUrl: 'https://www.zf.ro/rss',
    logo: 'https://logo.clearbit.com/zf.ro',
    bias: 'center-right', // Perspectivă business/fiscală conservatoare
    factuality: 'high',
    category: 'mainstream',
  },
  {
    id: 'gandul',
    name: 'Gândul',
    url: 'https://www.gandul.ro',
    rssUrl: 'https://www.gandul.ro/rss',
    logo: 'https://logo.clearbit.com/gandul.ro',
    bias: 'center-right', // Linie editorială dreapta de lungă durată
    factuality: 'mixed',
    category: 'mainstream',
  },
  {
    id: 'bursa',
    name: 'Bursa',
    url: 'https://www.bursa.ro',
    rssUrl: 'https://www.bursa.ro/rss',
    logo: 'https://logo.clearbit.com/bursa.ro',
    bias: 'center',
    factuality: 'high',
    category: 'mainstream',
  },
  {
    id: 'news-ro',
    name: 'News.ro',
    url: 'https://www.news.ro',
    rssUrl: 'https://www.news.ro/rss',
    logo: 'https://logo.clearbit.com/news.ro',
    bias: 'center',
    factuality: 'high',
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
    factuality: 'high',
    category: 'independent',
  },
  {
    id: 'g4media',
    name: 'G4Media',
    url: 'https://www.g4media.ro',
    rssUrl: 'https://www.g4media.ro/feed',
    logo: 'https://logo.clearbit.com/g4media.ro',
    bias: 'left', // Partizanat puternic anti-PSD/naționalism, pro-USR
    factuality: 'high',
    category: 'independent',
  },
  {
    id: 'libertatea',
    name: 'Libertatea',
    url: 'https://www.libertatea.ro',
    rssUrl: 'https://www.libertatea.ro/feed',
    logo: 'https://logo.clearbit.com/libertatea.ro',
    bias: 'center-left',
    factuality: 'high',
    category: 'mainstream',
  },
  {
    id: 'recorder',
    name: 'Recorder',
    url: 'https://recorder.ro',
    rssUrl: 'https://recorder.ro/feed',
    logo: 'https://logo.clearbit.com/recorder.ro',
    bias: 'center-left',
    factuality: 'high',
    category: 'independent',
  },
  {
    id: 'pressone',
    name: 'PressOne',
    url: 'https://pressone.ro',
    rssUrl: 'https://pressone.ro/feed',
    logo: 'https://logo.clearbit.com/pressone.ro',
    bias: 'center-left',
    factuality: 'high',
    category: 'independent',
  },
  {
    id: 'republica',
    name: 'Republica',
    url: 'https://republica.ro',
    rssUrl: 'https://republica.ro/feed',
    logo: 'https://logo.clearbit.com/republica.ro',
    bias: 'left',
    factuality: 'mixed',
    category: 'independent',
  },
  {
    id: 'europa-libera',
    name: 'Europa Liberă',
    url: 'https://romania.europalibera.org',
    rssUrl: 'https://romania.europalibera.org/api/feed',
    logo: 'https://logo.clearbit.com/europalibera.org',
    bias: 'center-left',
    factuality: 'high',
    category: 'independent',
  },
  {
    id: 'snoop',
    name: 'Snoop.ro',
    url: 'https://snoop.ro',
    rssUrl: 'https://snoop.ro/feed',
    logo: 'https://logo.clearbit.com/snoop.ro',
    bias: 'center-left',
    factuality: 'high',
    category: 'independent',
  },
  {
    id: 'vice-romania',
    name: 'Vice România',
    url: 'https://www.vice.com/ro',
    rssUrl: 'https://www.vice.com/ro/feed',
    logo: 'https://logo.clearbit.com/vice.com',
    bias: 'center-left',
    factuality: 'mixed',
    category: 'independent',
  },
  {
    id: 'spotmedia',
    name: 'Spotmedia',
    url: 'https://spotmedia.ro',
    rssUrl: 'https://spotmedia.ro/feed',
    logo: 'https://logo.clearbit.com/spotmedia.ro',
    bias: 'center-left',
    factuality: 'high',
    category: 'independent',
  },
  {
    id: 'biziday',
    name: 'Biziday',
    url: 'https://biziday.ro',
    rssUrl: 'https://biziday.ro/feed',
    logo: 'https://logo.clearbit.com/biziday.ro',
    bias: 'center',
    factuality: 'high',
    category: 'independent',
  },
  {
    id: 'paginademedia',
    name: 'Pagina de Media',
    url: 'https://www.paginademedia.ro',
    rssUrl: 'https://www.paginademedia.ro/feed',
    logo: 'https://logo.clearbit.com/paginademedia.ro',
    bias: 'center',
    factuality: 'high',
    category: 'independent',
  },
  {
    id: 'europafm',
    name: 'EuropaFM',
    url: 'https://www.europafm.ro',
    rssUrl: 'https://www.europafm.ro/feed',
    logo: 'https://logo.clearbit.com/europafm.ro',
    bias: 'center',
    factuality: 'high',
    category: 'mainstream',
  },
  {
    id: 'scena9',
    name: 'Scena9',
    url: 'https://www.scena9.ro',
    rssUrl: 'https://www.scena9.ro/feed',
    logo: 'https://logo.clearbit.com/scena9.ro',
    bias: 'center-left',
    factuality: 'high',
    category: 'independent',
  },

  // === DREAPTA / CENTRU-DREAPTA ===
  {
    id: 'romania-libera',
    name: 'România Liberă',
    url: 'https://romanialibera.ro',
    rssUrl: 'https://romanialibera.ro/feed',
    logo: 'https://logo.clearbit.com/romanialibera.ro',
    bias: 'center-right',
    factuality: 'mixed',
    category: 'mainstream',
  },
  {
    id: 'realitatea',
    name: 'Realitatea',
    url: 'https://www.realitatea.net',
    rssUrl: 'https://www.realitatea.net/rss',
    logo: 'https://logo.clearbit.com/realitatea.net',
    bias: 'right', // A virat spre naționalism/suveranism
    factuality: 'mixed',
    category: 'mainstream',
  },
  {
    id: 'romaniatv',
    name: 'RomâniaTV',
    url: 'https://www.romaniatv.net',
    rssUrl: 'https://www.romaniatv.net/rss',
    logo: 'https://logo.clearbit.com/romaniatv.net',
    bias: 'right',
    factuality: 'low',
    category: 'mainstream',
  },
  {
    id: 'b1tv',
    name: 'B1 TV',
    url: 'https://www.b1tv.ro',
    rssUrl: 'https://www.b1tv.ro/rss',
    logo: 'https://logo.clearbit.com/b1tv.ro',
    bias: 'center-right', // Mai moderat față de RoTV/DCNews
    factuality: 'mixed',
    category: 'mainstream',
  },
  {
    id: 'antena3',
    name: 'Antena 3',
    url: 'https://www.antena3.ro',
    rssUrl: 'https://www.antena3.ro/rss',
    logo: 'https://logo.clearbit.com/antena3.ro',
    bias: 'right', // Pro-PSD, pro-Georgescu puternic; Intact Group
    factuality: 'mixed',
    category: 'mainstream',
  },
  {
    id: 'dcnews',
    name: 'DCNews',
    url: 'https://www.dcnews.ro',
    rssUrl: 'https://www.dcnews.ro/rss',
    logo: 'https://logo.clearbit.com/dcnews.ro',
    bias: 'right',
    factuality: 'low',
    category: 'independent',
  },
  {
    id: 'activenews',
    name: 'ActiveNews',
    url: 'https://www.activenews.ro',
    rssUrl: 'https://www.activenews.ro/rss',
    logo: 'https://logo.clearbit.com/activenews.ro',
    bias: 'right',
    factuality: 'low',
    category: 'independent',
  },
  {
    id: 'epochtimes',
    name: 'Epoch Times',
    url: 'https://epochtimes-romania.com',
    rssUrl: 'https://epochtimes-romania.com/feed',
    logo: 'https://logo.clearbit.com/epochtimes-romania.com',
    bias: 'right',
    factuality: 'low',
    category: 'independent',
  },
  {
    id: 'evz',
    name: 'Evenimentul Zilei',
    url: 'https://evz.ro',
    rssUrl: 'https://evz.ro/feed',
    logo: 'https://logo.clearbit.com/evz.ro',
    bias: 'right', // Intact Group, a virat puternic spre dreapta
    factuality: 'mixed',
    category: 'mainstream',
  },
  {
    id: 'cotidianul',
    name: 'Cotidianul',
    url: 'https://www.cotidianul.ro',
    rssUrl: 'https://www.cotidianul.ro/feed',
    logo: 'https://logo.clearbit.com/cotidianul.ro',
    bias: 'right', // A virat semnificativ spre dreapta naționalistă
    factuality: 'mixed',
    category: 'mainstream',
  },
  // === SURSE NOI (Satiră & Investigații) ===
  {
    id: 'defapt',
    name: 'Defapt.ro',
    url: 'https://defapt.ro',
    rssUrl: 'https://defapt.ro/feed/',
    logo: 'https://logo.clearbit.com/defapt.ro',
    bias: 'center-right',
    factuality: 'high',
    category: 'independent',
  },
  {
    id: 'catavencii',
    name: 'Cațavencii',
    url: 'https://www.catavencii.ro',
    rssUrl: 'https://www.catavencii.ro/feed/',
    logo: 'https://logo.clearbit.com/catavencii.ro',
    bias: 'center',
    factuality: 'mixed',
    category: 'independent',
  },
  {
    id: 'academiacatavencu',
    name: 'Academia Cațavencu',
    url: 'https://academiacatavencu.com',
    rssUrl: 'https://academiacatavencu.com/feed/',
    logo: 'https://logo.clearbit.com/academiacatavencu.com',
    bias: 'center',
    factuality: 'mixed',
    category: 'independent',
  },
  {
    id: 'dailybusiness',
    name: 'Daily Business',
    url: 'https://www.dailybusiness.ro',
    rssUrl: 'https://www.dailybusiness.ro/feed/',
    logo: 'https://logo.clearbit.com/dailybusiness.ro',
    bias: 'center-right',
    factuality: 'high',
    category: 'mainstream',
  },
  {
    id: 'wowbiz',
    name: 'WOWbiz',
    url: 'https://www.wowbiz.ro',
    rssUrl: 'https://www.wowbiz.ro/feed/',
    logo: 'https://logo.clearbit.com/wowbiz.ro',
    bias: 'center',
    factuality: 'mixed',
    category: 'tabloid',
  },
  {
    id: 'actualitate',
    name: 'Actualitate.net',
    url: 'https://actualitate.net',
    rssUrl: 'https://actualitate.net/feed/',
    logo: 'https://logo.clearbit.com/actualitate.net',
    bias: 'center',
    factuality: 'mixed',
    category: 'independent',
  },
  {
    id: 'factual',
    name: 'Factual.ro',
    url: 'https://www.factual.ro',
    rssUrl: 'https://www.factual.ro/feed/',
    logo: 'https://logo.clearbit.com/factual.ro',
    bias: 'center',
    factuality: 'high',
    category: 'independent',
  },
  {
    id: 'jurnalul',
    name: 'Jurnalul.ro',
    url: 'https://jurnalul.ro',
    rssUrl: 'https://jurnalul.ro/feed/',
    logo: 'https://logo.clearbit.com/jurnalul.ro',
    bias: 'center',
    factuality: 'mixed',
    category: 'mainstream',
  },
];

// Mapare bias la procente pentru calculul distribuției
// Fiecare sursă contribuie 100% la categoria ei — fără "spread" artificial
export const BIAS_WEIGHT_MAP: Record<NewsSource['bias'], { left: number; center: number; right: number }> = {
  'left': { left: 100, center: 0, right: 0 },
  'center-left': { left: 60, center: 40, right: 0 },
  'center': { left: 0, center: 100, right: 0 },
  'center-right': { left: 0, center: 40, right: 60 },
  'right': { left: 0, center: 0, right: 100 },
};
