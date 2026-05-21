import type { WishlistItem, WishlistList } from "~interfaces/wishlist";
import { getBrowserSupabase } from "~libs/supabase/client";
import { wishlistKeys } from "~queries/wishlist/keys";
import {
    WISHLIST_ITEM_COLUMNS,
    type WishlistItemRow,
    mapWishlistItemRow,
} from "~queries/wishlist/map-item-row";

export const createFetchItemsQuery = (args: FetchItemsArgs) => ({
    queryKey: wishlistKeys.itemsList(args.list, args.ownerId),
    queryFn: () => fetchItems(args),
    staleTime: 0,
    refetchOnWindowFocus: true,
});

export interface FetchItemsArgs {
    list: WishlistList;
    // null означает shared (where owner_id is null). Иначе uuid конкретного
    // владельца (me или partner).
    ownerId: string | null;
}

export async function fetchItems({
    list,
    ownerId,
}: FetchItemsArgs): Promise<WishlistItem[]> {
    const supabase = getBrowserSupabase();
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
}
