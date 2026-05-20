"use client";

import { tv } from "tailwind-variants";

import CalendarIdeaCard from "~components/widgets/calendar/CalendarIdeaCard";
import { useOpenIdeaModal } from "~components/widgets/calendar/idea-modal";
import PlusCircleIcon from "~icons/calendar/PlusCircleIcon";
import type { EventIdea } from "~interfaces/calendar";
import { cn } from "~libs/utils";

interface CalendarIdeasListProps {
    ideas: EventIdea[];
}

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-2"),
        empty: cn(
            "flex flex-col items-center gap-3",
            "rounded-2xl border border-dashed border-border-subtle bg-bg-surface-1",
            "p-6 text-center",
        ),
        emptyText: cn("text-sm text-ink-muted"),
        addBtn: cn(
            "inline-flex items-center gap-1.5",
            "rounded-full border border-border-subtle bg-bg-surface-2",
            "px-4 py-2 text-[13px] font-medium text-ink-secondary",
            "transition-colors hover:text-ink-primary hover:bg-bg-surface-3",
        ),
        addInline: cn(
            "inline-flex items-center gap-1.5 self-start",
            "text-[13px] font-medium text-glow-warm",
            "transition-opacity hover:opacity-80",
            "px-1 py-1",
        ),
    },
});

const CalendarIdeasList = ({ ideas }: CalendarIdeasListProps) => {
    const { root, empty, emptyText, addBtn, addInline } = styles();
    const openIdeaModal = useOpenIdeaModal();

    if (ideas.length === 0) {
        return (
            <div className={empty()}>
                <span className={emptyText()}>идеи появятся здесь</span>
                <button
                    type="button"
                    className={addBtn()}
                    onClick={() => openIdeaModal()}
                >
                    <PlusCircleIcon />
                    добавить идею
                </button>
            </div>
        );
    }
    return (
        <div className={root()}>
            {ideas.map((idea) => (
                <CalendarIdeaCard key={idea.id} idea={idea} />
            ))}
            <button
                type="button"
                className={addInline()}
                onClick={() => openIdeaModal()}
            >
                <PlusCircleIcon />
                добавить идею
            </button>
        </div>
    );
};

export default CalendarIdeasList;
