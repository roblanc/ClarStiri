import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { SourceFavicon } from '@/components/SourceFavicon';
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

const biasLabelMap: Record<string, string> = {
  left: 'Stânga',
  'center-left': 'Centru-Stânga',
  center: 'Centru',
  'center-right': 'Centru-Dreapta',
  right: 'Dreapta',
};

const biasClassMap: Record<string, string> = {
  left: 'bg-blue-100 text-blue-700 border-blue-200',
  'center-left': 'bg-sky-100 text-sky-700 border-sky-200',
  center: 'bg-slate-100 text-slate-700 border-slate-200',
  'center-right': 'bg-orange-100 text-orange-700 border-orange-200',
  right: 'bg-red-100 text-red-700 border-red-200',
};

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

        {/* Methodology Section */}
        <section className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-[#0a0a0a] px-6 py-4">
            <h2 className="text-lg font-bold text-white">Cum clasificăm bias-ul editorial?</h2>
            <p className="text-neutral-400 text-sm mt-1">Metodologia thesite.ro pentru evaluarea spectrului politic al surselor</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Scale explanation */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Scala de clasificare</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Fiecare publicație monitorizată este evaluată pe o scală de 5 categorii, bazată pe linia editorială predominantă, nu pe articole individuale:
              </p>
              <div className="grid grid-cols-5 gap-1 text-center text-xs font-bold">
                <div className="bg-blue-600 text-white py-2 px-1 rounded-l-md">Stânga</div>
                <div className="bg-blue-400 text-white py-2 px-1">Centru-Stânga</div>
                <div className="bg-neutral-500 text-white py-2 px-1">Centru</div>
                <div className="bg-red-400 text-white py-2 px-1">Centru-Dreapta</div>
                <div className="bg-red-600 text-white py-2 px-1 rounded-r-md">Dreapta</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-600">Stânga</p>
                  <p className="text-xs text-muted-foreground">Promovează politici progresiste, justiție socială, redistribuire economică, intervenția statului. Critice față de conservatorism și naționalism.</p>
                  <p className="text-[10px] text-muted-foreground/70 italic mt-1">Figuri asociate: Bernie Sanders, Noam Chomsky, Olof Palme</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-400">Centru-Stânga</p>
                  <p className="text-xs text-muted-foreground">Înclinație pro-europeană și reformistă. Favorizează statul de drept, societatea civilă și modernizarea instituțională, cu ton moderat critic.</p>
                  <p className="text-[10px] text-muted-foreground/70 italic mt-1">Figuri asociate: Emmanuel Macron, Tony Blair, Barack Obama</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-500">Centru</p>
                  <p className="text-xs text-muted-foreground">Reportaj echilibrat, fără o agendă politică evidentă. Acoperire factuală cu spațiu editorial minim. Agenții de presă și surse business.</p>
                  <p className="text-[10px] text-muted-foreground/70 italic mt-1">Figuri asociate: Angela Merkel, Vaclav Havel, Ursula von der Leyen</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-400">Centru-Dreapta</p>
                  <p className="text-xs text-muted-foreground">Perspectivă conservatoare moderată, pro-business, accent pe responsabilitate fiscală. Favorable valorilor tradiționale fără radicalism.</p>
                  <p className="text-[10px] text-muted-foreground/70 italic mt-1">Figuri asociate: Margaret Thatcher, Konrad Adenauer, Nicolas Sarkozy</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-600">Dreapta</p>
                  <p className="text-xs text-muted-foreground">Linie editorială naționalistă sau suveranistă, critică față de UE/NATO, favorabilă politicilor conservatoare pe teme sociale și identitare.</p>
                  <p className="text-[10px] text-muted-foreground/70 italic mt-1">Figuri asociate: Ronald Reagan, Viktor Orbán, Charles de Gaulle</p>
                </div>
              </div>
            </div>

            {/* How it's calculated */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Cum se calculează distribuția de bias?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Pentru fiecare subiect de știre, agregăm sursele care l-au acoperit și calculăm o distribuție procentuală pe trei axe (Stânga, Centru, Dreapta) folosind ponderi fixe:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2 font-mono">
                <div className="flex justify-between"><span className="text-blue-600 font-semibold">Stânga</span><span className="text-muted-foreground">→ 100% Stânga</span></div>
                <div className="flex justify-between"><span className="text-blue-400 font-semibold">Centru-Stânga</span><span className="text-muted-foreground">→ 60% Stânga, 40% Centru</span></div>
                <div className="flex justify-between"><span className="text-neutral-500 font-semibold">Centru</span><span className="text-muted-foreground">→ 100% Centru</span></div>
                <div className="flex justify-between"><span className="text-red-400 font-semibold">Centru-Dreapta</span><span className="text-muted-foreground">→ 40% Centru, 60% Dreapta</span></div>
                <div className="flex justify-between"><span className="text-red-600 font-semibold">Dreapta</span><span className="text-muted-foreground">→ 100% Dreapta</span></div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Exemplu: o știre acoperită de 2 surse de centru-stânga și 1 sursă de dreapta va avea distribuția: 40% Stânga · 27% Centru · 33% Dreapta.
              </p>
            </div>

            {/* Criteria */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Criterii de evaluare</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">📰 Linia editorială</p>
                  <p className="text-xs text-muted-foreground">Analizăm tonul editorial predominant, selecția subiectelor, și modul de încadrare a evenimentelor pe o perioadă extinsă.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">🏢 Structura de proprietate</p>
                  <p className="text-xs text-muted-foreground">Identificăm proprietarii, grupul media, conexiunile politice directe și sursele de finanțare ale fiecărei publicații.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">📊 Analize externe</p>
                  <p className="text-xs text-muted-foreground">Ne raportăm la evaluări ale organizațiilor internaționale de fact-checking și monitorizare media (ex. Media Bias/Fact Check, RSF).</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">🔄 Actualizare periodică</p>
                  <p className="text-xs text-muted-foreground">Clasificările sunt revizuite trimestrial. Publicațiile care își schimbă linia editorială sunt reclasificate.</p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground italic">
                ⚠️ Clasificarea de bias nu implică o judecată de valoare asupra calității jurnalismului. O sursă clasificată la „stânga" sau „dreapta" poate produce jurnalism de calitate. Scopul este de a oferi cititorului o perspectivă asupra spectrului editorial, nu de a descalifica publicații.
              </p>
            </div>
          </div>
        </section>

        {/* Compact Source List */}
        {filteredSources.length === 0 ? (
          <section className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-foreground font-medium">Nicio sursă nu corespunde filtrelor curente.</p>
            <p className="text-sm text-muted-foreground mt-1">Resetează căutarea sau schimbă filtrul de bias.</p>
          </section>
        ) : (
          <section className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
            {filteredSources.map((source) => {
              const profile = source.profile!;
              const biasCategory = scoreToBiasCategory(profile.biasScore);

              return (
                <Link
                  key={source.id}
                  to={`/surse/${source.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors group"
                >
                  <SourceFavicon source={{ name: source.name, url: source.url, bias: source.bias }} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm truncate">{source.name}</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded-full border shrink-0 ${biasClassMap[biasCategory]}`}>
                        {biasLabelMap[biasCategory]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {profile.currentOwner || 'Proprietar nedocumentat'}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
