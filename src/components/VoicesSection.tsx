import { Link } from 'react-router-dom';
import { PUBLIC_FIGURES } from '@/data/publicFigures';
import { ChevronRight } from 'lucide-react';

export function VoicesSection() {
    return (
        <section className="bg-card border-y border-border py-8 mb-8">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-2 h-6 bg-primary rounded-full"></span>
                            Barometru Opinie
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Analiza poziționării figurilor publice din România
                        </p>
                    </div>
                    <Link
                        to="/voci"
                        className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                        Vezi toți
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                    {PUBLIC_FIGURES.map((figure) => (
                        <Link
                            key={figure.id}
                            to={`/voce/${figure.slug}`}
                            className="flex flex-col items-center min-w-[120px] group transition-transform hover:-translate-y-1"
                        >
                            <div className="relative mb-3">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
                                    <img
                                        src={figure.image}
                                        alt={figure.name}
                                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                        loading="lazy"
                                    />
                                </div>
                                {/* Bias Indicator Badge */}
                                <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white
                  ${getScoreColor(figure.bias.score)}`}
                                    title={`Bias: ${figure.bias.leaning}`}
                                >
                                    {getScoreLabel(figure.bias.score)}
                                </div>
                            </div>

                            <h3 className="font-bold text-sm text-center line-clamp-1 group-hover:text-primary transition-colors">
                                {figure.name}
                            </h3>
                            <p className="text-xs text-muted-foreground text-center">
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
