import { cache } from "react";

import "server-only";

import type { Couple } from "~interfaces/couple";
import { getServerSupabase } from "~libs/supabase/server";
import { coupleKeys } from "~queries/couple/keys";
import {
    COUPLE_COLUMNS,
    type CoupleRow,
    mapCoupleRow,
} from "~queries/couple/map-couple-row";

// Couple row меняется ~никогда (start_date/acquaintance_date правятся вручную
// в Profile, а row создаётся один раз при онбординге). Держим 5 минут как
// partner-profile, чтобы не дёргать RLS на каждом focus.
const COUPLE_STALE_TIME_MS = 5 * 60 * 1000;

export const createFetchCoupleServerQuery = () => ({
    queryKey: coupleKeys.current(),
    queryFn: fetchCoupleServer,
    staleTime: COUPLE_STALE_TIME_MS,
});

// RLS couples_select_own ограничивает выбор строкой пары текущего юзера —
// поэтому .maybeSingle без явного where достаточно.
export const fetchCoupleServer = cache(async (): Promise<Couple | null> => {
    const supabase = await getServerSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    const { data, error } = await supabase
        .from("couples")
        .select(COUPLE_COLUMNS)
        .maybeSingle<CoupleRow>();
    if (error) throw error;
    return data ? mapCoupleRow(data) : null;
});
