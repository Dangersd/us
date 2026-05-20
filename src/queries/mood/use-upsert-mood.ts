"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { EmotionId, MoodEntry, Visibility } from "~interfaces/mood";
import { getBrowserSupabase } from "~libs/supabase/client";
import { moodKeys } from "~queries/mood/keys";
import {
    MOOD_COLUMNS,
    type MoodEntryRow,
    mapMoodRow,
} from "~queries/mood/map-mood-row";

// Контракт: caller (form layer в 0.5.4) ВСЕГДА шлёт полный текущий visibility.
// Без default'а на mutation-стороне — иначе partial update формы, не
// перепрокинувший visibility, молча затёр бы кастомный privacy юзера обратно
// в DEFAULT_PRIVACY. DEFAULT_PRIVACY используется только формой при инициализации
// свежего дня.
export interface UpsertMoodInput {
    date: string; // YYYY-MM-DD
    energy: number | null;
    stress: number | null;
    socialBattery: number | null;
    emotion: EmotionId | null;
    visibility: Visibility;
}

interface MutationContext {
    prev: MoodEntry | null | undefined;
}

export function useUpsertMood() {
    const qc = useQueryClient();

    return useMutation<MoodEntry, Error, UpsertMoodInput, MutationContext>({
        mutationFn: async (input) => {
            const supabase = getBrowserSupabase();
            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("not_authenticated");

            const { data, error } = await supabase
                .from("mood_entries")
                .upsert(
                    {
                        user_id: auth.user.id,
                        date: input.date,
                        energy: input.energy,
                        stress: input.stress,
                        social_battery: input.socialBattery,
                        emotion: input.emotion,
                        visibility: input.visibility,
                    },
                    { onConflict: "user_id,date" },
                )
                .select(MOOD_COLUMNS)
                .single<MoodEntryRow>();
            if (error) throw error;
            return mapMoodRow(data);
        },

        onMutate: async (input) => {
            const key = moodKeys.byDate(input.date);
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<MoodEntry | null>(key);

            const now = new Date().toISOString();
            const optimistic: MoodEntry = {
                userId: prev?.userId ?? "",
                coupleId: prev?.coupleId ?? "",
                date: input.date,
                energy: input.energy,
                stress: input.stress,
                socialBattery: input.socialBattery,
                emotion: input.emotion,
                visibility: input.visibility,
                createdAt: prev?.createdAt ?? now,
                updatedAt: now,
            };
            qc.setQueryData(key, optimistic);
            return { prev };
        },

        onError: (_err, input, ctx) => {
            if (ctx) {
                qc.setQueryData(moodKeys.byDate(input.date), ctx.prev);
            }
        },

        onSettled: (_data, _err, input) => {
            qc.invalidateQueries({ queryKey: moodKeys.byDate(input.date) });
        },
    });
}
