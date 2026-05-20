"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
    CalendarEvent,
    EventCategory,
    RecurrenceRule,
    ReminderOffset,
} from "~interfaces/calendar";
import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";
import {
    type CalendarEventRow,
    mapCalendarEventRow,
} from "~queries/calendar/map-event-row";

// Atomic transaction: delete idea + insert event в одной БД-транзакции.
// SECURITY DEFINER RPC `promote_idea_to_event` (см. миграцию
// 20260523000001) сначала verifies couple_id, затем выполняет оба
// шага либо ни один. Альтернатива (client-parallel insert+delete) даёт
// race при partial fail — отвергнута в /plan-eng-review ARCH-2.
export interface PromoteIdeaInput {
    ideaId: string;
    payload: {
        title: string;
        date: string;
        time: string | null;
        durationMinutes: number | null;
        location: string | null;
        category: EventCategory;
        customCategoryLabel: string | null;
        note: string | null;
        isRecurring: boolean;
        recurrenceRule: RecurrenceRule | null;
        recurrenceAnchorDate: string | null;
        reminderOffsets: ReminderOffset[];
    };
}

export function usePromoteIdea() {
    const qc = useQueryClient();

    return useMutation<CalendarEvent, Error, PromoteIdeaInput>({
        mutationFn: async ({ ideaId, payload }) => {
            const supabase = getBrowserSupabase();
            const { data, error } = await supabase.rpc(
                "promote_idea_to_event",
                {
                    p_idea_id: ideaId,
                    p_event_payload: {
                        title: payload.title,
                        date: payload.date,
                        time: payload.time,
                        duration_minutes: payload.durationMinutes,
                        location: payload.location,
                        category: payload.category,
                        custom_category_label: payload.customCategoryLabel,
                        note: payload.note,
                        is_recurring: payload.isRecurring,
                        recurrence_rule: payload.recurrenceRule,
                        recurrence_anchor_date: payload.recurrenceAnchorDate,
                        reminder_offsets: payload.reminderOffsets,
                    },
                },
            );
            if (error) throw error;
            return mapCalendarEventRow(data as CalendarEventRow);
        },

        onSuccess: (data) => {
            qc.setQueryData(calendarKeys.eventById(data.id), data);
            qc.invalidateQueries({
                queryKey: calendarKeys.all,
                predicate: (q) => {
                    const kind = q.queryKey[1] as string | undefined;
                    return kind === "events-range" || kind === "ideas";
                },
            });
        },
    });
}
