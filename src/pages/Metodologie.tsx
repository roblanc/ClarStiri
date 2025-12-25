import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { NEWS_SOURCES } from "@/types/news";
import { SourceFavicon } from "@/components/SourceFavicon";
import { ChevronLeft, Info, Eye, BarChart3, Shield, AlertTriangle } from "lucide-react";

export default function Metodologie() {
    // Grupează sursele pe bias
    const sourcesByBias = {
        left: NEWS_SOURCES.filter(s => s.bias === 'left'),
        'center-left': NEWS_SOURCES.filter(s => s.bias === 'center-left'),
        center: NEWS_SOURCES.filter(s => s.bias === 'center'),
        'center-right': NEWS_SOURCES.filter(s => s.bias === 'center-right'),
        right: NEWS_SOURCES.filter(s => s.bias === 'right'),
    };

    const biasLabels: Record<string, { name: string; color: string; description: string }> = {
        'left': {
            name: 'Stânga',
            color: 'bg-blue-600',
            description: 'Publicații cu orientare progresistă, pro-europeană, care susțin de regulă partidele de stânga și politici sociale liberale.'
        },
        'center-left': {
            name: 'Centru-Stânga',
            color: 'bg-blue-400',
            description: 'Publicații cu înclinație moderată spre stânga, adesea critice față de corupție și cu focus pe jurnalism de investigații.'
        },
        'center': {
            name: 'Centru',
            color: 'bg-gray-500',
            description: 'Publicații care încearcă să mențină un echilibru între perspective, fără o înclinație politică evidentă.'
        },
        'center-right': {
            name: 'Centru-Dreapta',
            color: 'bg-red-400',
            description: 'Publicații cu înclinație moderată spre dreapta, adesea favorabile politicilor economice liberale și conservatoare moderat.'
        },
        'right': {
            name: 'Dreapta',
            color: 'bg-red-600',
            description: 'Publicații cu orientare conservatoare, naționalistă sau suveranistă, adesea critice față de UE și instituțiile internaționale.'
        },
    };

    const factualityLabels: Record<string, { name: string; color: string }> = {
        'high': { name: 'Ridicată', color: 'text-green-600' },
        'mixed': { name: 'Mixtă', color: 'text-yellow-600' },
        'low': { name: 'Scăzută', color: 'text-red-600' },
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back link */}
                <Link
                    to="/"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Înapoi la Știri
                </Link>

                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Cum Funcționează ClarȘtiri
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Metodologia noastră pentru agregarea și clasificarea știrilor din România
                </p>

                {/* Ce este ClarȘtiri */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Ce este ClarȘtiri?</h2>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-6">
                        <p className="text-foreground mb-4">
                            ClarȘtiri este un agregator de știri care colectează articole de la <strong>{NEWS_SOURCES.length} surse media românești</strong> și le grupează pe subiecte, oferindu-ți o perspectivă completă asupra modului în care diferite publicații acoperă aceleași evenimente.
                        </p>
                        <p className="text-muted-foreground">
                            Inspirat de platforme precum Ground News, scopul nostru este să te ajutăm să înțelegi ce povești sunt acoperite - și de cine - pentru a-ți forma o opinie mai informată.
                        </p>
                    </div>
                </section>

                {/* Ce înseamnă Bias */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Ce Înseamnă "Bias"?</h2>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-6">
                        <p className="text-foreground mb-4">
                            <strong>Bias-ul editorial</strong> se referă la tendința unei publicații de a prezenta știrile dintr-o anumită perspectivă politică sau ideologică. Aceasta poate influența:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                            <li>Ce știri alege să acopere (și ce omite)</li>
                            <li>Cum titlulează și formulează articolele</li>
                            <li>Ce surse și experți citează</li>
                            <li>Ce context oferă sau omite</li>
                        </ul>

                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Important de reținut</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        <strong>Bias-ul NU înseamnă că o publicație minte.</strong> O sursă poate fi factuală dar biased - prezintă fapte reale, dar din perspectiva care îi convine. Nici "centru" nu înseamnă automat "corect" - înseamnă doar că publicația nu are o orientare politică clară.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Clasificarea în context românesc */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Bias în Context Românesc</h2>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-6">
                        <p className="text-foreground mb-4">
                            Clasificările noastre sunt adaptate <strong>contextului politic românesc</strong>, care diferă de cel american. În România, liniile de demarcație includ:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                            <li><strong>Stânga:</strong> Pro-UE, pro-NATO, anti-corupție, progresist</li>
                            <li><strong>Dreapta:</strong> Suveranist, naționalist, conservator tradițional</li>
                            <li><strong>Centru:</strong> Echilibru sau lipsă de orientare clară</li>
                        </ul>
                        <p className="text-sm text-muted-foreground">
                            Clasificările sunt bazate pe analiza editorială a publicațiilor - titluri, selectarea știrilor, tonul general - nu pe declarații oficiale ale acestora.
                        </p>
                    </div>
                </section>

                {/* Bara de Bias */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Cum Citești Bara de Bias</h2>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-6">
                        <p className="text-foreground mb-4">
                            Pentru fiecare știre agregată, afișăm o bară colorată care arată distribuția surselor:
                        </p>

                        {/* Demo Bias Bar */}
                        <div className="mb-6">
                            <div className="flex h-8 rounded overflow-hidden text-sm font-medium mb-2">
                                <div className="bg-bias-left flex items-center justify-center text-white" style={{ width: '30%' }}>
                                    S 30%
                                </div>
                                <div className="bg-bias-center flex items-center justify-center text-white" style={{ width: '45%' }}>
                                    C 45%
                                </div>
                                <div className="bg-bias-right flex items-center justify-center text-white" style={{ width: '25%' }}>
                                    D 25%
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                                Exemplu: 30% surse stânga, 45% centru, 25% dreapta
                            </p>
                        </div>

                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded bg-bias-left"></span>
                                <span className="text-foreground"><strong>Albastru (S)</strong> = Surse de stânga și centru-stânga</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded bg-bias-center"></span>
                                <span className="text-foreground"><strong>Gri (C)</strong> = Surse de centru</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded bg-bias-right"></span>
                                <span className="text-foreground"><strong>Roșu (D)</strong> = Surse de dreapta și centru-dreapta</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Punct Orbit */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Eye className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Ce Sunt "Punctele Orbite"?</h2>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-6">
                        <p className="text-foreground mb-4">
                            Un <strong>"Punct Orbit"</strong> (Blindspot) este o știre acoperită disproporționat de sursele dintr-o singură parte a spectrului politic.
                        </p>
                        <p className="text-muted-foreground mb-4">
                            De exemplu, dacă o știre e raportată de 80% surse de stânga și doar 5% de dreapta, aceasta sugerează că audiențele de dreapta s-ar putea să nu fie la curent cu acest subiect - și invers.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Detectăm automat povești unde distribuția depășește 60% într-o direcție și le marcăm ca "Punct Orbit" pentru a te alerta asupra potențialelor lacune informaționale.
                        </p>
                    </div>
                </section>

                {/* Factualitate */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Scorul de Factualitate</h2>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-6">
                        <p className="text-foreground mb-4">
                            Pe lângă bias, evaluăm și <strong>factualitatea</strong> fiecărei surse - cât de des publică informații verificabile și corecte:
                        </p>
                        <ul className="space-y-2 text-sm mb-4">
                            <li className="flex items-center gap-2">
                                <span className="font-medium text-green-600">● Ridicată</span>
                                <span className="text-muted-foreground">— Rar publică informații false, corectează erorile</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-medium text-yellow-600">● Mixtă</span>
                                <span className="text-muted-foreground">— Ocazional publică informații neconfirmate sau senzaționalism</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-medium text-red-600">● Scăzută</span>
                                <span className="text-muted-foreground">— Frecvent publică informații false sau înșelătoare</span>
                            </li>
                        </ul>
                        <p className="text-sm text-muted-foreground">
                            Clasificările de factualitate sunt bazate pe istoricul publicațiilor, verificări de fapte anterioare și practica jurnalistică observată.
                        </p>
                    </div>
                </section>

                {/* Lista Surselor */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold text-foreground mb-4">
                        Toate Sursele Noastre ({NEWS_SOURCES.length})
                    </h2>

                    <div className="space-y-8">
                        {Object.entries(sourcesByBias).map(([bias, sources]) => (
                            sources.length > 0 && (
                                <div key={bias} className="bg-card rounded-lg border border-border p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`w-4 h-4 rounded ${biasLabels[bias].color}`}></span>
                                        <h3 className="font-bold text-foreground">{biasLabels[bias].name}</h3>
                                        <span className="text-sm text-muted-foreground">({sources.length} surse)</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {biasLabels[bias].description}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {sources.map(source => (
                                            <div
                                                key={source.id}
                                                className="flex items-center gap-3 p-2 rounded bg-muted/50"
                                            >
                                                <SourceFavicon source={source} size="sm" showRing={false} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-foreground truncate">
                                                        {source.name}
                                                    </p>
                                                    <p className={`text-xs ${factualityLabels[source.factuality].color}`}>
                                                        Factualitate: {factualityLabels[source.factuality].name}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </section>

                {/* Disclaimer */}
                <section className="mb-12">
                    <div className="bg-muted/50 rounded-lg p-6">
                        <h3 className="font-bold text-foreground mb-2">Disclaimer</h3>
                        <p className="text-sm text-muted-foreground">
                            Clasificările noastre sunt <strong>subiective</strong> și bazate pe propria analiză editorială.
                            Nu suntem afiliați cu nicio publicație listată, și nu pretindem că clasificările sunt perfecte.
                            Te încurajăm să citești din surse diverse și să îți formezi propria opinie.
                        </p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-card border-t border-border mt-12">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">Clar<span className="text-primary">Știri</span></span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2025 ClarȘtiri
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
