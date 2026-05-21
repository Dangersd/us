"use client";

import { useQuery } from "@tanstack/react-query";

import {
    type MemoryOfDayRow,
    mapMemoryRow,
} from "~components/widgets/home/utils/map-memory-row";
import type { MemoryOfTheDay } from "~interfaces/memory";
import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";

const ONE_MINUTE_MS = 60 * 1000;

// D1: signed URL TTL = 1h server-side. staleTime 50min + refetchOnMount:'always'
// гарантируют что при возврате на / клиент берёт свежий URL и фото не 403'ит
// после долгой сессии.
export function useMemoryOfDay(today: string) {
    return useQuery({
        queryKey: calendarKeys.memoryOfDay(today),
        staleTime: 50 * ONE_MINUTE_MS,
        refetchOnMount: "always",
        queryFn: async (): Promise<MemoryOfTheDay | null> => {
            const supabase = getBrowserSupabase();
            const todayMd = today.slice(5);
            const { data, error } = await supabase.rpc(
                "fetch_memory_of_the_day",
                { p_today_md: todayMd },
            );
            if (error) throw error;
            const rows = (data ?? []) as MemoryOfDayRow[];
            const row = rows[0];
            if (!row) return null;

            const { data: signed } = await supabase.storage
                .from("event-photos")
                .createSignedUrl(row.storage_path, 60 * 60);
            if (!signed?.signedUrl) return null;

            return mapMemoryRow(row, signed.signedUrl);
        },
    });
}
