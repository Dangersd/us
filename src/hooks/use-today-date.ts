"use client";

import { useEffect, useState } from "react";

import { COUPLE_TZ, todayDateString } from "~libs/date";

// Возвращает сегодняшнюю дату пары (YYYY-MM-DD в TZ Бишкека, см.
// COUPLE_TZ) и пересчитывает её на focus / visibilitychange / переход через
// полночь (setTimeout). Решает 23:59 → 00:01 stale-key bug в React Query,
// когда таб открыт через полночь — и плюс гарантирует, что SSR-prefetch
// (тоже COUPLE_TZ) совпадает с клиентским ключом.
export function useTodayDate(): string {
    const [date, setDate] = useState(() => todayDateString(COUPLE_TZ));

    useEffect(() => {
        const refresh = () => {
            const next = todayDateString(COUPLE_TZ);
            setDate((prev) => (prev === next ? prev : next));
        };

        // setTimeout до следующей полуночи + 1s — закрывает кейс idle-таба
        // (на нём focus/visibilitychange не выстреливают). Используем UTC-offset
        // Бишкека (+6) вместо setHours(24,...), чтобы не зависеть от устройства.
        const nowMs = Date.now();
        const bishkekOffsetMs = 6 * 60 * 60 * 1000;
        const msIntoDay = (nowMs + bishkekOffsetMs) % (24 * 60 * 60 * 1000);
        const msUntilMidnight = 24 * 60 * 60 * 1000 - msIntoDay + 1000;
        const midnightTid = window.setTimeout(refresh, msUntilMidnight);

        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", refresh);

        return () => {
            window.clearTimeout(midnightTid);
            window.removeEventListener("focus", refresh);
            document.removeEventListener("visibilitychange", refresh);
        };
    }, [date]);

    return date;
}
