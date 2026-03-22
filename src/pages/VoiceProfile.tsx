import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PUBLIC_FIGURES, Statement } from "@/data/publicFigures";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Quote, Facebook, Instagram, Youtube, Target, Zap, AlertTriangle, Users, History, Activity, BookOpen, MessageSquareQuote, BrainCircuit, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { StyledLink } from "@/components/ui/styled-link";
import { getStatementEvidence, getStatementEvidenceBadgeClass } from "@/utils/statementEvidence";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
    const weakStatementsCount = displayStatements.filter((statement) => getStatementEvidence(statement).strength === "weak").length;

    const score = figure.bias.score;
    // Enhanced bias styling based on score
    const isLeft = score < -15;
    const isRight = score > 15;
    
    // Core theme colors and glows
    const biasColor = isLeft ? 'bg-blue-500' : isRight ? 'bg-red-500' : 'bg-purple-500';
    const biasText = isLeft ? 'text-blue-500' : isRight ? 'text-red-500' : 'text-purple-500';
    const biasBorder = isLeft ? 'border-blue-500/20' : isRight ? 'border-red-500/20' : 'border-purple-500/20';
    const biasGlow = isLeft ? 'shadow-blue-500/20' : isRight ? 'shadow-red-500/20' : 'shadow-purple-500/20';
    const biasBgLight = isLeft ? 'bg-blue-500/5' : isRight ? 'bg-red-500/5' : 'bg-purple-500/5';
    
    const biasLabel = getBiasLabel(figure.bias.leaning);
    const biasBadgeClass = getBiasBadgeClass(figure.bias.leaning);

    // Calculate position for visual bias gauge (0 to 100%)
    const gaugePosition = Math.min(Math.max(((score + 100) / 200) * 100, 0), 100);

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            <Header />

            <Helmet>
                <title>{figure.name} | Analiză & Verdict | ClarStiri</title>
                <meta name="description" content={`Analiza poziționării politice și a declarațiilor recente ale lui ${figure.name}.`} />
            </Helmet>

            {/* Subtle background glow representing bias */}
            <div className="fixed top-0 left-0 right-0 h-[50vh] pointer-events-none overflow-hidden z-0">
                <div className={cn(
                    "absolute -top-1/2 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-10 dark:opacity-5 mix-blend-screen",
                    biasColor
                )}></div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
                <Link to="/influenceri" className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground mb-10 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Înapoi la Voci &amp; Influenceri
                </Link>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Glassmorphism Profile Card */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="xl:sticky xl:top-24">
                            <div className={cn(
                                "rounded-3xl p-8 border bg-card/60 backdrop-blur-xl shadow-2xl transition-all duration-500",
                                biasBorder,
                                "hover:" + biasGlow
                            )}>
                                {/* Enhanced Image Avatar */}
                                <div className="relative mx-auto w-32 h-32 md:w-48 md:h-48 mb-8 group">
                                    <div className={cn("absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700", biasColor)}></div>
                                    <div className={cn(
                                        "w-full h-full rounded-full overflow-hidden border-2 p-1.5 shadow-lg bg-card transition-transform duration-500 group-hover:scale-105", 
                                        biasBorder
                                    )}>
                                        <div className="w-full h-full rounded-full overflow-hidden bg-muted/20 relative">
                                            <img 
                                                src={figure.image} 
                                                alt={figure.name} 
                                                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 scale-100 group-hover:scale-110" 
                                            />
                                        </div>
                                    </div>
                                    {/* Small bias indicator dot */}
                                    <div className={cn("absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-card flex items-center justify-center shadow-lg", biasColor)}>
                                        <Activity className="w-4 h-4 text-white" />
                                    </div>
                                </div>

                                <div className="text-center mb-8">
                                    <h1 className="text-3xl md:text-4xl font-anthropic font-bold mb-2 tracking-tight text-foreground">{figure.name}</h1>
                                    <p className={cn("font-semibold uppercase tracking-widest text-xs", biasText)}>{figure.role}</p>
                                </div>

                                {/* Social Links */}
                                <div className="flex justify-center gap-3 mb-8">
                                    {figure.socialLinks.instagram && (
                                        <a href={figure.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-muted/50 rounded-full hover:bg-foreground hover:text-background hover:scale-110 transition-all text-muted-foreground">
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                    )}
                                    {figure.socialLinks.youtube && (
                                        <a href={figure.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-muted/50 rounded-full hover:bg-foreground hover:text-background hover:scale-110 transition-all text-muted-foreground">
                                            <Youtube className="w-5 h-5" />
                                        </a>
                                    )}
                                    {figure.socialLinks.facebook && (
                                        <a href={figure.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-muted/50 rounded-full hover:bg-foreground hover:text-background hover:scale-110 transition-all text-muted-foreground">
                                            <Facebook className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>

                                {/* Bias Visualizer */}
                                <div className="pt-6 border-t border-border/40">
                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <h3 className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-muted-foreground mb-1">Poziționare</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-anthropic font-bold">{biasLabel}</span>
                                            </div>
                                        </div>
                                        <div className={cn("text-2xl font-anthropic font-bold", biasText)}>
                                            {Math.abs(score)}
                                        </div>
                                    </div>
                                    
                                    {/* Visual Gauge */}
                                    <div className="relative w-full h-2.5 bg-muted/50 rounded-full overflow-hidden mt-4 shadow-inner">
                                        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-foreground/20 z-10 hidden sm:block"></div>
                                        <div className="absolute left-[25%] top-0 bottom-0 w-[1px] bg-foreground/10 z-10 hidden sm:block"></div>
                                        <div className="absolute left-[75%] top-0 bottom-0 w-[1px] bg-foreground/10 z-10 hidden sm:block"></div>
                                        
                                        <div
                                            className={cn("absolute top-0 bottom-0 rounded-full transition-all duration-1000 ease-out", biasColor)}
                                            style={{
                                                left: score < 0 ? `${gaugePosition}%` : '50%',
                                                right: score > 0 ? `${100 - gaugePosition}%` : '50%'
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] uppercase font-bold text-muted-foreground mt-2 tracking-wider">
                                        <span>Extrema Stângă</span>
                                        <span>Centru</span>
                                        <span>Extrema Dreaptă</span>
                                    </div>

                                    <p className="text-sm leading-relaxed text-muted-foreground font-anthropic mt-6 italic bg-muted/30 p-4 rounded-xl">
                                        "{figure.bias.description}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quotes & Analysis */}
                    <div className="xl:col-span-8 space-y-10">
                        {/* Premium Introductory Description */}
                        <section className="relative p-8 sm:p-10 rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary/40 to-transparent"></div>
                            <Quote className="w-10 h-10 text-primary/20 mb-6 absolute top-8 right-8" />
                            <p className="relative z-10 leading-relaxed text-foreground/90 font-anthropic text-xl md:text-[22px] lg:leading-[1.7] first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left">
                                {figure.description}
                            </p>
                        </section>

                        <Accordion type="multiple" className="space-y-6" defaultValue={["statements"]}>
                            {/* Context Notes */}
                            {figure.contextNotes && figure.contextNotes.length > 0 && (
                                <AccordionItem value="context" className="border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm data-[state=open]:shadow-md transition-all">
                                    <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-anthropic font-bold text-foreground">
                                                Note de Context
                                            </h2>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 pt-2">
                                        <ul className="space-y-3">
                                            {figure.contextNotes.map((note, i) => (
                                                <li key={i} className="text-base text-foreground/80 leading-relaxed font-anthropic flex gap-4 p-4 rounded-xl bg-muted/10 border border-border/30">
                                                    <span className="text-primary mt-1 opacity-60 text-lg flex-shrink-0">•</span>
                                                    <span className="flex-1">{note}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            )}

                            {/* External Analysis */}
                            {figure.externalAnalyses && figure.externalAnalyses.length > 0 && (
                                <AccordionItem value="analysis" className={cn("border rounded-2xl bg-card overflow-hidden shadow-sm data-[state=open]:shadow-md transition-all", biasBorder)}>
                                    <AccordionTrigger className={cn("px-6 py-5 hover:no-underline group", biasBgLight)}>
                                        <div className="flex items-center gap-3 text-left">
                                            <div className={cn("p-2.5 rounded-xl transition-colors text-white", biasColor)}>
                                                <BrainCircuit className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl md:text-2xl font-anthropic font-bold text-foreground">
                                                    Perspective Critice
                                                </h2>
                                                <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-0.5 block">Analize din afara bulei</span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 pt-4">
                                        <div className="space-y-8">
                                            {figure.externalAnalyses.map((analysis, idx) => (
                                                <div key={idx} className="p-6 rounded-2xl border border-border/40 bg-background/50">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Analiză de la</span>
                                                        <Link to={`/voce/${analysis.authorId}`} className={cn("text-sm font-bold hover:underline", biasText)}>
                                                            {analysis.authorName}
                                                        </Link>
                                                    </div>
                                                    <p className="text-lg md:text-xl font-medium leading-relaxed font-anthropic italic text-foreground border-l-4 pl-4 border-muted">
                                                        "{analysis.summary}"
                                                    </p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 mt-6 border-t border-border/20">
                                                        {analysis.sections.map((section, sIdx) => (
                                                            <div key={sIdx} className="space-y-4">
                                                                <h3 className={cn("text-xs font-bold uppercase tracking-widest mb-2", biasText)}>
                                                                    {section.title}
                                                                </h3>
                                                                {Array.isArray(section.content) ? (
                                                                    <ul className="space-y-3">
                                                                        {section.content.map((item, iIdx) => (
                                                                            <li key={iIdx} className="text-[15px] leading-relaxed text-foreground/80 flex gap-3 items-start">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-border mt-2 shrink-0" />
                                                                                <span>{item}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <p className="text-[15px] leading-relaxed text-foreground/80">
                                                                        {section.content}
                                                                    </p>
                                                                )}
                                                                {section.sources && section.sources.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2 mt-4 pt-2">
                                                                        {section.sources.map((src, srcIdx) => (
                                                                            <StyledLink key={srcIdx} href={src.url} target="_blank" rel="noopener noreferrer" className="text-[10px] items-center inline-flex gap-1 uppercase tracking-wide bg-background border border-border px-2 py-1 rounded-md">
                                                                                {src.label} <ExternalLink className="w-2.5 h-2.5 opacity-50" />
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
                                    </AccordionContent>
                                </AccordionItem>
                            )}

                            {/* Analytical Profile */}
                            <AccordionItem value="profile" className="border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm data-[state=open]:shadow-md transition-all">
                                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 group">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2.5 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-anthropic font-bold text-foreground">
                                                Profil Analitic
                                            </h2>
                                            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-0.5 block">Ținte &amp; Retorică</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-8 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-muted/10 p-6 sm:p-8 rounded-2xl border border-border/30">
                                        <div>
                                            <h3 className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-muted-foreground mb-6">
                                                <Users className="w-4 h-4 opacity-50" /> Ținte Predilecte
                                            </h3>
                                            <div className="flex flex-wrap gap-2.5">
                                                {figure.targets.length > 0 ? (
                                                    figure.targets.map((target) => (
                                                        <span key={target} className="text-sm font-semibold border-2 border-border/40 px-4 py-2 rounded-xl text-foreground/90 font-anthropic bg-background shadow-xs hover:border-primary/30 hover:-translate-y-0.5 transition-all">{target}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground font-anthropic italic">Nimeni în special</span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-muted-foreground mb-6">
                                                <Zap className="w-4 h-4 opacity-50" /> Tonul Discursului
                                            </h3>
                                            <div className="space-y-5">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-semibold text-foreground/80 font-anthropic">Agresivitate verbală</span>
                                                        <span className="font-anthropic font-bold text-lg">{figure.rhetoric.aggressiveness}%</span>
                                                    </div>
                                                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                                                        <div className="bg-orange-500 h-full rounded-full" style={{ width: `${figure.rhetoric.aggressiveness}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-semibold text-foreground/80 font-anthropic">Ironie / Sarcasm</span>
                                                        <span className="font-anthropic font-bold text-lg">{figure.rhetoric.irony}%</span>
                                                    </div>
                                                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                                                        <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${figure.rhetoric.irony}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Statements Section */}
                            <AccordionItem value="statements" className="border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm data-[state=open]:shadow-md transition-all">
                                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 group">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2.5 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <MessageSquareQuote className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-anthropic font-bold text-foreground">
                                                A zis / N-a zis
                                            </h2>
                                            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-0.5 block">{displayStatements.length} declarații analizate</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 pt-2">
                                    {weakStatementsCount > 0 && (
                                        <div className="mb-8 p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex gap-4 items-start">
                                            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-800 dark:text-amber-500 mb-1">Avertisment Factual</h4>
                                                <p className="text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/80 font-anthropic">
                                                    {weakStatementsCount} dintre aceste declarații au doar trimiteri către profiluri externe fără un link direct către clipul brut. Sunt monitorizate.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-6">
                                        {displayStatements.map((statement, idx) => {
                                            const evidence = getStatementEvidence(statement);

                                            return (
                                                <div key={statement.id || idx} className="p-6 md:p-8 rounded-2xl bg-muted/10 border border-border/30 hover:border-border transition-colors group">
                                                    {/* Meta Header */}
                                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border/40">
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] md:text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
                                                            <span className="flex items-center gap-1"><History className="w-3 h-3" /> {statement.date}</span>
                                                            <div className="w-1 h-1 rounded-full bg-border" />
                                                            <span className="bg-muted px-2.5 py-1 rounded-md">{statement.topic}</span>
                                                            {statement.impact === 'high' && (
                                                                <>
                                                                    <div className="w-1 h-1 rounded-full bg-border" />
                                                                    <span className="text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                                                                        <Zap className="w-3 h-3" /> Impact
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border shadow-sm ${getStatementEvidenceBadgeClass(evidence.strength)}`}>
                                                            {evidence.badgeLabel}
                                                        </div>
                                                    </div>

                                                    {/* The Quote */}
                                                    <blockquote className="relative px-2 md:px-6">
                                                        <Quote className="absolute -left-2 -top-4 w-10 h-10 text-primary/10 rotate-180" />
                                                        <p className="relative z-10 font-medium text-foreground leading-[1.5] transition-colors italic font-anthropic text-[22px] md:text-3xl selection:bg-primary/20">
                                                            "{statement.text}"
                                                        </p>
                                                    </blockquote>

                                                    {/* Evidence Source Link */}
                                                    <div className="flex justify-end mt-6 mr-2 md:mr-6">
                                                        <StyledLink
                                                            href={evidence.href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`text-xs inline-flex items-center gap-1.5 font-bold tracking-widest uppercase px-4 py-2 rounded-lg transition-all ${
                                                                evidence.strength === "weak" 
                                                                ? "text-amber-700 bg-amber-50 hover:bg-amber-100" 
                                                                : "bg-primary/5 hover:bg-primary/10 text-primary"
                                                            }`}
                                                        >
                                                            {evidence.linkLabel}: {evidence.hostLabel} <ExternalLink className="w-3.5 h-3.5" />
                                                        </StyledLink>
                                                    </div>

                                                    {/* Weak Evidence Note */}
                                                    {evidence.note && (
                                                        <div className={`mt-6 p-4 rounded-xl border flex items-start gap-4 ${
                                                            evidence.strength === "weak"
                                                                ? "bg-rose-50 border-rose-200"
                                                                : "bg-amber-50 border-amber-200"
                                                        }`}>
                                                            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                                                                evidence.strength === "weak" ? "text-rose-600" : "text-amber-600"
                                                            }`} />
                                                            <div>
                                                                <span className={`block text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${
                                                                    evidence.strength === "weak" ? "text-rose-700" : "text-amber-700"
                                                                }`}>
                                                                    Notă privind dovezile
                                                                </span>
                                                                <p className={`text-sm leading-relaxed font-anthropic ${
                                                                    evidence.strength === "weak" ? "text-rose-900" : "text-amber-900"
                                                                }`}>
                                                                    {evidence.note}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Fact Check Box */}
                                                    {statement.factCheck && (
                                                        <div className="mt-8 overflow-hidden rounded-xl border border-primary/20 bg-card shadow-sm">
                                                            <div className="bg-primary/5 px-6 py-3 border-b border-primary/10 flex items-center gap-2">
                                                                <Sparkles className="w-4 h-4 text-primary" />
                                                                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Analiza ClarStiri & Fact-Check</span>
                                                            </div>
                                                            <div className="p-6">
                                                                <p className="text-base leading-relaxed text-foreground/90 font-anthropic mb-5">
                                                                    {statement.factCheck.text}
                                                                </p>
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mr-2 border-r border-border pr-3">Surse Verificate:</span>
                                                                    {statement.factCheck.sources.map((src, i) => (
                                                                        <StyledLink key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="text-[11px] items-center inline-flex gap-1.5 uppercase font-semibold tracking-wide border border-border/50 bg-background px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors">
                                                                            {src.label} <ExternalLink className="w-3 h-3 opacity-50" />
                                                                        </StyledLink>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Similar Profiles Section */}
                <div className="mt-24 pt-12 border-t border-border/40 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4">
                        <Users className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-anthropic font-bold text-foreground mb-2">
                            Alte Voci Analizate
                        </h2>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Cu profil și bias similar</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {PUBLIC_FIGURES.filter(f => f.id !== figure.id)
                            .sort((a, b) => Math.abs(a.bias.score - figure.bias.score) - Math.abs(b.bias.score - figure.bias.score))
                            .slice(0, 4)
                            .map(suggested => (
                                <Link
                                    key={suggested.id}
                                    to={`/voce/${suggested.slug}`}
                                    className="group flex flex-col h-full items-center text-center p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden relative"
                                >
                                    <div className={`absolute top-0 left-0 w-full h-1 ${
                                        suggested.bias.leaning.includes('left') ? 'bg-blue-500' :
                                        suggested.bias.leaning.includes('right') ? 'bg-red-500' : 'bg-purple-500'
                                    }`}></div>
                                    
                                    <div className="relative mb-5 mt-2">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden transition-transform duration-500 shadow-sm p-1 border-2 border-border/40 group-hover:border-primary/30 group-hover:scale-105">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-muted/20">
                                                <img
                                                    src={suggested.image}
                                                    alt={suggested.name}
                                                    className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col flex-1 w-full justify-between items-center">
                                        <h3 className="font-bold text-lg sm:text-[20px] transition-colors leading-tight mb-2 font-anthropic truncate w-full">
                                            {suggested.name}
                                        </h3>
                                        <div className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold border ${
                                            suggested.bias.leaning.includes('left') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            suggested.bias.leaning.includes('right') ? 'bg-red-50 text-red-700 border-red-200' : 
                                            'bg-purple-50 text-purple-700 border-purple-200'
                                        }`}>
                                            {suggested.bias.leaning.replace('-', ' ')}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default VoiceProfile;

function getBiasLabel(leaning: 'left' | 'center-left' | 'center' | 'center-right' | 'right'): string {
    if (leaning === 'left') return 'Stânga';
    if (leaning === 'center-left') return 'Centru-Stânga';
    if (leaning === 'center-right') return 'Centru-Dreapta';
    if (leaning === 'right') return 'Dreapta';
    return 'Centru';
}

function getBiasBadgeClass(leaning: 'left' | 'center-left' | 'center' | 'center-right' | 'right'): string {
    if (leaning === 'left' || leaning === 'center-left') return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900';
    if (leaning === 'right' || leaning === 'center-right') return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900';
    return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900';
}
