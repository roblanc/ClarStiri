export type SourceBias = 'left' | 'center-left' | 'center' | 'center-right' | 'right';
export type SourceFactuality = 'high' | 'mixed' | 'low';
export type SourceCategory = 'mainstream' | 'independent' | 'tabloid' | 'public';

export interface BaseNewsSource {
  id: string;
  name: string;
  url: string;
  rssUrl: string;
  logo?: string;
  bias: SourceBias;
  factuality: SourceFactuality;
  category: SourceCategory;
}

export const NEWS_SOURCES_BASE = [
  { id: 'agerpres', name: 'Agerpres', url: 'https://www.agerpres.ro', rssUrl: 'https://www.agerpres.ro/rss', bias: 'center', factuality: 'high', category: 'public' },
  { id: 'mediafax', name: 'Mediafax', url: 'https://www.mediafax.ro', rssUrl: 'https://www.mediafax.ro/rss', bias: 'center', factuality: 'high', category: 'mainstream' },
  { id: 'protv', name: 'ProTV', url: 'https://stirileprotv.ro', rssUrl: 'https://rss.stirileprotv.ro/', bias: 'center', factuality: 'high', category: 'mainstream' },
  { id: 'tvr', name: 'TVR', url: 'https://stiri.tvr.ro', rssUrl: 'https://stiri.tvr.ro/rss.xml', bias: 'center', factuality: 'high', category: 'public' },
  { id: 'bursa', name: 'Bursa', url: 'https://www.bursa.ro', rssUrl: 'https://www.bursa.ro/rss', bias: 'center', factuality: 'high', category: 'mainstream' },
  { id: 'biziday', name: 'Biziday', url: 'https://www.biziday.ro', rssUrl: 'https://www.biziday.ro/feed/', bias: 'center', factuality: 'high', category: 'independent' },
  { id: 'digi24', name: 'Digi24', url: 'https://www.digi24.ro', rssUrl: 'https://www.digi24.ro/rss', bias: 'center-left', factuality: 'high', category: 'mainstream' },
  { id: 'hotnews', name: 'HotNews', url: 'https://www.hotnews.ro', rssUrl: 'https://www.hotnews.ro/rss/actualitate', bias: 'center-left', factuality: 'high', category: 'mainstream' },
  { id: 'recorder', name: 'Recorder', url: 'https://recorder.ro', rssUrl: 'https://recorder.ro/feed/', bias: 'center-left', factuality: 'high', category: 'independent' },
  { id: 'libertatea', name: 'Libertatea', url: 'https://www.libertatea.ro', rssUrl: 'https://www.libertatea.ro/rss', bias: 'center-left', factuality: 'mixed', category: 'mainstream' },
  { id: 'adevarul', name: 'Adevărul', url: 'https://adevarul.ro', rssUrl: 'https://adevarul.ro/rss/', bias: 'center-left', factuality: 'mixed', category: 'mainstream' },
  { id: 'newsweek', name: 'Newsweek România', url: 'https://newsweek.ro', rssUrl: 'https://newsweek.ro/rss', bias: 'center-left', factuality: 'high', category: 'mainstream' },
  { id: 'snoop', name: 'Snoop.ro', url: 'https://snoop.ro', rssUrl: 'https://snoop.ro/rss', bias: 'center-left', factuality: 'high', category: 'independent' },
  { id: 'spotmedia', name: 'Spotmedia', url: 'https://spotmedia.ro', rssUrl: 'https://spotmedia.ro/feed', bias: 'center-left', factuality: 'high', category: 'independent' },
  { id: 'paginademedia', name: 'Pagina de Media', url: 'https://www.paginademedia.ro', rssUrl: 'https://www.paginademedia.ro/feed/', bias: 'center-left', factuality: 'high', category: 'independent' },
  { id: 'vice', name: 'Vice România', url: 'https://www.vice.com/ro', rssUrl: 'https://www.vice.com/ro/rss', bias: 'center-left', factuality: 'mixed', category: 'independent' },
  { id: 'scena9', name: 'Scena9', url: 'https://www.scena9.ro', rssUrl: 'https://www.scena9.ro/feed', bias: 'center-left', factuality: 'high', category: 'independent' },
  { id: 'g4media', name: 'G4Media', url: 'https://www.g4media.ro', rssUrl: 'https://www.g4media.ro/feed', bias: 'left', factuality: 'high', category: 'independent' },
  { id: 'criticatac', name: 'CriticAtac', url: 'https://www.criticatac.ro', rssUrl: 'https://www.criticatac.ro/feed/', bias: 'left', factuality: 'mixed', category: 'independent' },
  { id: 'ziare', name: 'Ziare.com', url: 'https://www.ziare.com', rssUrl: 'https://www.ziare.com/rss/news.xml', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
  { id: 'gandul', name: 'Gândul', url: 'https://www.gandul.ro', rssUrl: 'https://www.gandul.ro/rss', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
  { id: 'capital', name: 'Capital', url: 'https://www.capital.ro', rssUrl: 'https://www.capital.ro/feed/', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
  { id: 'europafm', name: 'Europa FM', url: 'https://www.europafm.ro', rssUrl: 'https://www.europafm.ro/feed/', bias: 'center-right', factuality: 'high', category: 'mainstream' },
  { id: 'profit', name: 'Profit.ro', url: 'https://www.profit.ro', rssUrl: 'https://www.profit.ro/rss', bias: 'center-right', factuality: 'high', category: 'mainstream' },
  { id: 'zf', name: 'Ziarul Financiar', url: 'https://www.zf.ro', rssUrl: 'https://www.zf.ro/rss', bias: 'center-right', factuality: 'high', category: 'mainstream' },
  { id: 'romanialibera', name: 'România Liberă', url: 'https://romanialibera.ro', rssUrl: 'https://romanialibera.ro/feed/', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
  { id: 'observator', name: 'Observator', url: 'https://observatornews.ro', rssUrl: 'https://observatornews.ro/rss', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
  { id: 'antena3', name: 'Antena 3', url: 'https://www.antena3.ro', rssUrl: 'https://www.antena3.ro/rss', bias: 'right', factuality: 'low', category: 'mainstream' },
  { id: 'romaniatv', name: 'România TV', url: 'https://www.romaniatv.net', rssUrl: 'https://www.romaniatv.net/rss', bias: 'right', factuality: 'low', category: 'mainstream' },
  { id: 'dcnews', name: 'DCNews', url: 'https://www.dcnews.ro', rssUrl: 'https://www.dcnews.ro/rss/', bias: 'right', factuality: 'low', category: 'mainstream' },
  { id: 'flux24', name: 'Flux24', url: 'https://flux24.ro', rssUrl: 'https://flux24.ro/feed/', bias: 'right', factuality: 'mixed', category: 'independent' },
  { id: 'activenews', name: 'ActiveNews', url: 'https://www.activenews.ro', rssUrl: 'https://www.activenews.ro/rss', bias: 'right', factuality: 'low', category: 'independent' },
  { id: 'epochtimes', name: 'Epoch Times România', url: 'https://epochtimes-romania.com', rssUrl: 'https://epochtimes-romania.com/feed/', bias: 'right', factuality: 'low', category: 'independent' },
  { id: 'defapt', name: 'Defapt.ro', url: 'https://defapt.ro', rssUrl: 'https://defapt.ro/feed/', bias: 'center-right', factuality: 'high', category: 'independent' },
  { id: 'catavencii', name: 'Cațavencii', url: 'https://www.catavencii.ro', rssUrl: 'https://www.catavencii.ro/feed/', bias: 'center', factuality: 'mixed', category: 'independent' },
  { id: 'academiacatavencu', name: 'Academia Cațavencu', url: 'https://academiacatavencu.com', rssUrl: 'https://academiacatavencu.com/feed/', bias: 'center', factuality: 'mixed', category: 'independent' },
  { id: 'dailybusiness', name: 'Daily Business', url: 'https://www.dailybusiness.ro', rssUrl: 'https://www.dailybusiness.ro/feed/', bias: 'center-right', factuality: 'high', category: 'mainstream' },
  { id: 'wowbiz', name: 'WOWbiz', url: 'https://www.wowbiz.ro', rssUrl: 'https://www.wowbiz.ro/feed/', bias: 'center', factuality: 'mixed', category: 'tabloid' },
  { id: 'actualitate', name: 'Actualitate.net', url: 'https://actualitate.net', rssUrl: 'https://actualitate.net/feed/', bias: 'center', factuality: 'mixed', category: 'independent' },
  { id: 'factual', name: 'Factual.ro', url: 'https://www.factual.ro', rssUrl: 'https://www.factual.ro/feed/', bias: 'center', factuality: 'high', category: 'independent' },
  { id: 'jurnalul', name: 'Jurnalul.ro', url: 'https://jurnalul.ro', rssUrl: 'https://jurnalul.ro/feed/', bias: 'center', factuality: 'mixed', category: 'mainstream' },
  { id: 'realitatea', name: 'Realitatea Plus', url: 'https://www.realitatea.net', rssUrl: 'https://www.realitatea.net/rss', bias: 'right', factuality: 'mixed', category: 'mainstream' },
  { id: 'aktual24', name: 'Aktual24', url: 'https://www.aktual24.ro', rssUrl: 'https://www.aktual24.ro/feed/', bias: 'right', factuality: 'mixed', category: 'independent' },
  { id: 'redactia', name: 'Redacția', url: 'https://redactia.ro', rssUrl: 'https://redactia.ro/feed/', bias: 'center-right', factuality: 'mixed', category: 'independent' },
  { id: 'b1tv', name: 'B1 TV', url: 'https://www.b1tv.ro', rssUrl: 'https://www.b1tv.ro/feed/', bias: 'center-right', factuality: 'mixed', category: 'mainstream' },
] as const satisfies readonly BaseNewsSource[];

export type SourceId = (typeof NEWS_SOURCES_BASE)[number]['id'];

export const BIAS_WEIGHT_MAP: Record<SourceBias, { left: number; center: number; right: number }> = {
  left: { left: 100, center: 0, right: 0 },
  'center-left': { left: 60, center: 40, right: 0 },
  center: { left: 0, center: 100, right: 0 },
  'center-right': { left: 0, center: 40, right: 60 },
  right: { left: 0, center: 0, right: 100 },
};
