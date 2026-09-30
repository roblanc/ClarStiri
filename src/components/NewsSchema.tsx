import { Helmet } from 'react-helmet-async';
import { buildStoryOgImageUrl, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, SITE_URL } from '../../shared/ogImage';

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
        /** When given, og:image/twitter:image use the generated share card (same URL api/story-page.ts emits for bots). */
        id?: string;
        bias?: { left: number; center: number; right: number };
        sourcesCount?: number;
        section?: string;
    };
}

const absoluteUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`);

export function NewsSchema({ story }: NewsSchemaProps) {
    const photo = absoluteUrl(story.image);
    const shareImage = story.id
        ? buildStoryOgImageUrl({ id: story.id, title: story.title, bias: story.bias, sourcesCount: story.sourcesCount })
        : photo;
    const pageTitle = `${story.title} | thesite.ro`;
    const description = story.description
        || (story.sourcesCount
            ? `${story.title}. Vezi cum relatează ${story.sourcesCount} surse din toate perspectivele.`
            : 'Analiză din surse multiple pe thesite.ro');
    const imageAlt = `${story.title} — acoperire stânga / centru / dreapta pe thesite.ro`;

    // Mirrors the NewsArticle block api/story-page.ts injects for crawlers, so the hydrated page
    // and the bot snapshot agree. The aggregate is credited to thesite.ro as an organization.
    const schema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": story.title.length > 110 ? `${story.title.slice(0, 109).trimEnd()}…` : story.title,
        "image": [photo],
        "datePublished": story.datePublished,
        "dateModified": story.dateModified,
        "author": [{
            "@type": "Organization",
            "name": story.authorName,
            "url": SITE_URL
        }],
        "publisher": {
            "@type": "Organization",
            "name": story.publisherName,
            "logo": {
                "@type": "ImageObject",
                "url": story.publisherLogo
            }
        },
        "description": description,
        ...(story.section ? { "articleSection": story.section } : {}),
        "inLanguage": "ro-RO",
        "isAccessibleForFree": true,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": story.url
        }
    };

    return (
        <Helmet>
            {/* Title & description */}
            <title>{pageTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={story.url} />

            {/* Geo Localization */}
            <meta name="geo.region" content="RO" />
            <meta name="geo.placename" content="Romania" />

            {/* Open Graph (Facebook, WhatsApp, Telegram) */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={shareImage} />
            {story.id && <meta property="og:image:type" content="image/png" />}
            {story.id && <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />}
            {story.id && <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />}
            <meta property="og:image:alt" content={imageAlt} />
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
            <meta name="twitter:image" content={shareImage} />
            <meta name="twitter:image:alt" content={imageAlt} />

            {/* JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}
