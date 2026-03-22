import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/hooks/useSearchStore";

export function Header() {
  const isSearchPage = useLocation().pathname === "/cauta";
  const [searchOpen, setSearchOpen] = useState(isSearchPage);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { query, setQuery, clearQuery } = useSearchStore();

  // Pe /cauta: ține search bar deschis și populează din URL la prima randare
  useEffect(() => {
    if (isSearchPage) {
      setSearchOpen(true);
      const urlQ = searchParams.get("q") || "";
      if (urlQ && !query) setQuery(urlQ);
    }
  }, [isSearchPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const navLinks = [
    { to: "/surse", label: "Surse" },
    { to: "/influenceri", label: "Influenceri" },
    { to: "/despre", label: "Despre" },
  ];

  const handleSearchClose = () => {
    if (isSearchPage) {
      // Pe pagina de căutare: golește query dar lasă bara deschisă
      clearQuery();
    } else {
      setSearchOpen(false);
      clearQuery();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      const target = `/cauta?q=${encodeURIComponent(trimmed)}`;
      if (location.pathname !== "/cauta" || !window.location.search.includes(`q=${encodeURIComponent(trimmed)}`)) {
        navigate(target);
      }
    }
  };

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [searchOpen]);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || target.isContentEditable;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const inEditable = isEditableTarget(event.target);
      const isCmdCtrlK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const isSlash = event.key === "/";
      const isEscape = event.key === "Escape";

      if (isCmdCtrlK) {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (isSlash && !inEditable) {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (isEscape && searchOpen) {
        event.preventDefault();
        if (isSearchPage) {
          clearQuery();
        } else {
          setSearchOpen(false);
          clearQuery();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, clearQuery]);

  return (
    <header className="sticky top-0 z-50 bg-brand-green border-b border-black/10 transition-all text-black shadow-sm">
      {/* Main Bar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/hero-illustration-headphones.png"
              alt="ClarStiri Logo"
              className="h-10 md:h-12 w-auto object-contain pointer-events-none"
            />
            <span className="font-berthold text-2xl md:text-3xl font-normal text-black tracking-tight group-hover:opacity-80 transition-opacity">
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
                  location.pathname === link.to ? "text-black border-b-2 border-black" : "text-black/60"
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
              <form 
                onSubmit={handleSearchSubmit}
                className="relative flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200"
              >
                <div className="relative flex items-center">
                  <Input
                    ref={searchInputRef}
                    type="search"
                    placeholder="CAUTĂ..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-32 md:w-64 h-8 text-[10px] uppercase tracking-widest bg-black/5 border-black/10 text-black placeholder:text-black/40 focus-visible:ring-1 focus-visible:ring-black/20 pl-8 pr-3 rounded-full"
                    autoFocus
                  />
                  <Search className="absolute left-2.5 w-3.5 h-3.5 text-black/40" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/10 text-black" onClick={handleSearchClose} type="button">
                  <X className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <button
                className="p-2 text-black hover:bg-black/5 rounded-full transition-colors"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-5 h-5 md:w-4 md:h-4 text-black" />
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
                  ? "bg-black text-brand-green"
                  : "text-black/60 hover:text-black bg-black/5"
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
