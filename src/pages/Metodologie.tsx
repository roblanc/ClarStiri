import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, ArrowRight, BarChart3, ChevronLeft, Eye, Info, Shield } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SourceFavicon } from "@/components/SourceFavicon";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NEWS_SOURCES } from "@/types/news";

const SECTION_LINKS = [
    { id: "ce-este", label: "Ce agregăm" },
    { id: "bias", label: "Bias editorial" },
    { id: "bara-bias", label: "Bara de bias" },
    { id: "blindspot", label: "Blindspot" },
    { id: "factualitate", label: "Factualitate" },
    { id: "surse", label: "Surse" },
] as const;

const BIAS_ORDER = ["left", "center-left", "center", "center-right", "right"] as const;

const BIAS_META = {
    left: {
        name: "Stânga",
        color: "bg-blue-600",
        pill: "border-blue-200 bg-blue-50 text-blue-700",
        description:
            "Publicații cu orientare progresistă, pro-europeană și accent pe politici sociale sau reformiste.",
    },
    "center-left": {
        name: "Centru-stânga",
        color: "bg-blue-400",
        pill: "border-sky-200 bg-sky-50 text-sky-700",
        description:
            "Publicații moderat progresiste, adesea concentrate pe investigații, corupție și teme civice.",
    },
    center: {
        name: "Centru",
        color: "bg-gray-500",
        pill: "border-gray-200 bg-gray-50 text-gray-700",
        description:
            "Publicații care urmăresc echilibrul între perspective și evită o afiliere politică explicită.",
    },
    "center-right": {
        name: "Centru-dreapta",
        color: "bg-orange-400",
        pill: "border-orange-200 bg-orange-50 text-orange-700",
        description:
            "Publicații moderat conservatoare, favorabile de regulă pieței libere și unei retorici mai ordonate.",
    },
    right: {
        name: "Dreapta",
        color: "bg-red-600",
        pill: "border-red-200 bg-red-50 text-red-700",
        description:
            "Publicații cu accent conservator, suveranist sau anti-establishment, critice față de instituțiile mainstream.",
    },
} as const;

const FACTUALITY_META = {
    high: {
        name: "Ridicată",
        color: "text-emerald-600",
        pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
        description: "Rar publică informații false și corectează erorile când apar.",
    },
    mixed: {
        name: "Mixtă",
        color: "text-amber-600",
        pill: "border-amber-200 bg-amber-50 text-amber-700",
        description: "Alternează între materiale solide și episoade de senzaționalism sau informații neconfirmate.",
    },
    low: {
        name: "Scăzută",
        color: "text-red-600",
        pill: "border-red-200 bg-red-50 text-red-700",
        description: "Publică frecvent informații slabe, înșelătoare sau greu de verificat.",
    },
} as const;

const SOURCE_CATEGORY_LABELS = {
    mainstream: "Mainstream",
    independent: "Independentă",
    tabloid: "Tabloid",
    public: "Publică",
} as const;

const PRINCIPLES = [
    {
        title: "Agregăm aceeași poveste",
        description: "Grupăm articole care tratează același eveniment, ca să poți compara perspectivele în loc să citești izolat.",
    },
    {
        title: "Măsurăm direcția, nu adevărul absolut",
        description: "Bias-ul editorial arată din ce unghi e spusă povestea, nu dacă publicația are sau nu dreptate în tot ce scrie.",
    },
    {
        title: "Punem transparența înaintea verdictului",
        description: "Etichetele sunt explicate, nu ascunse; vrem să vezi cum citim noi ecosistemul media, nu doar ce concluzie tragem.",
    },
] as const;

const BIAS_FACTORS = [
    "Ce subiecte sunt alese și care rămân pe dinafară.",
    "Cum sunt titlate și încadrate evenimentele.",
    "Ce surse, experți și instituții sunt invocate în mod repetat.",
    "Ce context suplimentar este oferit sau, dimpotrivă, omis.",
] as const;

const CONTEXT_POINTS = [
    {
        title: "Filarea",
        description: "Selecția subiectelor care devin vizibile pentru publicul unei publicații.",
    },
    {
        title: "Omisiunea",
        description: "Evenimentele lăsate pe dinafară, deși sunt relevante în altă parte a spectrului.",
    },
    {
        title: "Încadrarea",
        description: "Limbajul, tonul și unghiul prin care e descrisă aceeași situație.",
    },
] as const;

const FACTUALITY_POINTS = [
    { key: "high", title: "Ridicată" },
    { key: "mixed", title: "Mixtă" },
    { key: "low", title: "Scăzută" },
] as const;

const SOURCES_BY_BIAS = {
    left: NEWS_SOURCES.filter((source) => source.bias === "left"),
    "center-left": NEWS_SOURCES.filter((source) => source.bias === "center-left"),
    center: NEWS_SOURCES.filter((source) => source.bias === "center"),
    "center-right": NEWS_SOURCES.filter((source) => source.bias === "center-right"),
    right: NEWS_SOURCES.filter((source) => source.bias === "right"),
};

const FACTUALITY_COUNTS = NEWS_SOURCES.reduce(
    (counts, source) => {
        counts[source.factuality] += 1;
        return counts;
    },
    { high: 0, mixed: 0, low: 0 },
);

const OVERVIEW_STATS = [
    { label: "Surse indexate", value: NEWS_SOURCES.length },
    { label: "Zone pe spectru", value: BIAS_ORDER.length },
    { label: "Factualitate ridicată", value: FACTUALITY_COUNTS.high },
] as const;

function SectionHeader({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">{title}</h2>
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>
        </div>
    );
}

export default function Metodologie() {
    const location = useLocation();

    useEffect(() => {
        if (!location.hash) return;

        const targetId = location.hash.replace("#", "");
        const timer = window.setTimeout(() => {
            document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);

        return () => window.clearTimeout(timer);
    }, [location.hash]);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
                <section className="grid gap-8 border-b border-border/60 pb-12 lg:grid-cols-[minmax(0,1.2fr)_340px]">
                    <div className="space-y-6">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Înapoi la Știri
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <Badge variant="outline" className="rounded-full border-border/70 bg-background px-3 py-1 text-[11px] tracking-[0.18em]">
                                Metodologie
                            </Badge>
                            <span>{NEWS_SOURCES.length} surse evaluate manual</span>
                            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline-flex" />
                            <span>Lectură comparativă, nu verdict final</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                                Cum funcționează thesite.ro
                            </h1>
                            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                                Agregăm știri din ecosistemul media românesc și le plasăm într-un cadru clar: cine
                                acoperă un subiect, din ce unghi îl spune și cât de fiabilă este sursa în timp.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button asChild className="rounded-full px-6">
                                <Link to="/surse">
                                    Vezi catalogul surselor
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full px-6">
                                <a href="#surse">Sari la distribuția pe spectru</a>
                            </Button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {PRINCIPLES.map((principle) => (
                                <div key={principle.title} className="rounded-[1.75rem] border border-border/60 bg-card/70 p-5">
                                    <p className="font-serif text-xl text-foreground">{principle.title}</p>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                        {principle.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <aside className="rounded-[2rem] border border-border/60 bg-card/70 p-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Pe scurt
                        </p>
                        <div className="mt-4 space-y-4">
                            {OVERVIEW_STATS.map((stat) => (
                                <div key={stat.label} className="rounded-[1.25rem] border border-border/60 bg-background/80 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <p className="mt-2 font-serif text-3xl text-foreground">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 border-t border-border/60 pt-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Traseu rapid
                            </p>
                            <nav className="mt-3 flex flex-wrap gap-2">
                                {SECTION_LINKS.map((link) => (
                                    <a
                                        key={link.id}
                                        href={`#${link.id}`}
                                        className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>
                </section>

                <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 rounded-[1.75rem] border border-border/60 bg-card/60 p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Cuprins
                            </p>
                            <nav className="mt-4 space-y-2">
                                {SECTION_LINKS.map((link) => (
                                    <a
                                        key={link.id}
                                        href={`#${link.id}`}
                                        className="block rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <div className="space-y-14">
                        <section id="ce-este" className="space-y-6 border-b border-border/60 pb-12">
                            <SectionHeader
                                eyebrow="Ce agregăm"
                                title="Ce este, concret, thesite.ro"
                                description="Un agregator comparativ de știri: colectăm aceeași poveste din mai multe redacții și îți arătăm unde există convergență, dezechilibru sau tăcere."
                            />

                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_320px]">
                                <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                                    <p>
                                        thesite.ro adună materiale de la <strong className="text-foreground">{NEWS_SOURCES.length} surse media românești</strong>, le
                                        grupează pe subiecte și pune în fața ta nu doar articolul, ci și distribuția
                                        editorială din spatele lui.
                                    </p>
                                    <p>
                                        Scopul nu este să îți spunem ce să crezi, ci să îți oferim mai rapid contextul
                                        de care ai nevoie ca să vezi dacă o poveste e împinsă dintr-o singură direcție
                                        sau circulă echilibrat prin spectrul media.
                                    </p>
                                </div>

                                <div className="rounded-[1.75rem] border border-border/60 bg-card/70 p-6">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        Ce urmărim
                                    </p>
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Info className="mt-0.5 h-4 w-4 text-primary" />
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                <span className="font-medium text-foreground">Acoperirea:</span> cine
                                                vorbește despre un subiect și cine lipsește complet.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <BarChart3 className="mt-0.5 h-4 w-4 text-primary" />
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                <span className="font-medium text-foreground">Unghiul:</span> din ce
                                                direcție editorială este împinsă povestea.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Shield className="mt-0.5 h-4 w-4 text-primary" />
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                <span className="font-medium text-foreground">Fiabilitatea:</span> cât
                                                de des sursa respectivă publică informații verificabile.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="bias" className="space-y-6 border-b border-border/60 pb-12">
                            <SectionHeader
                                eyebrow="Bias editorial"
                                title="Cum definim bias-ul"
                                description="Bias-ul editorial este preferința unei publicații pentru un anumit unghi de interpretare. Nu e sinonim cu minciuna; este filtrul prin care realitatea este selectată și povestită."
                            />

                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-5">
                                    <div className="rounded-[1.75rem] border border-border/60 bg-card/70 p-6">
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            În practică, bias-ul poate fi observat în felul în care o publicație
                                            prioritizează teme, alegerea cuvintelor și selecția vocilor citate în mod
                                            repetat.
                                        </p>
                                        <ul className="mt-5 space-y-3">
                                            {BIAS_FACTORS.map((factor) => (
                                                <li key={factor} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                                                    <span className="mt-1.5 h-2 w-2 rounded-full bg-foreground/30" />
                                                    <span>{factor}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50/70 p-6 dark:border-amber-900/70 dark:bg-amber-950/20">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                                                    Important
                                                </p>
                                                <p className="mt-2 text-sm leading-relaxed text-amber-900/80 dark:text-amber-100/80">
                                                    O sursă poate fi <strong>factuală, dar biased</strong>. La fel,
                                                    eticheta „centru” nu înseamnă automat „corect”, ci doar absența unei
                                                    orientări politice foarte vizibile.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[1.75rem] border border-border/60 bg-card/70 p-6">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        Context românesc
                                    </p>
                                    <div className="mt-4 space-y-4">
                                        {CONTEXT_POINTS.map((point) => (
                                            <div key={point.title} className="rounded-[1.25rem] border border-border/60 bg-background/80 p-4">
                                                <p className="font-medium text-foreground">{point.title}</p>
                                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                    {point.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                                        Clasificările sunt bazate pe analiza editorială a publicațiilor — titluri,
                                        selecția subiectelor, tonul general — nu pe declarațiile lor oficiale despre
                                        neutralitate.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section id="bara-bias" className="space-y-6 border-b border-border/60 pb-12">
                            <SectionHeader
                                eyebrow="Bara de bias"
                                title="Cum citești distribuția surselor"
                                description="Pentru fiecare știre agregată afișăm o bară care arată ce pondere a acoperirii vine din stânga, centru și dreapta."
                            />

                            <div className="rounded-[2rem] border border-border/60 bg-card/70 p-6">
                                <div className="flex h-10 overflow-hidden rounded-full text-sm font-semibold text-white">
                                    <div className="flex items-center justify-center bg-bias-left" style={{ width: "30%" }}>
                                        S 30%
                                    </div>
                                    <div className="flex items-center justify-center bg-bias-center" style={{ width: "45%" }}>
                                        C 45%
                                    </div>
                                    <div className="flex items-center justify-center bg-bias-right" style={{ width: "25%" }}>
                                        D 25%
                                    </div>
                                </div>

                                <p className="mt-4 text-sm text-muted-foreground">
                                    Exemplu: aceeași poveste e preluată de 30% surse de stânga, 45% de centru și 25%
                                    de dreapta.
                                </p>

                                <div className="mt-6 grid gap-4 md:grid-cols-3">
                                    <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full bg-bias-left" />
                                            <p className="font-medium text-foreground">Albastru</p>
                                        </div>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            Surse de stânga și centru-stânga.
                                        </p>
                                    </div>
                                    <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full bg-bias-center" />
                                            <p className="font-medium text-foreground">Gri</p>
                                        </div>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            Surse de centru sau echilibru editorial.
                                        </p>
                                    </div>
                                    <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full bg-bias-right" />
                                            <p className="font-medium text-foreground">Roșu</p>
                                        </div>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            Surse de dreapta și centru-dreapta.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="blindspot" className="space-y-6 border-b border-border/60 pb-12">
                            <SectionHeader
                                eyebrow="Blindspot"
                                title="Ce înseamnă un subiect ignorat"
                                description="Un blindspot apare când o poveste este împinsă aproape exclusiv dintr-o parte a spectrului și devine practic invizibilă pentru cititorii celeilalte tabere."
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-[1.75rem] border border-blue-200 bg-blue-50/70 p-6 dark:border-blue-900/70 dark:bg-blue-950/20">
                                    <p className="flex items-center gap-2 font-medium text-blue-900 dark:text-blue-200">
                                        <AlertTriangle className="h-4 w-4" />
                                        Ignorat de stânga
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-blue-900/80 dark:text-blue-100/80">
                                        Subiectul este acoperit masiv de surse de dreapta, dar aproape lipsește din
                                        zona progresistă. Cititorii care urmăresc doar presa de stânga riscă să nu-l
                                        vadă deloc.
                                    </p>
                                </div>

                                <div className="rounded-[1.75rem] border border-red-200 bg-red-50/70 p-6 dark:border-red-900/70 dark:bg-red-950/20">
                                    <p className="flex items-center gap-2 font-medium text-red-900 dark:text-red-200">
                                        <AlertTriangle className="h-4 w-4" />
                                        Ignorat de dreapta
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-red-900/80 dark:text-red-100/80">
                                        Subiectul domină în publicațiile de stânga, dar dispare aproape complet din
                                        agenda surselor conservatoare sau suveraniste.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[1.75rem] border border-border/60 bg-card/70 p-6">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Algoritmul nostru
                                </p>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                    Semnalăm automat cazurile în care o știre are cel puțin <strong className="text-foreground">3 surse</strong>, iar una dintre
                                    tabere are o prezență de <strong className="text-foreground">sub 8%</strong>, în timp ce cealaltă domină clar acoperirea.
                                </p>
                            </div>
                        </section>

                        <section id="factualitate" className="space-y-6 border-b border-border/60 pb-12">
                            <SectionHeader
                                eyebrow="Factualitate"
                                title="Cum notăm fiabilitatea surselor"
                                description="Pe lângă bias, evaluăm cât de constant publică o redacție informații verificabile și corecte."
                            />

                            <div className="grid gap-4 md:grid-cols-3">
                                {FACTUALITY_POINTS.map((item) => {
                                    const meta = FACTUALITY_META[item.key];

                                    return (
                                        <div key={item.key} className="rounded-[1.75rem] border border-border/60 bg-card/70 p-5">
                                            <Badge
                                                variant="outline"
                                                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${meta.pill}`}
                                            >
                                                {item.title}
                                            </Badge>
                                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                                {meta.description}
                                            </p>
                                            <p className={`mt-4 text-sm font-medium ${meta.color}`}>
                                                {FACTUALITY_COUNTS[item.key]} surse în această categorie
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Clasificările de factualitate folosesc istoricul publicației, corecțiile ulterioare,
                                standardele editoriale observabile și episoadele cunoscute de dezinformare.
                            </p>
                        </section>

                        <section id="surse" className="space-y-6">
                            <SectionHeader
                                eyebrow="Distribuția surselor"
                                title={`Toate sursele noastre (${NEWS_SOURCES.length})`}
                                description="Catalogul este împărțit pe zone editoriale. Deschide fiecare grup pentru a vedea componența și mixul de factualitate."
                            />

                            <Accordion
                                type="multiple"
                                defaultValue={["center", "center-left"]}
                                className="rounded-[2rem] border border-border/60 bg-card/70 px-6"
                            >
                                {BIAS_ORDER.map((biasKey) => {
                                    const sources = SOURCES_BY_BIAS[biasKey];
                                    const meta = BIAS_META[biasKey];

                                    if (sources.length === 0) return null;

                                    const localFactualityCounts = sources.reduce(
                                        (counts, source) => {
                                            counts[source.factuality] += 1;
                                            return counts;
                                        },
                                        { high: 0, mixed: 0, low: 0 },
                                    );

                                    return (
                                        <AccordionItem
                                            key={biasKey}
                                            value={biasKey}
                                            className="border-border/60 py-1 last:border-b-0"
                                        >
                                            <AccordionTrigger className="py-5 text-left hover:no-underline">
                                                <div className="space-y-3">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <span className={`h-3 w-3 rounded-full ${meta.color}`} />
                                                        <span className="font-serif text-2xl text-foreground">
                                                            {meta.name}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${meta.pill}`}
                                                        >
                                                            {sources.length} surse
                                                        </Badge>
                                                    </div>
                                                    <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                                                        {meta.description}
                                                    </p>
                                                </div>
                                            </AccordionTrigger>

                                            <AccordionContent className="space-y-5">
                                                <div className="flex flex-wrap gap-2">
                                                    {FACTUALITY_POINTS.map((item) => {
                                                        const factualityMeta = FACTUALITY_META[item.key];

                                                        return (
                                                            <Badge
                                                                key={item.key}
                                                                variant="outline"
                                                                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${factualityMeta.pill}`}
                                                            >
                                                                {item.title}: {localFactualityCounts[item.key]}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {sources.map((source) => (
                                                        <Link
                                                            key={source.id}
                                                            to={`/surse/${source.id}`}
                                                            className="flex items-center gap-3 rounded-[1.25rem] border border-border/60 bg-background/80 p-4 transition-colors hover:bg-muted/60"
                                                        >
                                                            <SourceFavicon source={source} size="sm" showRing={false} />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate font-medium text-foreground">
                                                                    {source.name}
                                                                </p>
                                                                <p className="mt-1 text-sm text-muted-foreground">
                                                                    {SOURCE_CATEGORY_LABELS[source.category]}
                                                                </p>
                                                            </div>
                                                            <span className={`text-xs font-medium ${FACTUALITY_META[source.factuality].color}`}>
                                                                {FACTUALITY_META[source.factuality].name}
                                                            </span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>

                            <div className="rounded-[1.75rem] border border-border/60 bg-card/70 p-6">
                                <h3 className="font-serif text-2xl text-foreground">Disclaimer</h3>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                    Clasificările noastre rămân <strong className="text-foreground">interpretări editoriale</strong>, nu adevăruri absolute.
                                    Nu suntem afiliați cu publicațiile listate și nu pretindem perfecțiune. Cel mai
                                    bun antidot la bias rămâne citirea din surse diverse și compararea lor.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
