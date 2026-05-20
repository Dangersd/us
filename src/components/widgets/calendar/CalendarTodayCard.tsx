"use client";

import { tv } from "tailwind-variants";

import { useOpenEventModal } from "~components/widgets/calendar/event-modal";
import PlusCircleIcon from "~icons/calendar/PlusCircleIcon";
import type { CalendarEventOccurrence } from "~interfaces/calendar";
import { cn } from "~libs/utils";

interface CalendarTodayCardProps {
    today: string;
    todayEvents: CalendarEventOccurrence[];
}

const styles = tv({
    slots: {
        root: cn(
            "flex flex-col gap-1",
            "rounded-2xl border border-border-subtle bg-bg-surface-1",
            "p-4",
        ),
        title: cn(
            "font-serif text-[20px] leading-tight font-medium text-ink-primary",
        ),
        subtitle: cn("text-[13px] text-ink-muted"),
        cta: cn(
            "mt-2 inline-flex items-center gap-1.5",
            "text-[13px] font-medium text-glow-warm",
            "transition-opacity hover:opacity-80",
        ),
    },
});

const CalendarTodayCard = ({ today, todayEvents }: CalendarTodayCardProps) => {
    const { root, title, subtitle, cta } = styles();
    const openEventModal = useOpenEventModal();

    const handleAdd = () => openEventModal({ mode: "new", initialDate: today });

    const isEmpty = todayEvents.length === 0;
    const firstEvent = todayEvents[0];
    const extraCount = todayEvents.length - 1;

    return (
        <div className={root()}>
            {isEmpty ? (
                <>
                    <span className={title()}>Тихий день</span>
                    <span className={subtitle()}>
                        Никаких планов — спокойствие.
                    </span>
                </>
            ) : (
                <>
                    <span className={title()}>{firstEvent.title}</span>
                    <span className={subtitle()}>
                        {firstEvent.time
                            ? firstEvent.time.slice(0, 5)
                            : "весь день"}
                        {extraCount > 0 && ` · и ещё ${extraCount}`}
                    </span>
                </>
            )}
            <button type="button" onClick={handleAdd} className={cta()}>
                <PlusCircleIcon />
                добавить план
            </button>
        </div>
    );
};

export default CalendarTodayCard;
