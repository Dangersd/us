"use client";

import { useCallback } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { tv } from "tailwind-variants";

import { CALENDAR_EVENT_PARAM } from "~config/routes";
import PlusIcon from "~icons/calendar/PlusIcon";
import { cn } from "~libs/utils";

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

const CalendarFab = () => {
    const { wrap, btn } = styles();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleClick = useCallback(() => {
        const sp = new URLSearchParams(searchParams.toString());
        sp.set(CALENDAR_EVENT_PARAM, "new");
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }, [pathname, router, searchParams]);

    return (
        <div className={wrap()} aria-hidden={false}>
            <button
                type="button"
                onClick={handleClick}
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
