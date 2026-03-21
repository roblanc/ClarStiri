import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
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

        <div className="bg-card rounded-lg border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Susține proiectul</h2>
            <p className="text-sm text-muted-foreground">
              Dacă ți se pare util, poți contribui cu o cafea.
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => window.open("https://ko-fi.com/clarstiri", "_blank")}
          >
            <Coffee className="w-4 h-4" />
            Ko-fi
          </Button>
        </div>
      </main>
    </div>
  );
}

