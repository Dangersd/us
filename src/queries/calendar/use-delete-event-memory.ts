"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";

interface DeleteEventMemoryInput {
    eventId: string;
    occurrenceDate: string;
}

export function useDeleteEventMemory() {
    const qc = useQueryClient();

    return useMutation<void, Error, DeleteEventMemoryInput>({
        mutationFn: async ({ eventId, occurrenceDate }) => {
            const supabase = getBrowserSupabase();
            const { error } = await supabase
                .from("event_memories")
                .delete()
                .eq("event_id", eventId)
                .eq("occurrence_date", occurrenceDate);
            if (error) throw error;
        },

        onSuccess: (_data, { eventId, occurrenceDate }) => {
            qc.setQueryData(
                calendarKeys.eventMemory(eventId, occurrenceDate),
                null,
            );
        },
    });
}
