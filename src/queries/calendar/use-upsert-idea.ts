"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { EventIdea } from "~interfaces/calendar";
import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";
import {
    EVENT_IDEA_COLUMNS,
    type EventIdeaRow,
    mapEventIdeaRow,
} from "~queries/calendar/map-idea-row";

export interface UpsertIdeaInput {
    id?: string;
    title: string;
    note: string | null;
}

export function useUpsertIdea() {
    const qc = useQueryClient();

    return useMutation<EventIdea, Error, UpsertIdeaInput>({
        mutationFn: async (input) => {
            const supabase = getBrowserSupabase();
            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("not_authenticated");

            const id = input.id ?? crypto.randomUUID();
            const { data, error } = await supabase
                .from("event_ideas")
                .upsert(
                    {
                        id,
                        created_by: auth.user.id,
                        title: input.title,
                        note: input.note,
                    },
                    { onConflict: "id" },
                )
                .select(EVENT_IDEA_COLUMNS)
                .single<EventIdeaRow>();
            if (error) throw error;
            return mapEventIdeaRow(data);
        },

        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: calendarKeys.all,
                predicate: (q) =>
                    (q.queryKey[1] as string | undefined) === "ideas",
            });
        },
    });
}
