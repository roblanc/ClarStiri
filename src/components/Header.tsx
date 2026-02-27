import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Single unified bar */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          {/* Logo */}
          <Link to="/" className="shrink-0 mr-4">
            <span className="font-serif italic text-2xl font-semibold text-foreground">
              thesite.ro
            </span>
          </Link>

          {/* Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-foreground ml-auto"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-1 items-center gap-x-5 lg:gap-x-7 justify-center">
            <Link to="/surse" className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground hover:opacity-50 transition-opacity whitespace-nowrap">
              Surse
            </Link>
            <Link to="/barometru" className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground hover:opacity-50 transition-opacity whitespace-nowrap">
              Barometru
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3 border-l border-border pl-4 ml-auto shrink-0">
            <ThemeToggle />
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
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in absolute w-full shadow-lg">
          <nav className="container mx-auto px-4 py-6 space-y-4 flex flex-col items-center text-center">
            <Link to="/surse" className="text-xs font-bold uppercase tracking-[0.2em] text-foreground w-full py-2 hover:bg-secondary" onClick={() => setMobileMenuOpen(false)}>Surse</Link>
            <Link to="/barometru" className="text-xs font-bold uppercase tracking-[0.2em] text-foreground w-full py-2 hover:bg-secondary" onClick={() => setMobileMenuOpen(false)}>Barometru</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
