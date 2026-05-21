"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchEventQuery } from "~queries/calendar/fetch-event";

// id может быть null до того как пользователь выбрал event (например модалка
// открыта в new-mode). enabled через spread — queryKey формы фабрики
// (calendarKeys.eventById) кэшируется в slot'е "none", но queryFn никогда не
// зовётся пока enabled=false.
export function useEvent(id: string | null) {
    return useQuery({
        ...createFetchEventQuery(id ?? "none"),
        enabled: Boolean(id),
    });
}
