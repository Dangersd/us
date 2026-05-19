import "server-only";

import type { AppUser } from "~interfaces/user";
import { getServerSupabase } from "~libs/supabase/server";
import {
    USER_COLUMNS,
    type UserRow,
    mapUserRow,
} from "~queries/user/map-user-row";

export async function fetchCurrentUserServer(): Promise<AppUser | null> {
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
}
