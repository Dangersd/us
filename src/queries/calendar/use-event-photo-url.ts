"use client";

import { useQuery } from "@tanstack/react-query";

import { getBrowserSupabase } from "~libs/supabase/client";

// Signed URL c TTL 1 час. Refetch на focus если запрос истёк.
// Cache by storagePath чтобы один и тот же файл не перевыпрашивал URL.
export function useEventPhotoUrl(storagePath: string | null) {
    return useQuery({
        queryKey: ["calendar", "photo-url", storagePath],
        queryFn: async () => {
            if (!storagePath) return null;
            const supabase = getBrowserSupabase();
            const { data, error } = await supabase.storage
                .from("event-photos")
                .createSignedUrl(storagePath, 60 * 60);
            if (error) throw error;
            return data?.signedUrl ?? null;
        },
        enabled: Boolean(storagePath),
        staleTime: 50 * 60 * 1000, // 50 min — refetch до истечения часа
        refetchOnWindowFocus: false,
    });
}
