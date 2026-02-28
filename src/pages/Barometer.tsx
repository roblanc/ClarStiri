import { Header } from "@/components/Header";
import { PUBLIC_FIGURES } from "@/data/publicFigures";
import { Link } from "react-router-dom";
import { Users, Target, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

const Barometer = () => {
    const [searchQuery, setSearchOpen] = useState("");

    const filteredFigures = useMemo(() => {
        return PUBLIC_FIGURES.filter(f =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 flex items-center gap-3">
                            <Target className="w-10 h-10 text-primary" />
                            Influenceri & Jurnaliști
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                            Cine face agenda publică? Analizăm poziționarea ideologică și cele mai recente declarații ale persoanelor care influențează opinia publică în România.
                        </p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Caută o voce..."
                            className="pl-10 h-11 rounded-xl bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchOpen(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                    {filteredFigures.map((figure) => (
                        <Link
                            key={figure.id}
                            to={`/voce/${figure.slug}`}
                            className="group flex flex-col h-full items-center text-center p-4 rounded-[2rem] hover:bg-muted/40 transition-all duration-300"
                        >
                            <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary/10 group-hover:border-primary/30 transition-colors shadow-inner">
                                    <img
                                        src={figure.image}
                                        alt={figure.name}
                                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Bias Indicator Dot/Badge */}
                                <div className="absolute -bottom-1 -right-1">
                                    <div className={`${getBiasColor(figure.bias.score)} w-4 h-4 rounded-full border-2 border-background shadow-sm`} title={figure.bias.leaning} />
                                </div>
                            </div>

                            <div className="flex flex-col flex-1 w-full">
                                <div className="mb-3">
                                    <h3 className="font-serif font-bold text-base sm:text-lg group-hover:text-primary transition-colors leading-tight mb-1 line-clamp-1">
                                        {figure.name}
                                    </h3>
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 line-clamp-1">
                                        {figure.role}
                                    </p>
                                </div>

                                <div className="mt-auto pt-3 border-t border-muted/30">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[8px] font-bold uppercase text-muted-foreground/60 tracking-tight">Orientare</span>
                                        <span className={`text-[10px] font-black ${getBiasTextColor(figure.bias.score)}`}>
                                            {figure.bias.score > 0 ? `+${figure.bias.score}` : figure.bias.score}
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden relative">
                                        <div className="absolute top-0 bottom-0 w-px bg-foreground/10 left-1/2 z-10" />
                                        <div
                                            className={`h-full absolute top-0 ${getBiasColor(figure.bias.score)} transition-all duration-1000`}
                                            style={{
                                                left: figure.bias.score < 0 ? `${50 + (figure.bias.score / 2)}%` : '50%',
                                                width: `${Math.abs(figure.bias.score) / 2}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredFigures.length === 0 && (
                    <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground font-serif text-xl">Nu am găsit nicio voce pentru "{searchQuery}"</p>
                    </div>
                )}
            </main>
        </div>
    );
};

function getBiasColor(score: number): string {
    if (score <= -15) return 'bg-blue-500';
    if (score >= 15) return 'bg-red-500';
    return 'bg-purple-500';
}

function getBiasTextColor(score: number): string {
    if (score <= -15) return 'text-blue-500';
    if (score >= 15) return 'text-red-500';
    return 'text-purple-500';
}

export default Barometer;
