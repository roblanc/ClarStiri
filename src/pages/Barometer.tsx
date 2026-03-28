import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, MessageSquare, Search, Target, Users } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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
        badge: "border-blue-200 bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
        text: "text-blue-600",
        surface: "from-blue-500/10 via-blue-500/5 to-transparent",
    },
    center: {
        eyebrow: "Zona de echilibru",
        title: "Centru",
        description: "Voci mai eclectice, care combină teme civice, tehnocrate și critici din mai multe direcții.",
        badge: "border-violet-200 bg-violet-50 text-violet-700",
        dot: "bg-violet-500",
        text: "text-violet-600",
        surface: "from-violet-500/10 via-violet-500/5 to-transparent",
    },
    right: {
        eyebrow: "Vocea conservatoare",
        title: "Dreapta & centru-dreapta",
        description: "Voci cu accent pe conservatorism, suveranism, ordine socială și retorică anti-establishment.",
        badge: "border-red-200 bg-red-50 text-red-700",
        dot: "bg-red-500",
        text: "text-red-600",
        surface: "from-red-500/10 via-red-500/5 to-transparent",
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

function getAggressivenessLabel(value: number) {
    if (value >= 75) return "Ridicată";
    if (value >= 45) return "Medie";
    return "Scăzută";
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
                <section className="grid gap-8 border-b border-border/60 pb-10 lg:grid-cols-[minmax(0,1.2fr)_340px]">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <Badge variant="outline" className="rounded-full border-border/70 bg-background px-3 py-1 text-[11px] tracking-[0.18em]">
                                Barometru editorial
                            </Badge>
                            <span>{safeFigures.length} voci indexate</span>
                            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline-flex" />
                            <span>Profiluri actualizate manual</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                                Tribuni
                            </h1>
                            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                                Cine setează tonul dezbaterii publice? Mapăm vocile care împing teme, narațiuni și
                                reacții politice în spațiul media românesc, cu accent pe poziționare, ton și frecvența
                                declarațiilor.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-[1.75rem] border border-border/60 bg-card/70 p-5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Voci polarizate
                                </p>
                                <p className="mt-3 font-serif text-3xl text-foreground">{highlyPolarizedCount}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Profiluri cu scor politic de minimum ±50.
                                </p>
                            </div>

                            <div className="rounded-[1.75rem] border border-border/60 bg-card/70 p-5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Retorică dură
                                </p>
                                <p className="mt-3 font-serif text-3xl text-foreground">{highRhetoricCount}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Voci cu agresivitate retorică ridicată.
                                </p>
                            </div>

                            <div className="rounded-[1.75rem] border border-border/60 bg-card/70 p-5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Declarații indexate
                                </p>
                                <p className="mt-3 font-serif text-3xl text-foreground">{totalStatements}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Citări și intervenții folosite în profilare.
                                </p>
                            </div>
                        </div>
                    </div>

                    <aside className="rounded-[2rem] border border-border/60 bg-card/70 p-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Cum citești pagina
                        </p>
                        <h2 className="mt-3 font-serif text-2xl text-foreground">Spectrul de poziționare</h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Scorurile nu descriu “adevărul”, ci direcția ideologică dominantă și intensitatea cu care
                            fiecare voce își împinge mesajele.
                        </p>

                        <div className="mt-6 rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                <span>Stânga</span>
                                <span>Centru</span>
                                <span>Dreapta</span>
                            </div>
                            <div className="relative mt-4 h-2 rounded-full bg-muted">
                                <div className="absolute inset-y-0 left-0 w-1/3 rounded-l-full bg-blue-500/80" />
                                <div className="absolute inset-y-0 left-1/3 w-1/3 bg-violet-500/80" />
                                <div className="absolute inset-y-0 right-0 w-1/3 rounded-r-full bg-red-500/80" />
                            </div>
                            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                                    <p>Scor negativ: accent progresist, civic sau critic la adresa conservatorismului.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-500" />
                                    <p>Scor aproape de zero: poziționare mixtă, eclectică sau mai greu de încadrat.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                                    <p>Scor pozitiv: accent conservator, suveranist sau anti-establishment.</p>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/metodologie"
                            className="mt-5 inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-primary"
                        >
                            Vezi metodologia completă
                            <span className="ml-2 text-base">→</span>
                        </Link>
                    </aside>
                </section>

                <section className="mt-8 rounded-[2rem] border border-border/60 bg-card/60 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-sm">
                            <label htmlFor="voices-search" className="sr-only">
                                Caută o voce
                            </label>
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="voices-search"
                                aria-label="Caută o voce"
                                placeholder="Caută nume, rol, temă sau țintă..."
                                className="h-11 rounded-full border-border/70 bg-background pl-10"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {FILTER_OPTIONS.map((option) => {
                                const isActive = option.id === activeFilter;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => setActiveFilter(option.id)}
                                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                            isActive
                                                ? "border-foreground bg-foreground text-background"
                                                : "border-border/70 bg-background text-foreground hover:bg-muted"
                                        }`}
                                    >
                                        {option.label}
                                        <span
                                            className={`text-xs ${
                                                isActive ? "text-background/70" : "text-muted-foreground"
                                            }`}
                                        >
                                            {filterCounts[option.id]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground">
                        <p>
                            Afișăm <span className="font-semibold text-foreground">{filteredFigures.length}</span> voci
                            {searchQuery.trim() ? ` pentru “${searchQuery.trim()}”` : ""}.
                        </p>

                        {hasActiveControls ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="rounded-full px-4"
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

                {filteredFigures.length === 0 ? (
                    <div className="mt-10 rounded-[2rem] border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center">
                        <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                        <h2 className="font-serif text-2xl text-foreground">Nicio voce pe filtrul ales</h2>
                        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                            Încearcă alt nume sau revino la toate profilurile ca să vezi întreaga distribuție de voci.
                        </p>
                    </div>
                ) : (
                    <div className="mt-10 space-y-12">
                        {visibleSections.map((section) =>
                            groupedFigures[section].length > 0 ? (
                                <section key={section} className="space-y-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                {LEANING_META[section].eyebrow}
                                            </p>
                                            <h2 className="mt-2 font-serif text-3xl text-foreground">
                                                {LEANING_META[section].title}
                                            </h2>
                                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                                {LEANING_META[section].description}
                                            </p>
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className={`w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${LEANING_META[section].badge}`}
                                        >
                                            {groupedFigures[section].length} voci
                                        </Badge>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {groupedFigures[section].map((figure) => {
                                            const tone = getBiasTone(figure.bias.score);

                                            return (
                                                <Link
                                                    key={figure.id}
                                                    to={`/voce/${figure.slug}`}
                                                    className={`group flex h-full flex-col rounded-[2rem] border border-border/60 bg-gradient-to-br ${tone.surface} bg-card/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-xl`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="relative shrink-0">
                                                            <div className="h-20 w-20 overflow-hidden rounded-[1.5rem] border border-border/60 bg-muted shadow-sm">
                                                                <img
                                                                    src={figure.image}
                                                                    alt={figure.name}
                                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                            <div
                                                                className={`absolute -bottom-2 -right-2 inline-flex min-w-[2.5rem] items-center justify-center rounded-full border border-background px-2 py-1 text-[11px] font-black shadow-sm ${tone.badge}`}
                                                            >
                                                                {formatScore(figure.bias.score)}
                                                            </div>
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                                {figure.role}
                                                            </p>
                                                            <h3 className="mt-2 font-serif text-2xl leading-tight text-foreground">
                                                                {figure.name}
                                                            </h3>
                                                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                                                {figure.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 space-y-4 border-t border-border/60 pt-4">
                                                        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                                            <span>Poziționare</span>
                                                            <span className={tone.text}>{getBiasLabel(figure.bias.score)}</span>
                                                        </div>

                                                        <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
                                                            <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/10" />
                                                            <div
                                                                className={`absolute inset-y-0 ${tone.dot} rounded-full`}
                                                                style={{
                                                                    left:
                                                                        figure.bias.score < 0
                                                                            ? `${50 + figure.bias.score / 2}%`
                                                                            : "50%",
                                                                    width: `${Math.abs(figure.bias.score) / 2}%`,
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                                                    Declarații
                                                                </p>
                                                                <p className="mt-1 text-sm font-semibold text-foreground">
                                                                    {figure.statements.length}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                                                    Agresivitate
                                                                </p>
                                                                <p className="mt-1 text-sm font-semibold text-foreground">
                                                                    {getAggressivenessLabel(figure.rhetoric.aggressiveness)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                                                    Ținte
                                                                </p>
                                                                <p className="mt-1 text-sm font-semibold text-foreground">
                                                                    {figure.targets.length}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-4 text-sm">
                                                            <div className="min-w-0">
                                                                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                                                    <Target className="h-3.5 w-3.5" />
                                                                    Accent principal
                                                                </p>
                                                                <p className="mt-1 truncate text-foreground">
                                                                    {figure.targets[0] || "Profil general"}
                                                                </p>
                                                            </div>

                                                            <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                                                Profil
                                                                <span className="transition-transform group-hover:translate-x-0.5">→</span>
                                                            </span>
                                                        </div>
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

                <section className="mt-12 rounded-[2rem] border border-border/60 bg-card/60 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Despre scoruri
                            </p>
                            <h2 className="mt-2 font-serif text-2xl text-foreground">
                                Profilurile sunt instrumente de orientare
                            </h2>
                        </div>
                        <Badge variant="outline" className="rounded-full border-border/70 bg-background px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                            Actualizare editorială
                        </Badge>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Target className="h-4 w-4 text-primary" />
                                Poziționare
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Scorul politic reflectă direcția dominantă a discursului și frecvența cu care apar teme
                                de stânga, centru sau dreapta.
                            </p>
                        </div>

                        <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Flame className="h-4 w-4 text-primary" />
                                Ton
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Agresivitatea măsoară intensitatea retoricii, nu corectitudinea factuală sau relevanța
                                intervențiilor.
                            </p>
                        </div>

                        <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                Dovezi
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Fiecare profil se bazează pe declarații și apariții documentate, nu pe simpatii sau
                                etichete arbitrare.
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
