import { cn } from "@/lib/utils";

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
