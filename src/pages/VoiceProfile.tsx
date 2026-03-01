import { Header } from "@/components/Header";
import { PUBLIC_FIGURES, Statement } from "@/data/publicFigures";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Quote, Facebook, Instagram, Youtube, Sparkles, Loader2, Target, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";



const VoiceProfile = () => {
    const { slug } = useParams();
    const figure = PUBLIC_FIGURES.find(f => f.slug === slug);

    if (!figure) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Profilul nu a fost găsit</h1>
                    <Link to="/voci">
                        <Button>Înapoi la Barometru</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const displayStatements = figure.statements;


    const score = figure.bias.score;
    const biasColor = score < -15 ? 'bg-blue-500' : score > 15 ? 'bg-red-500' : 'bg-purple-500';
    const biasLabel = figure.bias.leaning === 'left' ? 'Stânga' :
        figure.bias.leaning === 'right' ? 'Dreapta' :
            figure.bias.leaning === 'center-left' ? 'Centru-Stânga' :
                figure.bias.leaning === 'center-right' ? 'Centru-Dreapta' : 'Centru';

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <Helmet>
                <title>{figure.name} | Analiză & Verdict | ClarStiri</title>
                <meta name="description" content={`Analiza poziționării politice și a declarațiilor recente ale lui ${figure.name}.`} />
            </Helmet>

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <Link to="/voci" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Înapoi la listă
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coloana Stângă: Info Profil */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="lg:sticky lg:top-24">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-6 border border-border/50 shadow-sm p-1">
                                <div className="w-full h-full rounded-full overflow-hidden bg-muted/20">
                                    <img src={figure.image} alt={figure.name} className="w-full h-full object-cover grayscale transition-all duration-700 hover:grayscale-0" />
                                </div>
                            </div>

                            <h1 className="text-3xl font-anthropic font-bold mb-2">{figure.name}</h1>
                            <p className="text-primary font-medium mb-4">{figure.role}</p>

                            <div className="flex gap-3 mb-6">
                                {figure.socialLinks.instagram && (
                                    <a href={figure.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-full hover:bg-primary/10 transition-colors">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                )}
                                {figure.socialLinks.youtube && (
                                    <a href={figure.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-full hover:bg-primary/10 transition-colors">
                                        <Youtube className="w-5 h-5" />
                                    </a>
                                )}
                                {figure.socialLinks.facebook && (
                                    <a href={figure.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-full hover:bg-primary/10 transition-colors">
                                        <Facebook className="w-5 h-5" />
                                    </a>
                                )}
                            </div>

                            <div className="pt-6 border-t border-border/40">
                                <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-3">Înclinație Ideologică</h3>
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-xl font-anthropic font-bold">{biasLabel}</span>
                                    <span className="text-sm text-muted-foreground font-anthropic italic">({score > 0 ? `+${score}` : score})</span>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground font-anthropic">{figure.bias.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Coloana Dreaptă: Declarații și Analiză */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="mb-12">
                            <p className="leading-relaxed text-foreground font-anthropic text-xl md:text-2xl pt-2">{figure.description}</p>
                        </section>

                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-anthropic font-bold">Verdicte & Declarații</h2>
                        </div>

                        <div className="space-y-4">
                            {displayStatements.map((statement, idx) => (
                                <div key={statement.id || idx} className="py-10 border-b border-border/30 last:border-0 group">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                            <span>{statement.topic}</span>
                                            <span className="opacity-50">•</span>
                                            <span>{statement.date}</span>
                                            {statement.impact === 'high' && (
                                                <>
                                                    <span className="opacity-50">•</span>
                                                    <span className="text-red-500 flex items-center"><Zap className="inline w-3 h-3 mr-0.5" /> Impact Major</span>
                                                </>
                                            )}
                                        </div>
                                        <p className="font-medium text-foreground leading-[1.4] transition-colors italic font-anthropic text-[22px] md:text-3xl selection:bg-primary/20">
                                            "{statement.text}"
                                        </p>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${statement.bias.includes('right') ? 'bg-red-500' : statement.bias.includes('left') ? 'bg-blue-500' : 'bg-purple-500'}`} />
                                                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                                                    {statement.bias === 'left' ? 'Stânga' :
                                                        statement.bias === 'right' ? 'Dreapta' :
                                                            statement.bias === 'center' ? 'Centru' :
                                                                statement.bias === 'center-left' ? 'Centru-Stânga' :
                                                                    statement.bias === 'center-right' ? 'Centru-Dreapta' : statement.bias}
                                                </span>
                                            </div>
                                            {statement.articleUrl ? (
                                                <a
                                                    href={statement.articleUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 font-medium tracking-wide uppercase"
                                                >
                                                    Sursa <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground/70 inline-flex items-center gap-1 font-medium uppercase tracking-wide">
                                                    {new URL(statement.sourceUrl).hostname.replace('www.', '')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Secțiune nouă: Ținte & Retorică */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-border/40">
                            <div>
                                <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-6">Ținte Predilecte</h3>
                                <div className="flex flex-wrap gap-2">
                                    {figure.targets.length > 0 ? (
                                        figure.targets.map((target) => (
                                            <span key={target} className="text-xs font-medium border border-border/40 px-3 py-1.5 rounded-full text-foreground/80">{target}</span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground font-anthropic italic">Nimeni în special</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-6">Tonul Discursului</h3>
                                <div className="space-y-4 max-w-sm">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-foreground/80">Agresivitate verbală</span>
                                        <span className="font-anthropic italic text-lg">{figure.rhetoric.aggressiveness}%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-foreground/80">Ironie / Sarcasm</span>
                                        <span className="font-anthropic italic text-lg">{figure.rhetoric.irony}%</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VoiceProfile;
