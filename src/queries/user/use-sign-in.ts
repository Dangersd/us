"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

import { HOME_R } from "~config/routes";
import type { Gender } from "~interfaces/user";
import { getBrowserSupabase } from "~libs/supabase/client";
import { ACCOUNT_EMAILS } from "~queries/user/account-emails";
import { userKeys } from "~queries/user/keys";

export type SignInErrorKind = "invalid_credentials" | "generic";

export class SignInError extends Error {
    constructor(public kind: SignInErrorKind) {
        super(kind);
    }
}

interface SignInVars {
    gender: Gender;
    password: string;
}

export function useSignIn() {
    const router = useRouter();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ gender, password }: SignInVars) => {
            const supabase = getBrowserSupabase();
            const { error } = await supabase.auth.signInWithPassword({
                email: ACCOUNT_EMAILS[gender],
                password,
            });
            if (error) {
                const kind: SignInErrorKind =
                    error.code === "invalid_credentials"
                        ? "invalid_credentials"
                        : "generic";
                throw new SignInError(kind);
            }
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: userKeys.all });
            router.replace(HOME_R());
        },
    });
}
