"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";

import { tv } from "tailwind-variants";

import MoodMonthDayCell from "~components/widgets/mood-history/MoodMonthDayCell";
import type { MoodEntry } from "~interfaces/mood";
import {
    RU_WEEKDAY_SHORT,
    addDays,
    currentYearMonth,
    endOfIsoWeek,
    endOfMonth,
    getMonthRange,
    startOfIsoWeek,
} from "~libs/date";
import { cn } from "~libs/utils";
import { useOwnMoodRange } from "~queries/mood/use-own-mood-range";
import { usePartnerMoodRange } from "~queries/mood/use-partner-mood-range";

// Месячный grid: 7 колонок × 5–6 рядов. Lead/trail заполняются до полной
// недели — out-of-month рендерятся как dim-числа без интеракции.
//
// H3/MF6: `overlay` — слот для v0.2 cycle overlay (phase regions поверх grid'а,
// не per-cell). Не используется в 0.5.6, зарезервирован.

interface MoodMonthGridProps {
    /** YYYY-MM. */
    ym: string;
    selectedDay: string | null;
    userFallbackColor: string;
    partnerFallbackColor: string;
    /** v0.2 cycle overlay (не используется в MVP). */
    overlay?: ReactNode;
}

const styles = tv({
    slots: {
        root: cn("relative flex flex-col gap-2"),
        header: cn("grid grid-cols-7 gap-1 px-2"),
        weekday: cn(
            "text-ink-tertiary text-[10px] font-medium uppercase",
            "text-center tracking-wide py-1",
        ),
        grid: cn("relative grid grid-cols-7 gap-1"),
        overlayLayer: cn("pointer-events-none absolute inset-0"),
        empty: cn("text-ink-tertiary text-sm italic text-center py-8 px-4"),
        future: cn("text-ink-tertiary text-sm italic text-center py-4 px-4"),
    },
});

const MoodMonthGrid = ({
    ym,
    selectedDay,
    userFallbackColor,
    partnerFallbackColor,
    overlay,
}: MoodMonthGridProps) => {
    const { root, header, weekday, grid, overlayLayer, empty, future } =
        styles();

    const { start, end } = useMemo(() => getMonthRange(ym), [ym]);
    const ownRange = useOwnMoodRange(start, end);
    const partnerRange = usePartnerMoodRange(start, end);

    const ownByDate = useMemo(
        () => indexByDate(ownRange.data),
        [ownRange.data],
    );
    const partnerByDate = useMemo(
        () => indexByDate(partnerRange.data),
        [partnerRange.data],
    );

    // Сетка с lead/trail до полных недель (понедельник-старт).
    const days = useMemo(() => buildMonthDays(ym), [ym]);

    // Прилёт из WeekPattern с ?d=… — скроллим выбранную ячейку в видимую область.
    // block:'center' чтобы и заголовок месяца, и detail-карточка ниже остались в кадре.
    useEffect(() => {
        if (!selectedDay) return;
        const el = document.getElementById(`day-${selectedDay}`);
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [selectedDay]);

    const isFutureMonth = ym > currentYearMonth();
    const totalEntries =
        (ownRange.data?.length ?? 0) + (partnerRange.data?.length ?? 0);

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
                    <MoodMonthDayCell
                        key={d}
                        date={d}
                        ym={ym}
                        own={ownByDate.get(d) ?? null}
                        partner={partnerByDate.get(d) ?? null}
                        userFallbackColor={userFallbackColor}
                        partnerFallbackColor={partnerFallbackColor}
                        selectedDay={selectedDay}
                    />
                ))}
                {overlay ? (
                    <div className={overlayLayer()}>{overlay}</div>
                ) : null}
            </div>

            {isFutureMonth ? (
                <p className={future()}>пусто, ещё не пришло</p>
            ) : totalEntries === 0 &&
              !ownRange.isPending &&
              !partnerRange.isPending ? (
                <p className={empty()}>история наполняется тихо</p>
            ) : null}
        </div>
    );
};

function indexByDate(entries: MoodEntry[] | undefined) {
    const map = new Map<string, MoodEntry>();
    if (!entries) return map;
    for (const e of entries) map.set(e.date, e);
    return map;
}

function buildMonthDays(ym: string): string[] {
    const first = `${ym}-01`;
    const last = endOfMonth(ym);
    const gridStart = startOfIsoWeek(first);
    const gridEnd = endOfIsoWeek(last);

    const days: string[] = [];
    let cursor = gridStart;
    // Защита от бесконечного цикла (≤ 6×7 = 42 ячеек).
    for (let i = 0; i < 50 && cursor <= gridEnd; i++) {
        days.push(cursor);
        cursor = addDays(cursor, 1);
    }
    return days;
}

export default MoodMonthGrid;
