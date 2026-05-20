"use client";

import { useCallback } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { tv } from "tailwind-variants";

import { CALENDAR_EVENT_PARAM, CALENDAR_IDEA_PARAM } from "~config/routes";
import CalendarPlusIcon from "~icons/calendar/CalendarPlusIcon";
import type { EventIdea } from "~interfaces/calendar";
import { cn } from "~libs/utils";

interface CalendarIdeaCardProps {
    idea: EventIdea;
}

const styles = tv({
    slots: {
        root: cn(
            "flex w-full items-center justify-between gap-3",
            "rounded-2xl border border-border-subtle bg-bg-surface-1",
            "p-4 text-left",
            "transition-colors hover:bg-bg-surface-2",
        ),
        text: cn("min-w-0 flex-1"),
        title: cn(
            "font-serif text-[16px] font-medium text-ink-primary line-clamp-1",
        ),
        note: cn("mt-0.5 text-xs text-ink-secondary line-clamp-2"),
        icon: cn("shrink-0 text-ink-muted"),
    },
});

const CalendarIdeaCard = ({ idea }: CalendarIdeaCardProps) => {
    const { root, text, title, note, icon } = styles();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleAssign = useCallback(() => {
        const sp = new URLSearchParams(searchParams.toString());
        sp.set(CALENDAR_EVENT_PARAM, "new");
        sp.set(CALENDAR_IDEA_PARAM, idea.id);
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }, [idea.id, pathname, router, searchParams]);

    return (
        <button type="button" onClick={handleAssign} className={root()}>
            <div className={text()}>
                <div className={title()}>{idea.title}</div>
                {idea.note && <div className={note()}>{idea.note}</div>}
            </div>
            <CalendarPlusIcon className={icon()} />
        </button>
    );
};

export default CalendarIdeaCard;
