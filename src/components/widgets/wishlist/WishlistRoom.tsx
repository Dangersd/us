"use client";

import { useCallback, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import WishlistCategoryChips from "~components/widgets/wishlist/WishlistCategoryChips";
import WishlistEmptyState from "~components/widgets/wishlist/WishlistEmptyState";
import WishlistFab from "~components/widgets/wishlist/WishlistFab";
import WishlistGrid from "~components/widgets/wishlist/WishlistGrid";
import WishlistHeader from "~components/widgets/wishlist/WishlistHeader";
import WishlistSearchInput from "~components/widgets/wishlist/WishlistSearchInput";
import { WISHLIST_R, WISHLIST_TAB_PARAM } from "~config/routes";
import { WISHLIST_TAB_BY_ID, type WishlistTabId } from "~config/wishlist";
import type { WishlistCategory } from "~interfaces/wishlist";
import { useItems } from "~queries/wishlist";
import { filterItems } from "~queries/wishlist/filter-items";

export interface WishlistRoomProps {
    initialTab: WishlistTabId;
    currentUserId: string | null;
    partnerUserId: string | null;
}

const WishlistRoom = ({
    initialTab,
    currentUserId,
    partnerUserId,
}: WishlistRoomProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Tab — URL state. Initial из SSR; mutate через router.replace shallow.
    const rawTab = searchParams.get(WISHLIST_TAB_PARAM);
    const tabId: WishlistTabId =
        rawTab && rawTab in WISHLIST_TAB_BY_ID
            ? (rawTab as WishlistTabId)
            : initialTab;
    const tab = WISHLIST_TAB_BY_ID[tabId];

    const setTab = useCallback(
        (next: WishlistTabId) => {
            const url = new URL(WISHLIST_R(), window.location.origin);
            url.searchParams.set(WISHLIST_TAB_PARAM, next);
            router.replace(`${url.pathname}${url.search}`, { scroll: false });
        },
        [router],
    );

    // Filter — локальный state (не в URL): chip + search не имеют смысла
    // сохранять между сессиями, и фильтрация чисто client-side над cache.
    const [categories, setCategories] = useState<WishlistCategory[]>([]);
    const [search, setSearch] = useState("");

    const ownerId =
        tab.owner === null
            ? null
            : tab.owner === "me"
              ? currentUserId
              : partnerUserId;

    const itemsQuery = useItems({ list: tab.list, ownerId });
    const allItems = itemsQuery.data ?? [];

    const filtered = useMemo(
        () => filterItems(allItems, { categories, search }),
        [allItems, categories, search],
    );

    return (
        <div className="flex flex-col gap-3">
            <WishlistHeader activeTab={tabId} onTabChange={setTab} />
            <div className="flex flex-col gap-2">
                <WishlistSearchInput value={search} onChange={setSearch} />
                <WishlistCategoryChips
                    selected={categories}
                    onChange={setCategories}
                />
            </div>
            {filtered.length === 0 ? (
                <WishlistEmptyState
                    tabId={tabId}
                    search={search}
                    hasCategoryFilter={categories.length > 0}
                />
            ) : (
                <WishlistGrid
                    items={filtered}
                    currentUserId={currentUserId}
                    readOnly={tab.readOnly}
                />
            )}
            {!tab.readOnly && <WishlistFab list={tab.list} />}
        </div>
    );
};

export default WishlistRoom;
