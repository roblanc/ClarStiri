import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

const categories = [
  "Politică",
  "Economie",
  "Sănătate",
  "Tehnologie",
  "Mediu",
  "Sport",
  "Cultură",
  "Internațional",
];

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar - Brand and Action */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            {/* Elegant Serif Logo */}
            <span className="font-serif italic text-3xl font-semibold text-foreground">
              thesite.ro
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/onboarding" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:opacity-70 transition-opacity hidden md:block">
              ONBOARDING
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Navigation - Categories & Pages */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Desktop Categories */}
          <div className="hidden md:flex items-center gap-8 overflow-x-auto no-scrollbar">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/categorie/${category.toLowerCase()}`}
                className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground hover:opacity-50 transition-opacity whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
            <div className="w-px h-4 bg-border mx-2"></div>
            <Link to="/surse" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">
              Surse
            </Link>
            <Link to="/barometru" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">
              Barometru
            </Link>
          </div>

          {/* User / Search Actions */}
          <div className="flex items-center gap-4 border-l border-border pl-4">
            {searchOpen ? (
              <div className="relative flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="CAUTĂ..."
                  className="w-40 h-8 text-[10px] uppercase tracking-widest bg-transparent border-none focus-visible:ring-0 px-0"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSearchOpen(false)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <button
                className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground flex items-center gap-2 hover:opacity-50 transition-opacity"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-3 h-3" />
              </button>
            )}
            <Link to="/login" className="flex items-center gap-3 group">
              <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-serif italic overflow-hidden">
                U
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground group-hover:opacity-50 transition-opacity hidden sm:block">
                CONT
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in absolute w-full shadow-lg">
          <nav className="container mx-auto px-4 py-6 space-y-4 flex flex-col items-center text-center">
            {categories.map(category => (
              <Link
                key={category}
                to={`/categorie/${category.toLowerCase()}`}
                className="text-xs font-bold uppercase tracking-[0.2em] text-foreground w-full py-2 hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category}
              </Link>
            ))}
            <div className="w-12 h-px bg-border my-2"></div>
            <Link to="/surse" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground w-full py-2" onClick={() => setMobileMenuOpen(false)}>Surse</Link>
            <Link to="/barometru" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground w-full py-2" onClick={() => setMobileMenuOpen(false)}>Barometru</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
