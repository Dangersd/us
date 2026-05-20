"use client";

import { useCallback, useMemo } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { tv } from "tailwind-variants";

import { categoryColor } from "~config/calendar";
import { CALENDAR_DATE_PARAM } from "~config/routes";
import { useTodayDate } from "~hooks/use-today-date";
import { RU_WEEKDAY_SHORT, addDays, getWeekRange } from "~libs/date";
import { cn } from "~libs/utils";
import { useEventsRange } from "~queries/calendar";

const styles = tv({
    slots: {
        root: cn("grid grid-cols-7 gap-1 py-1"),
        col: cn(
            "flex flex-col items-center gap-1",
            "rounded-md py-2",
            "transition-colors",
        ),
        label: cn("text-[10px] font-medium text-ink-muted uppercase"),
        pill: cn(
            "flex h-7 w-7 items-center justify-center",
            "rounded-full text-sm font-medium",
            "text-ink-primary",
        ),
        pillToday: cn("bg-glow-warm text-bg-base"),
        dots: cn("flex h-1 items-center gap-[3px]"),
        dot: cn("h-1 w-1 rounded-full"),
    },
});

interface CalendarMiniWeekStripProps {
    weekStart: string; // YYYY-MM-DD (Mon)
}

const CalendarMiniWeekStrip = ({ weekStart }: CalendarMiniWeekStripProps) => {
    const today = useTodayDate();
    const { root, col, label, pill, pillToday, dots, dot } = styles();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const range = useMemo(() => getWeekRange(weekStart), [weekStart]);
    const { data: occurrences } = useEventsRange(range, today);

    // Группируем occurrences по дате — максимум 3 цветных dot'а на день.
    const colorsByDate = useMemo(() => {
        const map = new Map<string, string[]>();
        for (const o of occurrences ?? []) {
            const arr = map.get(o.occurrenceDate) ?? [];
            const color = categoryColor(o.category);
            if (arr.length < 3 && !arr.includes(color)) arr.push(color);
            map.set(o.occurrenceDate, arr);
        }
        return map;
    }, [occurrences]);

    const days = useMemo(
        () =>
            Array.from({ length: 7 }, (_, i) => {
                const date = addDays(weekStart, i);
                return {
                    date,
                    weekday: RU_WEEKDAY_SHORT[i],
                    day: date.slice(8, 10),
                };
            }),
        [weekStart],
    );

    const handleSelect = useCallback(
        (date: string) => {
            const sp = new URLSearchParams(searchParams.toString());
            sp.set(CALENDAR_DATE_PARAM, date);
            router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
        },
        [pathname, router, searchParams],
    );

    return (
        <div className={root()} role="tablist">
            {days.map((d) => {
                const isToday = d.date === today;
                const colors = colorsByDate.get(d.date) ?? [];
                return (
                    <button
                        key={d.date}
                        type="button"
                        role="tab"
                        aria-label={`${d.weekday} ${d.day}`}
                        onClick={() => handleSelect(d.date)}
                        className={col()}
                    >
                        <span className={label()}>{d.weekday}</span>
                        <span className={cn(pill(), isToday && pillToday())}>
                            {parseInt(d.day, 10)}
                        </span>
                        <span className={dots()}>
                            {colors.map((c) => (
                                <span
                                    key={c}
                                    className={dot()}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default CalendarMiniWeekStrip;
