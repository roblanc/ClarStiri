import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SourceProfileCard } from '@/components/SourceProfileCard';
import { SourceArchive } from '@/components/SourceArchive';
import { SOURCE_CATALOG_BY_ID } from '@/data/sourceCatalog';
import { Helmet } from 'react-helmet-async';

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

    const biasLabel: Record<string, string> = {
        'left': 'Stânga', 'center-left': 'Centru-Stânga',
        'center': 'Centru', 'center-right': 'Centru-Dreapta', 'right': 'Dreapta',
    };
    const pageTitle = `${source.name} | Profil Editorial | thesite.ro`;
    const pageDesc = `Profil editorial ${source.name} — orientare ${biasLabel[source.bias] ?? source.bias}, factualitate ${source.factuality}. Analiză de bias și arhivă de știri pe thesite.ro.`;
    const pageUrl = `https://thesite.ro/surses/${source.id}`;

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <link rel="canonical" href={pageUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDesc} />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDesc} />
            </Helmet>
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
