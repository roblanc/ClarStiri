import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAggregatedNews } from "@/hooks/useNews";
import { useSearchStore } from "@/hooks/useSearchStore";
import { PUBLIC_FIGURES } from "@/data/publicFigures";
import { SOURCE_CATALOG } from "@/data/sourceCatalog";
import { CATEGORIES } from "@/utils/categories";
import { buildStoryHref } from "@/utils/storyRoute";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

type ResultKind = "story" | "voice" | "source" | "category" | "page";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  kind: ResultKind;
  score: number;
}

const STATIC_PAGES = [
  { id: "page-home", title: "Prima pagină", subtitle: "Fluxul principal de știri", href: "/" },
  { id: "page-surse", title: "Surse", subtitle: "Profiluri și metodologie de evaluare", href: "/surse" },
  { id: "page-barometru", title: "Influenceri", subtitle: "Voci publice și profiluri", href: "/influenceri" },
  { id: "page-metodologie", title: "Metodologie", subtitle: "Cum agregăm și analizăm bias-ul", href: "/metodologie" },
  { id: "page-despre", title: "Despre", subtitle: "Despre proiect", href: "/despre" },
  { id: "page-contact", title: "Contact", subtitle: "Date de contact", href: "/contact" },
];

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

function scoreMatch(text: string, query: string): number {
  if (!text || !query) return 0;
  const value = normalize(text);
  if (!value.includes(query)) return 0;
  if (value.startsWith(query)) return 5;
  if (value.split(/\s+/).some((token) => token.startsWith(query))) return 3;
  return 1;
}

function kindLabel(kind: ResultKind): string {
  if (kind === "story") return "Știre";
  if (kind === "voice") return "Voce";
  if (kind === "source") return "Sursă";
  if (kind === "category") return "Categorie";
  return "Pagină";
}

function sectionTitle(kind: ResultKind): string {
  if (kind === "story") return "Știri";
  if (kind === "voice") return "Voci";
  if (kind === "source") return "Surse";
  if (kind === "category") return "Categorii";
  return "Pagini";
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const { query, setQuery, clearQuery } = useSearchStore();
  const { data: stories = [], isLoading } = useAggregatedNews(100);

  // URL → store: la navigare directă sau link shared
  useEffect(() => {
    const trimmed = urlQuery.trim();
    if (trimmed && trimmed !== query) {
      setQuery(trimmed);
    }
  }, [urlQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // store → URL: ține URL-ul în sync când userul tastează în Header
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed !== urlQuery) {
      setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true });
    }
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const normalizedQuery = normalize(query || "");

  const allResults = useMemo(() => {
    if (!normalizedQuery) return [] as SearchResult[];

    const storyResults: SearchResult[] = stories
      .map((story) => {
        const titleScore = scoreMatch(story.title, normalizedQuery);
        const descScore = scoreMatch(story.description || "", normalizedQuery);
        const sourceScore = Math.max(
          ...story.sources.map((source) => scoreMatch(source.source.name, normalizedQuery)),
          0,
        );
        const score = titleScore * 3 + descScore + sourceScore * 2;
        if (score === 0) return null;

        return {
          id: `story-${story.id}`,
          title: story.title,
          subtitle: `${story.sourcesCount} surse · ${story.timeAgo}`,
          href: buildStoryHref(story.id, story.title),
          kind: "story" as ResultKind,
          score,
        };
      })
      .filter((item): item is SearchResult => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    const voiceResults: SearchResult[] = PUBLIC_FIGURES
      .map((figure) => {
        const score =
          scoreMatch(figure.name, normalizedQuery) * 4 +
          scoreMatch(figure.role, normalizedQuery) * 2 +
          scoreMatch(figure.description, normalizedQuery) +
          Math.max(...figure.targets.map((target) => scoreMatch(target, normalizedQuery)), 0);

        if (score === 0) return null;
        return {
          id: `voice-${figure.id}`,
          title: figure.name,
          subtitle: figure.role,
          href: `/voce/${figure.slug}`,
          kind: "voice" as ResultKind,
          score,
        };
      })
      .filter((item): item is SearchResult => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    const sourceResults: SearchResult[] = SOURCE_CATALOG
      .map((source) => {
        const score =
          scoreMatch(source.name, normalizedQuery) * 3 +
          scoreMatch(source.id, normalizedQuery) * 2 +
          scoreMatch(source.profile?.currentOwner || "", normalizedQuery) +
          scoreMatch(source.profile?.editorialLine || "", normalizedQuery);

        if (score === 0) return null;
        return {
          id: `source-${source.id}`,
          title: source.name,
          subtitle: source.profile?.currentOwner || source.url,
          href: `/surse/${source.id}`,
          kind: "source" as ResultKind,
          score,
        };
      })
      .filter((item): item is SearchResult => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    const categoryResults: SearchResult[] = CATEGORIES
      .map((category) => {
        const score =
          scoreMatch(category.name, normalizedQuery) * 3 +
          scoreMatch(category.slug, normalizedQuery) * 2 +
          Math.max(...category.keywords.map((keyword) => scoreMatch(keyword, normalizedQuery)), 0);

        if (score === 0) return null;
        return {
          id: `category-${category.slug}`,
          title: category.name,
          subtitle: `Categorie: ${category.slug}`,
          href: `/categorie/${category.slug}`,
          kind: "category" as ResultKind,
          score,
        };
      })
      .filter((item): item is SearchResult => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    const pageResults: SearchResult[] = STATIC_PAGES
      .map((page) => {
        const score = scoreMatch(page.title, normalizedQuery) * 3 + scoreMatch(page.subtitle, normalizedQuery);
        if (score === 0) return null;
        return {
          ...page,
          kind: "page" as ResultKind,
          score,
        };
      })
      .filter((item): item is SearchResult => item !== null)
      .sort((a, b) => b.score - a.score);

    return [...storyResults, ...voiceResults, ...sourceResults, ...categoryResults, ...pageResults]
      .sort((a, b) => b.score - a.score);
  }, [normalizedQuery, stories]);

  const grouped = useMemo(() => {
    const groups: Record<ResultKind, SearchResult[]> = {
      story: [],
      voice: [],
      source: [],
      category: [],
      page: [],
    };
    allResults.forEach((result) => groups[result.kind].push(result));
    return groups;
  }, [allResults]);

  const sectionsOrder: ResultKind[] = ["story", "voice", "source", "category", "page"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-10 lg:max-w-[90%] xl:max-w-[85%]">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">Căutare Globală</h1>
          <p className="text-muted-foreground">
            {normalizedQuery
              ? `${allResults.length} rezultate pentru "${query}"`
              : "Scrie în bara de sus ca să cauți în știri, voci, surse, categorii și pagini."}
          </p>
        </div>

        {!normalizedQuery && (
          <div className="border border-border bg-card p-8 text-center text-muted-foreground">
            Introdu un termen în căutare.
          </div>
        )}

        {normalizedQuery && !isLoading && allResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border border-border bg-card">
            <SearchX className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="font-serif text-2xl mb-2 text-foreground">Niciun rezultat</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center max-w-md">
              Nu am găsit nimic pentru "{query}". Încearcă alți termeni.
            </p>
            <Button onClick={clearQuery} variant="outline" className="rounded-none border-border font-serif uppercase text-xs tracking-widest px-8">
              ȘTERGE CĂUTAREA
            </Button>
          </div>
        )}

        {normalizedQuery && allResults.length > 0 && (
          <div className="space-y-8">
            {sectionsOrder.map((kind) =>
              grouped[kind].length > 0 ? (
                <section key={kind}>
                  <h2 className="font-serif text-2xl text-foreground mb-4">
                    {sectionTitle(kind)} ({grouped[kind].length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {grouped[kind].slice(0, 9).map((result) => (
                      <Link
                        key={result.id}
                        to={result.href}
                        className="border border-border bg-card p-4 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            {kindLabel(result.kind)}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground line-clamp-2">{result.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.subtitle}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null,
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
