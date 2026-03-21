import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ChevronLeft } from "lucide-react";

export default function Despre() {
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

        <h1 className="text-3xl font-bold text-foreground mb-3">Despre thesite.ro</h1>
        <p className="text-muted-foreground mb-8">
          Un agregator de știri care grupează aceeași poveste din mai multe publicații, ca să vezi rapid
          perspective diferite.
        </p>

        <div className="space-y-6">
          <section className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Ce face platforma</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Colectează RSS-uri de la publicații românești.</li>
              <li>Grupează articole similare într-o singură „poveste”.</li>
              <li>Afișează distribuția de acoperire pe axa stânga–centru–dreapta.</li>
            </ul>
          </section>

          <section className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Limitări</h2>
            <p className="text-sm text-muted-foreground">
              Clasificările sunt aproximări și pot conține erori. RSS-urile diferă ca structură și pot lipsi
              imagini/categorii, iar gruparea se bazează pe similaritatea titlurilor.
            </p>
          </section>

          <section className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Metodologie</h2>
            <p className="text-sm text-muted-foreground">
              Detaliile despre bias, factualitate, „puncte orbite” și lista completă a surselor sunt pe pagina
              de Metodologie.
            </p>
            <Link to="/metodologie" className="inline-block mt-3 text-sm text-primary hover:underline">
              Vezi metodologia →
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

