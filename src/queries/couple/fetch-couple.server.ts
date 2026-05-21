import { cache } from "react";

import "server-only";

import type { Couple } from "~interfaces/couple";
import { getServerSupabase } from "~libs/supabase/server";
import { coupleKeys } from "~queries/couple/keys";

interface CoupleRow {
    id: string;
    created_at: string;
    relationship_start_date: string | null;
    acquaintance_date: string | null;
}

const COUPLE_COLUMNS =
    "id, created_at, relationship_start_date, acquaintance_date";

function mapCoupleRow(row: CoupleRow): Couple {
    return {
        id: row.id,
        createdAt: row.created_at,
        relationshipStartDate: row.relationship_start_date,
        acquaintanceDate: row.acquaintance_date,
    };
}

export const createFetchCoupleServerQuery = () => ({
    queryKey: coupleKeys.current(),
    queryFn: fetchCoupleServer,
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
