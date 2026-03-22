import { useState, useEffect } from 'react';
import { ArrowRight, Heart, Zap, Eye, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SplashPageProps {
    onContinue: () => void;
    isDataReady: boolean;
}

export function SplashPage({ onContinue, isDataReady }: SplashPageProps) {
    const [progress, setProgress] = useState(0);
    const [canSkip, setCanSkip] = useState(false);
    const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) { clearInterval(interval); return 100; }
                return prev + 2;
            });
        }, 50);
        const skipTimer = setTimeout(() => setCanSkip(true), 2000);
        const minTimer = setTimeout(() => setHasMinTimeElapsed(true), 8000);
        return () => { clearInterval(interval); clearTimeout(skipTimer); clearTimeout(minTimer); };
    }, []);

    useEffect(() => {
        if (hasMinTimeElapsed && isDataReady) {
            const timer = setTimeout(onContinue, 500);
            return () => clearTimeout(timer);
        }
    }, [hasMinTimeElapsed, isDataReady, onContinue]);

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-6 text-center">
                <div className="mb-8">
                    <img src="/ethics-logo.png" alt="ClarȘtiri" className="w-36 h-36 sm:w-24 sm:h-24 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-foreground">Clar<span className="text-primary">Știri</span></h1>
                </div>
                <p className="text-xl text-muted-foreground mb-8">Citești. Compari. Decizi.</p>
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card/50 border border-border/50">
                        <Eye className="w-6 h-6 text-primary" />
                        <span className="text-sm text-muted-foreground">Transparență</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card/50 border border-border/50">
                        <Zap className="w-6 h-6 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">40+ Surse</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card/50 border border-border/50">
                        <Heart className="w-6 h-6 text-red-500" />
                        <span className="text-sm text-muted-foreground">Independent</span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button variant="outline" size="lg" className="gap-2 border-primary/30 hover:bg-primary/10"
                        onClick={() => window.open('https://ko-fi.com/clarstiri', '_blank')}>
                        <Coffee className="w-5 h-5" />
                        Susține proiectul
                    </Button>
                    <Button size="lg" className="gap-2" onClick={onContinue} disabled={!canSkip}>
                        Mergi la știri
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
                <div className="max-w-xs mx-auto">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {isDataReady ? 'Gata! Redirecționare...' : 'Se încarcă știrile...'}
                    </p>
                </div>
                {canSkip && (
                    <button onClick={onContinue} className="mt-6 text-sm text-muted-foreground hover:text-foreground underline">
                        sau continuă fără să aștepți →
                    </button>
                )}
            </div>
        </div>
    );
}
