"use client";

import { useCallback } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { tv } from "tailwind-variants";

import { CALENDAR_VIEW_PARAM } from "~config/routes";
import { formatRuMonth } from "~libs/date";
import { cn } from "~libs/utils";

interface CalendarHeaderProps {
    ym: string; // YYYY-MM
    view: "agenda" | "month";
}

const styles = tv({
    slots: {
        root: cn("flex items-center justify-between gap-3", "py-2"),
        title: cn(
            "font-serif text-[26px] leading-none font-medium",
            "tracking-[-0.01em]",
            "text-ink-primary",
        ),
        toggle: cn(
            "inline-flex items-center gap-0.5",
            "rounded-full bg-bg-surface-1 p-[3px]",
            "border border-border-subtle",
        ),
        toggleBtn: cn(
            "rounded-full px-3 py-1.5 text-xs font-medium",
            "transition-colors duration-200",
            "text-ink-muted",
        ),
        toggleBtnActive: cn("bg-bg-surface-3 text-ink-primary"),
    },
});

const CalendarHeader = ({ ym, view }: CalendarHeaderProps) => {
    const { root, title, toggle, toggleBtn, toggleBtnActive } = styles();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const setView = useCallback(
        (next: "agenda" | "month") => {
            const sp = new URLSearchParams(searchParams.toString());
            if (next === "agenda") {
                sp.delete(CALENDAR_VIEW_PARAM);
            } else {
                sp.set(CALENDAR_VIEW_PARAM, next);
            }
            const qs = sp.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname);
        },
        [pathname, router, searchParams],
    );

    return (
        <div className={root()}>
            <h1 className={title()}>{formatRuMonth(ym)}</h1>
            <div className={toggle()} role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={view === "agenda"}
                    onClick={() => setView("agenda")}
                    className={cn(
                        toggleBtn(),
                        view === "agenda" && toggleBtnActive(),
                    )}
                >
                    лента
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={view === "month"}
                    onClick={() => setView("month")}
                    className={cn(
                        toggleBtn(),
                        view === "month" && toggleBtnActive(),
                    )}
                >
                    месяц
                </button>
            </div>
        </div>
    );
};

export default CalendarHeader;
