"use client";

import React from "react";

/**
 * Skeleton loader mimicking a MonkCard shape:
 * – 72×72 image placeholder on the left
 * – 3 text lines on the right
 * – Price + arrow button placeholder on the far right
 *
 * Uses `bg-amber-50/60` shimmer to match the brand palette.
 */
export function SkeletonCard() {
    return (
        <div className="bg-white border border-border p-3 mb-4 flex gap-4 items-center rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] h-[96px] animate-pulse">
            {/* Avatar placeholder */}
            <div className="w-[72px] h-[72px] flex-shrink-0 rounded-xl bg-amber-50/60" />

            {/* Text lines */}
            <div className="flex-1 min-w-0 space-y-2.5">
                <div className="h-4 w-3/4 rounded-lg bg-amber-50/60" />
                <div className="h-3 w-1/2 rounded-lg bg-amber-50/60" />
                <div className="h-3 w-2/3 rounded-lg bg-amber-50/60" />
            </div>

            {/* Price + button placeholder */}
            <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="h-4 w-14 rounded-lg bg-amber-50/60" />
                <div className="w-10 h-10 rounded-full bg-amber-50/60" />
            </div>
        </div>
    );
}

/**
 * Skeleton loader mimicking a BlogCard shape:
 * – Full-width image placeholder on top (h-48)
 * – 2 text lines below
 *
 * Uses `bg-amber-50/60` shimmer to match the brand palette.
 */
export function SkeletonBlogCard() {
    return (
        <div className="bg-white rounded-[24px] border border-stone/20 shadow-sm overflow-hidden animate-pulse">
            {/* Cover image placeholder */}
            <div className="h-48 w-full bg-amber-50/60" />

            {/* Text content */}
            <div className="p-6 space-y-3">
                <div className="h-3 w-1/3 rounded-lg bg-amber-50/60" />
                <div className="h-5 w-4/5 rounded-lg bg-amber-50/60" />
            </div>
        </div>
    );
}

/**
 * Renders N SkeletonCard items in a column.
 */
export function SkeletonMonkList({ count = 4 }: { count?: number }) {
    return (
        <div className="flex flex-col">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

/**
 * Renders N SkeletonBlogCard items in a responsive grid.
 */
export function SkeletonBlogList({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonBlogCard key={i} />
            ))}
        </div>
    );
}
