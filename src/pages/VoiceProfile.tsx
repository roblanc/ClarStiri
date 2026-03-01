import { Header } from "@/components/Header";
import { PUBLIC_FIGURES, Statement } from "@/data/publicFigures";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Quote, Facebook, Instagram, Youtube, Sparkles, Loader2, Target, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const VoiceProfile = () => {
    const { slug } = useParams();
    const figure = PUBLIC_FIGURES.find(f => f.slug === slug);

    const { data: dynamicData, isLoading: isLoadingDynamic } = useQuery({
        queryKey: ['voice-analysis', figure?.name],
        queryFn: async () => {
            if (!figure) return null;
            const res = await fetch(`/api/analyze-voice?name=${encodeURIComponent(figure.name)}&slug=${figure.slug}`);
            if (!res.ok) {
                console.error('API Error');
                return null;
            }
            return res.json() as Promise<{ statements: Statement[] }>;
        },
        enabled: !!figure,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours cache
    });

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

    const displayStatements = dynamicData?.statements && dynamicData.statements.length > 0
        ? dynamicData.statements
        : figure.statements;


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
                            <div className="aspect-square md:aspect-[3/4] rounded-2xl overflow-hidden mb-4 border shadow-sm bg-muted">
                                <img src={figure.image} alt={figure.name} className="w-full h-full object-cover" />
                            </div>

                            <h1 className="text-3xl font-serif font-bold mb-2">{figure.name}</h1>
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

                            <Card className="bg-muted/30 border-none shadow-none">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center">
                                        <Target className="w-4 h-4 mr-2" /> Barometru Ideologic
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold uppercase">{biasLabel}</span>
                                            <span className="text-[10px] text-muted-foreground">Scor: {score}</span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden relative">
                                            <div className="absolute top-0 bottom-0 w-px bg-foreground/20 left-1/2 z-10" />
                                            <div
                                                className={`h-full ${biasColor} transition-all duration-1000`}
                                                style={{
                                                    left: score < 0 ? `${50 + (score / 2)}%` : '50%',
                                                    width: `${Math.abs(score) / 2}%`,
                                                    position: 'absolute'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] mt-3 leading-relaxed opacity-80">{figure.bias.description}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Coloana Dreaptă: Declarații și Analiză */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                            <h3 className="text-lg font-bold mb-3 flex items-center">
                                <Sparkles className="w-5 h-5 mr-2 text-primary" /> Analiză Voice
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{figure.description}</p>
                        </section>

                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-serif font-bold">Verdicte & Declarații</h2>
                            {isLoadingDynamic && (
                                <Badge variant="secondary" className="animate-pulse flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Actualizare AI
                                </Badge>
                            )}
                        </div>

                        <div className="space-y-4">
                            {displayStatements.map((statement, idx) => (
                                <Card key={statement.id || idx} className="group hover:shadow-md transition-all border-muted/60 overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <Quote className="w-8 h-8 text-primary/10 shrink-0 mt-1" />
                                            <div className="space-y-3 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] font-bold uppercase py-0">
                                                        {statement.topic}
                                                    </Badge>
                                                    {statement.impact === 'high' && (
                                                        <Badge className="bg-red-500/10 text-red-500 border-none text-[10px] font-bold uppercase">
                                                            <Zap className="w-3 h-3 mr-1" /> Impact Mare
                                                        </Badge>
                                                    )}
                                                    <span className="text-[10px] text-muted-foreground ml-auto">{statement.date}</span>
                                                </div>
                                                <p className="text-base md:text-lg font-medium leading-snug group-hover:text-primary transition-colors italic">
                                                    "{statement.text}"
                                                </p>
                                                <div className="flex items-center justify-between pt-2 border-t border-muted/30">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${statement.bias === 'right' ? 'bg-red-500' : statement.bias === 'left' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{statement.bias}</span>
                                                    </div>
                                                    {statement.articleUrl ? (
                                                        <a
                                                            href={statement.articleUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                                                        >
                                                            Articol <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1 font-medium">
                                                            {new URL(statement.sourceUrl).hostname.replace('www.', '')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Secțiune nouă: Ținte & Retorică */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-primary/5 border-none shadow-none">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center">
                                        <Target className="w-4 h-4 mr-2" /> Ținte Predilecte
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {figure.targets.length > 0 ? (
                                        figure.targets.map((target) => (
                                            <Badge key={target} variant="secondary" className="text-[10px]">{target}</Badge>
                                        ))
                                    ) : (
                                        <span className="text-[10px] text-muted-foreground italic uppercase">Profil echidistant — fără ținte recurente</span>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-secondary/5 border-none shadow-none">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center">
                                        <AlertTriangle className="w-4 h-4 mr-2" /> Tonul Discursului
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-[10px] mb-1 uppercase font-bold tracking-wider">
                                                <span>Agresivitate</span>
                                                <span>{figure.rhetoric.aggressiveness}%</span>
                                            </div>
                                            <Progress value={figure.rhetoric.aggressiveness} className="h-1" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[10px] mb-1 uppercase font-bold tracking-wider">
                                                <span>Ironie / Sarcasm</span>
                                                <span>{figure.rhetoric.irony}%</span>
                                            </div>
                                            <Progress value={figure.rhetoric.irony} className="h-1" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VoiceProfile;
