import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Search, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { SourceProfileCard } from '@/components/SourceProfileCard';
import { SOURCE_CATALOG } from '@/data/sourceCatalog';
import { getMissingProfileIds, scoreToBiasCategory } from '@/data/sourceProfiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type BiasFilter = 'all' | 'left' | 'center-left' | 'center' | 'center-right' | 'right';

const BIAS_FILTERS: Array<{ value: BiasFilter; label: string }> = [
  { value: 'all', label: 'Toate' },
  { value: 'left', label: 'Stânga' },
  { value: 'center-left', label: 'Centru-Stânga' },
  { value: 'center', label: 'Centru' },
  { value: 'center-right', label: 'Centru-Dreapta' },
  { value: 'right', label: 'Dreapta' },
];

export default function Sources() {
  const [search, setSearch] = useState('');
  const [biasFilter, setBiasFilter] = useState<BiasFilter>('all');

  const sourcesWithProfiles = useMemo(
    () =>
      SOURCE_CATALOG
        .filter((source) => source.profile)
        .sort((a, b) => (a.profile!.biasScore - b.profile!.biasScore)),
    [],
  );

  const missingProfileIds = useMemo(
    () => getMissingProfileIds(SOURCE_CATALOG.map((source) => source.id)),
    [],
  );

  const filteredSources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sourcesWithProfiles.filter((source) => {
      const profile = source.profile!;
      const profileBias = scoreToBiasCategory(profile.biasScore);

      if (biasFilter !== 'all' && profileBias !== biasFilter) {
        return false;
      }

      if (!query) return true;

      return [
        source.name,
        source.id,
        source.url,
        profile.currentOwner,
        profile.parentCompany,
        profile.editorialLine,
        profile.biasRationale,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [biasFilter, search, sourcesWithProfiles]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Înapoi la știri
        </Link>

        <section className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Surse și raționamente de bias</h1>
          <p className="text-muted-foreground">
            Fiecare sursă include proprietate, finanțare, linie editorială și raționamentul explicit pentru scorul de bias.
          </p>
          <p className="text-sm text-muted-foreground">
            Profiluri documentate: {sourcesWithProfiles.length} din {SOURCE_CATALOG.length} surse.
          </p>
        </section>

        {missingProfileIds.length > 0 && (
          <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
            <p className="text-sm text-amber-800 font-medium">
              Există surse fără profil complet. Completează `NEW_SOURCE_TEMPLATE` înainte de a le activa.
            </p>
            <p className="text-xs text-amber-700">{missingProfileIds.join(', ')}</p>
          </section>
        )}

        <section className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Caută după sursă, proprietar, URL sau raționament"
              className="pl-9 pr-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {BIAS_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={biasFilter === filter.value ? 'default' : 'outline'}
                onClick={() => setBiasFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </section>

        {filteredSources.length === 0 ? (
          <section className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-foreground font-medium">Nicio sursă nu corespunde filtrelor curente.</p>
            <p className="text-sm text-muted-foreground mt-1">Resetează căutarea sau schimbă filtrul de bias.</p>
          </section>
        ) : (
          <section className="space-y-4">
            {filteredSources.map((source) => (
              <SourceProfileCard key={source.id} source={source} profile={source.profile!} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

