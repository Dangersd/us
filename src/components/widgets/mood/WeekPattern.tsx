"use client";

import { useMemo } from "react";

import { tv } from "tailwind-variants";

import WeekDayColumn from "~components/widgets/mood/WeekDayColumn";
import { useTodayDate } from "~hooks/use-today-date";
import type { MoodEntry } from "~interfaces/mood";
import { RU_WEEKDAY_SHORT, addDays, getWeekRange } from "~libs/date";
import { cn } from "~libs/utils";
import { useOwnMoodRange } from "~queries/mood/use-own-mood-range";
import { usePartnerMoodRange } from "~queries/mood/use-partner-mood-range";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";

// .pen Jtmiv → p9J7ra. Под check-in'ом: «─ НЕДЕЛЯ ─» cap, 7 колонок × 2 ряда
// mini-blob'ов (твой ряд сверху, партнёра снизу), footer «верх — ты / низ —
// {partnerName}».

interface WeekPatternProps {
    userFallbackColor: string;
    partnerFallbackColor: string;
}

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-4 p-1"),
        capRow: cn("flex items-center justify-center gap-3"),
        capDash: cn("h-px w-6 bg-glow-warm/[0.08]"),
        cap: cn(
            "text-ink-tertiary text-[11px] font-medium",
            "uppercase tracking-wide",
        ),
        columns: cn("flex justify-between gap-1"),
        footer: cn("flex items-center justify-between px-1"),
        footerText: cn("text-ink-tertiary text-[11px]"),
    },
});

const WeekPattern = ({
    userFallbackColor,
    partnerFallbackColor,
}: WeekPatternProps) => {
    const { root, capRow, capDash, cap, columns, footer, footerText } =
        styles();

    const partnerProfile = usePartnerProfile();
    const partnerName = partnerProfile.data?.displayName ?? "партнёр";

    // useTodayDate переcчитывает дату при пересечении полуночи (idle-таб case)
    // и на focus/visibilitychange — иначе после 00:00 (Бишкек) week-window
    // оставался бы вчерашним до перезагрузки.
    const today = useTodayDate();
    const { start, end } = useMemo(() => getWeekRange(today), [today]);

    const ownRange = useOwnMoodRange(start, end);
    const partnerRange = usePartnerMoodRange(start, end);

    // Индекс по дате для O(1) lookup'а.
    const ownByDate = useMemo(
        () => indexByDate(ownRange.data),
        [ownRange.data],
    );
    const partnerByDate = useMemo(
        () => indexByDate(partnerRange.data),
        [partnerRange.data],
    );

    const days = useMemo(() => {
        const out: string[] = [];
        for (let i = 0; i < 7; i++) out.push(addDays(start, i));
        return out;
    }, [start]);

    return (
        <section className={root()} aria-label="Неделя">
            <div className={capRow()}>
                <span className={capDash()} />
                <span className={cap()}>неделя</span>
                <span className={capDash()} />
            </div>

            <div className={columns()}>
                {days.map((date, i) => (
                    <WeekDayColumn
                        key={date}
                        date={date}
                        weekdayShort={RU_WEEKDAY_SHORT[i]}
                        own={ownByDate.get(date) ?? null}
                        partner={partnerByDate.get(date) ?? null}
                        userFallbackColor={userFallbackColor}
                        partnerFallbackColor={partnerFallbackColor}
                        today={today}
                    />
                ))}
            </div>

            <div className={footer()}>
                <span className={footerText()}>верх — ты</span>
                <span className={footerText()}>низ — {partnerName}</span>
            </div>
        </section>
    );
};

function indexByDate(entries: MoodEntry[] | undefined) {
    const map = new Map<string, MoodEntry>();
    if (!entries) return map;
    for (const e of entries) map.set(e.date, e);
    return map;
}

export default WeekPattern;
