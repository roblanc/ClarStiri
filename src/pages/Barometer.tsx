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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredFigures.map((figure) => (
                        <Link
                            key={figure.id}
                            to={`/voce/${figure.slug}`}
                            className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                        >
                            <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                                <img
                                    src={figure.image}
                                    alt={figure.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    loading="lazy"
                                />
                                
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                {/* Bias Badge Overlay */}
                                <div className="absolute top-4 right-4">
                                    <Badge className={`${getBiasColor(figure.bias.score)} border-none shadow-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest`}>
                                        {figure.bias.leaning}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1 relative bg-card">
                                <div className="mb-4">
                                    <h3 className="font-serif font-bold text-2xl group-hover:text-primary transition-colors leading-tight mb-1">
                                        {figure.name}
                                    </h3>
                                    <p className="text-xs font-bold uppercase tracking-widest text-primary/80">
                                        {figure.role}
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-muted/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Orientare</span>
                                        <span className="text-xs font-black">{figure.bias.score > 0 ? `+${figure.bias.score}` : figure.bias.score}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden relative">
                                        <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/10 left-1/2 z-10" />
                                        <div
                                            className={`h-full absolute top-0 ${getBiasColor(figure.bias.score)} transition-all duration-1000`}
                                            style={{
                                                left: figure.bias.score < 0 ? `${50 + (figure.bias.score / 2)}%` : '50%',
                                                width: `${Math.abs(figure.bias.score) / 2}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-muted-foreground/50 mt-2">
                                        <span>Stânga</span>
                                        <span>Dreapta</span>
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

export default Barometer;
