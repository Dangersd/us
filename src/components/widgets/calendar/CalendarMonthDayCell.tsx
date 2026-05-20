"use client";

import { tv } from "tailwind-variants";

import { useOpenEventModal } from "~components/widgets/calendar/event-modal";
import { displayCategoryColor } from "~config/calendar";
import type { CalendarEventOccurrence } from "~interfaces/calendar";
import type { CyclePhaseToken } from "~interfaces/cycle";
import { cn } from "~libs/utils";

// v0.2 cycle hook-point — рендерится per-day, не whole-grid (см.
// /plan-eng-review LOW finding: overlay?: ReactNode на grid'е был wrong
// shape). В 0.6 prop задекларирован, но рендера нет.

interface CalendarMonthDayCellProps {
    date: string; // YYYY-MM-DD
    ym: string; // YYYY-MM текущего месяца
    today: string;
    selectedDay: string | null;
    occurrences: CalendarEventOccurrence[];
    cyclePhase?: CyclePhaseToken;
}

const styles = tv({
    slots: {
        cell: cn(
            "flex h-14 flex-col items-center justify-center gap-1",
            "rounded-xl transition-colors duration-200",
        ),
        cellLink: cn(
            "hover:bg-bg-surface-1/40",
            "focus-visible:outline-none focus-visible:ring-1",
            "focus-visible:ring-glow-warm/40",
        ),
        cellSelected: cn(
            "bg-glow-warm/[0.18] inset-ring-2 inset-ring-glow-warm/30",
        ),
        cellOut: cn("opacity-30"),
        todayPill: cn(
            "flex h-6 w-6 items-center justify-center",
            "rounded-full bg-glow-warm text-bg-base",
        ),
        num: cn("text-ink-secondary text-[11px] leading-none font-medium"),
        dotsRow: cn("flex items-center justify-center gap-[3px] h-1"),
        dot: cn("h-1 w-1 rounded-full"),
        more: cn("text-[9px] text-ink-muted leading-none"),
    },
});

const CalendarMonthDayCell = ({
    date,
    ym,
    today,
    selectedDay,
    occurrences,
    cyclePhase: _cyclePhase, // зарезервировано, v0.2
}: CalendarMonthDayCellProps) => {
    const {
        cell,
        cellLink,
        cellSelected,
        cellOut,
        todayPill,
        num,
        dotsRow,
        dot,
        more,
    } = styles();
    const openEventModal = useOpenEventModal();

    const inMonth = date.slice(0, 7) === ym;
    const dayNum = Number(date.slice(8, 10));
    const isToday = date === today;
    const isSelected = date === selectedDay;

    const handleClick = () => {
        if (occurrences.length > 0) {
            const first = occurrences[0];
            openEventModal({
                mode: "edit",
                eventId: first.id,
                occurrenceDate: first.occurrenceDate,
            });
        } else {
            openEventModal({ mode: "new", initialDate: date });
        }
    };

    if (!inMonth) {
        return (
            <div className={cn(cell(), cellOut())} aria-hidden="true">
                <span className={num()}>{dayNum}</span>
            </div>
        );
    }

    // До 3 уникальных category-цветов + «+N» badge если больше.
    const seen = new Set<string>();
    const dots: string[] = [];
    for (const o of occurrences) {
        const c = displayCategoryColor(o.category, o.customCategoryLabel);
        if (dots.length < 3 && !seen.has(c)) {
            seen.add(c);
            dots.push(c);
        }
    }
    const extra = occurrences.length - dots.length;

    return (
        <button
            type="button"
            onClick={handleClick}
            id={`day-${date}`}
            className={cn(cell(), cellLink(), isSelected && cellSelected())}
            aria-label={`${dayNum} — ${occurrences.length} событий`}
            aria-current={isSelected ? "true" : undefined}
        >
            {isToday ? (
                <span className={todayPill()}>
                    <span className="text-[11px] font-semibold">{dayNum}</span>
                </span>
            ) : (
                <span className={num()}>{dayNum}</span>
            )}
            <span className={dotsRow()}>
                {dots.map((c) => (
                    <span
                        key={c}
                        className={dot()}
                        style={{ backgroundColor: c }}
                    />
                ))}
                {extra > 0 && <span className={more()}>+{extra}</span>}
            </span>
        </button>
    );
};

export default CalendarMonthDayCell;
