import { Link } from 'react-router-dom';
import { PUBLIC_FIGURES } from '@/data/publicFigures';
import { ChevronRight } from 'lucide-react';

export function VoicesSection() {
    return (
        <section className="py-12 mb-12 border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-serif text-foreground">
                            Barometru Opinie
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-2">
                            Analiza poziționării figurilor publice din România
                        </p>
                    </div>
                    <Link
                        to="/influenceri"
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:opacity-50 transition-colors flex items-center gap-1"
                    >
                        Vezi toți
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="flex flex-wrap items-start gap-8 lg:gap-10">
                    {PUBLIC_FIGURES.map((figure) => (
                        <Link
                            key={figure.id}
                            to={`/voce/${figure.slug}`}
                            className="flex flex-col items-center min-w-[120px] group transition-transform hover:-translate-y-1"
                        >
                            <div className="relative mb-4">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-border group-hover:border-foreground transition-colors bg-secondary">
                                    <img
                                        src={figure.image}
                                        alt={figure.name}
                                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                        loading="lazy"
                                    />
                                </div>
                                {/* Bias Indicator Badge */}
                                <div className={`absolute bottom-1 right-1 w-6 h-6 md:w-8 md:h-8 rounded-full border border-background flex items-center justify-center text-[10px] md:text-xs font-bold text-white
                                  ${getScoreColor(figure.bias.score)}`}
                                    title={`Bias: ${figure.bias.leaning}`}
                                >
                                    {getScoreLabel(figure.bias.score)}
                                </div>
                            </div>

                            <h3 className="font-title font-bold text-lg text-center leading-tight group-hover:opacity-70 transition-opacity text-foreground">
                                {figure.name}
                            </h3>
                            <span className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.12em] ${getBiasBadgeClass(figure.bias.score)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${getScoreColor(figure.bias.score)}`} />
                                {getBiasLabel(figure.bias.score)}
                            </span>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center mt-2 max-w-[120px]">
                                {figure.role}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

function getScoreColor(score: number): string {
    if (score <= -30) return 'bg-blue-500'; // Left
    if (score >= 30) return 'bg-red-500';   // Right
    return 'bg-purple-500';                 // Center
}

function getScoreLabel(score: number): string {
    if (score <= -30) return 'S';
    if (score >= 30) return 'D';
    return 'C';
}

function getBiasLabel(score: number): string {
    if (score <= -30) return 'Stânga';
    if (score >= 30) return 'Dreapta';
    return 'Centru';
}

function getBiasBadgeClass(score: number): string {
    if (score <= -30) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 30) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
}
