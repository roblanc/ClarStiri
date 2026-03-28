import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Users } from "lucide-react";

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
        dot: "bg-blue-500",
        text: "text-blue-600",
    },
    center: {
        eyebrow: "Zona de echilibru",
        title: "Centru",
        description: "Voci mai eclectice, care combină teme civice, tehnocrate și critici din mai multe direcții.",
        dot: "bg-violet-500",
        text: "text-violet-600",
    },
    right: {
        eyebrow: "Vocea conservatoare",
        title: "Dreapta & centru-dreapta",
        description: "Voci cu accent pe conservatorism, suveranism, ordine socială și retorică anti-establishment.",
        dot: "bg-red-500",
        text: "text-red-600",
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
                <section className="border-b border-border/60 pb-8">
                    <div className="max-w-4xl space-y-5">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <Badge variant="outline" className="rounded-full border-border/70 bg-background px-3 py-1 text-[11px] tracking-[0.18em]">
                                Barometru editorial
                            </Badge>
                            <span>{safeFigures.length} voci indexate</span>
                            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline-flex" />
                            <span>Profiluri actualizate manual</span>
                        </div>

                        <div className="space-y-3">
                            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                                Tribuni
                            </h1>
                            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                                Cine setează tonul dezbaterii publice? Mapăm vocile care împing teme și narațiuni în
                                spațiul media românesc, într-un format mai degrabă de orientare decât de spectacol.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/60 pt-4 text-sm text-muted-foreground">
                            <span>
                                <span className="font-semibold text-foreground">{highlyPolarizedCount}</span> voci puternic polarizate
                            </span>
                            <span>
                                <span className="font-semibold text-foreground">{highRhetoricCount}</span> cu retorică dură
                            </span>
                            <span>
                                <span className="font-semibold text-foreground">{totalStatements}</span> declarații indexate
                            </span>
                            <Link
                                to="/metodologie"
                                className="inline-flex items-center text-foreground transition-colors hover:text-primary"
                            >
                                Vezi metodologia
                                <span className="ml-2 text-base">→</span>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="mt-6 border-b border-border/60 pb-6">
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
                                className="surface-subtle h-11 rounded-full border-0 pl-10"
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
                                                ? "border-foreground text-foreground"
                                                : "border-transparent bg-background/65 text-muted-foreground hover:bg-background/90 hover:text-foreground"
                                        }`}
                                    >
                                        {option.label}
                                        <span
                                            className={`text-xs ${
                                                isActive ? "text-foreground/60" : "text-muted-foreground"
                                            }`}
                                        >
                                            {filterCounts[option.id]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
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
                    <div className="surface-ghost mt-10 rounded-[2rem] px-6 py-20 text-center">
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
                                    <div className="flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                {LEANING_META[section].eyebrow}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${LEANING_META[section].dot}`} />
                                                <h2 className="font-serif text-3xl text-foreground">
                                                    {LEANING_META[section].title}
                                                </h2>
                                            </div>
                                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                                {LEANING_META[section].description}
                                            </p>
                                        </div>

                                        <p className="text-sm text-muted-foreground">{groupedFigures[section].length} voci</p>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                        {groupedFigures[section].map((figure) => {
                                            const tone = getBiasTone(figure.bias.score);

                                            return (
                                                <Link
                                                    key={figure.id}
                                                    to={`/voce/${figure.slug}`}
                                                    className="group surface-panel flex h-full flex-col rounded-[1.5rem] bg-background p-4 transition-all hover:-translate-y-0.5 hover:bg-background/95"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="shrink-0">
                                                            <div className="surface-subtle h-16 w-16 overflow-hidden rounded-[1.25rem] bg-muted">
                                                                <img
                                                                    src={figure.image}
                                                                    alt={figure.name}
                                                                    className="h-full w-full object-cover"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                                        {figure.role}
                                                                    </p>
                                                                    <h3 className="mt-1 font-serif text-2xl leading-tight text-foreground">
                                                                        {figure.name}
                                                                    </h3>
                                                                </div>
                                                                <span className={`shrink-0 text-sm font-semibold ${tone.text}`}>
                                                                    {formatScore(figure.bias.score)}
                                                                </span>
                                                            </div>
                                                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                                                {figure.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/60 pt-3 text-sm">
                                                        <span className={`font-medium ${tone.text}`}>{getBiasLabel(figure.bias.score)}</span>
                                                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                                        <span className="text-muted-foreground">
                                                            {figure.statements.length} declarații
                                                        </span>
                                                        {figure.targets[0] ? (
                                                            <>
                                                                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                                                <span className="truncate text-muted-foreground">
                                                                    {figure.targets[0]}
                                                                </span>
                                                            </>
                                                        ) : null}
                                                        <span className="ml-auto font-medium text-foreground">
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

                <section className="mt-10 border-t border-border/60 pt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Despre scoruri
                    </p>
                    <div className="mt-3 grid gap-3 text-sm leading-relaxed text-muted-foreground md:grid-cols-3">
                        <p>
                            <span className="font-medium text-foreground">Poziționarea</span> descrie direcția dominantă
                            a discursului, nu valoarea unei persoane.
                        </p>
                        <p>
                            <span className="font-medium text-foreground">Tonul</span> arată intensitatea retoricii, nu
                            corectitudinea factuală a fiecărei intervenții.
                        </p>
                        <p>
                            <span className="font-medium text-foreground">Profilurile</span> sunt construite din
                            declarații și apariții documentate, nu din etichete arbitrare.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Barometer;
