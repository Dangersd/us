"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
    WishlistCategory,
    WishlistItem,
    WishlistList,
    WishlistPriority,
} from "~interfaces/wishlist";
import { getBrowserSupabase } from "~libs/supabase/client";
import { wishlistKeys } from "~queries/wishlist/keys";
import {
    WISHLIST_ITEM_COLUMNS,
    type WishlistItemRow,
    mapWishlistItemRow,
} from "~queries/wishlist/map-item-row";

// Контракт upsert. На update path сохраняем id (иначе upsert по id просто
// вставит новую строку). На insert: id генерим клиентом (crypto.randomUUID) —
// стабильный ключ для будущего optimistic update.
//
// list иммутабелен в DB (см. migration trigger). На edit form скрывает
// list-selector; на insert он обязателен.
export interface UpsertItemInput {
    id?: string;
    list: WishlistList;
    title: string;
    imageUrl: string | null;
    category: WishlistCategory;
    priceEstimate: string | null;
    linkUrl: string | null;
    note: string | null;
    priority: WishlistPriority;
}

export function useUpsertItem() {
    const qc = useQueryClient();

    return useMutation<WishlistItem, Error, UpsertItemInput>({
        mutationFn: async (input) => {
            const supabase = getBrowserSupabase();
            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("not_authenticated");

            const id = input.id ?? crypto.randomUUID();
            const payload = {
                id,
                created_by: auth.user.id,
                list: input.list,
                title: input.title,
                image_url: input.imageUrl,
                category: input.category,
                price_estimate: input.priceEstimate,
                link_url: input.linkUrl,
                note: input.note,
                priority: input.priority,
            };

            const { data, error } = await supabase
                .from("wishlist_items")
                .upsert(payload, { onConflict: "id" })
                .select(WISHLIST_ITEM_COLUMNS)
                .single<WishlistItemRow>();
            if (error) throw error;
            return mapWishlistItemRow(data);
        },

        // C2-fix паттерн (см. calendar/use-upsert-event.ts):
        // setQueryData для canonical single-row, invalidate всех items-list +
        // peek (Home в 0.8 потребляет). Без этого grid не подхватит
        // изменение до focus-refetch.
        onSuccess: (data) => {
            qc.setQueryData(wishlistKeys.itemById(data.id), data);
            qc.invalidateQueries({
                queryKey: wishlistKeys.all,
                predicate: (q) => {
                    const kind = q.queryKey[1] as string | undefined;
                    return kind === "items-list" || kind === "peek";
                },
            });
        },
    });
}
