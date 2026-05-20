import type { WishlistList } from "~interfaces/wishlist";

// React Query keys для wishlist-домена.
// kind = queryKey[1] — predicate-based invalidation в use-upsert/delete
// читает этот сегмент (см. C2-fix паттерн из mood/0.5.6 + calendar).
//
// items-list: разрезаем кэш по (list, ownerId), чтобы tab-переключения
// были «по нажатию» — без full refetch. Категории + поиск — клиентский
// фильтр поверх кэша (см. filter-items.ts).
export const wishlistKeys = {
    all: ["wishlist"] as const,
    itemsList: (list: WishlistList, ownerId: string | null) =>
        [...wishlistKeys.all, "items-list", list, ownerId] as const,
    itemById: (id: string) => [...wishlistKeys.all, "item", id] as const,
    peek: (viewerId: string) =>
        [...wishlistKeys.all, "peek", viewerId] as const,
};
