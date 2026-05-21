"use client";

import { useQuery } from "@tanstack/react-query";

import { getBrowserSupabase } from "~libs/supabase/client";
import type { WishlistPeek } from "~queries/wishlist/fetch-wishlist-peek.server";
import { wishlistKeys } from "~queries/wishlist/keys";
import {
    WISHLIST_ITEM_COLUMNS,
    type WishlistItemRow,
    mapWishlistItemRow,
} from "~queries/wishlist/map-item-row";

// Зеркалит fetchWishlistPeekServer на клиенте — нужен когда prefetch
// промахнулся (SSR error / partner появился позже) или peek-key инвалидирован
// wishlist-мутацией.
export function useWishlistPeek(partnerId: string | null | undefined) {
    return useQuery({
        queryKey: wishlistKeys.peek(partnerId ?? "none"),
        enabled: Boolean(partnerId),
        queryFn: async (): Promise<WishlistPeek> => {
            if (!partnerId) return { partnerWants: [], shared: [] };
            const supabase = getBrowserSupabase();
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
        },
    });
}
