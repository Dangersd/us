"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchItem } from "~queries/wishlist/fetch-item";
import { wishlistKeys } from "~queries/wishlist/keys";

export function useItem(id: string | null) {
    return useQuery({
        queryKey: id ? wishlistKeys.itemById(id) : ["wishlist", "item", "none"],
        queryFn: () => (id ? fetchItem(id) : Promise.resolve(null)),
        enabled: Boolean(id),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}
