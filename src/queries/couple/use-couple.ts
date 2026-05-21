"use client";

import { useQuery } from "@tanstack/react-query";

import type { Couple } from "~interfaces/couple";
import { getBrowserSupabase } from "~libs/supabase/client";
import { coupleKeys } from "~queries/couple/keys";

interface CoupleRow {
    id: string;
    created_at: string;
    relationship_start_date: string | null;
    acquaintance_date: string | null;
}

async function fetchCoupleBrowser(): Promise<Couple | null> {
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase
        .from("couples")
        .select("id, created_at, relationship_start_date, acquaintance_date")
        .maybeSingle<CoupleRow>();
    if (error) throw error;
    if (!data) return null;
    return {
        id: data.id,
        createdAt: data.created_at,
        relationshipStartDate: data.relationship_start_date,
        acquaintanceDate: data.acquaintance_date,
    };
}

export function useCouple() {
    return useQuery({
        queryKey: coupleKeys.current(),
        queryFn: fetchCoupleBrowser,
    });
}
