"use client";

import { tv } from "tailwind-variants";

import { useOpenEventModal } from "~components/widgets/calendar/event-modal";
import PlusIcon from "~icons/calendar/PlusIcon";
import { cn } from "~libs/utils";

interface CalendarFabProps {
    /** Pre-fill date в новом событии (today обычно). */
    defaultDate?: string;
}

const styles = tv({
    slots: {
        wrap: cn(
            "pointer-events-none fixed inset-x-0 z-30",
            // Поднят над BottomNav (нав ~64px) + safe-area inset.
            "bottom-[calc(env(safe-area-inset-bottom)+76px)]",
            "flex justify-center",
        ),
        btn: cn(
            "pointer-events-auto",
            "inline-flex h-12 items-center gap-2 rounded-full",
            "bg-glow-warm px-6 text-[15px] font-medium text-bg-base",
            "shadow-[0_4px_24px_-2px_rgba(255,201,168,0.6)]",
            "transition-transform active:scale-[0.97]",
        ),
    },
});

const CalendarFab = ({ defaultDate }: CalendarFabProps) => {
    const { wrap, btn } = styles();
    const openEventModal = useOpenEventModal();

    return (
        <div className={wrap()} aria-hidden={false}>
            <button
                type="button"
                onClick={() =>
                    openEventModal({ mode: "new", initialDate: defaultDate })
                }
                className={btn()}
                aria-label="добавить событие"
            >
                <PlusIcon />
                добавить
            </button>
        </div>
    );
};

export default CalendarFab;
