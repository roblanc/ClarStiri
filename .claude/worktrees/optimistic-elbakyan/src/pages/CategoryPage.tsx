import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { NewsListItem } from "@/components/NewsListItem";
import { useAggregatedNews } from "@/hooks/useNews";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getCategoryBySlug, matchesCategory, CATEGORIES } from "@/utils/categories";

const CategoryPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: allStories, isLoading, error } = useAggregatedNews(100);

    // Get category info
    const category = slug ? getCategoryBySlug(slug) : undefined;

    // Filter stories by category
    const filteredStories = allStories?.filter(story => {
        if (!slug) return false;

        // Check if any of the story's sources match this category
        const matchingSource = story.sources.some(source =>
            matchesCategory(slug, source.category, source.title, source.description)
        );

        // Also check the aggregated story title
        const matchesTitle = matchesCategory(slug, undefined, story.title, story.description);

        return matchingSource || matchesTitle;
    }) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Se încarcă știrile...</p>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Înapoi la toate știrile
                    </Link>

                    <div className="text-center py-16">
                        <h1 className="text-2xl font-bold text-foreground mb-4">
                            Categoria nu a fost găsită
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            Categoria "{slug}" nu există.
                        </p>

                        <div className="flex flex-wrap justify-center gap-2 mt-8">
                            {CATEGORIES.map(cat => (
                                <Link
                                    key={cat.slug}
                                    to={`/categorie/${cat.slug}`}
                                    className="px-4 py-2 bg-card border border-border rounded-full text-sm hover:bg-secondary transition-colors"
                                >
                                    {cat.icon} {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-6">
                {/* Back Link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Înapoi la toate știrile
                </Link>

                {/* Category Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{category.icon}</span>
                        <h1 className="text-3xl font-bold text-foreground">
                            {category.name}
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        {filteredStories.length} știri în această categorie
                    </p>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border">
                    {CATEGORIES.map(cat => (
                        <Link
                            key={cat.slug}
                            to={`/categorie/${cat.slug}`}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${cat.slug === slug
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }`}
                        >
                            {cat.icon} {cat.name}
                        </Link>
                    ))}
                </div>

                {/* Stories List */}
                {filteredStories.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground text-lg mb-4">
                            Nu am găsit știri în categoria "{category.name}" momentan.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Încearcă o altă categorie sau revino mai târziu.
                        </p>
                    </div>
                ) : (
                    <div className="bg-card rounded-lg border border-border divide-y divide-border">
                        {filteredStories.map((story) => (
                            <NewsListItem
                                key={story.id}
                                story={{
                                    id: story.id,
                                    title: story.title,
                                    image: story.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80",
                                    bias: story.bias,
                                    category: category.name,
                                    sourcesCount: story.sourcesCount,
                                    sources: story.sources.map(s => ({
                                        name: s.source.name,
                                        url: s.source.url,
                                        bias: s.source.bias,
                                    })),
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-card border-t border-border mt-12">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">thesite<span className="text-primary">.ro</span></span>
                        </div>
                        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
                            <Link to="/despre" className="hover:text-foreground transition-colors">Despre</Link>
                            <Link to="/metodologie" className="hover:text-foreground transition-colors">Metodologie</Link>
                            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                        </nav>
                        <p className="text-sm text-muted-foreground">
                            © 2025 thesite.ro
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CategoryPage;
