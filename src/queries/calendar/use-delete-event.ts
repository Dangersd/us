"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";

// Hard delete с storage cleanup. TENSION-2: storage.delete_object SQL trigger
// не существует в Supabase Cloud, поэтому каскадим вручную:
// (1) fetch storage paths всех event_photos,
// (2) parallel storage.remove,
// (3) delete calendar_events row — CASCADE удалит event_photos + event_memories
//     rows автоматически.
// Partial-fail: если storage.remove упал для части файлов — row всё равно
// удаляется (orphans остаются в bucket'е, не блокируем user flow).
export function useDeleteEvent() {
    const qc = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: async (id) => {
            const supabase = getBrowserSupabase();

            const { data: photos } = await supabase
                .from("event_photos")
                .select("storage_path")
                .eq("event_id", id);
            const paths = (photos ?? [])
                .map((p) => (p as { storage_path: string }).storage_path)
                .filter(Boolean);

            if (paths.length > 0) {
                await supabase.storage
                    .from("event-photos")
                    .remove(paths)
                    .catch((err) => {
                        // Non-fatal: orphan'ы лучше чем заблокированный delete.
                        console.warn(
                            "[use-delete-event] storage cleanup partial fail",
                            err,
                        );
                    });
            }

            const { error } = await supabase
                .from("calendar_events")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },

        onSuccess: (_data, id) => {
            qc.removeQueries({ queryKey: calendarKeys.eventById(id) });
            qc.invalidateQueries({
                queryKey: calendarKeys.all,
                predicate: (q) =>
                    (q.queryKey[1] as string | undefined) === "events-range",
            });
        },
    });
}
