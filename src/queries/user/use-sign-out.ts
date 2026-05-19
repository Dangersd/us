"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

import { LOGIN_R } from "~config/routes";
import { getBrowserSupabase } from "~libs/supabase/client";
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
            await qc.invalidateQueries({ queryKey: userKeys.all });
            router.replace(LOGIN_R());
            router.refresh();
        },
    });
}
