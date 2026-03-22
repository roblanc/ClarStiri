import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { ExternalLink, Rss, Users, BarChart3, GitMerge, Eye, ShieldAlert, Instagram, Radio } from "lucide-react";
import { StyledLink } from "@/components/ui/styled-link";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    handle: "@thesite.ro",
    url: "https://www.instagram.com/thesite.ro/",
    icon: Instagram,
    description: "Updates & behind the scenes",
  },
  {
    label: "TikTok",
    handle: "@thesite.ro",
    url: "https://www.tiktok.com/@thesite.ro",
    icon: Radio,
    description: "Clipuri scurte despre știrile zilei",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Rss,
    title: "Colectare RSS",
    body: "Platforma monitorizează continuu fluxurile RSS ale celor mai importante publicații românești — de la presa centrală la cea independentă. Articolele sunt colectate automat la fiecare câteva ore.",
  },
  {
    step: "02",
    icon: GitMerge,
    title: "Agregare & Clustering",
    body: "Algoritmul de similitudine detectează articolele care acoperă același eveniment și le grupează într-o singură „poveste”. O știre majoră adună în timp articole de la mai multe redacții, acumulând surse pe măsură ce presa o preia.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Analiză de Bias",
    body: "Fiecare sursă e clasificată pe axa stânga–centru–dreapta pe baza profilului editorial al publicației. Distribuția de culori de pe un card reflectă ponderea perspectivelor care acoperă acea știre.",
  },
  {
    step: "04",
    icon: Eye,
    title: "Puncte Oarbe",
    body: "Când o știre e acoperită aproape exclusiv de o singură parte a spectrului, platforma semnalează un potențial „punct orb” — un unghi pe care tabăra opusă îl ignoră sau îl minimizează.",
  },
];

const PRINCIPLES = [
  {
    icon: ShieldAlert,
    title: "Nu suntem presă",
    body: "thesite.ro nu produce conținut editorial propriu. Suntem un instrument de orientare în peisajul mediatic, nu o publicație.",
  },
  {
    icon: Users,
    title: "Barometrul de opinie",
    body: "Secțiunea „Influenceri” analizează figurile publice care modelează discursul mediatic — jurnaliști, comentatori, politicieni. Bias-ul lor e calculat pe baza declarațiilor documentate și a orientării editoriale, nu a opiniei noastre.",
  },
  {
    icon: Eye,
    title: "Transparență metodologică",
    body: "Clasificările conțin inevitabil aproximări. Metodologia completă — cum calculăm bias-ul, ce surse includem, cum funcționează aggregarea — e publică.",
  },
];

export default function Despre() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Despre thesite.ro | Cum funcționează</title>
        <meta name="description" content="Cum funcționează thesite.ro — agregator de știri românești cu analiză de bias și barometru de opinie." />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">

        {/* Hero */}
        <div className="mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Despre platformă
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight mb-6">
            Știri din toate<br />perspectivele.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            thesite.ro e un agregator de știri românești care grupează aceeași poveste din mai multe publicații,
            pe axa stânga–centru–dreapta, ca să poți vedea rapid ce acoperă fiecare tabără și ce ignoră.
          </p>
        </div>

        {/* How It Works */}
        <section className="mb-16">
          <div className="flex items-center gap-4 border-b border-border pb-4 mb-10">
            <h2 className="text-2xl font-serif font-bold text-foreground">Cum funcționează</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, body }) => (
              <div
                key={step}
                className="relative p-6 rounded-2xl border border-border/60 bg-card hover:border-border transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground/40 tracking-widest">{step}</span>
                    <div className="p-2 bg-muted rounded-xl">
                      <Icon className="w-4 h-4 text-foreground/70" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2 text-base">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section className="mb-16">
          <div className="flex items-center gap-4 border-b border-border pb-4 mb-10">
            <h2 className="text-2xl font-serif font-bold text-foreground">Principii</h2>
          </div>

          <div className="space-y-4">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-5 p-6 rounded-2xl bg-muted/20 border border-border/40">
                <div className="shrink-0 p-2.5 bg-background rounded-xl border border-border/60 h-fit mt-0.5">
                  <Icon className="w-4 h-4 text-foreground/70" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pl-6 border-l-2 border-primary/30">
            <p className="text-sm text-muted-foreground">
              Vezi metodologia completă pentru detalii despre surse, calcul de bias și limitări.
            </p>
            <Link
              to="/metodologie"
              className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:opacity-60 transition-opacity"
            >
              Metodologie <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </section>

        {/* Social Media */}
        <section className="mb-16">
          <div className="flex items-center gap-4 border-b border-border pb-4 mb-10">
            <h2 className="text-2xl font-serif font-bold text-foreground">Urmărește-ne</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SOCIAL_LINKS.map(({ label, handle, url, icon: Icon, description }) => (
              <StyledLink
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 p-6 rounded-2xl border border-border/60 bg-card hover:border-foreground hover:shadow-md transition-all duration-200 no-underline"
              >
                <div className="shrink-0 p-3.5 bg-muted rounded-xl group-hover:bg-foreground group-hover:text-background transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
                  </div>
                  <p className="font-bold text-foreground text-base truncate">{handle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 group-hover:text-foreground transition-colors" />
              </StyledLink>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-10 border-t border-border/40">
          <p className="text-sm text-muted-foreground mb-4">Explorează platforma</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 bg-foreground text-background rounded-full hover:opacity-80 transition-opacity"
            >
              Feed Știri
            </Link>
            <Link
              to="/influenceri"
              className="text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 border border-border rounded-full hover:bg-muted transition-colors"
            >
              Barometru Opinie
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
