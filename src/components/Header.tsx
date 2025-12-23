import { Link } from "react-router-dom";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-14 px-4">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-primary-foreground hover:bg-primary-foreground/10">
                <Menu className="w-5 h-5" />
              </Button>
              <Link to="/" className="flex items-center">
                <span className="font-bold text-xl tracking-tight">
                  CLARSTIRI
                </span>
              </Link>
            </div>

            {/* Center: Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-primary-foreground hover:text-primary-foreground/80 transition-colors">
                Acasă
              </Link>
              <Link to="/pentru-tine" className="text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Pentru Tine
              </Link>
              <Link to="/local" className="text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Local
              </Link>
              <Link to="/punct-orbit" className="text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Punct Orbit
              </Link>
            </nav>

            {/* Right: Search + Auth */}
            <div className="flex items-center gap-3">
              {searchOpen ? (
                <div className="relative">
                  <Input 
                    type="search" 
                    placeholder="Caută..." 
                    className="w-48 md:w-56 h-9 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                    autoFocus
                    onBlur={() => setSearchOpen(false)}
                  />
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}
              
              <Button variant="secondary" size="sm" className="hidden md:inline-flex">
                Abonează-te
              </Button>

              <Button variant="outline" size="sm" className="hidden md:inline-flex border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Conectare
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="bg-card border-b border-border overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/categorie/${category.toLowerCase()}`}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors whitespace-nowrap"
              >
                {category}
                <span className="text-xs opacity-60">+</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
