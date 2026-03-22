import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold font-serif text-foreground">404</h1>
          <p className="mb-8 text-xl text-muted-foreground">Oops! Pagina nu a fost găsită.</p>
          <a href="/" className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Înapoi la Știri
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
