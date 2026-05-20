"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { EmotionId, MoodEntry, Visibility } from "~interfaces/mood";
import type { AppUser } from "~interfaces/user";
import { getBrowserSupabase } from "~libs/supabase/client";
import { moodKeys } from "~queries/mood/keys";
import {
    MOOD_COLUMNS,
    type MoodEntryRow,
    mapMoodRow,
} from "~queries/mood/map-mood-row";
import { userKeys } from "~queries/user/keys";

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

            const cachedUser = qc.getQueryData<AppUser | null>(
                userKeys.current(),
            );
            const seedUserId = prev?.userId ?? cachedUser?.id;
            const seedCoupleId = prev?.coupleId ?? cachedUser?.coupleId;

            // Без identity в кэше — пропускаем optimistic snapshot. onSuccess
            // подложит каноническую строку из upsert-результата. Page-level
            // prefetch userKeys.current() гарантирует, что мы сюда не попадём
            // на свежем дне (см. mood/page.tsx).
            if (!seedUserId || !seedCoupleId) return { prev };

            const now = new Date().toISOString();
            const optimistic: MoodEntry = {
                userId: seedUserId,
                coupleId: seedCoupleId,
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

        // setQueryData с каноническим row для текущего byDate(date) —
        // оптимистичная запись становится канонической без лишнего рефетча.
        // Дополнительно (Phase 0.5.6 C2): invalidate range-keys + partner-today,
        // чтобы WeekPattern / месячный grid / partner-glance подхватили
        // изменение в том же табе без ожидания focus-refetch. Predicate
        // исключает только-что-set byDate(input.date), иначе рефетч сразу
        // после setQueryData затрёт оптимистичное значение и даст flicker.
        onSuccess: (data, input) => {
            qc.setQueryData(moodKeys.byDate(input.date), data);
            qc.invalidateQueries({
                queryKey: moodKeys.all,
                predicate: (q) => {
                    const kind = q.queryKey[1] as string | undefined;
                    return (
                        kind === "own-range" ||
                        kind === "partner-range" ||
                        kind === "partner"
                    );
                },
            });
        },
    });
}
