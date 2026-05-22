"use client";

import { tv } from "tailwind-variants";

import { useOpenEventModal } from "~components/widgets/calendar/event-modal";
import { useOpenIdeaModal } from "~components/widgets/calendar/idea-modal";
import EllipsisIcon from "~icons/EllipsisIcon";
import CalendarPlusIcon from "~icons/calendar/CalendarPlusIcon";
import type { EventIdea } from "~interfaces/calendar";
import { cn } from "~libs/utils";

interface CalendarIdeaCardProps {
    idea: EventIdea;
}

const styles = tv({
    slots: {
        root: cn(
            "flex w-full items-stretch",
            "rounded-2xl border border-border-subtle bg-bg-surface-1",
            "overflow-hidden",
        ),
        main: cn(
            "flex min-w-0 flex-1 items-center justify-between gap-3",
            "p-4 text-left",
            "transition-colors hover:bg-bg-surface-2",
        ),
        text: cn("min-w-0 flex-1"),
        title: cn(
            "font-serif text-[16px] font-medium text-ink-primary line-clamp-1",
        ),
        note: cn("mt-0.5 text-xs text-ink-secondary line-clamp-2"),
        icon: cn("shrink-0 text-ink-muted"),
        menu: cn(
            "flex shrink-0 items-center justify-center",
            "w-11 border-l border-border-subtle",
            "text-ink-muted transition-colors",
            "hover:bg-bg-surface-2 hover:text-ink-primary",
        ),
    },
});

const CalendarIdeaCard = ({ idea }: CalendarIdeaCardProps) => {
    const { root, main, text, title, note, icon, menu } = styles();
    const openEventModal = useOpenEventModal();
    const openIdeaModal = useOpenIdeaModal();

    const handleAssign = () =>
        openEventModal({
            mode: "promote",
            promotion: { ideaId: idea.id, ideaTitle: idea.title },
        });

    const handleEdit = () => openIdeaModal({ existing: idea });

    return (
        <div className={root()} data-weather-surface="true">
            <button type="button" onClick={handleAssign} className={main()}>
                <div className={text()}>
                    <div className={title()}>{idea.title}</div>
                    {idea.note && <div className={note()}>{idea.note}</div>}
                </div>
                <CalendarPlusIcon className={icon()} />
            </button>
            <button
                type="button"
                onClick={handleEdit}
                className={menu()}
                aria-label="правка идеи"
            >
                <EllipsisIcon />
            </button>
        </div>
    );
};

export default CalendarIdeaCard;
