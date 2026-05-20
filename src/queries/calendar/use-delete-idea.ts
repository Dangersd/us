"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";

export function useDeleteIdea() {
    const qc = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: async (id) => {
            const supabase = getBrowserSupabase();
            const { error } = await supabase
                .from("event_ideas")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },

        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: calendarKeys.all,
                predicate: (q) =>
                    (q.queryKey[1] as string | undefined) === "ideas",
            });
        },
    });
}
