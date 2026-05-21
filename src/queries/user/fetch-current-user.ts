import type { AppUser } from "~interfaces/user";
import { getBrowserSupabase } from "~libs/supabase/client";
import { userKeys } from "~queries/user/keys";
import {
    USER_COLUMNS,
    type UserRow,
    mapUserRow,
} from "~queries/user/map-user-row";

export const createFetchCurrentUserQuery = () => ({
    queryKey: userKeys.current(),
    queryFn: fetchCurrentUser,
    // Симметрия с server factory (см. fetch-current-user.server.ts) и
    // partner profile — current user меняется только из Profile, перезапрос
    // каждые 60s после hydration переплачивается зря.
    staleTime: 5 * 60_000,
});

export async function fetchCurrentUser(): Promise<AppUser | null> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    const { data, error } = await supabase
        .from("users")
        .select(USER_COLUMNS)
        .eq("id", auth.user.id)
        .maybeSingle<UserRow>();
    if (error) throw error;
    return data ? mapUserRow(data) : null;
}
