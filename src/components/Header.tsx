import { Link } from "react-router-dom";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              ClarStiri
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors">
              Acasă
            </Link>
            <Link to="/surse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Surse
            </Link>
            <Link to="/categorii" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Categorii
            </Link>
            <Link to="/despre" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Despre
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="relative">
                <Input 
                  type="search" 
                  placeholder="Caută știri..." 
                  className="w-48 md:w-64 h-9 pr-8"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-4 h-4" />
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex">
              <User className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
              <Menu className="w-5 h-5" />
            </Button>

            <Button size="sm" className="hidden md:inline-flex">
              Începe
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
