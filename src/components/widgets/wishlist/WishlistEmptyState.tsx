"use client";

import { WISHLIST_EMPTY_COPY, type WishlistTabId } from "~config/wishlist";
import { cn } from "~libs/utils";

export interface WishlistEmptyStateProps {
    tabId: WishlistTabId;
    search: string;
    hasCategoryFilter: boolean;
}

const WishlistEmptyState = ({
    tabId,
    search,
    hasCategoryFilter,
}: WishlistEmptyStateProps) => {
    const trimmed = search.trim();
    const message =
        trimmed.length > 0
            ? `Ничего не нашли по запросу «${trimmed}»`
            : hasCategoryFilter
              ? "По выбранным категориям ничего нет"
              : WISHLIST_EMPTY_COPY[tabId];

    return (
        <div
            className={cn(
                "flex items-center justify-center py-16 px-4",
                "text-center text-ink-secondary text-base max-w-md mx-auto",
            )}
        >
            <p>{message}</p>
        </div>
    );
};

export default WishlistEmptyState;
