import { Link, useLocation } from "react-router-dom";
import { Search, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/hooks/useSearchStore";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { query, setQuery, clearQuery } = useSearchStore();

  const navLinks = [
    { to: "/surse", label: "Surse" },
    { to: "/barometru", label: "Influenceri" },
  ];

  const handleSearchClose = () => {
    setSearchOpen(false);
    clearQuery();
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all">
      {/* Main Bar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-8 h-8 overflow-hidden bg-transparent">
              <img
                src="/logo_full.png"
                alt="ClarStiri Logo"
                className="w-full h-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert pointer-events-none scale-125"
              />
            </div>
            <span className="font-serif italic text-xl md:text-2xl font-semibold text-foreground tracking-tight group-hover:opacity-80 transition-opacity">
              thesite.ro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-x-8 justify-center flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:opacity-60",
                  location.pathname === link.to ? "text-primary" : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions (Search & Theme) */}
          <div className="flex items-center gap-1 md:gap-4 ml-auto">
            <ThemeToggle />

            {searchOpen ? (
              <div className="relative flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                <Input
                  type="search"
                  placeholder="CAUTĂ..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-32 md:w-48 h-8 text-[10px] uppercase tracking-widest bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary px-3 rounded-full"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleSearchClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <button
                className="p-2 text-foreground hover:bg-muted rounded-full transition-colors"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Visible only on mobile, no hamburger */}
        <nav className="md:hidden flex items-center gap-x-6 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors py-1 px-2 rounded-md",
                location.pathname === link.to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground bg-muted/30"
              )}
            >
              {link.label}
            </Link>
          ))}
          {/* Active link indicator or extra mobile only links could go here */}
        </nav>
      </div>
    </header>
  );
}
