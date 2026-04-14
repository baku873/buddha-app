"use client";

import React, { ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import MobileScrollView from "./mobile/MobileScrollView";

/**
 * Client wrapper that adds MobileScrollView with pull-to-refresh
 * to the server-rendered home page content.
 *
 * @param children - Server-rendered page content (Hero, HomeSections, etc.)
 */
export default function HomeClientWrapper({ children }: { children: ReactNode }) {
    const router = useRouter();

    const handleRefresh = useCallback(async () => {
        // Re-fetch page data by triggering a Next.js router refresh
        // This invalidates the server-side cache and re-renders with fresh data
        router.refresh();
        // Small delay to let the refresh propagate
        await new Promise((resolve) => setTimeout(resolve, 800));
    }, [router]);

    return (
        <MobileScrollView pullToRefresh onRefresh={handleRefresh}>
            {children}
        </MobileScrollView>
    );
}
