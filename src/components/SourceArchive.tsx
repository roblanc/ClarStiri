import { useState, useEffect } from 'react';
import { ExternalLink, History, Loader2, Calendar, ChevronRight, ChevronDown, Archive, Search } from 'lucide-react';

interface ArchiveEntry {
  url: string;
  timestamp?: string;
  displayDate: string;
  year: string;
  month: string;
  title: string;
  source: 'local' | 'wayback';
}

interface GroupedArchive {
  [year: string]: {
    [month: string]: ArchiveEntry[];
  };
}

interface SourceArchiveProps {
  sourceId: string;
  domain: string;
}

interface LocalArchiveItem {
  title: string;
  url: string;
  date: string;
}

const MONTH_NAMES = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

export function SourceArchive({ sourceId, domain }: SourceArchiveProps) {
  const [groupedItems, setGroupedItems] = useState<GroupedArchive>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingWayback, setIsRefreshingWayback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

  useEffect(() => {
    let cancelled = false;

    const addToGroup = (target: GroupedArchive, entry: ArchiveEntry) => {
      if (!target[entry.year]) target[entry.year] = {};
      if (!target[entry.year][entry.month]) target[entry.year][entry.month] = [];
      if (!target[entry.year][entry.month].some(e => e.url === entry.url)) {
        target[entry.year][entry.month].push(entry);
      }
    };

    const fetchFullHistory = async () => {
      setIsLoading(true);
      setError(null);
      const grouped: GroupedArchive = {};

      try {
        // 1) Load local archive first and render immediately
        try {
          const localData = await import(`../data/archives/${sourceId}.json`);
          const localEntries = (localData?.default ?? []) as LocalArchiveItem[];
          if (Array.isArray(localEntries)) {
            localEntries.forEach((item) => {
              const date = new Date(item.date);
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear().toString();
                const monthName = MONTH_NAMES[date.getMonth()];
                addToGroup(grouped, {
                  url: item.url,
                  title: item.title,
                  displayDate: date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' }),
                  year,
                  month: monthName,
                  source: 'local'
                });
              }
            });
          }
        } catch (e) {
          console.log(`No local archive for ${sourceId}`);
        }

        if (!cancelled) {
          setGroupedItems(grouped);
          setIsLoading(false);
          const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
          if (years.length > 0) setExpandedYears({ [years[0]]: true });
        }

        // 2) Fetch Wayback in background and merge results progressively
        setIsRefreshingWayback(true);
        const wbUrl = `https://web.archive.org/cdx/search/cdx?url=${cleanDomain}/*&output=json&limit=150&collapse=urlkey&filter=statuscode:200&filter=mimetype:text/html`;
        const response = await fetch(wbUrl);

        if (response.ok) {
          const data = (await response.json()) as string[][];
          if (data.length > 1) {
            const rows = data.slice(1);
            rows.forEach((row: string[]) => {
              const timestamp = row[1];
              const originalUrl = row[2];
              
              const year = timestamp.substring(0, 4);
              const monthIdx = parseInt(timestamp.substring(4, 6)) - 1;
              const monthName = MONTH_NAMES[monthIdx];
              const day = timestamp.substring(6, 8);

              // Generăm un titlu din URL dacă nu e deja în arhiva locală
              let title = originalUrl.split('/').pop()?.replace(/-/g, ' ').replace(/\.html?$/, '') || originalUrl;
              if (title.length < 5) title = originalUrl;

              addToGroup(grouped, {
                url: originalUrl,
                timestamp,
                title: title.charAt(0).toUpperCase() + title.slice(1),
                displayDate: `${day} ${monthName} ${year}`,
                year,
                month: monthName,
                source: 'wayback'
              });
            });
          }
        }

        if (!cancelled) {
          setGroupedItems(grouped);
          const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
          if (years.length > 0) {
            setExpandedYears(prev => (Object.keys(prev).length ? prev : { [years[0]]: true }));
          }
        }

      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Nu am putut încărca indexul extern Wayback. Se afișează arhiva disponibilă local.');
          setGroupedItems(grouped);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshingWayback(false);
        }
      }
    };

    fetchFullHistory();

    return () => {
      cancelled = true;
    };
  }, [sourceId, cleanDomain]);

  const toggleYear = (year: string) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const toggleMonth = (year: string, month: string) => {
    const key = `${year}-${month}`;
    setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-card border border-border rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Se reconstruiește istoricul publicației...</p>
      </div>
    );
  }

  const sortedYears = Object.keys(groupedItems).sort((a, b) => b.localeCompare(a));

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground text-lg">Arhivă Evolutivă</h3>
          {isRefreshingWayback && (
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground animate-pulse">
              actualizăm indexul...
            </span>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Caută în arhivă..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-border bg-background w-full sm:w-48 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {sortedYears.length === 0 ? (
        <div className="p-8 text-center bg-card border border-border rounded-xl">
          <p className="text-sm text-muted-foreground">
            {isRefreshingWayback
              ? 'Se caută înregistrări în Wayback...'
              : 'Nu am găsit înregistrări istorice pentru acest domeniu.'}
          </p>
          {error && (
            <p className="text-xs text-amber-700 mt-2">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedYears.map(year => (
            <div key={year} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleYear(year)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-2xl tracking-tighter text-foreground">{year}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">
                    {Object.values(groupedItems[year]).reduce((acc, val) => acc + val.length, 0)} articole
                  </span>
                </div>
                {expandedYears[year] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>

              {expandedYears[year] && (
                <div className="px-4 pb-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {Object.keys(groupedItems[year]).sort((a, b) => {
                    return MONTH_NAMES.indexOf(b) - MONTH_NAMES.indexOf(a);
                  }).map(month => {
                    const monthKey = `${year}-${month}`;
                    const articles = groupedItems[year][month].filter(a => 
                      a.title.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    
                    if (searchQuery && articles.length === 0) return null;

                    return (
                      <div key={month} className="border border-border/40 rounded-lg overflow-hidden bg-muted/10">
                        <button 
                          onClick={() => toggleMonth(year, month)}
                          className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-sm font-bold"
                        >
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary/60" />
                            {month}
                          </span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${expandedMonths[monthKey] ? 'rotate-90' : ''}`} />
                        </button>

                        {expandedMonths[monthKey] && (
                          <div className="divide-y divide-border/30 bg-background/40">
                            {articles.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')).map((article, idx) => (
                              <div key={idx} className="flex flex-col p-3 hover:bg-primary/5 transition-all group relative">
                                <div className="flex items-start justify-between gap-4">
                                  <p className="text-sm font-bold text-foreground leading-snug pr-6">
                                    {article.title}
                                  </p>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {article.source === 'local' && (
                                      <span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                                        LIVE CAPTURE
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                                    {article.displayDate}
                                  </span>
                                  
                                  <div className="flex items-center gap-3 ml-auto opacity-60 group-hover:opacity-100 transition-opacity">
                                    <a 
                                      href={article.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                                    >
                                      Sursă
                                    </a>
                                    <a 
                                      href={article.source === 'local' ? `https://web.archive.org/web/${article.url}` : `https://web.archive.org/web/${article.timestamp}/${article.url}`}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                                    >
                                      Arhivă <History className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <p className="text-[9px] text-muted-foreground text-center pt-2 max-w-xs mx-auto">
        Arhiva combină capturi live și indexul istoric Wayback Machine pentru transparență totală.
      </p>
    </section>
  );
}
