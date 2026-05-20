"use client";

import Link from "next/link";
import { tv } from "tailwind-variants";

import MoodMiniBlob from "~components/widgets/mood/MoodMiniBlob";
import { MOOD_HISTORY_R } from "~config/routes";
import type { MoodEntry } from "~interfaces/mood";
import { cn } from "~libs/utils";

// Один столбец недели: лейбл «Пн» + own mini-blob + partner mini-blob.
// Каждый столбец — `<Link>` на /mood/history?m=YYYY-MM&d=YYYY-MM-DD,
// тап ведёт в полную историю с якорем на день.

interface WeekDayColumnProps {
    /** YYYY-MM-DD дня. */
    date: string;
    /** Короткий лейбл «Пн»…«Вс». */
    weekdayShort: string;
    own: MoodEntry | null;
    partner: MoodEntry | null;
    userFallbackColor: string;
    partnerFallbackColor: string;
    /** Сегодняшняя дата (для подсветки текущей колонки). */
    today: string;
}

const styles = tv({
    slots: {
        link: cn(
            "flex flex-col items-center gap-2.5",
            "w-10 py-1.5 rounded-xl",
            "transition-colors duration-200",
            "hover:bg-bg-surface-1/40",
            "focus-visible:outline-none focus-visible:ring-1",
            "focus-visible:ring-glow-warm/40",
        ),
        linkToday: cn("bg-bg-surface-1/30"),
        label: cn(
            "text-ink-tertiary text-[10px] font-medium leading-none",
            "uppercase tracking-wide",
        ),
        labelToday: cn("text-ink-secondary"),
        cell: cn("flex h-8 w-8 items-center justify-center"),
    },
});

const WeekDayColumn = ({
    date,
    weekdayShort,
    own,
    partner,
    userFallbackColor,
    partnerFallbackColor,
    today,
}: WeekDayColumnProps) => {
    const { link, linkToday, label, labelToday, cell } = styles();
    const ym = date.slice(0, 7);
    const isToday = date === today;

    return (
        <Link
            href={`${MOOD_HISTORY_R()}?m=${ym}&d=${date}`}
            className={cn(link(), { [linkToday()]: isToday })}
            aria-label={`${weekdayShort} ${Number(date.slice(8, 10))} — открыть в истории`}
        >
            <span className={cn(label(), { [labelToday()]: isToday })}>
                {weekdayShort}
            </span>
            <span className={cell()}>
                <MoodMiniBlob
                    entry={own}
                    fallbackColor={userFallbackColor}
                    size={24}
                />
            </span>
            <span className={cell()}>
                <MoodMiniBlob
                    entry={partner}
                    fallbackColor={partnerFallbackColor}
                    size={24}
                />
            </span>
        </Link>
    );
};

export default WeekDayColumn;
