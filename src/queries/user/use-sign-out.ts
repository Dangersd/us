"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

import { LOGIN_R } from "~config/routes";
import { getBrowserSupabase } from "~libs/supabase/client";
import { moodKeys } from "~queries/mood/keys";
import { userKeys } from "~queries/user/keys";

export function useSignOut() {
    const router = useRouter();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const supabase = getBrowserSupabase();
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        },
        onSuccess: async () => {
            // Чистим mood-кэш помимо user-кэша: на общем устройстве (двое
            // партнёров) без этого следующий signed-in юзер видел бы один tick
            // stale-кэша предыдущего, пока refetch не вернёт его данные.
            await Promise.all([
                qc.invalidateQueries({ queryKey: userKeys.all }),
                qc.invalidateQueries({ queryKey: moodKeys.all }),
            ]);
            router.replace(LOGIN_R());
        },
    });
}
