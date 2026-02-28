import { useState, useEffect } from 'react';
import { ExternalLink, History, Loader2, Calendar, ChevronRight, ChevronDown, AlertCircle, Archive } from 'lucide-react';

interface ArchiveEntry {
  url: string;
  timestamp: string;
  displayDate: string;
  year: string;
  month: string;
  title: string;
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

const MONTH_NAMES = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

export function SourceArchive({ domain }: SourceArchiveProps) {
  const [groupedItems, setGroupedItems] = useState<GroupedArchive>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

  useEffect(() => {
    const fetchWaybackHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Query the CDX API for the last 200 unique captures to keep it fast but relevant
        const url = `https://web.archive.org/cdx/search/cdx?url=${cleanDomain}/*&output=json&limit=200&collapse=urlkey&filter=statuscode:200&filter=mimetype:text/html`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Nu am putut interoga arhiva.');
        
        const data = await response.json();
        if (data.length <= 1) {
          setGroupedItems({});
          return;
        }

        const rows = data.slice(1);
        const grouped: GroupedArchive = {};

        rows.forEach((row: string[]) => {
          const timestamp = row[1];
          const originalUrl = row[2];
          
          const year = timestamp.substring(0, 4);
          const monthIdx = parseInt(timestamp.substring(4, 6)) - 1;
          const monthName = MONTH_NAMES[monthIdx];
          const day = timestamp.substring(6, 8);

          // Clean title from URL (Wayback doesn't provide titles in CDX, so we prettify the URL)
          let title = originalUrl
            .split('/').pop()?.replace(/-/g, ' ').replace(/\.html?$/, '') || originalUrl;
          if (title.length < 5) title = originalUrl;

          const entry: ArchiveEntry = {
            url: originalUrl,
            timestamp,
            year,
            month: monthName,
            title: title.charAt(0).toUpperCase() + title.slice(1),
            displayDate: `${day} ${monthName} ${year}`
          };

          if (!grouped[year]) grouped[year] = {};
          if (!grouped[year][monthName]) grouped[year][monthName] = [];
          grouped[year][monthName].push(entry);
        });

        // Sort months and years descending
        setGroupedItems(grouped);
        
        // Auto-expand the latest year
        const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
        if (years.length > 0) {
          setExpandedYears({ [years[0]]: true });
        }

      } catch (err) {
        setError('Eroare la conectarea cu Internet Archive.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaybackHistory();
  }, [cleanDomain]);

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

  const years = Object.keys(groupedItems).sort((a, b) => b.localeCompare(a));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground text-lg">Arhivă Evolutivă</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded">
          Powered by Wayback Machine
        </span>
      </div>

      {years.length === 0 ? (
        <div className="p-8 text-center bg-card border border-border rounded-xl">
          <p className="text-sm text-muted-foreground">Nu am găsit înregistrări istorice pentru acest domeniu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {years.map(year => (
            <div key={year} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Year Header */}
              <button 
                onClick={() => toggleYear(year)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <span className="font-black text-xl tracking-tighter">{year}</span>
                {expandedYears[year] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>

              {expandedYears[year] && (
                <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {Object.keys(groupedItems[year]).sort((a, b) => {
                    return MONTH_NAMES.indexOf(b) - MONTH_NAMES.indexOf(a);
                  }).map(month => {
                    const monthKey = `${year}-${month}`;
                    const articles = groupedItems[year][month];
                    
                    return (
                      <div key={month} className="border border-border/50 rounded-lg overflow-hidden">
                        {/* Month Header */}
                        <button 
                          onClick={() => toggleMonth(year, month)}
                          className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-bold"
                        >
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            {month}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                            {articles.length} înregistrări
                          </span>
                        </button>

                        {expandedMonths[monthKey] && (
                          <div className="p-2 space-y-1 bg-background/50">
                            {articles.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map((article, idx) => (
                              <a 
                                key={idx} 
                                href={`https://web.archive.org/web/${article.timestamp}/${article.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 p-3 rounded-md hover:bg-primary/5 transition-all group"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-1.5 group-hover:bg-primary transition-colors" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                    {article.title}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">
                                    {article.displayDate} • {new URL(article.url).hostname}
                                  </p>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-1" />
                              </a>
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
      
      <p className="text-[10px] text-muted-foreground text-center pt-2 italic">
        Datele sunt agregate din indexul public Internet Archive. Legăturile deschid versiunea arhivată a paginii originale.
      </p>
    </section>
  );
}
