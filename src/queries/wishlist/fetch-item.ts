import type { WishlistItem } from "~interfaces/wishlist";
import { getBrowserSupabase } from "~libs/supabase/client";
import {
    WISHLIST_ITEM_COLUMNS,
    type WishlistItemRow,
    mapWishlistItemRow,
} from "~queries/wishlist/map-item-row";

export async function fetchItem(id: string): Promise<WishlistItem | null> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    const { data, error } = await supabase
        .from("wishlist_items")
        .select(WISHLIST_ITEM_COLUMNS)
        .eq("id", id)
        .maybeSingle<WishlistItemRow>();
    if (error) throw error;
    return data ? mapWishlistItemRow(data) : null;
}
