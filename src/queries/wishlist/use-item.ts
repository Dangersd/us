"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchItemQuery } from "~queries/wishlist/fetch-item";

export function useItem(id: string | null) {
    return useQuery({
        ...createFetchItemQuery(id ?? "none"),
        enabled: Boolean(id),
    });
}
