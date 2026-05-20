"use client";

import { useQuery } from "@tanstack/react-query";

import type { WishlistList } from "~interfaces/wishlist";
import { type FetchItemsArgs, fetchItems } from "~queries/wishlist/fetch-items";
import { wishlistKeys } from "~queries/wishlist/keys";

export function useItems(args: FetchItemsArgs) {
    return useQuery({
        queryKey: wishlistKeys.itemsList(args.list, args.ownerId),
        queryFn: () => fetchItems(args),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}

// Удобная перегрузка без аргумент-объекта (по-умолчанию для прямых вызовов).
export function useItemsByListOwner(
    list: WishlistList,
    ownerId: string | null,
) {
    return useItems({ list, ownerId });
}
