"use client";

import { useMemo } from "react";

import { tv } from "tailwind-variants";

import CalendarEventCard from "~components/widgets/calendar/CalendarEventCard";
import type { CalendarEventOccurrence } from "~interfaces/calendar";
import type { Gender } from "~interfaces/user";
import { RU_MONTHS_NOM, RU_WEEKDAY_SHORT } from "~libs/date";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-2"),
        group: cn("flex flex-col gap-2"),
        dayLabel: cn("px-1 text-[11px] uppercase tracking-wide text-ink-muted"),
        empty: cn(
            "rounded-2xl border border-border-subtle bg-bg-surface-1 p-6",
            "text-center text-sm text-ink-muted",
        ),
    },
});

function formatDayLabel(date: string): string {
    // "2026-05-22" → "Пятница · 22 мая"
    const y = parseInt(date.slice(0, 4), 10);
    const m = parseInt(date.slice(5, 7), 10);
    const d = parseInt(date.slice(8, 10), 10);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const isoIdx = dow === 0 ? 6 : dow - 1;
    return `${RU_WEEKDAY_SHORT[isoIdx]} · ${d} ${RU_MONTHS_NOM[m - 1]}`;
}

interface CalendarUpcomingListProps {
    occurrences: CalendarEventOccurrence[]; // already filtered to "upcoming" range
    excludeDate: string | null; // today — рендерится отдельной TodayCard
    currentUserId: string | null;
    partnerDisplayName: string | null;
    partnerGender: Gender | null;
}

const CalendarUpcomingList = ({
    occurrences,
    excludeDate,
    currentUserId,
    partnerDisplayName,
    partnerGender,
}: CalendarUpcomingListProps) => {
    const { root, group, dayLabel, empty } = styles();

    const filtered = useMemo(
        () =>
            occurrences.filter(
                (o) =>
                    o.occurrenceDate !== excludeDate && o.state !== "cancelled",
            ),
        [occurrences, excludeDate],
    );

    const grouped = useMemo(() => {
        const map = new Map<string, CalendarEventOccurrence[]>();
        for (const o of filtered) {
            const arr = map.get(o.occurrenceDate) ?? [];
            arr.push(o);
            map.set(o.occurrenceDate, arr);
        }
        return Array.from(map.entries());
    }, [filtered]);

    if (grouped.length === 0) {
        return <div className={empty()}>пусто впереди — добавь первое</div>;
    }

    return (
        <div className={root()}>
            {grouped.map(([date, events]) => (
                <div key={date} className={group()}>
                    <div className={dayLabel()}>{formatDayLabel(date)}</div>
                    {events.map((occurrence) => (
                        <CalendarEventCard
                            key={occurrence.occurrenceId}
                            occurrence={occurrence}
                            currentUserId={currentUserId}
                            partnerDisplayName={partnerDisplayName}
                            partnerGender={partnerGender}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default CalendarUpcomingList;
