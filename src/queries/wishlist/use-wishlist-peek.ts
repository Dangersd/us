"use client";

import { useQuery } from "@tanstack/react-query";

import { getBrowserSupabase } from "~libs/supabase/client";
import {
    type WishlistPeek,
    fetchWishlistPeekWith,
} from "~queries/wishlist/fetch-wishlist-peek-core";
import { wishlistKeys } from "~queries/wishlist/keys";

// Зеркалит fetchWishlistPeekServer на клиенте через тот же isomorphic core.
// Нужен когда prefetch промахнулся (SSR error / partner появился позже) или
// peek-key инвалидирован wishlist-мутацией (см. use-upsert-item / use-delete-item).
export function useWishlistPeek(partnerId: string | null | undefined) {
    return useQuery({
        queryKey: wishlistKeys.peek(partnerId ?? "none"),
        enabled: Boolean(partnerId),
        queryFn: (): Promise<WishlistPeek> => {
            if (!partnerId)
                return Promise.resolve({ partnerWants: [], shared: [] });
            return fetchWishlistPeekWith(getBrowserSupabase(), partnerId);
        },
    });
}
