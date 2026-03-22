import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronLeft, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Înapoi la Știri
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-3">Contact</h1>
        <p className="text-muted-foreground mb-8">
          Pagina de contact este în lucru. Pentru moment, feedback-ul și susținerea proiectului se pot face prin
          link-ul de mai jos.
        </p>

        <div className="bg-editorial text-white rounded-2xl border-2 border-border p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden relative shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          {/* Subtle decoration inside the green card */}
         <div className="absolute -right-4 -top-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl pointer-events-none" />
         
          <div className="relative z-10">
            <h2 className="text-2xl font-serif font-bold text-white mb-1">Susține proiectul independent</h2>
            <p className="text-sm font-minimalist text-white/90">
              Dacă îți este util, ajută-ne să păstrăm thesite.ro independent.
            </p>
          </div>
          <Button
            className="gap-2 bg-white text-editorial hover:bg-white/90 font-bold uppercase tracking-widest text-xs px-6 py-5 rounded-full relative z-10 shadow-sm"
            onClick={() => window.open("https://ko-fi.com/clarstiri", "_blank")}
          >
            <Coffee className="w-4 h-4 shrink-0" />
            Un Ko-fi
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

