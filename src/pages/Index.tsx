import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { BiasBar } from "@/components/BiasBar";
import { mockNews, topStories } from "@/data/mockNews";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Newspaper, ChevronRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Vezi fiecare parte a fiecărei știri.
            </h1>
            <p className="text-muted-foreground text-lg mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Citește știrile din perspective multiple. Treci dincolo de părtinirea media cu surse locale și internaționale de încredere.
            </p>
            <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link 
                to="/incepe" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Începe acum
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bias Legend */}
      <section className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-bias-left"></div>
              <span className="text-muted-foreground">Stânga</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-bias-center"></div>
              <span className="text-muted-foreground">Centru</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-bias-right"></div>
              <span className="text-muted-foreground">Dreapta</span>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                Știri Principale
              </h2>
              <span className="text-sm text-muted-foreground">23 decembrie 2025</span>
            </div>

            {/* Featured Story */}
            <div className="mb-6">
              <NewsCard news={mockNews[0]} variant="featured" />
            </div>

            {/* News Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {mockNews.slice(1, 7).map((news, index) => (
                <div 
                  key={news.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <NewsCard news={news} />
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Încarcă mai multe știri
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Top Stories */}
            <div className="bg-card rounded-lg border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Cele Mai Citite
              </h3>
              <div className="space-y-4">
                {topStories.map((story, index) => (
                  <Link 
                    key={index} 
                    to={`/stire/${index + 1}`}
                    className="block group"
                  >
                    <div className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                      <h4 className="text-sm font-medium text-card-foreground group-hover:text-muted-foreground transition-colors line-clamp-2 mb-2">
                        {story.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-bias-center">{story.centerCoverage}% Centru</span>
                        <span>·</span>
                        <span>{story.sourcesCount} surse</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-card rounded-lg border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4">Cum funcționează?</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-secondary-foreground">1</span>
                  </div>
                  <p>Agregăm știri din sute de surse din România și din lume.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-secondary-foreground">2</span>
                  </div>
                  <p>Analizăm și clasificăm fiecare sursă pe spectrul politic.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-secondary-foreground">3</span>
                  </div>
                  <p>Afișăm acoperirea din toate perspectivele într-un singur loc.</p>
                </div>
              </div>
            </div>

            {/* Sample Bias Bar */}
            <div className="bg-card rounded-lg border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4">Bara de Bias</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Fiecare poveste arată distribuția acoperirii media:
              </p>
              <BiasBar left={35} center={45} right={20} showLabels size="lg" />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <span className="font-semibold text-foreground">ClarStiri.ro</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/despre" className="hover:text-foreground transition-colors">Despre</Link>
              <Link to="/surse" className="hover:text-foreground transition-colors">Surse</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <Link to="/confidentialitate" className="hover:text-foreground transition-colors">Confidențialitate</Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2025 ClarStiri.ro
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
