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

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {PUBLIC_FIGURES.map((figure) => (
                        <Link
                            key={figure.id}
                            to={`/voce/${figure.slug}`}
                            className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-primary/50"
                        >
                            <div className="aspect-square relative overflow-hidden bg-muted">
                                <img
                                    src={figure.image}
                                    alt={figure.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />

                                {/* Bias Badge Overlay */}
                                <div className={`absolute top-3 right-3 px-2 py-1 rounded bg-background/90 backdrop-blur text-xs font-bold shadow-sm border
                  ${figure.bias.leaning.includes('left') ? 'text-blue-600 border-blue-200' :
                                        figure.bias.leaning.includes('right') ? 'text-red-600 border-red-200' :
                                            'text-purple-600 border-purple-200'}`}
                                >
                                    {figure.bias.leaning === 'left' ? 'Stânga' :
                                        figure.bias.leaning === 'right' ? 'Dreapta' :
                                            figure.bias.leaning === 'center-left' ? 'Centru-Stânga' :
                                                figure.bias.leaning === 'center-right' ? 'Centru-Dreapta' : 'Centru'}
                                </div>
                            </div>

                            <div className="p-4 text-center">
                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                    {figure.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {figure.role}
                                </p>

                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${figure.bias.score < 0 ? 'bg-blue-500' : 'bg-red-500'
                                            }`}
                                        style={{
                                            width: `${Math.abs(figure.bias.score)}%`,
                                            marginLeft: figure.bias.score < 0 ? 'auto' : '0',
                                            marginRight: figure.bias.score > 0 ? 'auto' : '0',
                                            // Center alignment trick
                                            position: 'relative',
                                            left: figure.bias.score > 0 ? '50%' : 'auto',
                                            right: figure.bias.score < 0 ? '50%' : 'auto',
                                        }}
                                    />
                                    {/* Since the complex bar logic is tricky here, let's keep it simpler for the card list */}
                                </div>

                                <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1 px-1">
                                    <span>Stânga</span>
                                    <span>Centru</span>
                                    <span>Dreapta</span>
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
