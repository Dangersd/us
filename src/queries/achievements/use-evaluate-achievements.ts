"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type AchievementScope, findAchievement } from "~config/achievements";
import type { NewlyUnlocked } from "~interfaces/achievements";
import { getBrowserSupabase } from "~libs/supabase/client";
import { achievementsKeys } from "~queries/achievements/keys";

interface EvaluateRpcRow {
    key: string;
    scope: string;
    unlocked_by_user_id: string | null;
}

// Mutation: вызывает evaluate_and_unlock_achievements RPC и возвращает массив
// СВЕЖЕРАЗЛОКИРОВАННЫХ ключей (RETURNING из ON CONFLICT DO NOTHING). Toast
// hooks subscribe'ятся к onSuccess через mutateAsync результат.
//
// onSuccess инвалидирует read-query чтобы grid сразу отразил новые звёзды.
export function useEvaluateAchievements() {
    const qc = useQueryClient();
    return useMutation<NewlyUnlocked[], Error, void>({
        mutationFn: async () => {
            const supabase = getBrowserSupabase();
            const { data, error } = await supabase.rpc(
                "evaluate_and_unlock_achievements",
            );
            if (error) throw error;
            if (!data) return [];
            return (data as EvaluateRpcRow[])
                .map((r): NewlyUnlocked | null => {
                    if (!findAchievement(r.key)) return null;
                    if (r.scope !== "couple" && r.scope !== "user") return null;
                    return {
                        key: r.key,
                        scope: r.scope as AchievementScope,
                        unlockedByUserId: r.unlocked_by_user_id,
                    };
                })
                .filter((u): u is NewlyUnlocked => u !== null);
        },
        onSuccess: (newly) => {
            if (newly.length > 0) {
                qc.invalidateQueries({ queryKey: achievementsKeys.all });
            }
        },
    });
}
