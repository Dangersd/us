"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import * as yup from "yup";

import type { CycleSettings } from "~interfaces/cycle";
import { DEFAULT_CYCLE_SETTINGS } from "~interfaces/cycle";
import type { AppUser } from "~interfaces/user";
import { getBrowserSupabase } from "~libs/supabase/client";
import { cycleKeys } from "~queries/cycle/keys";
import { userKeys } from "~queries/user/keys";
import {
    USER_COLUMNS,
    type UserRow,
    mapUserRow,
} from "~queries/user/map-user-row";

// Schema валидации перед PATCH — защита от silent drift (D7). avg_cycle_length
// — реалистичный коридор 20-45 дней (медицинский диапазон с буфером).
const cycleSettingsSchema: yup.ObjectSchema<CycleSettings> = yup.object({
    phase_visible_to_partner: yup.boolean().required(),
    avg_cycle_length: yup.number().integer().min(20).max(45).required(),
});

export interface UpdateCycleSettingsInput {
    phase_visible_to_partner?: boolean;
    avg_cycle_length?: number;
}

// PATCH-семантика: caller отправляет только меняемые поля. Полная schema
// собирается из cached current user.settings.cycle + DEFAULT'ов.
export function useUpdateCycleSettings() {
    const qc = useQueryClient();

    return useMutation<AppUser, Error, UpdateCycleSettingsInput>({
        mutationFn: async (input) => {
            const supabase = getBrowserSupabase();
            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("not_authenticated");

            // Merge: cached user.settings.cycle + DEFAULT'ы + input patch.
            const cachedUser = qc.getQueryData<AppUser | null>(
                userKeys.current(),
            );
            const cachedSettings = cachedUser?.settings ?? {};
            const existingCycle = (cachedSettings.cycle ??
                {}) as Partial<CycleSettings>;
            const merged: CycleSettings = {
                ...DEFAULT_CYCLE_SETTINGS,
                ...existingCycle,
                ...input,
            };

            const validated = await cycleSettingsSchema.validate(merged, {
                strict: true,
            });

            // Полный settings (cycle namespace замещается).
            const newSettings = {
                ...cachedSettings,
                cycle: validated,
            };

            const { data, error } = await supabase
                .from("users")
                .update({ settings: newSettings })
                .eq("id", auth.user.id)
                .select(USER_COLUMNS)
                .single<UserRow>();
            if (error) throw error;
            return mapUserRow(data);
        },

        onSuccess: (user) => {
            qc.setQueryData(userKeys.current(), user);
            // Toggle phase_visible_to_partner влияет на get_partner_phase →
            // партнёрский ambient ring должен немедленно обновиться у партнёра
            // (он refetch'нёт при focus). Внутри её сессии — invalidate
            // own myPhase кэш на случай если avg_cycle_length изменился.
            qc.invalidateQueries({ queryKey: cycleKeys.myPhase() });
        },
    });
}
