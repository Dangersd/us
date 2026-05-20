// Phase 0.7: Wishlist domain types.
//
// NB: значение 'want' существует и в WishlistList, и в WishlistPriority —
// это разные enum'ы:
//   - list = 'want' — куда положена вещь («Я хочу»)
//   - priority = 'want' — субъективная сила желания (средняя)
// Не путать. UI всегда дисамбигурирует через label.

export type WishlistList = "want" | "love" | "shared";

export type WishlistCategory =
    | "clothing"
    | "fragrance"
    | "books"
    | "home"
    | "food"
    | "experience"
    | "travel"
    | "other";

export type WishlistPriority = "someday" | "want" | "really_want";

export interface WishlistItem {
    id: string;
    coupleId: string;
    createdBy: string;
    // null <=> list === 'shared'. Иначе uuid владельца личного списка.
    ownerId: string | null;
    list: WishlistList;
    title: string;
    imageUrl: string | null;
    category: WishlistCategory;
    priceEstimate: string | null;
    linkUrl: string | null;
    note: string | null;
    priority: WishlistPriority;
    createdAt: string;
    updatedAt: string;
}
