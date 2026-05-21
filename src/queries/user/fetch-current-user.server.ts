import { cache } from "react";

import "server-only";

import type { AppUser } from "~interfaces/user";
import { getServerSupabase } from "~libs/supabase/server";
import { userKeys } from "~queries/user/keys";
import {
    USER_COLUMNS,
    type UserRow,
    mapUserRow,
} from "~queries/user/map-user-row";

// Current user row меняется только из Profile (display_name/avatar). 5 мин —
// тот же баланс, что и partner profile / couple.
const CURRENT_USER_STALE_TIME_MS = 5 * 60 * 1000;

export const createFetchCurrentUserServerQuery = () => ({
    queryKey: userKeys.current(),
    queryFn: fetchCurrentUserServer,
    staleTime: CURRENT_USER_STALE_TIME_MS,
});

export const fetchCurrentUserServer = cache(
    async (): Promise<AppUser | null> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return null;

        const { data, error } = await supabase
            .from("users")
            .select(USER_COLUMNS)
            .eq("id", auth.user.id)
            .maybeSingle<UserRow>();
        if (error) throw error;
        return data ? mapUserRow(data) : null;
    },
);
