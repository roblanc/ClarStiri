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
                        <h1 className="text-2xl font-bold flex items-center gap-2 font-anthropic">
                            <Users className="w-6 h-6 text-primary" />
                            Barometru Opinie
                        </h1>
                        <p className="text-muted-foreground text-sm font-anthropic">
                            Analiza poziționării figurilor publice din spațiul românesc.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {PUBLIC_FIGURES.map((figure) => (
                        <Link
                            key={figure.id}
                            to={`/voce/${figure.slug}`}
                            className="group flex flex-col h-full items-center text-center py-6 px-2 hover:opacity-80 transition-all duration-300"
                        >
                            <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden transition-all shadow-sm">
                                    <img
                                        src={figure.image}
                                        alt={figure.name}
                                        className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                                        loading="lazy"
                                    />
                                </div>

                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background shadow-sm
                                    ${figure.bias.leaning.includes('left') ? 'bg-blue-500' :
                                        figure.bias.leaning.includes('right') ? 'bg-red-500' : 'bg-purple-500'}`}
                                />
                            </div>

                            <div className="flex flex-col flex-1 w-full">
                                <div className="mb-3 min-h-[56px] flex flex-col justify-center">
                                    <h3 className="font-bold text-lg sm:text-xl transition-colors leading-tight mb-1 line-clamp-1 font-anthropic">
                                        {figure.name}
                                    </h3>
                                    <p className="text-xs font-medium text-muted-foreground line-clamp-1">
                                        {figure.role}
                                    </p>
                                </div>

                                <div className="mt-2 text-xs text-muted-foreground/60">
                                    <span className="capitalize">{figure.bias.leaning.replace('-', ' ')}</span>
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
