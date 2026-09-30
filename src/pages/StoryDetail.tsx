import { NewsSchema } from "@/components/NewsSchema";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BiasBar } from "@/components/BiasBar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  newsListQueryKey,
  normalizeFullStory,
  readCachedCards,
  useAggregatedNews,
  type NewsCardStory,
} from "@/hooks/useNews";
import { fetchStoryById } from "@/services/newsApiService";
import type { AggregatedStory } from "@/types/news";
import { isStoryCard } from "../../shared/storyCard";
import { coverageView, scoreOfSource } from "../../shared/coverage";
import { scoreToBiasCategory } from "../../shared/newsSources";
import { findStoryBySlug, normalizeStorySlug } from "@/utils/storyRoute";
import { ArrowLeft, ArrowRight, Clock, ExternalLink, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShareButton } from "@/components/ShareButton";
import { useMemo, useState } from "react";
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

/** Current category of an outlet (cached payloads may carry an older `bias`). */
const currentBias = (source: { id: string }) => scoreToBiasCategory(scoreOfSource(source));

const getBlindspotMeta = (blindspot: AggregatedStory["blindspot"], otherSideOutlets: number) => {
  if (blindspot === 'left') {
    return {
      label: 'Punct orb de stânga',
      description: `Nicio publicație de stânga sau centru-stânga nu a preluat subiectul, deși ${otherSideOutlets} publicații din zona de dreapta l-au acoperit.`,
      className: 'bg-blue-100 text-blue-700 border-blue-200',
    };
  }

  if (blindspot === 'right') {
    return {
      label: 'Punct orb de dreapta',
      description: `Nicio publicație de dreapta sau centru-dreapta nu a preluat subiectul, deși ${otherSideOutlets} publicații din zona de stânga l-au acoperit.`,
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

type StoryLike = AggregatedStory | NewsCardStory;
type OutletEntry = StoryLike["sources"][number];

const fetchFullStory = async (storyId: string, signal?: AbortSignal): Promise<AggregatedStory | null> => {
  const story = await fetchStoryById(storyId, signal);
  return story ? normalizeFullStory(story) : null;
};

const STORY_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 1,
} as const;

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
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${getBiasColor(currentBias(source))} hover:scale-105 transition-transform`}
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'left' | 'center' | 'right'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const slugFromUrl = normalizeStorySlug(searchParams.get("s") || "");
  const queryClient = useQueryClient();

  // 1. Seed from lists this tab already has (homepage/search/category) or this browser saved,
  //    so a click from the feed renders instantly without refetching the whole list.
  const seedPool = useMemo<StoryLike[]>(() => {
    const full = queryClient.getQueryData<AggregatedStory[]>(newsListQueryKey("full")) ?? [];
    const cards = queryClient.getQueryData<NewsCardStory[]>(newsListQueryKey("card")) ?? readCachedCards() ?? [];
    return [...full, ...cards];
  }, [queryClient, id]); // eslint-disable-line react-hooks/exhaustive-deps
  const seed = useMemo(() => (id ? seedPool.find((story) => story.id === id) : undefined), [seedPool, id]);
  const seedIsFull = !!seed && !isStoryCard(seed);

  // 2. The article list comes from /api/news?id= (small, CDN-cached). On a direct visit this is
  //    the first and only request; after a click from the feed it fills in the articles.
  const detailQuery = useQuery({
    queryKey: ["story", id],
    queryFn: () => fetchFullStory(id!),
    enabled: !!id && !seedIsFull,
    ...STORY_QUERY_OPTIONS,
  });

  // 3. Unknown id (e.g. an old link): fall back to matching the title slug against the feed.
  const needSlugLookup = !!slugFromUrl && !seed && (detailQuery.data === null || detailQuery.isError);
  const feed = useAggregatedNews("card", { enabled: needSlugLookup });
  const slugMatch = useMemo(
    () => (needSlugLookup ? findStoryBySlug([...seedPool, ...(feed.data ?? [])], slugFromUrl) : undefined),
    [needSlugLookup, seedPool, feed.data, slugFromUrl]
  );
  const slugMatchIsCard = !!slugMatch && isStoryCard(slugMatch);
  const slugDetailQuery = useQuery({
    queryKey: ["story", slugMatch?.id],
    queryFn: () => fetchFullStory(slugMatch!.id),
    enabled: slugMatchIsCard,
    ...STORY_QUERY_OPTIONS,
  });

  const fullStory: AggregatedStory | undefined =
    (seedIsFull ? (seed as AggregatedStory) : undefined) ??
    detailQuery.data ??
    (slugMatch && !slugMatchIsCard ? (slugMatch as AggregatedStory) : undefined) ??
    slugDetailQuery.data ??
    undefined;
  const resolvedStory: StoryLike | undefined = fullStory ?? seed ?? slugMatch;
  const articlesLoading = !fullStory && (detailQuery.isFetching || slugDetailQuery.isFetching);
  const articlesFailed = !fullStory && !articlesLoading && !!resolvedStory;
  const isLoading = !resolvedStory && (detailQuery.isFetching || (needSlugLookup && feed.isFetching) || slugDetailQuery.isFetching);
  const retryArticles = () => {
    if (slugMatchIsCard) slugDetailQuery.refetch();
    else detailQuery.refetch();
  };

  // Bara, preluările și gruparea pe zone vin din aceeași analiză (shared/coverage.ts),
  // deci cifrele de pe pagină au aceleași definiții ca bara.
  const coverage = useMemo(() => (resolvedStory ? coverageView(resolvedStory) : null), [resolvedStory]);

  // Grupează publicațiile după zonă (stânga = stânga + centru-stânga etc.), fiecare o singură dată
  const groupedSources = ((resolvedStory?.sources ?? []) as OutletEntry[]).reduce((acc, source, index) => {
    if (!acc.seen.has(source.source.id)) {
      acc.seen.add(source.source.id);
      acc[coverage?.sides[index] ?? 'center'].push(source);
    }
    return acc;
  }, { seen: new Set<string>(), left: [] as OutletEntry[], center: [] as OutletEntry[], right: [] as OutletEntry[] });

  // Filtrează articolele
  // Articles (title, link, text) exist only on the full story; cards carry just the outlets.
  // When there is a full story it is also resolvedStory, so coverage indexes line up.
  const articles = (fullStory?.sources ?? []).map((source, index) => ({
    ...source,
    side: coverage?.sides[index] ?? 'center',
    syndicated: coverage?.syndicated[index] ?? false,
  }));
  const filteredArticles = articles.filter(source => {
    const matchesFilter = activeFilter === 'all' || source.side === activeFilter;

    const matchesSearch = searchQuery === '' ||
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.source.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
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

  // Calculează statistici (publicații distincte; bara = relatări independente)
  const storyBias = coverage?.bias ?? resolvedStory.bias;
  const totalSources = coverage?.outlets ?? resolvedStory.sourcesCount;
  const independentReports = coverage?.independent ?? totalSources;
  const copiedOutlets = Math.max(0, totalSources - independentReports);
  const leftCount = groupedSources.left.length;
  const centerCount = groupedSources.center.length;
  const rightCount = groupedSources.right.length;

  const storyPublishedAt = toValidDate(resolvedStory.publishedAt) ?? new Date();
  const dominantBias = getDominantBiasMeta(storyBias);
  const blindspotMeta = getBlindspotMeta(resolvedStory.blindspot, resolvedStory.blindspot === 'left' ? rightCount : leftCount);
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
      sources: groupedSources.left,
    },
    {
      key: 'center',
      label: 'Centru',
      count: centerCount,
      textClass: 'text-slate-700',
      ringClass: 'border-slate-200 bg-slate-50',
      sources: groupedSources.center,
    },
    {
      key: 'right',
      label: 'Dreapta',
      count: rightCount,
      textClass: 'text-red-700',
      ringClass: 'border-red-200 bg-red-50',
      sources: groupedSources.right,
    },
  ];
  const summaryPoints = [
    copiedOutlets > 0
      ? `${totalSources} publicații, ${independentReports} relatări independente: ${copiedOutlets === 1 ? 'o preluare de agenție contează' : `${copiedOutlets} preluări de agenție contează`} o singură dată în bară.`
      : `Subiectul este acoperit de ${totalSources} ${totalSources === 1 ? 'publicație' : 'publicații'} distincte.`,
    `Ponderea dominantă este ${dominantBias.label.toLowerCase()} (${dominantBias.value}%), calculată din scorul editorial al fiecărei publicații.`,
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
        url: `https://thesite.ro/stire/${encodeURIComponent(resolvedStory.id)}`
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
                <div className="surface-subtle rounded-[24px] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Surse</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{totalSources}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {copiedOutlets > 0 ? `publicații, ${independentReports} relatări independente` : 'publicații distincte în comparație'}
                  </p>
                </div>
                <div className="surface-subtle rounded-[24px] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Bias dominant</p>
                  <p className={cn("mt-2 text-3xl font-semibold", dominantBias.accentClass)}>{dominantBias.value}%</p>
                  <p className="mt-1 text-sm text-muted-foreground">{dominantBias.label} în distribuția totală</p>
                </div>
                <div className="surface-subtle rounded-[24px] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Filtru curent</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{articleFilterCounts[activeFilter]}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{BIAS_LABELS[activeFilter]} afișate mai jos</p>
                </div>
              </div>

              <Card className="rounded-[28px]">
                <CardContent className="p-5 md:p-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Distribuție editorială</p>
                      <h2 className="text-lg font-semibold text-foreground">Cum se împart perspectivele pe această știre</h2>
                    </div>

                    <BiasBar
                      left={storyBias.left}
                      center={storyBias.center}
                      right={storyBias.right}
                      variant="labeled"
                      size="xl"
                    />

                    <div className="grid gap-3 md:grid-cols-3">
                      {summaryPoints.map((point) => (
                        <div key={point} className="surface-subtle rounded-2xl p-4 text-sm leading-relaxed text-muted-foreground">
                          {point}
                        </div>
                      ))}
                    </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

            <Card className="overflow-hidden rounded-[28px]">
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
              <Card className="rounded-[28px]">
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
                          className="surface-subtle h-11 rounded-full border-0 pl-11 pr-4"
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
                                : 'border-transparent bg-background/65 text-muted-foreground hover:bg-background/90 hover:text-foreground',
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
                  <Card key={article.id} className="rounded-[28px] transition-all hover:-translate-y-0.5 hover:bg-background/95">
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
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${getBiasBadgeStyle(currentBias(article.source))}`}>
                              {getBiasLabel(currentBias(article.source))}
                            </span>
                            {article.syndicated && (
                              <span
                                className="rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                                title="Text preluat de la o agenție de presă sau din altă publicație. Contează o singură dată în bara de distribuție."
                              >
                                preluare
                              </span>
                            )}
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

                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/35 pt-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {article.category && (
                                <Badge variant="outline" className="border-transparent bg-background/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground shadow-none">
                                  {article.category}
                                </Badge>
                              )}
                              <Badge variant="outline" className="border-transparent bg-background/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground shadow-none">
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

                {articlesLoading && (
                  <Card className="surface-ghost rounded-[28px] shadow-none">
                    <CardContent className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Se încarcă articolele...</span>
                    </CardContent>
                  </Card>
                )}

                {articlesFailed && (
                  <Card className="surface-ghost rounded-[28px] shadow-none">
                    <CardContent className="p-10 text-center">
                      <p className="text-lg font-medium text-foreground">Nu am putut încărca articolele.</p>
                      <p className="mt-2 text-sm text-muted-foreground">Verifică conexiunea și încearcă din nou.</p>
                      <Button onClick={retryArticles} variant="outline" className="mt-4 rounded-full">
                        Reîncearcă
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {fullStory && filteredArticles.length === 0 && (
                  <Card className="surface-ghost rounded-[28px] shadow-none">
                    <CardContent className="p-10 text-center">
                      <p className="text-lg font-medium text-foreground">Nu există articole care să corespundă filtrelor selectate.</p>
                      <p className="mt-2 text-sm text-muted-foreground">Schimbă filtrul sau golește căutarea pentru a vedea toate sursele.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            <aside className="space-y-5 xl:sticky xl:top-24 self-start">
              <Card className="rounded-[28px]">
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
                            <span className="text-xs text-muted-foreground">{cluster.count} {cluster.count === 1 ? 'publicație' : 'publicații'}</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {cluster.sources.slice(0, 8).map((source, index) => (
                              <SourceLogo key={`${source.source.id}-${index}`} source={source.source} />
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

              <Card className="rounded-[28px]">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Despre analiza bias</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      thesite.ro compară orientarea editorială a surselor care au acoperit aceeași poveste. Scorurile spun ceva despre contextul sursei, nu reprezintă un verdict absolut despre articol.
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Zonele de mai sus grupează publicațiile după categorie (stânga include centru-stânga). Bara împarte fiecare relatare independentă după scorul publicației, așa că o sursă de centru-stânga contează parțial la centru.{' '}
                      <Link to="/metodologie#bara-bias" className="font-medium text-foreground underline-offset-4 hover:underline">Metodologia</Link>
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
