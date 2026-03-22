import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SourceProfileCard } from '@/components/SourceProfileCard';
import { SourceArchive } from '@/components/SourceArchive';
import { SOURCE_CATALOG_BY_ID } from '@/data/sourceCatalog';

export default function SourceDetail() {
    const { id } = useParams<{ id: string }>();
    const source = id ? SOURCE_CATALOG_BY_ID[id] : undefined;

    if (!source || !source.profile) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-6">
                    <Link
                        to="/surse"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Înapoi la surse
                    </Link>
                    <div className="text-center py-16">
                        <h1 className="text-2xl font-bold text-foreground mb-4">Sursă negăsită</h1>
                        <p className="text-muted-foreground">Sursa solicitată nu există sau nu are profil documentat.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
                <Link
                    to="/surse"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Înapoi la surse
                </Link>

                <SourceProfileCard source={source} profile={source.profile} />

                <SourceArchive sourceId={source.id} domain={source.url} />
            </main>
            <Footer />
        </div>
    );
}
