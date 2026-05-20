"use client";

import { useEffect, useState } from "react";

import { COUPLE_TZ } from "~libs/date";
import { cn } from "~libs/utils";

// Header Mood-комнаты: «Сегодня, 19 мая» + «Понедельник · HH:MM».
// Per design (untitled.pen → Jtmiv → oJh4r). Время тикает каждую минуту,
// дата — каждый день (через useTodayDate logic мы и так пересчитаем).
//
// Все строки локализуются через Intl с TZ Бишкека — клиент в путешествии
// продолжает видеть «home time».

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
    timeZone: COUPLE_TZ,
    day: "numeric",
    month: "long",
});

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
    timeZone: COUPLE_TZ,
    weekday: "long",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
    timeZone: COUPLE_TZ,
    hour: "2-digit",
    minute: "2-digit",
});

const capitalize = (s: string) =>
    s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);

const MoodHeader = () => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const tick = () => setNow(new Date());
        const id = window.setInterval(tick, 30_000);
        window.addEventListener("focus", tick);
        document.addEventListener("visibilitychange", tick);
        return () => {
            window.clearInterval(id);
            window.removeEventListener("focus", tick);
            document.removeEventListener("visibilitychange", tick);
        };
    }, []);

    const dateLine = `Сегодня, ${FULL_DATE_FORMATTER.format(now)}`;
    const weekday = capitalize(WEEKDAY_FORMATTER.format(now));
    const time = TIME_FORMATTER.format(now);
    const subLine = `${weekday} · ${time}`;

    return (
        <header className={cn("flex flex-col gap-1 p-1 mb-4")}>
            <p
                className={cn(
                    "font-display text-ink-primary",
                    "text-[28px] leading-tight font-medium tracking-[-0.01em]",
                )}
            >
                {dateLine}
            </p>
            <p
                className={cn(
                    "font-sans text-ink-muted text-[13px] font-normal",
                )}
            >
                {subLine}
            </p>
        </header>
    );
};

export default MoodHeader;
