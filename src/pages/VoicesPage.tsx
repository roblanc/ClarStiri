import { Header } from "@/components/Header";
import { PUBLIC_FIGURES } from "@/data/publicFigures";
import { Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const VoicesPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary" />
                            Barometru Opinie
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Analiza poziționării figurilor publice din spațiul românesc.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {PUBLIC_FIGURES.map((figure) => (
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

                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background shadow-sm
                                    ${figure.bias.leaning.includes('left') ? 'bg-blue-500' :
                                        figure.bias.leaning.includes('right') ? 'bg-red-500' : 'bg-purple-500'}`}
                                />
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
                                        <span className={`text-[10px] font-black ${figure.bias.score < -15 ? 'text-blue-500' :
                                            figure.bias.score > 15 ? 'text-red-500' : 'text-purple-500'
                                            }`}>
                                            {figure.bias.score > 0 ? `+${figure.bias.score}` : figure.bias.score}
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden relative">
                                        <div className="absolute top-0 bottom-0 w-px bg-foreground/10 left-1/2 z-10" />
                                        <div
                                            className={`h-full absolute top-0 ${figure.bias.score < -15 ? 'bg-blue-500' :
                                                figure.bias.score > 15 ? 'bg-red-500' : 'bg-purple-500'
                                                } transition-all duration-1000`}
                                            style={{
                                                left: figure.bias.score < 0 ? `${50 + (figure.bias.score / 2)}%` : '50%',
                                                width: `${Math.abs(figure.bias.score) / 2}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[7px] font-black uppercase tracking-tighter text-muted-foreground/40 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span>Stânga</span>
                                        <span>Dreapta</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default VoicesPage;
