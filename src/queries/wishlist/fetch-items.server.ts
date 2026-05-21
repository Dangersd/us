import { cache } from "react";

import "server-only";

import type { WishlistItem } from "~interfaces/wishlist";
import { getServerSupabase } from "~libs/supabase/server";
import type { FetchItemsArgs } from "~queries/wishlist/fetch-items";
import { wishlistKeys } from "~queries/wishlist/keys";
import {
    WISHLIST_ITEM_COLUMNS,
    type WishlistItemRow,
    mapWishlistItemRow,
} from "~queries/wishlist/map-item-row";

export const createFetchItemsServerQuery = (args: FetchItemsArgs) => ({
    queryKey: wishlistKeys.itemsList(args.list, args.ownerId),
    queryFn: () => fetchItemsServer(args),
});

export const fetchItemsServer = cache(
    async ({ list, ownerId }: FetchItemsArgs): Promise<WishlistItem[]> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return [];

        let query = supabase
            .from("wishlist_items")
            .select(WISHLIST_ITEM_COLUMNS)
            .eq("list", list)
            .order("created_at", { ascending: false });

        query =
            ownerId === null
                ? query.is("owner_id", null)
                : query.eq("owner_id", ownerId);

        const { data, error } = await query.returns<WishlistItemRow[]>();
        if (error) throw error;
        return (data ?? []).map(mapWishlistItemRow);
    },
);
