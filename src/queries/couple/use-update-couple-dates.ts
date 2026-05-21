"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Couple } from "~interfaces/couple";
import { getBrowserSupabase } from "~libs/supabase/client";
import { reseedAndInvalidate } from "~queries/calendar/reseed-and-invalidate";
import { coupleKeys } from "~queries/couple/keys";
import {
    COUPLE_COLUMNS,
    type CoupleRow,
    mapCoupleRow,
} from "~queries/couple/map-couple-row";

export interface UpdateCoupleDatesInput {
    relationshipStartDate: string | null;
    acquaintanceDate: string | null;
}

// Flow (см. plan-eng-review D1):
//   1. SELECT couple id (нужен для explicit-scope DELETE и UPDATE).
//   2. DELETE auto-seeded anniversary events с явным couple_id фильтром
//      (defense-in-depth поверх RLS calendar_events_delete_couple). Это
//      убирает ghost'ы старой даты.
//   3. UPDATE couples set dates. couples_update_couple_members policy
//      (миграция 20260529000000) разрешает обоим партнёрам.
//   4. POST /api/calendar/seed-recurring → пересоздаёт anniversary с новым
//      anchor_date.
//
// KNOWN: при одновременном save'е обоих партнёров возможна ghost-годовщина
// (см. TODOS.md «Profile important-dates concurrency»). Для 2-личной пары
// риск минимальный, фикс отложен в follow-up phase.
export function useUpdateCoupleDates() {
    const qc = useQueryClient();

    return useMutation<Couple, Error, UpdateCoupleDatesInput>({
        mutationFn: async (input) => {
            const supabase = getBrowserSupabase();

            // 1. Узнаём couple id (нужен для explicit filter ниже).
            const { data: existing, error: existErr } = await supabase
                .from("couples")
                .select("id")
                .maybeSingle<{ id: string }>();
            if (existErr) throw existErr;
            if (!existing) throw new Error("no_couple");

            // 2. DELETE stale anniversary auto-events. Явный couple_id —
            //    defense-in-depth: даже если RLS упадёт/ослабнет, не сметём
            //    события чужих пар.
            const { error: deleteErr } = await supabase
                .from("calendar_events")
                .delete()
                .eq("source", "anniversary")
                .eq("couple_id", existing.id);
            if (deleteErr) throw deleteErr;

            // 3. UPDATE couple dates.
            const { data, error } = await supabase
                .from("couples")
                .update({
                    relationship_start_date: input.relationshipStartDate,
                    acquaintance_date: input.acquaintanceDate,
                })
                .eq("id", existing.id)
                .select(COUPLE_COLUMNS)
                .single<CoupleRow>();
            if (error) throw error;

            // 4. Re-seed anniversaries (идемпотентно).
            await reseedAndInvalidate(qc);

            return mapCoupleRow(data);
        },
        onSuccess: (data) => {
            qc.setQueryData(coupleKeys.current(), data);
        },
    });
}
