import { Helmet } from 'react-helmet-async';

interface NewsSchemaProps {
    story: {
        title: string;
        description: string;
        image: string;
        datePublished: string;
        dateModified: string;
        authorName: string;
        publisherName: string;
        publisherLogo: string;
        url: string;
    };
}

export function NewsSchema({ story }: NewsSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": story.title,
        "image": [story.image],
        "datePublished": story.datePublished,
        "dateModified": story.dateModified,
        "author": [{
            "@type": "Person",
            "name": story.authorName,
            "url": story.url
        }],
        "publisher": {
            "@type": "Organization",
            "name": story.publisherName,
            "logo": {
                "@type": "ImageObject",
                "url": story.publisherLogo
            }
        },
        "description": story.description,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": story.url
        }
    };

    const pageTitle = `${story.title} | thesite.ro`;
    const description = story.description || 'Analiză din surse multiple pe thesite.ro';

    return (
        <Helmet>
            {/* Title & description */}
            <title>{pageTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={story.url} />

            {/* Open Graph (Facebook, WhatsApp, Telegram) */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={story.image} />
            <meta property="og:url" content={story.url} />
            <meta property="og:site_name" content="thesite.ro" />
            <meta property="og:locale" content="ro_RO" />
            <meta property="article:published_time" content={story.datePublished} />
            <meta property="article:modified_time" content={story.dateModified} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@thesitero" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={story.image} />

            {/* JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}
