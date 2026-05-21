import type { QueryClient } from "@tanstack/react-query";

import { calendarKeys } from "~queries/calendar/keys";

// Общий tail для мутаций, меняющих anchor-даты (couple anniversary, own
// birthday): POST к idempotent seed-recurring endpoint'у + invalidate всех
// events-range query'ев чтобы Календарь подхватил пересозданные авто-события.
//
// Fire-and-forget POST с явным console.warn на ошибку — UPDATE уже committed,
// fallback подхватит при следующем визите CalendarPage (TENSION-3 в
// seed-recurring.ts), но silent swallow маскировал бы реальные регрессы. warn
// делает их видимыми в DevTools без блокировки UX.
export async function reseedAndInvalidate(qc: QueryClient): Promise<void> {
    try {
        const res = await fetch("/api/calendar/seed-recurring", {
            method: "POST",
        });
        if (!res.ok) {
            console.warn(
                `[reseed] seed-recurring returned ${res.status} — eventual consistency via CalendarPage fallback`,
            );
        }
    } catch (err) {
        console.warn("[reseed] seed-recurring failed", err);
    }
    qc.invalidateQueries({
        queryKey: calendarKeys.all,
        predicate: (q) => q.queryKey[1] === "events-range",
    });
}
