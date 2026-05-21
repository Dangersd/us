import { cache } from "react";

import "server-only";

import { getServerSupabase } from "~libs/supabase/server";
import {
    type WishlistPeek,
    fetchWishlistPeekWith,
} from "~queries/wishlist/fetch-wishlist-peek-core";
import { wishlistKeys } from "~queries/wishlist/keys";

// React Query factory: используется page-prefetch'ом и client-hook'ом.
// partnerId служит scoping-ключом (cache hit для одной пары стабилен).
// partnerId=null → пустой peek без round-trip (login mid-onboarding).
export const createFetchWishlistPeekServerQuery = (
    partnerId: string | null,
) => ({
    queryKey: wishlistKeys.peek(partnerId ?? "none"),
    queryFn: () =>
        partnerId
            ? fetchWishlistPeekServer(partnerId)
            : Promise.resolve<WishlistPeek>({ partnerWants: [], shared: [] }),
});

export const fetchWishlistPeekServer = cache(
    async (partnerId: string): Promise<WishlistPeek> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return { partnerWants: [], shared: [] };
        return fetchWishlistPeekWith(supabase, partnerId);
    },
);

// Re-export shape used by useWishlistPeek and Home widgets.
export type { WishlistPeek };
