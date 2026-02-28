import { useState, useEffect } from 'react';
import { ExternalLink, History, Loader2, Calendar, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArchiveItem {
  url: string;
  timestamp: string;
  date: string;
  archiveUrl: string;
}

interface SourceArchiveProps {
  domain: string;
}

export function SourceArchive({ domain }: SourceArchiveProps) {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean domain for API (remove protocol and www)
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

  const fetchArchive = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Wayback Machine CDX API
      // We search for unique original URLs captured under this domain
      // output=json, limit=50, collapse=urlkey (to avoid duplicate snapshots of same URL)
      const url = `https://web.archive.org/cdx/search/cdx?url=${cleanDomain}/*&output=json&limit=50&collapse=urlkey&filter=statuscode:200`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Nu am putut accesa Internet Archive.');
      
      const data = await response.json();
      
      // First row is headers: ["urlkey", "timestamp", "original", "mimetype", "statuscode", "digest", "length"]
      if (data.length <= 1) {
        setItems([]);
        return;
      }

      const headers = data[0];
      const rows = data.slice(1);

      const mappedItems: ArchiveItem[] = rows.map((row: string[]) => {
        const timestamp = row[1];
        const originalUrl = row[2];
        
        // Format date: YYYYMMDDHHMMSS -> DD MMM YYYY
        const year = timestamp.substring(0, 4);
        const month = timestamp.substring(4, 6);
        const day = timestamp.substring(6, 8);
        const dateObj = new Date(`${year}-${month}-${day}`);
        const formattedDate = dateObj.toLocaleDateString('ro-RO', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        });

        return {
          url: originalUrl,
          timestamp,
          date: formattedDate,
          archiveUrl: `https://web.archive.org/web/${timestamp}/${originalUrl}`
        };
      }).sort((a: ArchiveItem, b: ArchiveItem) => b.timestamp.localeCompare(a.timestamp));

      setItems(mappedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare necunoscută');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground text-lg">Arhivă Istorică</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background px-2 py-1 rounded border border-border">
          via Wayback Machine
        </span>
      </div>

      <div className="p-5">
        {items.length === 0 && !isLoading && !error && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Explorează ultimele pagini salvate de Internet Archive pentru acest domeniu.
            </p>
            <Button onClick={fetchArchive} variant="outline" size="sm" className="rounded-full">
              <History className="w-4 h-4 mr-2" />
              Încarcă Arhiva
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground font-medium">Interogăm Internet Archive...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Eroare la încărcare</p>
              <p className="text-xs text-destructive/80">{error}</p>
              <Button onClick={fetchArchive} variant="link" className="text-xs p-0 h-auto mt-2 text-destructive underline">
                Încearcă din nou
              </Button>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4 italic">
              * Lista de mai jos conține snapshot-uri capturate în timp. Link-urile duc către versiunea istorică a paginii.
            </p>
            <div className="grid gap-2">
              {items.map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.archiveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border group"
                >
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.url.replace(/^https?:\/\//, '')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Capturat: {item.date}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-center">
              <a 
                href={`https://web.archive.org/web/*/${cleanDomain}`} 
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
