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

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}
