import type {
    WishlistCategory,
    WishlistItem,
    WishlistList,
    WishlistPriority,
} from "~interfaces/wishlist";

export interface WishlistItemRow {
    id: string;
    couple_id: string;
    created_by: string;
    owner_id: string | null;
    list: WishlistList;
    title: string;
    image_url: string | null;
    category: WishlistCategory;
    price_estimate: string | null;
    link_url: string | null;
    note: string | null;
    priority: WishlistPriority;
    created_at: string;
    updated_at: string;
}

export const WISHLIST_ITEM_COLUMNS =
    "id, couple_id, created_by, owner_id, list, title, image_url, category, " +
    "price_estimate, link_url, note, priority, created_at, updated_at";

export function mapWishlistItemRow(row: WishlistItemRow): WishlistItem {
    return {
        id: row.id,
        coupleId: row.couple_id,
        createdBy: row.created_by,
        ownerId: row.owner_id,
        list: row.list,
        title: row.title,
        imageUrl: row.image_url,
        category: row.category,
        priceEstimate: row.price_estimate,
        linkUrl: row.link_url,
        note: row.note,
        priority: row.priority,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
