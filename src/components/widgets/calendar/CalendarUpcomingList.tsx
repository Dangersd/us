"use client";

import { tv } from "tailwind-variants";

import CalendarEventCard from "~components/widgets/calendar/CalendarEventCard";
import type { CalendarEventOccurrence } from "~interfaces/calendar";
import type { Gender } from "~interfaces/user";
import { cn } from "~libs/utils";

// Без группировки по дням — дата живёт внутри карточки (см. EventCard).
// Список просто рендерит карточки по порядку дат.

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-2"),
        empty: cn(
            "rounded-2xl border border-border-subtle bg-bg-surface-1 p-6",
            "text-center text-sm text-ink-muted",
        ),
    },
});

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
    const { root, empty } = styles();

    // React Compiler сам мемоизирует — useMemo здесь оверкилл и тригерит
    // react-hooks/preserve-manual-memoization.
    const filtered = occurrences.filter(
        (o) => o.occurrenceDate !== excludeDate && o.state !== "cancelled",
    );

    if (filtered.length === 0) {
        return <div className={empty()}>пусто впереди — добавь первое</div>;
    }

    return (
        <div className={root()}>
            {filtered.map((occurrence) => (
                <CalendarEventCard
                    key={occurrence.occurrenceId}
                    occurrence={occurrence}
                    currentUserId={currentUserId}
                    partnerDisplayName={partnerDisplayName}
                    partnerGender={partnerGender}
                />
            ))}
        </div>
    );
};

export default CalendarUpcomingList;
