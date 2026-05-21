"use client";

import { useQuery } from "@tanstack/react-query";

import type { Couple } from "~interfaces/couple";
import { getBrowserSupabase } from "~libs/supabase/client";
import { coupleKeys } from "~queries/couple/keys";
import {
    COUPLE_COLUMNS,
    type CoupleRow,
    mapCoupleRow,
} from "~queries/couple/map-couple-row";

const COUPLE_STALE_TIME_MS = 5 * 60 * 1000;

async function fetchCoupleBrowser(): Promise<Couple | null> {
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase
        .from("couples")
        .select(COUPLE_COLUMNS)
        .maybeSingle<CoupleRow>();
    if (error) throw error;
    return data ? mapCoupleRow(data) : null;
}

export function useCouple() {
    return useQuery({
        queryKey: coupleKeys.current(),
        queryFn: fetchCoupleBrowser,
        staleTime: COUPLE_STALE_TIME_MS,
    });
}
