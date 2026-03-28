import { NewsSchema } from "@/components/NewsSchema";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BiasBar } from "@/components/BiasBar";
import { useAggregatedNews } from "@/hooks/useNews";
import type { AggregatedStory } from "@/types/news";
import { normalizeStorySlug, toStorySlug, buildStoryHref } from "@/utils/storyRoute";
import { ArrowLeft, ArrowRight, Clock, ExternalLink, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShareButton } from "@/components/ShareButton";
import { useMemo, useState, useEffect } from "react";
import { decodeHtmlEntities } from "../../shared/htmlEntities";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Mapare bias text pentru filtre
const BIAS_LABELS = {
  all: 'Toate',
  left: 'Stânga',
  center: 'Centru',
  right: 'Dreapta',
} as const;

// Funcie pentru a obține culoarea bias-ului
const getBiasColor = (bias: string) => {
  if (bias === 'left' || bias === 'center-left') return 'bg-blue-500';
  if (bias === 'right' || bias === 'center-right') return 'bg-red-500';
  return 'bg-purple-500';
};

const getBiasBadgeStyle = (bias: string) => {
  if (bias === 'left' || bias === 'center-left') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (bias === 'right' || bias === 'center-right') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-purple-100 text-purple-700 border-purple-200';
};

const getBiasLabel = (bias: string) => {
  const labels: Record<string, string> = {
    'left': 'Stânga',
    'center-left': 'Centru-Stânga',
    'center': 'Centru',
    'center-right': 'Centru-Dreapta',
    'right': 'Dreapta',
  };
  return labels[bias] || 'Centru';
};

const getDominantBiasMeta = (bias: { left: number; center: number; right: number }) => {
  if (bias.center >= bias.left && bias.center >= bias.right) {
    return {
      label: 'Centru',
      value: bias.center,
      className: 'bg-slate-100 text-slate-700 border-slate-200',
      accentClass: 'text-slate-700',
    };
  }

  if (bias.left > bias.right) {
    return {
      label: 'Stânga',
      value: bias.left,
      className: 'bg-blue-100 text-blue-700 border-blue-200',
      accentClass: 'text-blue-700',
    };
  }

  return {
    label: 'Dreapta',
    value: bias.right,
    className: 'bg-red-100 text-red-700 border-red-200',
    accentClass: 'text-red-700',
  };
};

const getBlindspotMeta = (blindspot?: AggregatedStory["blindspot"]) => {
  if (blindspot === 'left') {
    return {
      label: 'Punct orb de stânga',
      description: 'Subiectul pare acoperit mai mult de surse din afara zonei de stânga.',
      className: 'bg-blue-100 text-blue-700 border-blue-200',
    };
  }

  if (blindspot === 'right') {
    return {
      label: 'Punct orb de dreapta',
      description: 'Subiectul pare acoperit mai mult de surse din afara zonei de dreapta.',
      className: 'bg-red-100 text-red-700 border-red-200',
    };
  }

  return null;
};

const formatStoryTimestamp = (date: Date) =>
  new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

const formatArticleTimestamp = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};

const toValidDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const normalizeCachedStoryDate = (story: AggregatedStory): AggregatedStory => {
  const publishedAt = toValidDate(story.publishedAt) ?? new Date();
  return {
    ...story,
    title: decodeHtmlEntities(story.title),
    description: decodeHtmlEntities(story.description || ""),
    mainCategory: decodeHtmlEntities(story.mainCategory || ""),
    publishedAt,
    sources: story.sources.map((source) => ({
      ...source,
      title: decodeHtmlEntities(source.title),
      description: decodeHtmlEntities(source.description || ""),
      category: decodeHtmlEntities(source.category || "") || undefined,
    })),
    image: story.image || story.sources.find((source) => source.imageUrl)?.imageUrl,
  };
};

const getCachedStories = (): AggregatedStory[] => {
  const cacheKeys = [
    "last_news_v2_100",
    "last_news_v2_60",
    "last_news_v2_120",
    "clarstiri_aggregated_cache_v4_ultra",
  ];

  const allStories: AggregatedStory[] = [];

  for (const key of cacheKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const candidates = Array.isArray(parsed?.data)
        ? parsed.data
        : Array.isArray(parsed?.stories)
          ? parsed.stories
          : [];

      for (const story of candidates) {
        if (story?.id) {
          allStories.push(normalizeCachedStoryDate(story as AggregatedStory));
        }
      }
    } catch {
      // Ignore malformed cache entries and continue with others
    }
  }

  const dedup = new Map<string, AggregatedStory>();
  allStories.forEach((story) => {
    if (!dedup.has(story.id)) {
      dedup.set(story.id, story);
    }
  });

  return Array.from(dedup.values());
};

// Componenta logo sursă cu fallback la inițiale
function SourceLogo({ source }: { source: { id: string; name: string; bias: string; url?: string; logo?: string } }) {
  const [failed, setFailed] = useState(false);
  // Use Google favicon service as primary, clearbit logo as fallback
  let domain = '';
  if (source.url) {
    try {
      domain = new URL(source.url).hostname;
    } catch {
      domain = '';
    }
  }
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '';

  if (!faviconUrl || failed) {
    return (
      <Link
        to={`/surse/${source.id}`}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${getBiasColor(source.bias)} hover:scale-105 transition-transform`}
        title={`Vezi profilul sursei ${source.name}`}
        aria-label={`Vezi profilul sursei ${source.name}`}
      >
        {source.name.substring(0, 2).toUpperCase()}
      </Link>
    );
  }

  return (
    <Link
      to={`/surse/${source.id}`}
      className="w-10 h-10 rounded-full shrink-0 bg-white hover:scale-105 transition-transform"
      title={`Vezi profilul sursei ${source.name}`}
      aria-label={`Vezi profilul sursei ${source.name}`}
    >
      <img
        src={faviconUrl}
        alt={source.name}
        className="w-10 h-10 rounded-full object-cover border border-border shrink-0 bg-white"
        onError={() => setFailed(true)}
      />
    </Link>
  );
}

const StoryDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { data: stories, isLoading } = useAggregatedNews(100);
  const [activeFilter, setActiveFilter] = useState<'all' | 'left' | 'center' | 'right'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [archivedStory, setArchivedStory] = useState<AggregatedStory | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const cachedStories = useMemo(() => getCachedStories(), []);
  const slugFromUrl = normalizeStorySlug(searchParams.get("s") || "");
  const storiesPool = useMemo(() => {
    const map = new Map<string, AggregatedStory>();
    [...(stories || []), ...cachedStories].forEach((story) => {
      if (!map.has(story.id)) {
        map.set(story.id, story);
      }
    });
    return Array.from(map.values());
  }, [stories, cachedStories]);

  // Găsește povestea după ID; fallback după slug stabil din titlu
  const currentStory = useMemo(() => {
    if (id) {
      const byId = storiesPool.find((story) => story.id === id);
      if (byId) return byId;
    }

    if (slugFromUrl) {
      const bySlug = storiesPool.find((story) => toStorySlug(story.title) === slugFromUrl);
      if (bySlug) return bySlug;

      const slugPrefix = slugFromUrl.split("-").slice(0, 6).join("-");
      if (slugPrefix) {
        const bySlugPrefix = storiesPool.find((story) => toStorySlug(story.title).startsWith(slugPrefix));
        if (bySlugPrefix) return bySlugPrefix;
      }
    }

    return undefined;
  }, [id, slugFromUrl, storiesPool]);

  const resolvedStory = currentStory ?? archivedStory ?? undefined;

  // Fallback: dacă povestea nu e în pool-ul principal, caută în arhiva Redis
  useEffect(() => {
    if (isLoading || currentStory || !id || archivedStory || archiveLoading) return;
    setArchiveLoading(true);
    fetch(`/api/news?id=${encodeURIComponent(id)}`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.success && json?.data) {
          setArchivedStory(normalizeCachedStoryDate(json.data as AggregatedStory));
        }
      })
      .catch(() => {/* silently fail */})
      .finally(() => setArchiveLoading(false));
  }, [isLoading, currentStory, id, archivedStory, archiveLoading]);

  // Grupează sursele după bias
  const groupedSources = resolvedStory?.sources.reduce((acc, source) => {
    const bias = source.source.bias;
    if (bias === 'left' || bias === 'center-left') {
      acc.left.push(source);
    } else if (bias === 'right' || bias === 'center-right') {
      acc.right.push(source);
    } else {
      acc.center.push(source);
    }
    return acc;
  }, { left: [] as NonNullable<typeof resolvedStory>['sources'], center: [] as NonNullable<typeof resolvedStory>['sources'], right: [] as NonNullable<typeof resolvedStory>['sources'] });

  // Filtrează articolele
  const filteredArticles = resolvedStory?.sources.filter(source => {
    const bias = source.source.bias;
    const matchesFilter = activeFilter === 'all' ||
      (activeFilter === 'left' && (bias === 'left' || bias === 'center-left')) ||
      (activeFilter === 'center' && bias === 'center') ||
      (activeFilter === 'right' && (bias === 'right' || bias === 'center-right'));

    const matchesSearch = searchQuery === '' ||
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.source.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  }) || [];

  if (isLoading || archiveLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Se încarcă știrea...</p>
        </div>
      </div>
    );
  }

  if (!resolvedStory) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Știrea nu a fost găsită</h1>
          <Link to="/" className="text-primary hover:underline">Înapoi la prima pagină</Link>
        </div>
      </div>
    );
  }

  // Calculează statistici
  const totalSources = resolvedStory.sourcesCount;
  const leftCount = groupedSources?.left.length || 0;
  const centerCount = groupedSources?.center.length || 0;
  const rightCount = groupedSources?.right.length || 0;

  const storyPublishedAt = toValidDate(resolvedStory.publishedAt) ?? new Date();
  const dominantBias = getDominantBiasMeta(resolvedStory.bias);
  const blindspotMeta = getBlindspotMeta(resolvedStory.blindspot);
  const storySummary = resolvedStory.description?.trim() || "Compară mai jos cum este tratat același subiect de publicații din zone editoriale diferite.";
  const articleFilterCounts = {
    all: totalSources,
    left: leftCount,
    center: centerCount,
    right: rightCount,
  } as const;
  const sourceClusters = [
    {
      key: 'left',
      label: 'Stânga',
      count: leftCount,
      textClass: 'text-blue-700',
      ringClass: 'border-blue-200 bg-blue-50',
      sources: groupedSources?.left || [],
    },
    {
      key: 'center',
      label: 'Centru',
      count: centerCount,
      textClass: 'text-slate-700',
      ringClass: 'border-slate-200 bg-slate-50',
      sources: groupedSources?.center || [],
    },
    {
      key: 'right',
      label: 'Dreapta',
      count: rightCount,
      textClass: 'text-red-700',
      ringClass: 'border-red-200 bg-red-50',
      sources: groupedSources?.right || [],
    },
  ];
  const summaryPoints = [
    `Subiectul este acoperit de ${totalSources} ${totalSources === 1 ? 'sursă' : 'surse'} distincte.`,
    `Ponderea dominantă este ${dominantBias.label.toLowerCase()} (${dominantBias.value}%).`,
    blindspotMeta?.description,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* SEO Schema */}
      <NewsSchema story={{
        title: resolvedStory.title,
        description: resolvedStory.description || '',
        image: resolvedStory.image || PLACEHOLDER_IMAGE,
        datePublished: storyPublishedAt.toISOString(),
        dateModified: storyPublishedAt.toISOString(),
        authorName: 'thesite.ro',
        publisherName: 'thesite.ro',
        publisherLogo: 'https://thesite.ro/ethics-logo.png',
        url: `https://thesite.ro${buildStoryHref(resolvedStory.id, resolvedStory.title)}`
      }} />

      <main className="mx-auto w-full max-w-[1240px] overflow-x-hidden px-4 py-6 md:px-6 md:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Înapoi la știri
        </Link>

        <div className="space-y-8">
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-border/60 bg-background px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {resolvedStory.mainCategory || "Actualitate"}
                </Badge>
                <Badge variant="outline" className={cn("border px-3 py-1 text-[10px] uppercase tracking-[0.18em]", dominantBias.className)}>
                  Dominant: {dominantBias.label}
                </Badge>
                {blindspotMeta && (
                  <Badge variant="outline" className={cn("border px-3 py-1 text-[10px] uppercase tracking-[0.18em]", blindspotMeta.className)}>
                    {blindspotMeta.label}
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Publicat {resolvedStory.timeAgo}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span>{formatStoryTimestamp(storyPublishedAt)}</span>
                </div>

                <h1 className="max-w-4xl font-serif text-3xl font-bold leading-tight text-foreground md:text-5xl">
                  {resolvedStory.title}
                </h1>

                <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  {storySummary}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-border/60 bg-card/90 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Surse</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{totalSources}</p>
                  <p className="mt-1 text-sm text-muted-foreground">publicații distincte în comparație</p>
                </div>
                <div className="rounded-[24px] border border-border/60 bg-card/90 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Bias dominant</p>
                  <p className={cn("mt-2 text-3xl font-semibold", dominantBias.accentClass)}>{dominantBias.value}%</p>
                  <p className="mt-1 text-sm text-muted-foreground">{dominantBias.label} în distribuția totală</p>
                </div>
                <div className="rounded-[24px] border border-border/60 bg-card/90 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Filtru curent</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{articleFilterCounts[activeFilter]}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{BIAS_LABELS[activeFilter]} afișate mai jos</p>
                </div>
              </div>

              <Card className="rounded-[28px] border-border/60 shadow-sm">
                <CardContent className="p-5 md:p-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Distribuție editorială</p>
                      <h2 className="text-lg font-semibold text-foreground">Cum se împart perspectivele pe această știre</h2>
                    </div>

                    <BiasBar
                      left={resolvedStory.bias.left}
                      center={resolvedStory.bias.center}
                      right={resolvedStory.bias.right}
                      variant="labeled"
                      size="xl"
                    />

                    <div className="grid gap-3 md:grid-cols-3">
                      {summaryPoints.map((point) => (
                        <div key={point} className="rounded-2xl border border-border/50 bg-background/70 p-4 text-sm leading-relaxed text-muted-foreground">
                          {point}
                        </div>
                      ))}
                    </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

            <Card className="overflow-hidden rounded-[28px] border-border/60 shadow-sm">
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={resolvedStory.image || PLACEHOLDER_IMAGE}
                  alt={resolvedStory.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Cum citești comparația</p>
                    <h2 className="text-lg font-semibold text-foreground">Deschide aceeași poveste din mai multe unghiuri</h2>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Filtrează după orientare ca să vezi cine insistă pe subiect și cine îl tratează mai puțin.</p>
                    <p>Folosește căutarea din listă dacă vrei să găsești rapid o publicație sau un anumit titlu.</p>
                  </div>

                  <ShareButton
                    title={resolvedStory.title}
                    description={`${resolvedStory.title} - Analiză din ${totalSources} surse pe thesite.ro`}
                    variant="outline"
                    className="w-full justify-center rounded-full"
                    showLabel={true}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-5">
              <Card className="rounded-[28px] border-border/60 shadow-sm">
                <CardContent className="p-5 md:p-6">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Compară articolele</p>
                        <h2 className="text-2xl font-semibold text-foreground">{filteredArticles.length} rezultate în listă</h2>
                        <p className="text-sm text-muted-foreground">
                          {activeFilter === 'all'
                            ? 'Vezi toate sursele care au acoperit subiectul.'
                            : `Vezi doar publicațiile din zona ${BIAS_LABELS[activeFilter].toLowerCase()}.`}
                        </p>
                      </div>

                      <div className="relative w-full lg:max-w-sm">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="search"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          aria-label="Caută după titlu sau publicație"
                          placeholder="Caută după titlu sau publicație"
                          className="h-11 rounded-full border-border/50 bg-background pl-11 pr-4"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Filtre pentru articole">
                      {Object.entries(BIAS_LABELS).map(([key, label]) => {
                        const filterKey = key as keyof typeof BIAS_LABELS;
                        const count = articleFilterCounts[filterKey];

                        return (
                          <button
                            key={key}
                            type="button"
                            aria-pressed={activeFilter === key}
                            onClick={() => setActiveFilter(key as typeof activeFilter)}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors",
                              activeFilter === key
                                ? key === 'left'
                                  ? 'border-blue-200 bg-blue-100 text-blue-700'
                                  : key === 'center'
                                    ? 'border-slate-200 bg-slate-100 text-slate-700'
                                    : key === 'right'
                                      ? 'border-red-200 bg-red-100 text-red-700'
                                      : 'border-primary bg-primary text-primary-foreground'
                                : 'border-border/60 bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground',
                            )}
                          >
                            <span>{label}</span>
                            <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] leading-none text-inherit">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="rounded-[28px] border-border/60 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <SourceLogo source={article.source} />

                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/surse/${article.source.id}`}
                              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              {article.source.name}
                            </Link>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${getBiasBadgeStyle(article.source.bias)}`}>
                              {getBiasLabel(article.source.bias)}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatArticleTimestamp(article.pubDate)}</span>
                          </div>

                          <div className="space-y-2">
                            <a
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/link inline-flex items-start gap-2 text-lg font-semibold leading-snug text-foreground transition-colors hover:text-primary"
                            >
                              <span>{article.title}</span>
                              <ExternalLink className="mt-1 h-4 w-4 shrink-0 opacity-60 transition-transform group-hover/link:translate-x-0.5" />
                            </a>

                            {article.description && (
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {article.description}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {article.category && (
                                <Badge variant="outline" className="border-border/60 bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                  {article.category}
                                </Badge>
                              )}
                              <Badge variant="outline" className="border-border/60 bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                {article.source.name}
                              </Badge>
                            </div>

                            <a
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                            >
                              Citește articolul
                              <ArrowRight className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredArticles.length === 0 && (
                  <Card className="rounded-[28px] border-dashed border-border/80 shadow-none">
                    <CardContent className="p-10 text-center">
                      <p className="text-lg font-medium text-foreground">Nu există articole care să corespundă filtrelor selectate.</p>
                      <p className="mt-2 text-sm text-muted-foreground">Schimbă filtrul sau golește căutarea pentru a vedea toate sursele.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            <aside className="space-y-5 xl:sticky xl:top-24 self-start">
              <Card className="rounded-[28px] border-border/60 shadow-sm">
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Panou lateral</p>
                      <h3 className="text-lg font-semibold text-foreground">Surse pe spectru</h3>
                    </div>

                    <div className="space-y-4">
                      {sourceClusters.map((cluster) => (
                        <div key={cluster.key} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xs font-bold uppercase tracking-[0.16em]", cluster.textClass)}>
                              {cluster.label}
                            </span>
                            <span className="text-xs text-muted-foreground">{cluster.count} surse</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {cluster.sources.slice(0, 8).map((source) => (
                              <SourceLogo key={source.id} source={source.source} />
                            ))}
                            {cluster.sources.length > 8 && (
                              <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold text-muted-foreground", cluster.ringClass)}>
                                +{cluster.sources.length - 8}
                              </div>
                            )}
                          </div>
                      </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-border/60 shadow-sm">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Despre analiza bias</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      thesite.ro compară orientarea editorială a surselor care au acoperit aceeași poveste. Scorurile spun ceva despre contextul sursei, nu reprezintă un verdict absolut despre articol.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StoryDetail;
