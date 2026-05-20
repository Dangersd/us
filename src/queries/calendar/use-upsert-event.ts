"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DEFAULT_REMINDER_OFFSETS } from "~config/calendar";
import type {
    CalendarEvent,
    EventCategory,
    RecurrenceRule,
    ReminderOffset,
} from "~interfaces/calendar";
import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";
import {
    CALENDAR_EVENT_COLUMNS,
    type CalendarEventRow,
    mapCalendarEventRow,
} from "~queries/calendar/map-event-row";

// Контракт upsert: caller (form layer в 0.6.3) шлёт полный набор полей.
// На update path сохраняем существующий id — иначе Supabase upsert by id
// просто insert'нёт новую строку. Для insert: id генерим клиентом
// (crypto.randomUUID), чтобы optimistic update имел стабильный ключ.
export interface UpsertEventInput {
    id?: string;
    title: string;
    date: string;
    time: string | null; // HH:MM:SS
    durationMinutes: number | null;
    location: string | null;
    category: EventCategory;
    customCategoryLabel: string | null;
    note: string | null;
    isRecurring: boolean;
    recurrenceRule: RecurrenceRule | null;
    recurrenceAnchorDate: string | null;
    reminderOffsets: ReminderOffset[];
}

export function useUpsertEvent() {
    const qc = useQueryClient();

    return useMutation<CalendarEvent, Error, UpsertEventInput>({
        mutationFn: async (input) => {
            const supabase = getBrowserSupabase();
            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("not_authenticated");

            const id = input.id ?? crypto.randomUUID();
            const payload = {
                id,
                created_by: auth.user.id,
                title: input.title,
                date: input.date,
                time: input.time,
                duration_minutes: input.durationMinutes,
                location: input.location,
                category: input.category,
                custom_category_label: input.customCategoryLabel,
                note: input.note,
                is_recurring: input.isRecurring,
                recurrence_rule: input.recurrenceRule,
                recurrence_anchor_date: input.recurrenceAnchorDate,
                reminder_offsets:
                    input.reminderOffsets.length > 0
                        ? input.reminderOffsets
                        : [...DEFAULT_REMINDER_OFFSETS],
            };

            const { data, error } = await supabase
                .from("calendar_events")
                .upsert(payload, { onConflict: "id" })
                .select(CALENDAR_EVENT_COLUMNS)
                .single<CalendarEventRow>();
            if (error) throw error;
            return mapCalendarEventRow(data);
        },

        // C2 fix зеркалит useUpsertMood: setQueryData для canonical single-row,
        // invalidate всех events-range + ideas (idea→event promotion).
        // Без этого WeekStrip и MonthGrid не подхватят изменение до focus-refetch.
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
