import type { SupabaseClient } from "@supabase/supabase-js";

import type { WishlistItem } from "~interfaces/wishlist";
import {
    WISHLIST_ITEM_COLUMNS,
    type WishlistItemRow,
    mapWishlistItemRow,
} from "~queries/wishlist/map-item-row";

// Контракт peek-выборки. Используется и SSR-prefetch'ом (server-only клиент)
// и client-hook'ом (browser клиент) — оба зовут fetchWishlistPeekWith ниже.
export interface WishlistPeek {
    partnerWants: WishlistItem[];
    shared: WishlistItem[];
}

// Isomorphic core: принимает supabase-клиент сверху, чтобы один и тот же
// Promise.all/filter/limit/map работал на обоих side'ах без дублирования.
// schema-изменение (limit, ordering, новые фильтры) меняется в одном месте.
export async function fetchWishlistPeekWith(
    supabase: SupabaseClient,
    partnerId: string,
): Promise<WishlistPeek> {
    const [partnerRes, sharedRes] = await Promise.all([
        supabase
            .from("wishlist_items")
            .select(WISHLIST_ITEM_COLUMNS)
            .eq("list", "want")
            .eq("owner_id", partnerId)
            .limit(3)
            .returns<WishlistItemRow[]>(),
        supabase
            .from("wishlist_items")
            .select(WISHLIST_ITEM_COLUMNS)
            .eq("list", "shared")
            .is("owner_id", null)
            .limit(1)
            .returns<WishlistItemRow[]>(),
    ]);
    if (partnerRes.error) throw partnerRes.error;
    if (sharedRes.error) throw sharedRes.error;
    return {
        partnerWants: (partnerRes.data ?? []).map(mapWishlistItemRow),
        shared: (sharedRes.data ?? []).map(mapWishlistItemRow),
    };
}
