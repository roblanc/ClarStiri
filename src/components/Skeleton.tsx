import { cn } from "@/lib/utils";
import {
    FEED_GRID_CLASS,
    POSTER_CARD_ARTICLE_CLASS,
    POSTER_CARD_OUTER_CLASS,
} from "@/lib/feedLayout";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted",
                className
            )}
        />
    );
}

export function NewsCardSkeleton() {
    return (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
            {/* Image skeleton */}
            <Skeleton className="w-full h-44" />

            <div className="p-4">
                {/* Sources count */}
                <Skeleton className="h-3 w-16 mb-3" />

                {/* Title */}
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-3" />

                {/* Bias bar */}
                <Skeleton className="h-2 w-full mb-2" />

                {/* Bias percentages */}
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-10" />
                </div>
            </div>
        </div>
    );
}

export function FeaturedStorySkeleton() {
    return (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
            {/* Large image skeleton */}
            <Skeleton className="w-full h-56" />

            <div className="p-4">
                {/* Title */}
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-4/5 mb-4" />

                {/* Bias bar */}
                <Skeleton className="h-3 w-full mb-2" />

                {/* Meta info */}
                <Skeleton className="h-3 w-32 mt-3" />
            </div>
        </div>
    );
}

export function NewsListItemSkeleton() {
    return (
        <div className="flex gap-4 p-4 border-b border-border last:border-b-0">
            {/* Image */}
            <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />

            <div className="flex-1 min-w-0">
                {/* Category */}
                <Skeleton className="h-3 w-20 mb-2" />

                {/* Title */}
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-3" />

                {/* Bias bar */}
                <Skeleton className="h-1.5 w-full" />
            </div>
        </div>
    );
}

export function TopStorySkeleton() {
    return (
        <div className="py-3 border-b border-border last:border-b-0">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-1.5 w-full" />
        </div>
    );
}

export function DailyBriefingSkeleton() {
    return (
        <div className="bg-card rounded-lg border border-border p-4">
            <Skeleton className="h-5 w-32 mb-4" />

            {/* Stats */}
            <div className="flex gap-4 mb-4">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-12" />
            </div>

            {/* Story previews */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <Skeleton className="w-12 h-12 rounded" />
                    <Skeleton className="h-4 flex-1" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-12 h-12 rounded" />
                    <Skeleton className="h-4 flex-1" />
                </div>
            </div>
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="space-y-6">
            <DailyBriefingSkeleton />

            <div className="bg-card rounded-lg border border-border p-4">
                <Skeleton className="h-5 w-28 mb-3" />
                {[...Array(5)].map((_, i) => (
                    <TopStorySkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

// Headline line widths per card, so the placeholders don't look cloned. Mobile
// headlines sit in a narrow column next to the thumbnail and typically wrap to
// ~6 lines (18px / 1.3), poster headlines to 3–4.
const MOBILE_TITLE_LINES = [
    ["100%", "96%", "100%", "92%", "98%", "54%"],
    ["98%", "100%", "94%", "100%", "90%", "62%"],
    ["100%", "94%", "98%", "70%"],
    ["96%", "100%", "92%", "100%", "97%", "48%"],
    ["100%", "98%", "91%", "100%", "95%", "66%"],
    ["100%", "93%", "99%", "58%"],
];

const TITLE_LINES = [
    ["100%", "92%", "96%", "58%"],
    ["97%", "100%", "71%"],
    ["100%", "88%", "94%", "42%"],
    ["94%", "100%", "64%"],
    ["100%", "96%", "83%", "50%"],
    ["91%", "100%", "76%"],
];

/**
 * One poster card placeholder. Mirrors NewsCard variant="poster" box for box:
 * the mobile row (meta line, headline + 124×82 thumb, coverage bar) and the
 * desktop poster (min 16rem image + 43px coverage bar), so swapping skeleton →
 * cards doesn't move anything. The animation lives in index.css (.feed-skel-*).
 */
function PosterCardSkeleton({ index }: { index: number }) {
    const lines = TITLE_LINES[index % TITLE_LINES.length];
    const mobileLines = MOBILE_TITLE_LINES[index % MOBILE_TITLE_LINES.length];
    // Stagger the animation card by card (read by the .feed-skel-* rules).
    const stagger = { "--skel-delay": `${index * 140}ms` } as React.CSSProperties;

    return (
        <div className={POSTER_CARD_OUTER_CLASS} style={stagger} aria-hidden="true">
            <div className={POSTER_CARD_ARTICLE_CLASS}>
                {/* Mobile */}
                <div className="flex md:hidden flex-col h-full px-4 py-5 w-full">
                    <div className="flex items-center w-full mb-3 h-[18px]">
                        <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-[#fbbf24] mr-2 shrink-0" />
                        <span className="feed-skel-ink h-2.5 w-20 shrink-0" />
                        <div className="flex-1 border-b-[2px] border-dotted border-muted-foreground/30 mx-3 translate-y-[-2px]" />
                        <span className="feed-skel-ink h-2.5 w-14 shrink-0" />
                    </div>

                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            {mobileLines.map((width, i) => (
                                <div key={i} className="flex h-[23.4px] items-center">
                                    <span className="feed-skel-ink h-[15px]" style={{ width }} />
                                </div>
                            ))}
                        </div>
                        <div className="feed-skel-photo w-[124px] h-[82px] shrink-0 border border-border/40" />
                    </div>

                    <div className="mt-auto">
                        <BiasBarSkeleton className="h-8 sm:h-9" />
                    </div>
                </div>

                {/* Desktop / tablet poster */}
                <div className="hidden md:flex flex-col h-full overflow-hidden w-full">
                    <div className="feed-skel-photo relative flex-1 min-h-[16rem] w-full overflow-hidden">
                        <div className="absolute left-4 top-4 flex gap-1.5">
                            <span className="feed-skel-chip h-[15px] w-14" />
                            <span className="feed-skel-chip h-[15px] w-12" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-5 sm:pb-5">
                            {lines.map((width, i) => (
                                <div key={i} className="flex h-[27px] items-center">
                                    <span className="feed-skel-chip h-[19px]" style={{ width }} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full shrink-0">
                        <BiasBarSkeleton className="h-10 md:h-[43px]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Placeholder for the stânga / centru / dreapta coverage bar. The three
 * segments slowly trade width — "comparing perspectives" while we load.
 */
function BiasBarSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("flex w-full overflow-hidden", className)}>
            <span className="feed-skel-bias feed-skel-bias-left" />
            <span className="feed-skel-bias feed-skel-bias-center" />
            <span className="feed-skel-bias feed-skel-bias-right" />
        </div>
    );
}

/**
 * Loading state of the homepage feed: the same grid as the real feed, filled
 * with poster placeholders. Respects prefers-reduced-motion (see index.css).
 */
export function FeedSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div role="status" aria-live="polite" aria-busy="true">
            <span className="sr-only">Se încarcă știrile…</span>
            <div className={FEED_GRID_CLASS}>
                {Array.from({ length: count }, (_, i) => (
                    <PosterCardSkeleton key={i} index={i} />
                ))}
            </div>
        </div>
    );
}

export function MainFeedSkeleton() {
    return (
        <div>
            <FeaturedStorySkeleton />

            <div className="mt-6 bg-card rounded-lg border border-border">
                {[...Array(5)].map((_, i) => (
                    <NewsListItemSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
