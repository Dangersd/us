"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CycleEntry, CycleSymptom, PeriodFlow } from "~interfaces/cycle";
import { getBrowserSupabase } from "~libs/supabase/client";
import { cycleKeys } from "~queries/cycle/keys";
import {
    CYCLE_COLUMNS,
    type CycleEntryRow,
    mapCycleRow,
} from "~queries/cycle/map-cycle-row";

// Контракт (D2 last-write-wins): caller отправляет ПОЛНЫЙ снимок полей
// (period_flow, symptoms, note). UPSERT через `on conflict (user_id, date)`
// замещает все три. Mood checkin делает prefetch through useCycleToday,
// чтобы chip'ы рендерились active и user не терял симптомы случайно.
export interface UpsertCycleEntryInput {
    date: string; // YYYY-MM-DD
    periodFlow: PeriodFlow | null;
    symptoms: CycleSymptom[];
    note: string | null;
}

export function useUpsertCycleEntry() {
    const qc = useQueryClient();

    return useMutation<CycleEntry, Error, UpsertCycleEntryInput>({
        mutationFn: async (input) => {
            const supabase = getBrowserSupabase();
            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("not_authenticated");

            // user_id и couple_id выводятся BEFORE INSERT trigger'ом — клиент
            // не должен их передавать. Но Postgrest требует unique conflict-
            // target включая user_id, поэтому ему мы его всё-таки шлём
            // (trigger перезапишет тем же значением).
            const { data, error } = await supabase
                .from("cycle_entries")
                .upsert(
                    {
                        user_id: auth.user.id,
                        date: input.date,
                        period_flow: input.periodFlow,
                        symptoms: input.symptoms,
                        note: input.note,
                    },
                    { onConflict: "user_id,date" },
                )
                .select(CYCLE_COLUMNS)
                .single<CycleEntryRow>();
            if (error) throw error;
            return mapCycleRow(data);
        },

        onSuccess: (data, input) => {
            // Канонический row → today + month кэши + phase RPC + history
            // (для stats).
            qc.setQueryData(cycleKeys.today(input.date), data);
            qc.invalidateQueries({
                queryKey: cycleKeys.all,
                predicate: (q) => {
                    const kind = q.queryKey[1] as string | undefined;
                    return (
                        kind === "month" ||
                        kind === "history" ||
                        kind === "my-phase"
                    );
                },
            });
        },
    });
}
