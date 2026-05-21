"use client";

import { useQuery } from "@tanstack/react-query";

import type { WishlistList } from "~interfaces/wishlist";
import {
    type FetchItemsArgs,
    createFetchItemsQuery,
} from "~queries/wishlist/fetch-items";

export function useItems(args: FetchItemsArgs) {
    return useQuery(createFetchItemsQuery(args));
}

// Удобная перегрузка без аргумент-объекта (по-умолчанию для прямых вызовов).
export function useItemsByListOwner(
    list: WishlistList,
    ownerId: string | null,
) {
    return useItems({ list, ownerId });
}
