"use client";

import { useMemo } from "react";

import { tv } from "tailwind-variants";

import CalendarMonthDayCell from "~components/widgets/calendar/CalendarMonthDayCell";
import { useTodayDate } from "~hooks/use-today-date";
import type { CalendarEventOccurrence } from "~interfaces/calendar";
import type { CyclePhaseToken } from "~interfaces/cycle";
import {
    RU_WEEKDAY_SHORT,
    addDays,
    endOfIsoWeek,
    endOfMonth,
    getMonthRange,
    startOfIsoWeek,
} from "~libs/date";
import { cn } from "~libs/utils";
import { useEventsRange } from "~queries/calendar";
import { dayPhaseToken, extractPeriodStarts } from "~queries/cycle";
import { useCycleHistory } from "~queries/cycle/use-cycle-history";
import { useCycleMonth } from "~queries/cycle/use-cycle-month";
import { useCurrentUser } from "~queries/user/use-current-user";

interface CalendarMonthGridProps {
    ym: string;
    selectedDay: string | null;
}

const styles = tv({
    slots: {
        root: cn("relative flex flex-col gap-2"),
        header: cn("grid grid-cols-7 gap-1 px-2"),
        weekday: cn(
            "text-ink-muted text-[10px] font-medium uppercase",
            "text-center tracking-wide py-1",
        ),
        grid: cn("relative grid grid-cols-7 gap-1"),
    },
});

function buildMonthDays(ym: string): string[] {
    const first = `${ym}-01`;
    const last = endOfMonth(ym);
    const gridStart = startOfIsoWeek(first);
    const gridEnd = endOfIsoWeek(last);
    const out: string[] = [];
    let cursor = gridStart;
    for (let i = 0; i < 50 && cursor <= gridEnd; i++) {
        out.push(cursor);
        cursor = addDays(cursor, 1);
    }
    return out;
}

function indexByDate(occurrences: CalendarEventOccurrence[] | undefined) {
    const map = new Map<string, CalendarEventOccurrence[]>();
    if (!occurrences) return map;
    for (const o of occurrences) {
        const arr = map.get(o.occurrenceDate) ?? [];
        arr.push(o);
        map.set(o.occurrenceDate, arr);
    }
    return map;
}

const CalendarMonthGrid = ({ ym, selectedDay }: CalendarMonthGridProps) => {
    const { root, header, weekday, grid } = styles();
    const today = useTodayDate();

    const range = useMemo(() => getMonthRange(ym), [ym]);
    const { data: occurrences } = useEventsRange(range, today);

    // Phase 0.11: cycle overlay — только для female-аккаунта. Hook'и всегда
    // вызываются (нельзя conditional hook), но реально fetch'ятся только когда
    // gender=female (RLS вернёт пустоту для male — graceful).
    const { data: me } = useCurrentUser();
    const isFemale = me?.gender === "female";
    const { data: cycleMonth } = useCycleMonth(ym);
    const { data: cycleHistory } = useCycleHistory(180);

    const cycleByDate = useMemo<Map<string, CyclePhaseToken>>(() => {
        if (!isFemale) return new Map();
        const periodStarts = extractPeriodStarts(cycleHistory ?? []);
        const map = new Map<string, CyclePhaseToken>();
        // avgLen в overlay'е — берём 28 если нет cycleHistory с >=2 циклами.
        // Точная middle-ground; для precise значения юзер открывает /profile/cycle.
        const avgLen = 28;
        const entries = cycleMonth ?? [];
        const days = buildMonthDays(ym);
        for (const d of days) {
            const token = dayPhaseToken(d, entries, periodStarts, avgLen);
            if (token !== "none") map.set(d, token);
        }
        return map;
    }, [isFemale, cycleHistory, cycleMonth, ym]);

    const occurrencesByDate = useMemo(
        () => indexByDate(occurrences),
        [occurrences],
    );

    const days = useMemo(() => buildMonthDays(ym), [ym]);

    return (
        <div className={root()}>
            <div className={header()} aria-hidden="true">
                {RU_WEEKDAY_SHORT.map((w) => (
                    <span key={w} className={weekday()}>
                        {w}
                    </span>
                ))}
            </div>

            <div className={grid()}>
                {days.map((d) => (
                    <CalendarMonthDayCell
                        key={d}
                        date={d}
                        ym={ym}
                        today={today}
                        selectedDay={selectedDay}
                        occurrences={occurrencesByDate.get(d) ?? []}
                        cyclePhase={cycleByDate.get(d)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CalendarMonthGrid;
