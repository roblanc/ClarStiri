import { Header } from "@/components/Header";
import { PUBLIC_FIGURES } from "@/data/publicFigures";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Quote, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
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

    // Calculate bias percentage for the bar
    const score = figure.bias.score; // -100 to 100
    const biasLabel = figure.bias.leaning === 'left' ? 'Stânga' :
        figure.bias.leaning === 'right' ? 'Dreapta' :
            figure.bias.leaning === 'center-left' ? 'Centru-Stânga' :
                figure.bias.leaning === 'center-right' ? 'Centru-Dreapta' : 'Centru';

    const biasColor = score < -15 ? 'bg-blue-500' : score > 15 ? 'bg-red-500' : 'bg-purple-500';

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <Helmet>
                <title>{figure.name} | Barometru Opinie thesite.ro</title>
                <meta name="description" content={`Analiza poziționării politice și a declarațiilor recente ale lui ${figure.name}.`} />
            </Helmet>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {/* Profile Card */}
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-card shadow-lg mb-6">
                            <img
                                src={figure.image}
                                alt={figure.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <h1 className="text-3xl font-bold text-center mb-2">{figure.name}</h1>
                        <p className="text-muted-foreground font-medium mb-4">{figure.role}</p>

                        <div className="flex gap-4 mb-6">
                            {figure.socialLinks.facebook && (
                                <a href={figure.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#1877F2]">
                                    <Facebook className="w-6 h-6" />
                                </a>
                            )}
                            {figure.socialLinks.instagram && (
                                <a href={figure.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#E4405F]">
                                    <Instagram className="w-6 h-6" />
                                </a>
                            )}
                            {figure.socialLinks.youtube && (
                                <a href={figure.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#FF0000]">
                                    <Youtube className="w-6 h-6" />
                                </a>
                            )}
                            {figure.socialLinks.tiktok && (
                                <a href={figure.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                    {/* Lucide doesn't have tiktok yet, use Twitter icon as placeholder or generic link */}
                                    <ExternalLink className="w-6 h-6" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Bio & Bias Analysis */}
                    <div className="w-full md:w-2/3">
                        <div className="bg-card border border-border rounded-xl p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                Poziționare Politică
                            </h2>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-2xl capitalize">{biasLabel}</span>
                                    <span className="text-sm text-muted-foreground">Scor: {score > 0 ? `+${score}` : score}</span>
                                </div>

                                {/* Visual Bar */}
                                <div className="h-4 w-full bg-muted rounded-full relative overflow-hidden">
                                    <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 left-1/2 z-10"></div> {/* Center marker */}

                                    {score !== 0 && (
                                        <div
                                            className={`h-full absolute top-0 ${biasColor} transition-all duration-1000`}
                                            style={{
                                                left: score < 0 ? `${50 + (score / 2)}%` : '50%',
                                                width: `${Math.abs(score) / 2}%`,
                                            }}
                                        ></div>
                                    )}
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    <span>Stânga Extremă</span>
                                    <span>Centru</span>
                                    <span>Dreapta Extremă</span>
                                </div>
                            </div>

                            <div className="space-y-4 text-muted-foreground leading-relaxed">
                                <p>{figure.description}</p>
                                <div className="bg-muted/30 p-4 rounded-lg text-sm border-l-4 border-primary">
                                    <strong>Analiză Bias:</strong> {figure.bias.description}
                                </div>
                            </div>
                        </div>

                        {/* Recent Statements */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Quote className="w-5 h-5 text-primary" />
                                Declarații Recente & Derapaje
                            </h2>

                            <div className="space-y-4">
                                {figure.statements.length > 0 ? (
                                    figure.statements.map(statement => (
                                        <div key={statement.id} className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <Quote className="w-8 h-8 text-muted-foreground/20 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="italic text-lg mb-3">"{statement.text}"</p>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-muted-foreground">{statement.date}</span>
                                                            <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">
                                                                {statement.topic}
                                                            </span>
                                                        </div>
                                                        <a
                                                            href={statement.sourceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-primary hover:underline"
                                                        >
                                                            Sursa <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                                        Încă nu au fost analizate declarații recente pentru acest profil.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VoiceProfile;
