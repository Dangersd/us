import { cache } from "react";

import "server-only";

import {
    type MemoryOfDayRow,
    mapMemoryRow,
} from "~components/widgets/home/utils/map-memory-row";
import type { MemoryOfTheDay } from "~interfaces/memory";
import { getServerSupabase } from "~libs/supabase/server";
import { calendarKeys } from "~queries/calendar/keys";

// React Query factory: используется page-prefetch'ом. Сегодня в YYYY-MM-DD
// приходит из todayDateString(COUPLE_TZ); RPC принимает MM-DD slice.
export const createFetchMemoryOfDayServerQuery = (today: string) => ({
    queryKey: calendarKeys.memoryOfDay(today),
    queryFn: () => fetchMemoryOfDayServer(today),
});

// Signed URL выпекается сервером — first paint показывает фото без
// дополнительного round-trip. TTL 1h; client-hook делает refetchOnMount
// чтобы при возврате на /  signed URL не успел протухнуть (D1).
export const fetchMemoryOfDayServer = cache(
    async (today: string): Promise<MemoryOfTheDay | null> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return null;

        const todayMd = today.slice(5);
        const { data, error } = await supabase.rpc("fetch_memory_of_the_day", {
            p_today_md: todayMd,
        });
        if (error) throw error;
        const rows = (data ?? []) as MemoryOfDayRow[];
        const row = rows[0];
        if (!row) return null;

        const { data: signed, error: signedErr } = await supabase.storage
            .from("event-photos")
            .createSignedUrl(row.storage_path, 60 * 60);
        if (signedErr || !signed?.signedUrl) return null;

        return mapMemoryRow(row, signed.signedUrl);
    },
);
