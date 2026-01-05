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
      {/* Main Header - Clean minimal style inspired by Snoop.ro */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-foreground hover:bg-secondary md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <Link to="/" className="flex items-center gap-2 cursor-pointer">
                {/* Logo mark - Ethics Icon */}
                <img
                  src="/ethics-logo.png"
                  alt="thesite.ro Logo"
                  className="w-9 h-9 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="font-bold text-xl text-foreground tracking-tight">
                  thesite<span className="text-primary">.ro</span>
                </span>
              </Link>
            </div>

            {/* Center: Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-foreground border-b-2 border-primary pb-1">
                Acasă
              </Link>
              <Link to="/metodologie" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Surse
              </Link>
              <Link to="/metodologie" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Metodologie
              </Link>
            </nav>

            {/* Right: Search + Auth */}
            <div className="flex items-center gap-3">
              {searchOpen ? (
                <div className="relative flex items-center gap-2">
                  <Input
                    type="search"
                    placeholder="Caută știri..."
                    className="w-48 md:w-64 h-9 bg-secondary border-border"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setSearchOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}

              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Bar - Solid Yellow */}
      <div className="bg-primary border-b border-primary overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/categorie/${category.toLowerCase()}`}
                className="px-4 py-1.5 text-sm text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full transition-colors whitespace-nowrap font-medium"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border animate-fade-in">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link
              to="/"
              className="block px-4 py-2 text-foreground font-medium rounded-lg bg-primary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Acasă
            </Link>
            <Link
              to="/metodologie"
              className="block px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Surse
            </Link>
            <Link
              to="/metodologie"
              className="block px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Metodologie
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
