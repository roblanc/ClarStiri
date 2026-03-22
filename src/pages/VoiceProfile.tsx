import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PUBLIC_FIGURES } from "@/data/publicFigures";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft, ExternalLink, Quote, Facebook, Instagram, Youtube,
    Target, Zap, AlertTriangle, Users, History, Activity,
    BookOpen, MessageSquareQuote, BrainCircuit, Sparkles, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { StyledLink } from "@/components/ui/styled-link";
import { getStatementEvidence, getStatementEvidenceBadgeClass } from "@/utils/statementEvidence";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const VoiceProfile = () => {
    const { slug } = useParams();
    const figure = PUBLIC_FIGURES.find(f => f.slug === slug);

    if (!figure) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
                    <h1 className="text-3xl font-bold mb-4 font-anthropic text-foreground/80">Profilul nu a fost găsit</h1>
                    <p className="text-muted-foreground mb-8">Ne pare rău, dar vocea căutată nu există în baza noastră de date.</p>
                    <Link to="/influenceri">
                        <Button variant="default" className="rounded-full px-8">Înapoi la Influenceri</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const displayStatements = figure.statements;
    const weakStatementsCount = displayStatements.filter(
        (s) => getStatementEvidence(s).strength === "weak"
    ).length;

    const score = figure.bias.score;
    const isLeft = score < -15;
    const isRight = score > 15;

    const biasColor = isLeft ? 'bg-blue-500' : isRight ? 'bg-red-500' : 'bg-purple-500';
    const biasText = isLeft ? 'text-blue-500' : isRight ? 'text-red-500' : 'text-purple-500';
    const biasBorder = isLeft ? 'border-blue-500/30' : isRight ? 'border-red-500/30' : 'border-purple-500/30';
    const biasGradient = isLeft
        ? 'from-blue-500/10 via-transparent to-transparent'
        : isRight
        ? 'from-red-500/10 via-transparent to-transparent'
        : 'from-purple-500/10 via-transparent to-transparent';

    const biasLabel = getBiasLabel(figure.bias.leaning);

    // Gauge position 0–100
    const gaugePosition = Math.min(Math.max(((score + 100) / 200) * 100, 0), 100);

    const hasContext = figure.contextNotes && figure.contextNotes.length > 0;
    const hasAnalyses = figure.externalAnalyses && figure.externalAnalyses.length > 0;

    const defaultTab = displayStatements.length > 0 ? "declaratii" : hasContext ? "context" : "profil";

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>{figure.name} | Profil & Bias | thesite.ro</title>
                <meta name="description" content={`Analiza poziționării politice și a declarațiilor lui ${figure.name} — ${biasLabel}, scor ${Math.abs(score)}.`} />
                <meta property="og:title" content={`${figure.name} | thesite.ro`} />
                <meta property="og:description" content={figure.bias.description} />
            </Helmet>

            <Header />

            {/* ── HERO ─────────────────────────────────────────────────── */}
            <div className={cn("relative overflow-hidden border-b border-border/40 bg-gradient-to-br", biasGradient)}>
                {/* faint background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className={cn("absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.06]", biasColor)} />
                </div>

                <div className="container mx-auto px-4 py-10 max-w-5xl relative z-10">
                    {/* Back link */}
                    <Link
                        to="/influenceri"
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors group mb-10"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Voci &amp; Influenceri
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                        {/* Photo */}
                        <div className="shrink-0 mx-auto md:mx-0">
                            <div className={cn("relative w-36 h-36 md:w-48 md:h-48 rounded-2xl overflow-hidden border-2 shadow-xl", biasBorder)}>
                                <img
                                    src={figure.image}
                                    alt={figure.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* bias indicator strip at bottom */}
                                <div className={cn("absolute bottom-0 left-0 right-0 h-1", biasColor)} />
                            </div>
                        </div>

                        {/* Info block */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-2">
                                {figure.role}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight leading-none mb-4">
                                {figure.name}
                            </h1>

                            {/* Bias label + score inline */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border", biasText, biasBorder, "bg-background/80")}>
                                    {biasLabel}
                                </span>
                                <span className={cn("text-2xl font-serif font-bold", biasText)}>
                                    {Math.abs(score)}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">/100</span>
                            </div>

                            {/* Bias spectrum bar */}
                            <div className="mb-6 max-w-sm">
                                <div className="relative w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/20 z-10" />
                                    <div
                                        className={cn("absolute top-0 bottom-0 rounded-full transition-all duration-700", biasColor)}
                                        style={{
                                            left: score < 0 ? `${gaugePosition}%` : '50%',
                                            right: score > 0 ? `${100 - gaugePosition}%` : '50%',
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] uppercase font-bold text-muted-foreground/60 mt-1.5 tracking-wider">
                                    <span>Stânga</span>
                                    <span>Centru</span>
                                    <span>Dreapta</span>
                                </div>
                            </div>

                            {/* Social links */}
                            <div className="flex items-center gap-2 mb-6">
                                {figure.socialLinks.instagram && (
                                    <a href={figure.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                        className="p-2 bg-muted/50 rounded-full hover:bg-foreground hover:text-background transition-all text-muted-foreground">
                                        <Instagram className="w-4 h-4" />
                                    </a>
                                )}
                                {figure.socialLinks.youtube && (
                                    <a href={figure.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                                        className="p-2 bg-muted/50 rounded-full hover:bg-foreground hover:text-background transition-all text-muted-foreground">
                                        <Youtube className="w-4 h-4" />
                                    </a>
                                )}
                                {figure.socialLinks.facebook && (
                                    <a href={figure.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                                        className="p-2 bg-muted/50 rounded-full hover:bg-foreground hover:text-background transition-all text-muted-foreground">
                                        <Facebook className="w-4 h-4" />
                                    </a>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
                                {figure.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── METRICS STRIP ────────────────────────────────────────── */}
            <div className="border-b border-border/40 bg-muted/10">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-3 divide-x divide-border/40">
                        <div className="py-5 px-6 text-center">
                            <div className="text-3xl font-serif font-bold text-foreground mb-0.5">
                                {displayStatements.length}
                            </div>
                            <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground flex items-center justify-center gap-1">
                                <MessageSquareQuote className="w-3 h-3" /> Declarații
                            </div>
                        </div>
                        <div className="py-5 px-6 text-center">
                            <div className="text-3xl font-serif font-bold text-orange-500 mb-0.5">
                                {figure.rhetoric.aggressiveness}<span className="text-base text-muted-foreground font-sans">%</span>
                            </div>
                            <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground flex items-center justify-center gap-1">
                                <Zap className="w-3 h-3" /> Agresivitate
                            </div>
                        </div>
                        <div className="py-5 px-6 text-center">
                            <div className="text-3xl font-serif font-bold text-yellow-500 mb-0.5">
                                {figure.rhetoric.irony}<span className="text-base text-muted-foreground font-sans">%</span>
                            </div>
                            <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground flex items-center justify-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Ironie
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
            <main className="container mx-auto px-4 py-10 max-w-5xl">

                {/* Bias quote card */}
                <div className={cn("mb-8 p-5 rounded-2xl border bg-card flex gap-4 items-start", biasBorder)}>
                    <Activity className={cn("w-4 h-4 mt-0.5 shrink-0", biasText)} />
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{figure.bias.description}"
                    </p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue={defaultTab}>
                    <TabsList className="mb-8 h-auto p-1 bg-muted/40 rounded-xl flex flex-wrap gap-1 w-full justify-start">
                        {displayStatements.length > 0 && (
                            <TabsTrigger value="declaratii" className="text-[10px] uppercase tracking-[0.15em] font-bold rounded-lg px-4 py-2 flex items-center gap-1.5">
                                <MessageSquareQuote className="w-3.5 h-3.5" />
                                Declarații
                                <span className="ml-1 text-[9px] bg-foreground/10 px-1.5 py-0.5 rounded-full">{displayStatements.length}</span>
                            </TabsTrigger>
                        )}
                        {hasContext && (
                            <TabsTrigger value="context" className="text-[10px] uppercase tracking-[0.15em] font-bold rounded-lg px-4 py-2 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                Context
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="profil" className="text-[10px] uppercase tracking-[0.15em] font-bold rounded-lg px-4 py-2 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5" />
                            Profil Analitic
                        </TabsTrigger>
                        {hasAnalyses && (
                            <TabsTrigger value="analize" className="text-[10px] uppercase tracking-[0.15em] font-bold rounded-lg px-4 py-2 flex items-center gap-1.5">
                                <BrainCircuit className="w-3.5 h-3.5" />
                                Perspective Critice
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* ── TAB: DECLARATII ─────────────────────────────── */}
                    {displayStatements.length > 0 && (
                        <TabsContent value="declaratii">
                            {weakStatementsCount > 0 && (
                                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex gap-3 items-start">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <p className="text-xs leading-relaxed text-amber-900/80 dark:text-amber-200/80">
                                        <span className="font-bold uppercase tracking-wider">Avertisment: </span>
                                        {weakStatementsCount} declarații au doar trimiteri externe fără link direct la sursă. Monitorizate.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {displayStatements.map((statement, idx) => {
                                    const evidence = getStatementEvidence(statement);
                                    return (
                                        <div
                                            key={statement.id || idx}
                                            className="rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-border transition-colors"
                                        >
                                            {/* Card header */}
                                            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-border/30 bg-muted/20">
                                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                    <span className="flex items-center gap-1">
                                                        <History className="w-3 h-3" /> {statement.date}
                                                    </span>
                                                    <span className="opacity-30">·</span>
                                                    <span className="bg-muted px-2 py-0.5 rounded">{statement.topic}</span>
                                                    {statement.impact === 'high' && (
                                                        <>
                                                            <span className="opacity-30">·</span>
                                                            <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Zap className="w-3 h-3" /> Impact
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <span className={`px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-full border ${getStatementEvidenceBadgeClass(evidence.strength)}`}>
                                                    {evidence.badgeLabel}
                                                </span>
                                            </div>

                                            {/* Quote */}
                                            <div className="px-6 py-5">
                                                <blockquote className="relative">
                                                    <Quote className="absolute -left-1 -top-2 w-7 h-7 text-primary/10 rotate-180" />
                                                    <p className="relative z-10 text-xl md:text-2xl font-serif font-medium italic leading-relaxed text-foreground pl-4">
                                                        "{statement.text}"
                                                    </p>
                                                </blockquote>

                                                {/* Source link */}
                                                <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                                                    <StyledLink
                                                        href={evidence.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={cn(
                                                            "text-[10px] inline-flex items-center gap-1.5 font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg transition-all",
                                                            evidence.strength === "weak"
                                                                ? "text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400"
                                                                : "bg-primary/5 hover:bg-primary/10 text-primary"
                                                        )}
                                                    >
                                                        {evidence.linkLabel}: {evidence.hostLabel}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </StyledLink>
                                                </div>

                                                {/* Weak evidence note */}
                                                {evidence.note && (
                                                    <div className={cn(
                                                        "mt-4 p-3 rounded-xl border flex items-start gap-3 text-xs",
                                                        evidence.strength === "weak"
                                                            ? "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/50"
                                                            : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50"
                                                    )}>
                                                        <AlertTriangle className={cn("w-4 h-4 shrink-0 mt-0.5", evidence.strength === "weak" ? "text-rose-600" : "text-amber-600")} />
                                                        <p className={evidence.strength === "weak" ? "text-rose-900 dark:text-rose-200" : "text-amber-900 dark:text-amber-200"}>
                                                            {evidence.note}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Fact check */}
                                                {statement.factCheck && (
                                                    <div className="mt-4 rounded-xl border border-primary/20 bg-card overflow-hidden">
                                                        <div className="bg-primary/5 px-4 py-2 border-b border-primary/10 flex items-center gap-2">
                                                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Fact-Check</span>
                                                        </div>
                                                        <div className="p-4">
                                                            <p className="text-sm leading-relaxed text-foreground/90 mb-3">
                                                                {statement.factCheck.text}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 items-center">
                                                                <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground">Surse:</span>
                                                                {statement.factCheck.sources.map((src, i) => (
                                                                    <StyledLink key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                                                        className="text-[10px] inline-flex items-center gap-1 uppercase font-semibold tracking-wide border border-border/50 bg-background px-2.5 py-1 rounded hover:border-primary/40 transition-colors">
                                                                        {src.label} <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                                                                    </StyledLink>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </TabsContent>
                    )}

                    {/* ── TAB: CONTEXT ────────────────────────────────── */}
                    {hasContext && (
                        <TabsContent value="context">
                            <ul className="space-y-3">
                                {figure.contextNotes!.map((note, i) => (
                                    <li key={i} className="flex gap-4 p-5 rounded-2xl bg-card border border-border/50">
                                        <span className={cn("text-lg mt-0.5 shrink-0", biasText)}>•</span>
                                        <p className="text-base text-foreground/80 leading-relaxed">{note}</p>
                                    </li>
                                ))}
                            </ul>
                        </TabsContent>
                    )}

                    {/* ── TAB: PROFIL ANALITIC ────────────────────────── */}
                    <TabsContent value="profil">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Targets */}
                            <div className="p-6 rounded-2xl border border-border/50 bg-card">
                                <h3 className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-5">
                                    <Users className="w-3.5 h-3.5" /> Ținte Predilecte
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {figure.targets.length > 0 ? (
                                        figure.targets.map((target) => (
                                            <span key={target} className="text-sm font-semibold border border-border/60 px-3 py-1.5 rounded-lg text-foreground/90 bg-muted/20 hover:border-primary/30 transition-colors">
                                                {target}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">Nimeni în special</span>
                                    )}
                                </div>
                            </div>

                            {/* Rhetoric bars */}
                            <div className="p-6 rounded-2xl border border-border/50 bg-card">
                                <h3 className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-5">
                                    <Zap className="w-3.5 h-3.5" /> Tonul Discursului
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="font-medium text-foreground/80">Agresivitate verbală</span>
                                            <span className="font-bold text-orange-500">{figure.rhetoric.aggressiveness}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                            <div className="bg-orange-500 h-full rounded-full transition-all duration-700" style={{ width: `${figure.rhetoric.aggressiveness}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="font-medium text-foreground/80">Ironie / Sarcasm</span>
                                            <span className="font-bold text-yellow-500">{figure.rhetoric.irony}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                            <div className="bg-yellow-500 h-full rounded-full transition-all duration-700" style={{ width: `${figure.rhetoric.irony}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── TAB: PERSPECTIVE CRITICE ────────────────────── */}
                    {hasAnalyses && (
                        <TabsContent value="analize">
                            <div className="space-y-6">
                                {figure.externalAnalyses!.map((analysis, idx) => (
                                    <div key={idx} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                                        {/* Analysis header */}
                                        <div className="px-6 py-4 border-b border-border/30 bg-muted/10 flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Analiză de la</span>
                                            <Link to={`/voce/${analysis.authorId}`} className={cn("text-sm font-bold hover:underline", biasText)}>
                                                {analysis.authorName}
                                            </Link>
                                        </div>

                                        <div className="p-6">
                                            {/* Summary quote */}
                                            <blockquote className="border-l-2 border-border pl-4 mb-6">
                                                <p className="text-lg font-serif font-medium italic leading-relaxed text-foreground/90">
                                                    "{analysis.summary}"
                                                </p>
                                            </blockquote>

                                            {/* Sections grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {analysis.sections.map((section, sIdx) => (
                                                    <div key={sIdx}>
                                                        <h3 className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mb-3", biasText)}>
                                                            {section.title}
                                                        </h3>
                                                        {Array.isArray(section.content) ? (
                                                            <ul className="space-y-2">
                                                                {section.content.map((item, iIdx) => (
                                                                    <li key={iIdx} className="text-sm leading-relaxed text-foreground/80 flex gap-2.5 items-start">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 shrink-0" />
                                                                        <span>{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-sm leading-relaxed text-foreground/80">{section.content}</p>
                                                        )}
                                                        {section.sources && section.sources.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                {section.sources.map((src, srcIdx) => (
                                                                    <StyledLink key={srcIdx} href={src.url} target="_blank" rel="noopener noreferrer"
                                                                        className="text-[10px] items-center inline-flex gap-1 uppercase tracking-wide bg-background border border-border px-2 py-1 rounded hover:border-primary/40 transition-colors">
                                                                        {src.label} <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                                                                    </StyledLink>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>

                {/* ── SIMILAR PROFILES ─────────────────────────────────── */}
                <div className="mt-16 pt-10 border-t border-border/40">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-2">
                        Explorează
                    </p>
                    <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
                        Alte Voci Analizate
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {PUBLIC_FIGURES
                            .filter(f => f.id !== figure.id)
                            .sort((a, b) => Math.abs(a.bias.score - figure.bias.score) - Math.abs(b.bias.score - figure.bias.score))
                            .slice(0, 4)
                            .map(suggested => {
                                const sLeft = suggested.bias.score < -15;
                                const sRight = suggested.bias.score > 15;
                                const sColor = sLeft ? 'bg-blue-500' : sRight ? 'bg-red-500' : 'bg-purple-500';
                                const sText = sLeft ? 'text-blue-500' : sRight ? 'text-red-500' : 'text-purple-500';
                                return (
                                    <Link
                                        key={suggested.id}
                                        to={`/voce/${suggested.slug}`}
                                        className="group flex flex-col items-center text-center p-5 rounded-2xl border border-border/40 bg-card hover:border-border hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 relative overflow-hidden"
                                    >
                                        <div className={cn("absolute top-0 left-0 right-0 h-0.5", sColor)} />
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border/40 group-hover:border-primary/30 transition-colors mb-3 mt-1">
                                            <img
                                                src={suggested.image}
                                                alt={suggested.name}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                        <h3 className="font-bold text-sm leading-tight mb-1.5 truncate w-full">{suggested.name}</h3>
                                        <span className={cn("text-[9px] uppercase font-bold tracking-wider", sText)}>
                                            {getBiasLabel(suggested.bias.leaning)}
                                        </span>
                                    </Link>
                                );
                            })}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default VoiceProfile;

function getBiasLabel(leaning: 'left' | 'center-left' | 'center' | 'center-right' | 'right'): string {
    const labels: Record<string, string> = {
        'left': 'Stânga',
        'center-left': 'Centru-Stânga',
        'center': 'Centru',
        'center-right': 'Centru-Dreapta',
        'right': 'Dreapta',
    };
    return labels[leaning] ?? leaning;
}
