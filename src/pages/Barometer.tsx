import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Users, ArrowRight, ShieldAlert, Sparkles, Filter } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { VoiceAvatar } from "@/components/VoiceAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PUBLIC_FIGURES } from "@/data/publicFigures";

type VoiceFilter = "all" | "left" | "center" | "right";

const FILTER_OPTIONS: Array<{ id: VoiceFilter; label: string }> = [
    { id: "all", label: "Toate" },
    { id: "left", label: "Stânga" },
    { id: "center", label: "Centru" },
    { id: "right", label: "Dreapta" },
];

const LEANING_META = {
    left: {
        eyebrow: "Vocea contestatară",
        title: "Stânga & centru-stânga",
        description: "Voci cu accent pe progresism, anti-corupție, drepturi civice și critică instituțională.",
        dot: "bg-blue-600",
        badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50",
        text: "text-blue-600 dark:text-blue-400",
    },
    center: {
        eyebrow: "Zona de echilibru",
        title: "Centru",
        description: "Voci mai eclectice, care combină teme civice, tehnocrate și critici din mai multe direcții.",
        dot: "bg-slate-700",
        badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800/50",
        text: "text-slate-700 dark:text-slate-300",
    },
    right: {
        eyebrow: "Vocea conservatoare",
        title: "Dreapta & centru-dreapta",
        description: "Voci cu accent pe conservatorism, suveranism, ordine socială și retorică anti-establishment.",
        dot: "bg-rose-600",
        badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50",
        text: "text-rose-600 dark:text-rose-400",
    },
} as const;

function getMacroBias(score: number): Exclude<VoiceFilter, "all"> {
    if (score <= -15) return "left";
    if (score >= 15) return "right";
    return "center";
}

function getBiasTone(score: number) {
    return LEANING_META[getMacroBias(score)];
}

function formatScore(score: number) {
    return score > 0 ? `+${score}` : `${score}`;
}

function getBiasLabel(score: number) {
    return LEANING_META[getMacroBias(score)].title;
}

const Barometer = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<VoiceFilter>("all");

    const safeFigures = useMemo(() => {
        return PUBLIC_FIGURES.filter(
            (figure) =>
                typeof figure?.id === "string" &&
                typeof figure?.slug === "string" &&
                typeof figure?.name === "string" &&
                typeof figure?.role === "string" &&
                typeof figure?.description === "string" &&
                Array.isArray(figure?.targets) &&
                Array.isArray(figure?.statements) &&
                figure.bias &&
                typeof figure.bias.score === "number" &&
                typeof figure.bias.leaning === "string" &&
                figure.rhetoric &&
                typeof figure.rhetoric.aggressiveness === "number"
        );
    }, []);

    const filterCounts = useMemo(() => {
        return {
            all: safeFigures.length,
            left: safeFigures.filter((figure) => getMacroBias(figure.bias.score) === "left").length,
            center: safeFigures.filter((figure) => getMacroBias(figure.bias.score) === "center").length,
            right: safeFigures.filter((figure) => getMacroBias(figure.bias.score) === "right").length,
        };
    }, [safeFigures]);

    const totalStatements = useMemo(
        () => safeFigures.reduce((sum, figure) => sum + figure.statements.length, 0),
        [safeFigures],
    );

    const highlyPolarizedCount = useMemo(
        () => safeFigures.filter((figure) => Math.abs(figure.bias.score) >= 50).length,
        [safeFigures],
    );

    const highRhetoricCount = useMemo(
        () => safeFigures.filter((figure) => figure.rhetoric.aggressiveness >= 75).length,
        [safeFigures],
    );

    const filteredFigures = useMemo(() => {
        const normalizedQuery = searchQuery.toLowerCase().trim();

        return safeFigures
            .filter((figure) => activeFilter === "all" || getMacroBias(figure.bias.score) === activeFilter)
            .filter(
                (figure) =>
                    normalizedQuery === "" ||
                    figure.name.toLowerCase().includes(normalizedQuery) ||
                    figure.role.toLowerCase().includes(normalizedQuery) ||
                    figure.description.toLowerCase().includes(normalizedQuery) ||
                    figure.targets.some((target) => target.toLowerCase().includes(normalizedQuery)),
            )
            .sort((a, b) => {
                const scoreDelta = Math.abs(b.bias.score) - Math.abs(a.bias.score);
                if (scoreDelta !== 0) return scoreDelta;

                const statementDelta = b.statements.length - a.statements.length;
                if (statementDelta !== 0) return statementDelta;

                return a.name.localeCompare(b.name, "ro");
            });
    }, [activeFilter, safeFigures, searchQuery]);

    const groupedFigures = useMemo(() => {
        return filteredFigures.reduce<Record<Exclude<VoiceFilter, "all">, typeof filteredFigures>>(
            (groups, figure) => {
                groups[getMacroBias(figure.bias.score)].push(figure);
                return groups;
            },
            { left: [], center: [], right: [] },
        );
    }, [filteredFigures]);

    const visibleSections = (activeFilter === "all" ? ["left", "center", "right"] : [activeFilter]).filter(
        (section): section is Exclude<VoiceFilter, "all"> => section !== "all",
    );

    const hasActiveControls = searchQuery.trim().length > 0 || activeFilter !== "all";

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
                {/* ─── EDITORIAL HERO ─── */}
                <section className="border-b border-border/80 pb-8">
                    <div className="max-w-4xl space-y-4">
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                            <Badge variant="outline" className="rounded-full border-border bg-background px-3 py-0.5 text-[10px] tracking-[0.2em] font-bold">
                                BAROMETRU OPINIE
                            </Badge>
                            <span>{safeFigures.length} voci documentate</span>
                            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline-flex" />
                            <span>Monitorizare editorială</span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                                Tribuni
                            </h1>
                            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground font-sans md:text-xl">
                                Cine setează tonul dezbaterii publice? Mapăm vocile care împing teme și narațiuni în
                                spațiul media românesc, printr-o grilă riguroasă de date și declarații verificate.
                            </p>
                        </div>

                        {/* Metric stats row */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/60 pt-4 text-xs font-medium text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground">{highlyPolarizedCount}</span> voci puternic polarizate
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground">{highRhetoricCount}</span> cu retorică dură
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground">{totalStatements}</span> declarații indexate
                            </span>
                            <Link
                                to="/metodologie"
                                className="inline-flex items-center text-foreground font-bold hover:underline transition-all ml-auto"
                            >
                                Metodologie evaluare
                                <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ─── FILTERS & SEARCH ─── */}
                <section className="mt-6 border-b border-border/60 pb-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-sm">
                            <label htmlFor="voices-search" className="sr-only">
                                Caută o voce
                            </label>
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="voices-search"
                                aria-label="Caută o voce"
                                placeholder="Caută după nume, rol, țintă..."
                                className="h-10 rounded-full border border-border/80 bg-background pl-10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-foreground"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {FILTER_OPTIONS.map((option) => {
                                const isActive = option.id === activeFilter;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => setActiveFilter(option.id)}
                                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                                            isActive
                                                ? "border-foreground bg-foreground text-background shadow-sm"
                                                : "border-border/80 bg-background text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                                        }`}
                                    >
                                        {option.label}
                                        <span
                                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                                                isActive ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                                            }`}
                                        >
                                            {filterCounts[option.id]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                        <p>
                            Afișăm <span className="font-bold text-foreground">{filteredFigures.length}</span> voci
                            {searchQuery.trim() ? ` pentru “${searchQuery.trim()}”` : ""}.
                        </p>

                        {hasActiveControls ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-full px-3"
                                onClick={() => {
                                    setSearchQuery("");
                                    setActiveFilter("all");
                                }}
                            >
                                Resetează filtrele
                            </Button>
                        ) : null}
                    </div>
                </section>

                {/* ─── VOICES GRID ─── */}
                {filteredFigures.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-dashed border-border/80 p-12 text-center">
                        <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                        <h2 className="font-serif text-2xl font-bold text-foreground">Nicio voce găsită</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                            Încearcă alt termen de căutare sau resetează filtrele pentru a vedea toți tribunii indexați.
                        </p>
                    </div>
                ) : (
                    <div className="mt-10 space-y-12">
                        {visibleSections.map((section) =>
                            groupedFigures[section].length > 0 ? (
                                <section key={section} className="space-y-4">
                                    <div className="flex flex-col gap-2 border-b border-border/80 pb-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                                                {LEANING_META[section].eyebrow}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2.5">
                                                <span className={`h-2.5 w-2.5 rounded-full ${LEANING_META[section].dot}`} />
                                                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                                                    {LEANING_META[section].title}
                                                </h2>
                                            </div>
                                            <p className="mt-1 max-w-2xl text-xs md:text-sm text-muted-foreground leading-relaxed">
                                                {LEANING_META[section].description}
                                            </p>
                                        </div>

                                        <p className="text-xs font-mono font-bold text-muted-foreground uppercase">
                                            {groupedFigures[section].length} {groupedFigures[section].length === 1 ? 'voce' : 'voci'}
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {groupedFigures[section].map((figure) => {
                                            const tone = getBiasTone(figure.bias.score);

                                            return (
                                                <Link
                                                    key={figure.id}
                                                    to={`/voce/${figure.slug}`}
                                                    className="group flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-md"
                                                >
                                                    <div>
                                                        <div className="flex items-start gap-4">
                                                            <VoiceAvatar
                                                                src={figure.image}
                                                                name={figure.name}
                                                                score={figure.bias.score}
                                                                size="md"
                                                            />

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="min-w-0">
                                                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground truncate">
                                                                            {figure.role}
                                                                        </p>
                                                                        <h3 className="mt-0.5 font-serif text-xl md:text-2xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                                                                            {figure.name}
                                                                        </h3>
                                                                    </div>
                                                                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-mono font-bold ${tone.badge}`}>
                                                                        {formatScore(figure.bias.score)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <p className="mt-3 line-clamp-2 text-xs md:text-sm leading-relaxed text-muted-foreground font-sans">
                                                            {figure.description}
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-2 border-t border-border/60 pt-3 text-xs font-medium">
                                                        <span className={`font-bold ${tone.text}`}>
                                                            {getBiasLabel(figure.bias.score)}
                                                        </span>
                                                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                                        <span className="text-muted-foreground">
                                                            {figure.statements.length} {figure.statements.length === 1 ? 'declarație' : 'declarații'}
                                                        </span>
                                                        {figure.targets[0] ? (
                                                            <>
                                                                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                                                <span className="truncate max-w-[120px] text-muted-foreground text-[11px]">
                                                                    {figure.targets[0]}
                                                                </span>
                                                            </>
                                                        ) : null}
                                                        <span className="ml-auto inline-flex items-center text-xs font-bold text-foreground group-hover:translate-x-0.5 transition-transform">
                                                            Profil →
                                                        </span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </section>
                            ) : null,
                        )}
                    </div>
                )}

                {/* ─── ABOUT SCORES SECTION ─── */}
                <section className="mt-12 rounded-2xl border border-border/80 bg-muted/20 p-6 md:p-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                        METODOLOGIE &amp; SCORURI
                    </p>
                    <div className="mt-4 grid gap-6 text-sm leading-relaxed text-muted-foreground md:grid-cols-3">
                        <div className="space-y-1.5">
                            <p className="font-bold text-foreground text-sm font-serif">Poziționarea Ideologică</p>
                            <p className="text-xs leading-relaxed">
                                Descrie axa dominantă a discursului pe baza declarațiilor publice și a conținutului editorial recurent, nu o etichetă arbitrară.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="font-bold text-foreground text-sm font-serif">Intensitatea Retoricii</p>
                            <p className="text-xs leading-relaxed">
                                Măsoară agresivitatea, ironia și frecvența atacurilor la persoană sau instituții în intervențiile media analizate.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="font-bold text-foreground text-sm font-serif">Surse Documentate</p>
                            <p className="text-xs leading-relaxed">
                                Toate profilurile sunt ancorate în citate directe și apariții media verificate din presa centrală și independentă.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Barometer;

