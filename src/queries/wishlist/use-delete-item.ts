"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getBrowserSupabase } from "~libs/supabase/client";
import { wishlistKeys } from "~queries/wishlist/keys";

// Hard delete. В 0.7 нет storage upload, поэтому никаких storage-orphan'ов
// чистить не надо — только row. Когда вернём upload в 0.7.5 — добавим
// supabase.storage.remove() перед row delete по аналогии с
// calendar/use-delete-event.ts.
export function useDeleteItem() {
    const qc = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: async (id) => {
            const supabase = getBrowserSupabase();
            const { error } = await supabase
                .from("wishlist_items")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },

        onSuccess: (_data, id) => {
            qc.removeQueries({ queryKey: wishlistKeys.itemById(id) });
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
