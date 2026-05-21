import { cache } from "react";

import "server-only";

import type { AppUser } from "~interfaces/user";
import { getServerSupabase } from "~libs/supabase/server";
import { profileKeys } from "~queries/profile/keys";
import {
    USER_COLUMNS,
    type UserRow,
    mapUserRow,
} from "~queries/user/map-user-row";

// Profile row меняется ~никогда (avatar/name редактируются вручную в Profile).
// 5 минут — баланс между актуальностью и тем, чтобы не дёргать RLS на каждом
// focus / page switch.
const PARTNER_PROFILE_STALE_TIME_MS = 5 * 60 * 1000;

export const createFetchPartnerProfileServerQuery = () => ({
    queryKey: profileKeys.partner(),
    queryFn: fetchPartnerProfileServer,
    staleTime: PARTNER_PROFILE_STALE_TIME_MS,
});

// См. комментарий про RLS-инвариант в ~queries/profile/fetch-partner-profile.
export const fetchPartnerProfileServer = cache(
    async (): Promise<AppUser | null> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return null;

        const { data, error } = await supabase
            .from("users")
            .select(USER_COLUMNS)
            .neq("id", auth.user.id)
            .maybeSingle<UserRow>();
        if (error) throw error;
        return data ? mapUserRow(data) : null;
    },
);
