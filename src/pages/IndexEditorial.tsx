import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { NewsImage } from "@/components/NewsImage";
import { useAggregatedNews } from "@/hooks/useNews";
import { getThumbnailUrl } from "@/utils/imageOptimizer";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainFeedSkeleton } from "@/components/Skeleton";

const PLACEHOLDER_IMAGE = "/default-news.png";
const ARCHIVE_BATCH = 6;

// ─── Card mare featured (stânga sus) ─────────────────────────────────────────
function FeaturedCard({ story }: { story: any }) {
  return (
    <Link to={`/stire/${story.id}`} className="block h-full group">
      <article className="border border-border h-full flex flex-col bg-card">
        <div className="px-3 py-1.5 bg-primary border-b border-border">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
            {story.category || "Actualitate"} · {story.sourcesCount} surse
          </span>
        </div>
        <div className="h-48 md:h-64 border-b border-border overflow-hidden">
          <NewsImage
            src={getThumbnailUrl(story.image)}
            seed={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h2 className="font-serif text-xl md:text-2xl font-bold leading-tight text-foreground group-hover:underline mb-3">
            {story.title}
          </h2>
          {story.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
              {story.description}
            </p>
          )}
          <div className="mt-auto">
            <BiasLine bias={story.bias} />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {story.timeAgo}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Card capsulă (dreapta sus) ───────────────────────────────────────────────
function CapsuleCard({ story, index }: { story: any; index: number }) {
  return (
    <Link to={`/stire/${story.id}`} className="block group">
      <article className="border border-border bg-card flex flex-col h-full">
        <div className="px-3 py-1.5 border-b border-border flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Capsul{index + 1}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            {story.sourcesCount} surse
          </span>
        </div>
        <div className="p-4 flex gap-3 flex-1">
          <div className="w-20 h-20 flex-shrink-0 border border-border overflow-hidden">
            <NewsImage
              src={getThumbnailUrl(story.image)}
              seed={story.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h3 className="font-serif text-base font-bold leading-snug text-foreground group-hover:underline mb-2">
              {story.title}
            </h3>
            <div className="mt-auto">
              <BiasLine bias={story.bias} />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                {story.timeAgo}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Card arhivă (rândul de jos) ──────────────────────────────────────────────
function ArchiveCard({ story }: { story: any }) {
  return (
    <Link to={`/stire/${story.id}`} className="block group">
      <article className="border border-border bg-card h-full flex flex-col">
        <div className="px-3 py-1.5 border-b border-border">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Arhivă · {story.category || "Actualitate"}
          </span>
        </div>
        <div className="p-3 flex gap-3 flex-1">
          <div className="w-16 h-16 flex-shrink-0 border border-border overflow-hidden">
            <NewsImage
              src={getThumbnailUrl(story.image)}
              seed={story.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h4 className="font-serif text-sm font-bold leading-snug text-foreground group-hover:underline mb-1 line-clamp-3">
              {story.title}
            </h4>
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground mt-auto">
              {story.sourcesCount} surse · {story.timeAgo}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Bara de bias minimalistă ─────────────────────────────────────────────────
function BiasLine({ bias }: { bias: { left: number; center: number; right: number } }) {
  return (
    <div className="flex h-0.5 w-full mb-2 overflow-hidden">
      <div className="bg-blue-400" style={{ width: `${bias.left}%` }} />
      <div className="bg-gray-300" style={{ width: `${bias.center}%` }} />
      <div className="bg-red-400" style={{ width: `${bias.right}%` }} />
    </div>
  );
}

// ─── Pagina principală ────────────────────────────────────────────────────────
const IndexEditorial = () => {
  const { data: stories, isLoading, error, refetch, isFetching } = useAggregatedNews(60);
  const [archiveVisible, setArchiveVisible] = useState(ARCHIVE_BATCH);

  const converted = useMemo(() => {
    return stories?.map(s => ({
      id: s.id,
      title: s.title,
      image: s.image || PLACEHOLDER_IMAGE,
      bias: s.bias,
      category: s.mainCategory || "Actualitate",
      sourcesCount: s.sourcesCount,
      timeAgo: s.timeAgo,
      description: s.description,
    })) || [];
  }, [stories]);

  const featured = converted[0];
  const capsules = converted.slice(1, 3);
  const archive = converted.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Banner test */}
      <div className="bg-foreground text-background text-center py-1.5">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em]">
          ⚗ Layout alternativ — test editorial
        </span>
        <Link to="/" className="text-[9px] font-bold uppercase tracking-[0.2em] ml-6 underline opacity-60 hover:opacity-100">
          ← înapoi la layout normal
        </Link>
      </div>

      <main className="container mx-auto px-4 py-8 lg:max-w-[75%] xl:max-w-[65%]">

        {/* Loading */}
        {isLoading && (
          <div className="space-y-8">
            <MainFeedSkeleton />
          </div>
        )}

        {/* Error */}
        {!isLoading && !isFetching && !stories?.length && (
          <div className="flex flex-col items-center justify-center py-20 border border-border bg-card">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <p className="font-serif text-xl mb-6 text-foreground">
              {error?.message ?? "Flux gol. Reveniti."}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="rounded-none text-xs uppercase tracking-widest px-8">
              Reîncearcă
            </Button>
          </div>
        )}

        {converted.length > 0 && (
          <>
            {/* ── Rândul 1: Featured + Capsule ── */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:border border-border mb-6 md:mb-0">
              {/* Featured: 2/3 */}
              <div className="md:col-span-2 md:border-r border-border">
                {featured && <FeaturedCard story={featured} />}
              </div>

              {/* Capsule: 1/3, împărțit vertical */}
              <div className="flex flex-col gap-6 md:gap-0">
                {capsules.map((s, i) => (
                  <div key={s.id} className={i === 0 ? "md:border-b border-border flex-1" : "flex-1"}>
                    <CapsuleCard story={s} index={i} />
                  </div>
                ))}
              </div>
            </section>

            {/* Separator cu label */}
            <div className="md:border-x md:border-b border-border px-3 py-1.5 flex items-center gap-3 mb-6 md:mb-0">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Arhivă
              </span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {archive.length} știri
              </span>
            </div>

            {/* ── Rândul 2+: Arhivă ── */}
            <section className="md:border-x md:border-b border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-0">
                {archive.slice(0, archiveVisible).map((s, i) => {
                  return (
                    <div
                      key={s.id}
                      className={[
                        "h-full",
                        i % 3 !== 2 ? "md:border-r border-border" : "",
                        i < archive.slice(0, archiveVisible).length - (archive.slice(0, archiveVisible).length % 3 || 3) ? "md:border-b border-border" : "",
                      ].join(" ")}
                    >
                      <ArchiveCard story={s} />
                    </div>
                  );
                })}
              </div>

              {archiveVisible < archive.length && (
                <div className="border-t border-border flex justify-center py-4">
                  <Button
                    onClick={() => setArchiveVisible(v => v + ARCHIVE_BATCH)}
                    variant="ghost"
                    className="rounded-none text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
                  >
                    Mai multe
                  </Button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-border mt-16 pt-8 pb-16">
        <div className="container mx-auto px-4 text-center">
          <span className="font-serif italic text-2xl font-semibold text-foreground block mb-4">
            thesite.ro
          </span>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            © 2026 · Layout editorial test
          </p>
        </div>
      </footer>
    </div>
  );
};

export default IndexEditorial;
