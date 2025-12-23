import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { BiasBar } from "@/components/BiasBar";
import { useAggregatedNews } from "@/hooks/useNews";
import { ArrowLeft, Share2, Bookmark, ExternalLink, Clock, MapPin, Loader2, Search, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NEWS_SOURCES } from "@/types/news";

// Placeholder image
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80";

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

const StoryDetail = () => {
  const { id } = useParams();
  const { data: stories, isLoading } = useAggregatedNews(50);
  const [activeFilter, setActiveFilter] = useState<'all' | 'left' | 'center' | 'right'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Găsește povestea cu ID-ul din URL
  const story = stories?.find(s => s.id === id);

  // Dacă nu găsim story-ul exact, încercăm să căutăm după o parte din ID
  const alternativeStory = !story && stories ? stories.find(s => s.id.includes(id?.split('-').slice(0, 2).join('-') || '')) : null;
  const currentStory = story || alternativeStory;

  // Grupează sursele după bias
  const groupedSources = currentStory?.sources.reduce((acc, source) => {
    const bias = source.source.bias;
    if (bias === 'left' || bias === 'center-left') {
      acc.left.push(source);
    } else if (bias === 'right' || bias === 'center-right') {
      acc.right.push(source);
    } else {
      acc.center.push(source);
    }
    return acc;
  }, { left: [] as typeof currentStory.sources, center: [] as typeof currentStory.sources, right: [] as typeof currentStory.sources });

  // Filtrează articolele
  const filteredArticles = currentStory?.sources.filter(source => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Se încarcă detaliile știrii...</p>
        </div>
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Știrea nu a fost găsită</h1>
          <p className="text-muted-foreground mb-6">Este posibil ca această știre să nu mai fie disponibilă.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la pagina principală
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculează statistici
  const totalSources = currentStory.sourcesCount;
  const leftCount = groupedSources?.left.length || 0;
  const centerCount = groupedSources?.center.length || 0;
  const rightCount = groupedSources?.right.length || 0;

  // Determină bias-ul dominant
  const dominantBias = currentStory.bias.center >= currentStory.bias.left && currentStory.bias.center >= currentStory.bias.right
    ? 'Centru'
    : currentStory.bias.left > currentStory.bias.right
      ? 'Stânga'
      : 'Dreapta';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Înapoi la știri
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2 columns */}
          <div className="lg:col-span-2">
            {/* Story Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Clock className="w-4 h-4" />
                <span>Publicat {currentStory.timeAgo}</span>
                <span>•</span>
                <span>Actualizat recent</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                {currentStory.title}
              </h1>

              {/* Bias Tabs */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setActiveFilter('left')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${activeFilter === 'left'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                    }`}
                >
                  Stânga
                </button>
                <button
                  onClick={() => setActiveFilter('center')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${activeFilter === 'center'
                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                    }`}
                >
                  Centru
                </button>
                <button
                  onClick={() => setActiveFilter('right')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${activeFilter === 'right'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                    }`}
                >
                  Dreapta
                </button>
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${activeFilter === 'all'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                    }`}
                >
                  Comparație Bias
                </button>
              </div>

              {/* Summary Points */}
              <div className="bg-card rounded-lg border border-border p-4 mb-6">
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-foreground">{currentStory.description}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-foreground">
                      Această știre este acoperită de {totalSources} {totalSources === 1 ? 'sursă' : 'surse'} din presa românească.
                    </span>
                  </li>
                  {currentStory.bias.center > 50 && (
                    <li className="flex gap-3">
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-foreground">
                        Majoritatea surselor ({currentStory.bias.center}%) sunt de centru, indicând o acoperire echilibrată.
                      </span>
                    </li>
                  )}
                </ul>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">📊 Analiză thesite.ro</span>
                  <button className="text-xs text-primary hover:underline">
                    Pare această analiză incorectă?
                  </button>
                </div>
              </div>
            </div>

            {/* Articles Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-foreground">
                    {filteredArticles.length} Articole
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`px-3 py-1 rounded-full transition-colors ${activeFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                        }`}
                    >
                      Toate
                    </button>
                    <button
                      onClick={() => setActiveFilter('left')}
                      className={`px-3 py-1 rounded-full transition-colors ${activeFilter === 'left' ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:bg-secondary'
                        }`}
                    >
                      Stânga {leftCount}
                    </button>
                    <button
                      onClick={() => setActiveFilter('center')}
                      className={`px-3 py-1 rounded-full transition-colors ${activeFilter === 'center' ? 'bg-purple-500 text-white' : 'text-muted-foreground hover:bg-secondary'
                        }`}
                    >
                      Centru {centerCount}
                    </button>
                    <button
                      onClick={() => setActiveFilter('right')}
                      className={`px-3 py-1 rounded-full transition-colors ${activeFilter === 'right' ? 'bg-red-500 text-white' : 'text-muted-foreground hover:bg-secondary'
                        }`}
                    >
                      Dreapta {rightCount}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Caută..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Articles List */}
              <div className="space-y-4">
                {filteredArticles.map((article, index) => (
                  <article
                    key={article.id}
                    className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Source Logo */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getBiasColor(article.source.bias)}`}>
                        {article.source.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Source Name and Badges */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-medium text-foreground">{article.source.name}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${getBiasBadgeStyle(article.source.bias)}`}>
                            {getBiasLabel(article.source.bias)}
                          </span>
                        </div>

                        {/* Article Title */}
                        <h3 className="font-semibold text-foreground mb-2 leading-tight">
                          {article.title}
                        </h3>

                        {/* Article Description */}
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {article.description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(article.pubDate).toLocaleDateString('ro-RO', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {article.category && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {article.category}
                              </span>
                            )}
                          </div>

                          <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            Citește articolul
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {filteredArticles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nu există articole care să corespundă filtrelor selectate.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Right column */}
          <aside className="space-y-6">
            {/* Coverage Details Card */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold text-foreground mb-4">Detalii Acoperire</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Surse</span>
                  <span className="font-semibold text-foreground">{totalSources}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stânga</span>
                  <span className="font-semibold text-foreground">{leftCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dreapta</span>
                  <span className="font-semibold text-foreground">{rightCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Centru</span>
                  <span className="font-semibold text-foreground">{centerCount}</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actualizat</span>
                    <span className="text-foreground">{currentStory.timeAgo}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Distribuție Bias</span>
                    <span className="font-semibold text-foreground">{currentStory.bias.center}% Centru</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bias Distribution Chart */}
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Distribuție Bias</h3>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {currentStory.bias.center}% din surse sunt de Centru
              </p>

              {/* Bias Bar */}
              <BiasBar
                left={currentStory.bias.left}
                center={currentStory.bias.center}
                right={currentStory.bias.right}
                showLabels
                size="lg"
              />

              {/* Source Icons Grid */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {currentStory.sources.map((source, index) => (
                    <div
                      key={source.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${getBiasColor(source.source.bias)} ring-2 ring-offset-2 ring-offset-background ${source.source.bias.includes('left') ? 'ring-blue-500/30' :
                        source.source.bias.includes('right') ? 'ring-red-500/30' : 'ring-purple-500/30'
                        }`}
                      title={source.source.name}
                    >
                      {source.source.name.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Share Actions */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold text-foreground mb-4">Acțiuni</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Distribuie această analiză
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Salvează pentru mai târziu
                </Button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <h4 className="font-semibold text-foreground mb-2">ℹ️ Despre Analiza Bias</h4>
              <p className="text-muted-foreground text-xs">
                thesite.ro analizează automat știrile din multiple surse românești și calculează
                distribuția bias-ului politic bazat pe categoria editorială a fiecărei publicații.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">thesite<span className="text-primary">.ro</span></span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/despre" className="hover:text-foreground transition-colors">Despre</Link>
              <Link to="/surse" className="hover:text-foreground transition-colors">Surse</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2025 thesite.ro
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoryDetail;
