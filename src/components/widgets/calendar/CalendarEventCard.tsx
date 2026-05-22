"use client";

import { tv } from "tailwind-variants";

import { useOpenEventModal } from "~components/widgets/calendar/event-modal";
import { displayCategoryColor, displayCategoryLabel } from "~config/calendar";
import MapPinIcon from "~icons/calendar/MapPinIcon";
import type { CalendarEventOccurrence } from "~interfaces/calendar";
import type { Gender } from "~interfaces/user";
import { RU_MONTHS_NOM, RU_WEEKDAY_SHORT } from "~libs/date";
import { cn } from "~libs/utils";

interface CalendarEventCardProps {
    occurrence: CalendarEventOccurrence;
    currentUserId: string | null;
    partnerDisplayName: string | null;
    partnerGender: Gender | null;
}

const styles = tv({
    slots: {
        root: cn(
            "block w-full text-left",
            "rounded-3xl border border-border-warm",
            "bg-bg-surface-1/85 backdrop-blur-2xl",
            "p-4",
            "transition-opacity duration-300",
        ),
        header: cn(
            "flex items-center justify-between gap-3",
            "text-[11px] uppercase tracking-wide text-ink-muted",
        ),
        dateRow: cn("inline-flex items-center gap-2 min-w-0"),
        dot: cn("h-2 w-2 shrink-0 rounded-full"),
        topRow: cn("mt-2 flex items-start justify-between gap-3"),
        title: cn(
            "font-serif text-[22px] leading-tight font-medium",
            "text-ink-primary",
        ),
        time: cn(
            "shrink-0 text-[15px] font-medium tabular-nums text-ink-primary",
        ),
        meta: cn(
            "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1",
            "text-xs text-ink-secondary",
        ),
        location: cn("inline-flex items-center gap-1"),
        attribution: cn("text-xs text-ink-muted"),
        pastDim: cn("opacity-70"),
        cancelled: cn("opacity-50 line-through decoration-1"),
    },
});

function formatTime(time: string | null, allDayFallback: string): string {
    if (!time) return allDayFallback;
    // "19:00:00" → "19:00"
    return time.slice(0, 5);
}

// "2026-05-23" → "сб · 23 мая"
function formatCardDate(date: string): string {
    const y = parseInt(date.slice(0, 4), 10);
    const m = parseInt(date.slice(5, 7), 10);
    const d = parseInt(date.slice(8, 10), 10);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const isoIdx = dow === 0 ? 6 : dow - 1;
    return `${RU_WEEKDAY_SHORT[isoIdx]} · ${d} ${RU_MONTHS_NOM[m - 1]}`;
}

function attributionLabel(
    occurrence: CalendarEventOccurrence,
    currentUserId: string | null,
    partnerDisplayName: string | null,
    partnerGender: Gender | null,
): string | null {
    if (!currentUserId) return null;
    if (occurrence.createdBy === currentUserId) return "ты предложил";
    const verb = partnerGender === "female" ? "предложила" : "предложил";
    if (partnerDisplayName) return `${partnerDisplayName} ${verb}`;
    return verb === "предложила" ? "она предложила" : "он предложил";
}

const CalendarEventCard = ({
    occurrence,
    currentUserId,
    partnerDisplayName,
    partnerGender,
}: CalendarEventCardProps) => {
    const {
        root,
        header,
        dateRow,
        dot,
        topRow,
        title,
        time,
        meta,
        location,
        attribution,
        pastDim,
        cancelled,
    } = styles();
    const openEventModal = useOpenEventModal();

    const handleClick = () =>
        openEventModal({
            mode: "edit",
            eventId: occurrence.id,
            occurrenceDate: occurrence.occurrenceDate,
        });

    const isCancelled = occurrence.state === "cancelled";
    const attribution_ = attributionLabel(
        occurrence,
        currentUserId,
        partnerDisplayName,
        partnerGender,
    );

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                root(),
                isCancelled ? cancelled() : occurrence.isPast && pastDim(),
            )}
            aria-label={occurrence.title}
            data-weather-surface="true"
        >
            <div className={header()}>
                <span className={dateRow()}>
                    <span
                        className={dot()}
                        style={{
                            backgroundColor: displayCategoryColor(
                                occurrence.category,
                                occurrence.customCategoryLabel,
                            ),
                        }}
                        aria-hidden
                    />
                    <span className="truncate">
                        {formatCardDate(occurrence.occurrenceDate)}
                    </span>
                </span>
                <span className={time()}>
                    {formatTime(occurrence.time, "весь день")}
                </span>
            </div>
            <div className={topRow()}>
                <div className="min-w-0">
                    <div className={title()}>{occurrence.title}</div>
                    <div className={meta()}>
                        <span>
                            {displayCategoryLabel(
                                occurrence.category,
                                occurrence.customCategoryLabel,
                            )}
                        </span>
                        {occurrence.location && (
                            <span className={location()}>
                                <MapPinIcon className="text-ink-muted" />
                                {occurrence.location}
                            </span>
                        )}
                        {attribution_ && (
                            <span className={attribution()}>
                                {attribution_}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
};

export default CalendarEventCard;
