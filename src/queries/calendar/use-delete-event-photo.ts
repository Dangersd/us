"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { EventPhoto } from "~interfaces/calendar";
import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";

// TENSION-2: storage cleanup client-side. SQL trigger через storage.delete_object
// не работает в Supabase Cloud. Порядок: storage.remove → row delete. На
// partial fail (storage OK, row delete fail) row остаётся, ретрай идемпотентен.
export function useDeleteEventPhoto() {
    const qc = useQueryClient();

    return useMutation<void, Error, EventPhoto>({
        mutationFn: async (photo) => {
            const supabase = getBrowserSupabase();
            await supabase.storage
                .from("event-photos")
                .remove([photo.storagePath]);

            const { error } = await supabase
                .from("event_photos")
                .delete()
                .eq("id", photo.id);
            if (error) throw error;
        },

        onSuccess: (_data, photo) => {
            qc.invalidateQueries({
                queryKey: calendarKeys.eventPhotos(
                    photo.eventId,
                    photo.occurrenceDate,
                ),
            });
        },
    });
}
