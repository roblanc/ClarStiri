import postgres from 'postgres';
import { NEWS_SOURCES, RSSNewsItem, NewsSource } from './shared.js';
import { AggregatedStory, calculateBiasDistribution, calculateBlindspot, getTimeAgo } from './aggregation.js';

/**
 * Permanent story archive in Postgres (schema `thesite`), so /stire/<id> links never expire.
 *
 * Redis stays the primary, fast store; this is a write-behind copy plus a read fallback.
 * Every call is optional: without THESITE_DATABASE_URL, or on any DB error, callers just
 * get nothing back and carry on.
 *
 * Only slim fields are stored (source id, not the embedded NewsSource / biasAnalysis).
 * A source row is inserted once and never overwritten, so its first_seen_at records when
 * thesite.ro first attached that article to the story.
 */

type Sql = ReturnType<typeof postgres>;
let sqlClient: Sql | null = null;

function getSql(): Sql | null {
    const url = process.env.THESITE_DATABASE_URL;
    if (!url) return null;
    // Supabase transaction pooler: no prepared statements, one connection per function instance.
    sqlClient ??= postgres(url, { prepare: false, max: 1, idle_timeout: 20, connect_timeout: 10 });
    return sqlClient;
}

function toTimestamp(value: string | undefined): string | null {
    if (!value) return null;
    const t = Date.parse(value);
    return Number.isNaN(t) ? null : new Date(t).toISOString();
}

export async function archiveStories(stories: AggregatedStory[]): Promise<{ stories: number; sources: number } | null> {
    const sql = getSql();
    if (!sql || stories.length === 0) return null;

    const storyRows = stories.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description || '',
        image: s.image ?? null,
        main_category: s.mainCategory ?? null,
        bias_left: Math.round(s.bias?.left ?? 0),
        bias_center: Math.round(s.bias?.center ?? 0),
        bias_right: Math.round(s.bias?.right ?? 0),
        blindspot: s.blindspot ?? null,
        published_at: toTimestamp(s.publishedAt),
    }));

    const seen = new Set<string>();
    const sourceRows = stories.flatMap(s => s.sources.flatMap(src => {
        const key = `${s.id}\u0000${src.link}`;
        if (!src.link || seen.has(key)) return [];
        seen.add(key);
        return [{
            story_id: s.id,
            link: src.link,
            source_id: src.source?.id ?? 'unknown',
            title: src.title,
            description: (src.description || '').slice(0, 500),
            image_url: src.imageUrl ?? null,
            pub_date: toTimestamp(src.pubDate),
        }];
    }));

    await sql.begin(async tx => {
        await tx`
            insert into thesite.stories ${tx(storyRows)}
            on conflict (id) do update set
                title = excluded.title,
                description = excluded.description,
                image = coalesce(excluded.image, thesite.stories.image),
                main_category = excluded.main_category,
                bias_left = excluded.bias_left,
                bias_center = excluded.bias_center,
                bias_right = excluded.bias_right,
                blindspot = excluded.blindspot,
                published_at = coalesce(thesite.stories.published_at, excluded.published_at),
                last_seen_at = now()`;
        // Chunked to stay well under Postgres' 65k bind-parameter limit.
        for (let i = 0; i < sourceRows.length; i += 1000) {
            await tx`
                insert into thesite.story_sources ${tx(sourceRows.slice(i, i + 1000))}
                on conflict (story_id, link) do nothing`;
        }
    });

    return { stories: storyRows.length, sources: sourceRows.length };
}

const SOURCES_BY_ID = new Map(NEWS_SOURCES.map(s => [s.id, s]));

function resolveSource(id: string): NewsSource {
    return SOURCES_BY_ID.get(id) ?? {
        id,
        name: id,
        url: '',
        rssUrl: '',
        bias: 'center',
        factuality: 'mixed',
        category: 'mainstream',
    };
}

interface StoryRow {
    id: string;
    title: string;
    description: string;
    image: string | null;
    main_category: string | null;
    blindspot: string | null;
    published_at: Date | null;
    first_seen_at: Date;
}

interface SourceRow {
    link: string;
    source_id: string;
    title: string;
    description: string;
    image_url: string | null;
    pub_date: Date | null;
    first_seen_at: Date;
}

export async function loadArchivedStory(id: string): Promise<AggregatedStory | null> {
    const sql = getSql();
    if (!sql) return null;

    const [story] = await sql<StoryRow[]>`
        select id, title, description, image, main_category, blindspot, published_at, first_seen_at
        from thesite.stories where id = ${id}`;
    if (!story) return null;

    const rows = await sql<SourceRow[]>`
        select link, source_id, title, description, image_url, pub_date, first_seen_at
        from thesite.story_sources where story_id = ${id}
        order by pub_date desc nulls last`;

    const sources: RSSNewsItem[] = rows.map((r, i) => ({
        id: `${id}-${i}`,
        title: r.title,
        description: r.description,
        link: r.link,
        pubDate: (r.pub_date ?? r.first_seen_at).toUTCString(),
        imageUrl: r.image_url ?? undefined,
        source: resolveSource(r.source_id),
    }));

    const bias = calculateBiasDistribution(sources);
    const publishedAt = (story.published_at ?? story.first_seen_at).toISOString();
    return {
        id: story.id,
        title: story.title,
        description: story.description,
        image: story.image ?? undefined,
        sources,
        sourcesCount: sources.length,
        bias,
        blindspot: calculateBlindspot(bias, sources.length),
        mainCategory: story.main_category ?? 'Actualitate',
        publishedAt,
        timeAgo: getTimeAgo(publishedAt),
    };
}
