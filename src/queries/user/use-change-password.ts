"use client";

import { useMutation } from "@tanstack/react-query";

import { getBrowserSupabase } from "~libs/supabase/client";

export interface ChangePasswordInput {
    newPassword: string;
}

// Supabase updateUser({ password }) не требует текущего пароля при наличии
// валидной сессии — для приватного двухпользовательского приложения этого
// достаточно. Никакой query-инвалидации: auth state не кэшируется в RQ.
export function useChangePassword() {
    return useMutation({
        mutationFn: async ({ newPassword }: ChangePasswordInput) => {
            const supabase = getBrowserSupabase();
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error) throw error;
        },
    });
}
