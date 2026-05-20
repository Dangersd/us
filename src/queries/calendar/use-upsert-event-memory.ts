"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { EventMemory, MemoryMoodTag } from "~interfaces/calendar";
import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";
import {
    EVENT_MEMORY_COLUMNS,
    type EventMemoryRow,
    mapEventMemoryRow,
} from "~queries/calendar/map-event-memory-row";

export interface UpsertEventMemoryInput {
    eventId: string;
    occurrenceDate: string;
    moodTag: MemoryMoodTag | null;
    note: string | null;
}

export function useUpsertEventMemory() {
    const qc = useQueryClient();

    return useMutation<EventMemory, Error, UpsertEventMemoryInput>({
        mutationFn: async (input) => {
            const supabase = getBrowserSupabase();
            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("not_authenticated");

            const { data, error } = await supabase
                .from("event_memories")
                .upsert(
                    {
                        event_id: input.eventId,
                        occurrence_date: input.occurrenceDate,
                        created_by: auth.user.id,
                        mood_tag: input.moodTag,
                        note: input.note,
                        recorded_at: new Date().toISOString(),
                    },
                    { onConflict: "event_id,occurrence_date" },
                )
                .select(EVENT_MEMORY_COLUMNS)
                .single<EventMemoryRow>();
            if (error) throw error;
            return mapEventMemoryRow(data);
        },

        onSuccess: (data) => {
            qc.setQueryData(
                calendarKeys.eventMemory(data.eventId, data.occurrenceDate),
                data,
            );
            // Range queries не зависят от memory (карточка events рендерит
            // ✓ chip из useEventMemory отдельно). Не инвалидируем.
        },
    });
}
