import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { BiasBar } from "@/components/BiasBar";
import { SourceCard } from "@/components/SourceCard";
import { storyDetails } from "@/data/mockNews";
import { ArrowLeft, Share2, Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const StoryDetail = () => {
  const { id } = useParams();
  const story = storyDetails[id as keyof typeof storyDetails] || storyDetails["1"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Story Header */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi la știri
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                {story.title}
              </h1>
              <p className="text-muted-foreground mb-6">
                {story.summary}
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-muted-foreground">
                  {story.sourcesCount} surse
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Distribuie
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Salvează
                  </Button>
                </div>
              </div>

              <div className="max-w-md">
                <BiasBar 
                  left={story.bias.left} 
                  center={story.bias.center} 
                  right={story.bias.right}
                  showLabels
                  size="lg"
                />
              </div>
            </div>

            <div className="relative">
              <img 
                src={story.image} 
                alt="" 
                className="w-full h-64 md:h-80 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bias Legend Banner */}
      <section className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-bias-left"></div>
              <span className="font-medium text-foreground">Stânga</span>
              <span className="text-muted-foreground">({story.bias.left}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-bias-center"></div>
              <span className="font-medium text-foreground">Centru</span>
              <span className="text-muted-foreground">({story.bias.center}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-bias-right"></div>
              <span className="font-medium text-foreground">Dreapta</span>
              <span className="text-muted-foreground">({story.bias.right}%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Three Column View */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-bias-left">
              <div className="w-4 h-4 rounded-full bg-bias-left"></div>
              <h2 className="font-semibold text-lg text-foreground">Stânga</h2>
              <span className="text-sm text-muted-foreground">
                {story.sources.left.length} surse
              </span>
            </div>
            <div className="space-y-4">
              {story.sources.left.map((source, index) => (
                <div 
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <SourceCard source={source} bias="left" />
                </div>
              ))}
            </div>
          </div>

          {/* Center Column */}
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-bias-center">
              <div className="w-4 h-4 rounded-full bg-bias-center"></div>
              <h2 className="font-semibold text-lg text-foreground">Centru</h2>
              <span className="text-sm text-muted-foreground">
                {story.sources.center.length} surse
              </span>
            </div>
            <div className="space-y-4">
              {story.sources.center.map((source, index) => (
                <div 
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <SourceCard source={source} bias="center" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-bias-right">
              <div className="w-4 h-4 rounded-full bg-bias-right"></div>
              <h2 className="font-semibold text-lg text-foreground">Dreapta</h2>
              <span className="text-sm text-muted-foreground">
                {story.sources.right.length} surse
              </span>
            </div>
            <div className="space-y-4">
              {story.sources.right.map((source, index) => (
                <div 
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <SourceCard source={source} bias="right" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View Original Sources CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Vrei să citești articolele originale din toate sursele?
          </p>
          <Button size="lg">
            <ExternalLink className="w-4 h-4 mr-2" />
            Accesează toate sursele
          </Button>
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

export default StoryDetail;
