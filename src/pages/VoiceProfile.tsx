import { Header } from "@/components/Header";
import { PUBLIC_FIGURES, Statement } from "@/data/publicFigures";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Quote, Facebook, Instagram, Youtube, Sparkles, Loader2, Target, Zap, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { StyledLink } from "@/components/ui/styled-link";



const VoiceProfile = () => {
    const { slug } = useParams();
    const figure = PUBLIC_FIGURES.find(f => f.slug === slug);

    if (!figure) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Profilul nu a fost găsit</h1>
                    <Link to="/influenceri">
                        <Button>Înapoi la Influenceri</Button>
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
                <Link to="/influenceri" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
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
                        <section className="space-y-12 mb-12">
                            <p className="leading-relaxed text-foreground font-anthropic text-xl md:text-2xl pt-2">{figure.description}</p>

                            {figure.contextNotes && figure.contextNotes.length > 0 && (
                                <details className="group [&_summary::-webkit-details-marker]:hidden mt-8 rounded-md bg-card border border-border overflow-hidden shadow-sm">
                                    <summary className="flex items-center justify-between cursor-pointer list-none p-6 bg-muted/20 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors">
                                        <h2 className="text-xl md:text-2xl font-anthropic font-bold text-foreground">
                                            Note de Context
                                        </h2>
                                        <div className="w-6 h-6 shrink-0 relative flex items-center justify-center text-primary ml-4">
                                            <div className="absolute w-4 h-[2px] bg-current rounded-full transition-transform duration-300"></div>
                                            <div className="absolute w-4 h-[2px] bg-current rounded-full transition-transform duration-300 rotate-90 group-open:rotate-0"></div>
                                        </div>
                                    </summary>

                                    <div className="space-y-4 animate-in fade-in duration-500 p-6 pt-6 border-t border-border/40 bg-card">
                                        <ul className="space-y-3">
                                            {figure.contextNotes.map((note, i) => (
                                                <li key={i} className="text-base text-foreground/80 leading-relaxed font-anthropic flex gap-3 pb-3 border-b border-border/20 last:border-0 last:pb-0">
                                                    <span className="text-primary mt-1.5 opacity-50 text-[10px]">■</span>
                                                    <span className="flex-1">{note}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </details>
                            )}

                            {figure.externalAnalyses && figure.externalAnalyses.length > 0 && (
                                <details className="group [&_summary::-webkit-details-marker]:hidden mt-8 rounded-md bg-card border border-border overflow-hidden shadow-sm border-l-4 border-l-primary/40">
                                    <summary className="flex items-center justify-between cursor-pointer list-none p-6 bg-primary/5 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-full">
                                                <Quote className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-anthropic font-bold text-foreground">
                                                Perspective Critice <span className="text-muted-foreground text-sm xl:text-lg font-normal ml-2">(Analiză externă)</span>
                                            </h2>
                                        </div>
                                        <div className="w-6 h-6 shrink-0 relative flex items-center justify-center text-primary ml-4">
                                            <div className="absolute w-4 h-[2px] bg-current rounded-full transition-transform duration-300"></div>
                                            <div className="absolute w-4 h-[2px] bg-current rounded-full transition-transform duration-300 rotate-90 group-open:rotate-0"></div>
                                        </div>
                                    </summary>

                                    <div className="animate-in fade-in duration-500 bg-card">
                                        {figure.externalAnalyses.map((analysis, idx) => (
                                            <div key={idx} className="p-8 space-y-8 border-b border-border/40 last:border-0">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Analiză de la</span>
                                                            <Link to={`/voce/${analysis.authorId}`} className="text-sm font-bold hover:underline font-anthropic">{analysis.authorName}</Link>
                                                        </div>
                                                        <p className="text-lg font-medium leading-relaxed font-anthropic italic text-foreground/90">
                                                            "{analysis.summary}"
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                    {analysis.sections.map((section, sIdx) => (
                                                        <div key={sIdx} className="space-y-3">
                                                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 border-b border-border/20 pb-2">
                                                                {section.title}
                                                            </h3>
                                                            {Array.isArray(section.content) ? (
                                                                <ul className="space-y-2">
                                                                    {section.content.map((item, iIdx) => (
                                                                        <li key={iIdx} className="text-sm leading-relaxed text-foreground/80 flex gap-2">
                                                                            <span className="text-primary/40">•</span>
                                                                            <span>{item}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-sm leading-relaxed text-foreground/80">
                                                                    {section.content}
                                                                </p>
                                                            )}
                                                            {section.sources && section.sources.length > 0 && (
                                                                <div className="flex flex-wrap gap-3 mt-4">
                                                                    {section.sources.map((src, srcIdx) => (
                                                                        <StyledLink key={srcIdx} href={src.url} target="_blank" rel="noopener noreferrer" className="text-[10px] items-center inline-flex gap-1 uppercase tracking-wide">
                                                                            {src.label} <ExternalLink className="w-2.5 h-2.5" />
                                                                        </StyledLink>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}

                            <details className="group [&_summary::-webkit-details-marker]:hidden mt-8 rounded-md bg-card border border-border overflow-hidden shadow-sm">
                                <summary className="flex items-center justify-between cursor-pointer list-none p-6 bg-muted/20 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors">
                                    <h2 className="text-xl md:text-2xl font-anthropic font-bold text-foreground">
                                        Profil Analitic <span className="text-muted-foreground text-sm xl:text-lg font-normal ml-2">(Ținte & Retorică)</span>
                                    </h2>
                                    <div className="w-6 h-6 shrink-0 relative flex items-center justify-center text-primary ml-4">
                                        <div className="absolute w-4 h-[2px] bg-current rounded-full transition-transform duration-300"></div>
                                        <div className="absolute w-4 h-[2px] bg-current rounded-full transition-transform duration-300 rotate-90 group-open:rotate-0"></div>
                                    </div>
                                </summary>

                                <div className="animate-in fade-in duration-500 p-6 pt-6 border-t border-border/40 bg-card">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div>
                                            <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-6">Ținte Predilecte</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {figure.targets.length > 0 ? (
                                                    figure.targets.map((target) => (
                                                        <span key={target} className="text-sm font-medium border border-border/40 px-3 py-1.5 rounded-full text-foreground/80 font-anthropic">{target}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground font-anthropic italic">Nimeni în special</span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-6">Tonul Discursului</h3>
                                            <div className="space-y-4 max-w-sm">
                                                <div className="flex justify-between items-center text-sm border-b border-border/20 pb-2">
                                                    <span className="font-medium text-foreground/80 font-anthropic">Agresivitate verbală</span>
                                                    <span className="font-anthropic font-bold text-lg">{figure.rhetoric.aggressiveness}%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-medium text-foreground/80 font-anthropic">Ironie / Sarcasm</span>
                                                    <span className="font-anthropic font-bold text-lg">{figure.rhetoric.irony}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </section>

                        <details className="group [&_summary::-webkit-details-marker]:hidden mt-8 rounded-md bg-card border border-border overflow-hidden shadow-sm">
                            <summary className="flex items-center justify-between cursor-pointer list-none p-6 bg-muted/20 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors">
                                <h2 className="text-xl md:text-2xl font-anthropic font-bold text-foreground">
                                    Verdicte & Declarații <span className="text-muted-foreground text-sm xl:text-lg font-normal ml-2">({displayStatements.length} declarații)</span>
                                </h2>
                                <div className="w-6 h-6 shrink-0 relative flex items-center justify-center text-primary ml-4">
                                    <div className="absolute w-4 h-[2px] bg-current rounded-full transition-transform duration-300"></div>
                                    <div className="absolute w-4 h-[2px] bg-current rounded-full transition-transform duration-300 rotate-90 group-open:rotate-0"></div>
                                </div>
                            </summary>

                            <div className="space-y-4 animate-in fade-in duration-500 p-6 pt-0 border-t border-border/40 pb-8 bg-card">
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
                                            <blockquote className="border-l-4 border-primary/20 pl-6 py-2 my-4 group-hover:border-primary/50 transition-colors">
                                                <p className="font-medium text-foreground leading-[1.4] transition-colors italic font-anthropic text-xl md:text-2xl selection:bg-primary/20">
                                                    "{statement.text}"
                                                </p>
                                                <footer className="flex items-center justify-end mt-6">
                                                    {statement.articleUrl ? (
                                                        <StyledLink
                                                            href={statement.articleUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[11px] inline-flex items-center gap-1 tracking-wide uppercase"
                                                        >
                                                            Sursa <ExternalLink className="w-3 h-3" />
                                                        </StyledLink>
                                                    ) : (
                                                        <StyledLink
                                                            href={statement.sourceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[11px] inline-flex items-center gap-1 tracking-wide uppercase text-muted-foreground"
                                                        >
                                                            {new URL(statement.sourceUrl).hostname.replace('www.', '')} <ExternalLink className="w-3 h-3" />
                                                        </StyledLink>
                                                    )}
                                                </footer>
                                            </blockquote>

                                            {statement.factCheck && (
                                                <div className="mt-[-8px] mb-4 ml-6 p-4 bg-primary/5 border border-primary/10 rounded-sm">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-primary" />
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Context / Fact-Check</span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-foreground/80 mb-3 font-anthropic">
                                                        {statement.factCheck.text}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                        {statement.factCheck.sources.map((src, i) => (
                                                            <StyledLink key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="text-[10px] items-center inline-flex gap-1 uppercase tracking-wide">
                                                                {src.label} <ExternalLink className="w-2.5 h-2.5" />
                                                            </StyledLink>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                </div>

                {/* Secțiune nouă: Influenceri Similari / Sugerați */}
                <div className="mt-20 pt-10 border-t border-border/40">
                    <h2 className="text-xl md:text-2xl font-anthropic font-bold mb-8 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> Profile Similare Analizate
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {PUBLIC_FIGURES.filter(f => f.id !== figure.id)
                            .sort((a, b) => Math.abs(a.bias.score - figure.bias.score) - Math.abs(b.bias.score - figure.bias.score))
                            .slice(0, 4)
                            .map(suggested => (
                                <Link
                                    key={suggested.id}
                                    to={`/voce/${suggested.slug}`}
                                    className="group flex flex-col h-full items-center text-center py-6 px-2 hover:opacity-80 transition-all duration-300 bg-card rounded-md border border-border/40 shadow-sm"
                                >
                                    <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden transition-all shadow-sm p-[3px] border border-border/40 group-hover:border-primary/20">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-muted/20">
                                                <img
                                                    src={suggested.image}
                                                    alt={suggested.name}
                                                    className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>

                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background shadow-sm
                                            ${suggested.bias.leaning.includes('left') ? 'bg-blue-500' :
                                                suggested.bias.leaning.includes('right') ? 'bg-red-500' : 'bg-purple-500'}`}
                                        />
                                    </div>

                                    <div className="flex flex-col flex-1 w-full justify-between items-center">
                                        <div className="mb-2 w-full">
                                            <h3 className="font-bold text-lg sm:text-[19px] transition-colors leading-tight mb-1 font-anthropic truncate">
                                                {suggested.name}
                                            </h3>
                                        </div>
                                        <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">
                                            {suggested.bias.leaning.replace('-', ' ')}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VoiceProfile;
