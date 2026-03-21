import { ExternalLink } from 'lucide-react';
import { SourceFavicon } from '@/components/SourceFavicon';
import { getConfidenceLabel, scoreToBiasCategory, type SourceProfile } from '@/data/sourceProfiles';
import type { NewsSource } from '@/types/news';

interface SourceProfileCardProps {
  source: NewsSource;
  profile: SourceProfile;
}

const biasLabelMap: Record<ReturnType<typeof scoreToBiasCategory>, string> = {
  left: 'Stânga',
  'center-left': 'Centru-Stânga',
  center: 'Centru',
  'center-right': 'Centru-Dreapta',
  right: 'Dreapta',
};

const biasClassMap: Record<ReturnType<typeof scoreToBiasCategory>, string> = {
  left: 'bg-blue-100 text-blue-700 border-blue-200',
  'center-left': 'bg-sky-100 text-sky-700 border-sky-200',
  center: 'bg-slate-100 text-slate-700 border-slate-200',
  'center-right': 'bg-orange-100 text-orange-700 border-orange-200',
  right: 'bg-red-100 text-red-700 border-red-200',
};

const factualityClassMap: Record<NewsSource['factuality'], string> = {
  high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  mixed: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-rose-100 text-rose-700 border-rose-200',
};

const factualityLabelMap: Record<NewsSource['factuality'], string> = {
  high: 'Factualitate ridicată',
  mixed: 'Factualitate mixtă',
  low: 'Factualitate scăzută',
};

function SectionList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm text-muted-foreground leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SourceProfileCard({ source, profile }: SourceProfileCardProps) {
  const biasCategory = scoreToBiasCategory(profile.biasScore);

  return (
    <article className="bg-card border border-border rounded-xl p-5 space-y-5">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <SourceFavicon source={{ name: source.name, url: source.url, bias: source.bias }} size="lg" />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-foreground truncate">{source.name}</h3>
              <p className="text-xs text-muted-foreground">
                {source.category} • {profile.lastAnalysed}
              </p>
            </div>
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
          >
            Site
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-1 text-xs rounded-full border ${biasClassMap[biasCategory]}`}>
            {biasLabelMap[biasCategory]} ({profile.biasScore})
          </span>
          <span className={`px-2.5 py-1 text-xs rounded-full border ${factualityClassMap[source.factuality]}`}>
            {factualityLabelMap[source.factuality]}
          </span>
          <span className="px-2.5 py-1 text-xs rounded-full border border-border bg-muted text-muted-foreground">
            Încredere {getConfidenceLabel(profile.confidence).toLowerCase()}
          </span>
        </div>
      </header>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Linie editorială</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{profile.editorialLine}</p>
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Raționament bias</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{profile.biasRationale}</p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1 text-sm">
          {profile.foundedYear && (
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Înființare:</span> {profile.foundedYear}
            </p>
          )}
          {profile.currentOwner && (
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Proprietar:</span> {profile.currentOwner}
            </p>
          )}
          {profile.parentCompany && (
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Companie-mamă:</span> {profile.parentCompany}
            </p>
          )}
        </div>
        <div className="space-y-1 text-sm">
          {profile.founders && profile.founders.length > 0 && (
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Fondatori:</span> {profile.founders.join(', ')}
            </p>
          )}
          {profile.factualityRationale && (
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Factualitate:</span> {profile.factualityRationale}
            </p>
          )}
        </div>
      </section>

      {profile.ownershipHistory && (
        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Istoric proprietate</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.ownershipHistory}</p>
        </section>
      )}

      <section className="grid sm:grid-cols-2 gap-4">
        <SectionList title="Conexiuni politice" items={profile.politicalConnections} />
        <SectionList title="Surse de finanțare" items={profile.fundingSources} />
        <SectionList title="Interese financiare" items={profile.knownFinancialInterests} />
        <SectionList title="Tipare observate" items={profile.notablePatterns} />
      </section>

      <SectionList title="Controverse documentate" items={profile.controversies} />
      <SectionList title="Puncte forte" items={profile.strengths} />

      {profile.references && profile.references.length > 0 && (
        <section className="space-y-2 border-t border-border pt-4">
          <h4 className="text-sm font-semibold text-foreground">Surse și referințe</h4>
          <ol className="space-y-1.5">
            {profile.references.map((ref, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-muted-foreground/50 shrink-0 tabular-nums w-4 text-right">{i + 1}.</span>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {ref.label}
                  <ExternalLink className="w-3 h-3 inline ml-1 -mt-0.5" />
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

