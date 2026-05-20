"use client";

import { useCallback } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { tv } from "tailwind-variants";

import { categoryColor, categoryLabel } from "~config/calendar";
import { CALENDAR_EVENT_PARAM } from "~config/routes";
import MapPinIcon from "~icons/calendar/MapPinIcon";
import type { CalendarEventOccurrence } from "~interfaces/calendar";
import type { Gender } from "~interfaces/user";
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
            "relative block w-full text-left",
            "rounded-3xl border border-border-warm",
            "bg-bg-surface-1/85 backdrop-blur-2xl",
            "p-4",
            "transition-opacity duration-300",
        ),
        topRow: cn("flex items-start justify-between gap-3"),
        dot: cn(
            "absolute left-2 top-1/2 -translate-y-1/2",
            "h-2 w-2 rounded-full",
        ),
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
        topRow,
        dot,
        title,
        time,
        meta,
        location,
        attribution,
        pastDim,
        cancelled,
    } = styles();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleClick = useCallback(() => {
        const sp = new URLSearchParams(searchParams.toString());
        sp.set(CALENDAR_EVENT_PARAM, occurrence.occurrenceId);
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }, [occurrence.occurrenceId, pathname, router, searchParams]);

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
        >
            <span
                className={dot()}
                style={{ backgroundColor: categoryColor(occurrence.category) }}
                aria-hidden
            />
            <div className={topRow()}>
                <div className="min-w-0">
                    <div className={title()}>{occurrence.title}</div>
                    <div className={meta()}>
                        <span>{categoryLabel(occurrence.category)}</span>
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
                <span className={time()}>
                    {formatTime(occurrence.time, "весь день")}
                </span>
            </div>
        </button>
    );
};

export default CalendarEventCard;
