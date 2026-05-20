"use client";

import { useEffect, useState } from "react";

import { todayDateString } from "~libs/date";

// Возвращает сегодняшнюю дату (YYYY-MM-DD) и пересчитывает её на focus,
// visibilitychange и при переходе через полночь (setTimeout). Решает
// 23:59 → 00:01 stale-key bug в React Query, когда таб открыт через полночь
// (виджеты Mood-комнаты используют этот хук как источник правды для date-ключей).
export function useTodayDate(): string {
    const [date, setDate] = useState(() => todayDateString());

    useEffect(() => {
        const refresh = () => {
            const next = todayDateString();
            setDate((prev) => (prev === next ? prev : next));
        };

        // setTimeout до следующей полуночи + 1s — закрывает кейс idle-таба
        // (на нём focus/visibilitychange не выстреливают). После выстрела
        // refresh обновит date, useEffect перезапустится с новым timeout до
        // следующей полуночи (state change → cleanup → re-mount effect).
        const nextMidnight = new Date();
        nextMidnight.setHours(24, 0, 0, 0);
        const msUntilMidnight = nextMidnight.getTime() - Date.now() + 1000;
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
