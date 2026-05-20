import { cache } from "react";

import "server-only";

import type { WishlistItem } from "~interfaces/wishlist";
import { getServerSupabase } from "~libs/supabase/server";
import {
    WISHLIST_ITEM_COLUMNS,
    type WishlistItemRow,
    mapWishlistItemRow,
} from "~queries/wishlist/map-item-row";

// Phase 0.7 экспортирует этот контракт для Home (0.8). Возвращает случайную
// выборку из partner.want (до 3) + shared (до 1). 0.7 страница его не
// потребляет — это hook-point для widget'а в Home.
//
// 0.7 ships «last N by created_at desc» — простой контракт. Home (0.8) может
// делать дополнительный client-side shuffle, либо мы переведём это на
// `order('random')` через PostgREST когда понадобится. Главное — контракт
// зафиксирован сейчас, чтобы Home не делал лишний refactor query layer'a.
export interface WishlistPeek {
    partnerWants: WishlistItem[];
    shared: WishlistItem[];
}

export const fetchWishlistPeekServer = cache(
    async (partnerId: string): Promise<WishlistPeek> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return { partnerWants: [], shared: [] };

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
);
