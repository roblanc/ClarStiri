import { useState, useEffect } from 'react';
import { ExternalLink, History, Loader2, Calendar, Link as LinkIcon, AlertCircle, ShieldCheck } from 'lucide-react';
import { fetchNewsFromSource } from '@/services/newsService';
import { RSSNewsItem } from '@/types/news';

interface SourceArchiveProps {
  sourceId: string;
  domain: string;
}

export function SourceArchive({ sourceId, domain }: SourceArchiveProps) {
  const [items, setItems] = useState<RSSNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentArticles = async () => {
      setIsLoading(true);
      try {
        const news = await fetchNewsFromSource(sourceId, 20);
        setItems(news);
      } catch (err) {
        setError('Nu am putut încărca articolele recente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentArticles();
  }, [sourceId]);

  const getWaybackUrl = (url: string) => {
    // pattern: https://web.archive.org/web/[url] -> redirects to latest
    return `https://web.archive.org/web/${url}`;
  };

  return (
    <section className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground text-lg">Urmărire & Arhivă Proaspătă</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background px-2 py-1 rounded border border-border">
          Auto-Archiving Active
        </span>
      </div>

      <div className="p-5">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground font-medium">Se încarcă istoricul recent...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">
            Nu am găsit articole recente pentru această sursă.
          </p>
        )}

        {items.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground mb-4">
              Toate articolele de mai jos sunt trimise automat către <strong>Internet Archive</strong> în momentul publicării pentru a asigura transparența și integritatea datelor.
            </p>
            <div className="grid gap-3">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-all group"
                >
                  <h4 className="text-sm font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.pubDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        Sursă <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      
                      <a 
                        href={getWaybackUrl(item.link)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
                      >
                        Vezi Arhivă <History className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-border flex justify-center">
              <a 
                href={`https://web.archive.org/web/*/${domain.replace(/^(https?:\/\/)?(www\.)?/, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest"
              >
                Vezi tot calendarul pe Wayback Machine
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
