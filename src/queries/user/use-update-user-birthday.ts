"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AppUser } from "~interfaces/user";
import { getBrowserSupabase } from "~libs/supabase/client";
import { reseedAndInvalidate } from "~queries/calendar/reseed-and-invalidate";
import { userKeys } from "~queries/user/keys";
import {
    USER_COLUMNS,
    type UserRow,
    mapUserRow,
} from "~queries/user/map-user-row";

export interface UpdateUserBirthdayInput {
    birthday: string | null;
}

// Flow (см. plan-eng-review D1, зеркалит useUpdateCoupleDates):
//   1. DELETE own birthday auto-events (source='birthday' AND created_by=self).
//      RLS на calendar_events_delete_couple — couple-scope, поэтому явно
//      ограничиваем created_by чтобы не убить birthday партнёра.
//   2. UPDATE users.birthday — через users_update_self policy.
//   3. POST /api/calendar/seed-recurring → пересоздаёт birthday-events из
//      current_couple_anchor_dates view. Партнёрский birthday seed может
//      soft-skip'нуться (RLS на created_by!=auth.uid) — это ОК, партнёр
//      seed'ит сам при следующем визите Календаря (TENSION-3).
export function useUpdateUserBirthday() {
    const qc = useQueryClient();

    return useMutation<AppUser, Error, UpdateUserBirthdayInput>({
        mutationFn: async (input) => {
            const supabase = getBrowserSupabase();
            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("not_authenticated");

            // 1. DELETE own stale birthday auto-events.
            const { error: deleteErr } = await supabase
                .from("calendar_events")
                .delete()
                .eq("source", "birthday")
                .eq("created_by", auth.user.id);
            if (deleteErr) throw deleteErr;

            // 2. UPDATE own birthday.
            const { data, error } = await supabase
                .from("users")
                .update({ birthday: input.birthday })
                .eq("id", auth.user.id)
                .select(USER_COLUMNS)
                .single<UserRow>();
            if (error) throw error;

            // 3. Re-seed birthdays.
            await reseedAndInvalidate(qc);

            return mapUserRow(data);
        },
        onSuccess: (data) => {
            qc.setQueryData(userKeys.current(), data);
        },
    });
}
