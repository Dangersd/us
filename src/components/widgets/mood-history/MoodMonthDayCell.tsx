"use client";

import Link from "next/link";
import { tv } from "tailwind-variants";

import MoodMiniBlob from "~components/widgets/mood/MoodMiniBlob";
import { MOOD_HISTORY_R } from "~config/routes";
import type { MoodEntry } from "~interfaces/mood";
import { cn } from "~libs/utils";

// Ячейка месячного grid'а. Решение T3: blob+число рядом — итерируем при QA.
// Lead/trail (out-of-month) рендерятся как dim-числа без `<Link>`.

interface MoodMonthDayCellProps {
    /** YYYY-MM-DD. */
    date: string;
    /** YYYY-MM текущего просматриваемого месяца. */
    ym: string;
    own: MoodEntry | null;
    partner: MoodEntry | null;
    userFallbackColor: string;
    partnerFallbackColor: string;
    /** YYYY-MM-DD выбранного дня (для подсветки). */
    selectedDay: string | null;
}

const styles = tv({
    slots: {
        cell: cn(
            "flex h-14 flex-col items-center justify-center gap-1",
            "rounded-xl",
            "transition-colors duration-200",
        ),
        cellLink: cn(
            "hover:bg-bg-surface-1/40",
            "focus-visible:outline-none focus-visible:ring-1",
            "focus-visible:ring-glow-warm/40",
        ),
        cellSelected: cn(
            "bg-glow-warm/[0.18]",
            "inset-ring-2 inset-ring-glow-warm/30",
        ),
        cellOut: cn("opacity-30"),
        num: cn("text-ink-tertiary text-[11px] leading-none font-medium"),
        blobsRow: cn("flex items-center justify-center gap-1"),
    },
});

const MoodMonthDayCell = ({
    date,
    ym,
    own,
    partner,
    userFallbackColor,
    partnerFallbackColor,
    selectedDay,
}: MoodMonthDayCellProps) => {
    const { cell, cellLink, cellSelected, cellOut, num, blobsRow } = styles();
    const inMonth = date.slice(0, 7) === ym;
    const dayNum = Number(date.slice(8, 10));

    if (!inMonth) {
        // Out-of-month: dim число, non-interactive.
        return (
            <div className={cn(cell(), cellOut())} aria-hidden="true">
                <span className={num()}>{dayNum}</span>
            </div>
        );
    }

    const isSelected = date === selectedDay;
    const hasAny = own !== null || partner !== null;

    return (
        <Link
            href={`${MOOD_HISTORY_R()}?m=${ym}&d=${date}`}
            id={`day-${date}`}
            scroll={false}
            className={cn(cell(), cellLink(), isSelected && cellSelected())}
            aria-label={`${dayNum} — открыть детали`}
            aria-current={isSelected ? "true" : undefined}
        >
            <span className={num()}>{dayNum}</span>
            {hasAny ? (
                <span className={blobsRow()}>
                    <MoodMiniBlob
                        entry={own}
                        fallbackColor={userFallbackColor}
                        size={14}
                    />
                    <MoodMiniBlob
                        entry={partner}
                        fallbackColor={partnerFallbackColor}
                        size={14}
                    />
                </span>
            ) : (
                <span className={blobsRow()}>
                    <MoodMiniBlob
                        entry={null}
                        fallbackColor={userFallbackColor}
                        size={14}
                    />
                </span>
            )}
        </Link>
    );
};

export default MoodMonthDayCell;
