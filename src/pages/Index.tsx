import { Header } from "@/components/Header";
import { FeaturedStory } from "@/components/FeaturedStory";
import { NewsListItem } from "@/components/NewsListItem";
import { TopStoriesList } from "@/components/TopStoriesList";
import { DailyBriefing } from "@/components/DailyBriefing";
import { BlindspotCard } from "@/components/BlindspotCard";
import { mockNews, topStories, blindspotStories, dailyBriefingData } from "@/data/mockNews";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, HelpCircle, User } from "lucide-react";

const Index = () => {
  const featuredStory = {
    id: mockNews[0].id,
    title: mockNews[0].title,
    image: mockNews[0].image,
    bias: mockNews[0].bias,
    category: mockNews[0].category,
    location: mockNews[0].location,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Daily Briefing & Top Stories */}
          <aside className="lg:col-span-3 space-y-6">
            <DailyBriefing briefing={dailyBriefingData} />
            
            <div className="bg-card rounded-lg border border-border p-4">
              <h2 className="font-bold text-lg text-foreground mb-3">Știri Principale</h2>
              <TopStoriesList stories={topStories} />
            </div>
          </aside>

          {/* Center - Main Feed */}
          <div className="lg:col-span-5">
            {/* Featured Story */}
            <div className="mb-6">
              <FeaturedStory story={featuredStory} />
            </div>

            {/* News List */}
            <div className="bg-card rounded-lg border border-border">
              {mockNews.slice(1).map((news) => (
                <NewsListItem 
                  key={news.id} 
                  story={{
                    id: news.id,
                    title: news.title,
                    image: news.image,
                    bias: news.bias,
                    category: news.category,
                    location: news.location,
                    sourcesCount: news.sourcesCount,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar - Blindspot */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Blindspot Section */}
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5" />
                <h2 className="font-bold text-lg text-foreground">PUNCT ORBIT</h2>
                <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">TM</span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Știri acoperite disproporționat de o parte a spectrului politic.{" "}
                <Link to="/despre-punct-orbit" className="underline hover:text-foreground">
                  Află mai multe despre bias-ul politic în știri.
                </Link>
              </p>

              <div className="space-y-4">
                {blindspotStories.map((story) => (
                  <BlindspotCard key={story.id} story={story} />
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                Vezi Feed Punct Orbit
              </Button>
            </div>

            {/* My News Bias Section */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-bold text-foreground mb-4">Bias-ul Meu</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">Utilizator Demo</p>
                  <p className="text-xs text-muted-foreground">0 Știri · 0 Articole</p>
                </div>
              </div>

              <div className="flex h-6 rounded overflow-hidden text-xs font-medium mb-4">
                <div className="bg-bias-left flex-1 flex items-center justify-center text-white">?</div>
                <div className="bg-bias-center flex-1 flex items-center justify-center text-white">?</div>
                <div className="bg-bias-right flex-1 flex items-center justify-center text-white">?</div>
              </div>

              <Button variant="outline" className="w-full">
                Vezi Demo
              </Button>
            </div>

            {/* Promo Banner */}
            <div className="bg-primary rounded-lg p-4 text-primary-foreground">
              <p className="text-sm font-medium mb-2">Oferă darul perspectivei</p>
              <p className="text-xs opacity-80 mb-3">Reducere de sărbători: 40% reducere la abonamentul Premium</p>
              <Button variant="secondary" size="sm">
                Abonează-te acum
              </Button>
            </div>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">CLARSTIRI</span>
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
