"use client";

import { tv } from "tailwind-variants";

import CalendarIdeaCard from "~components/widgets/calendar/CalendarIdeaCard";
import type { EventIdea } from "~interfaces/calendar";
import { cn } from "~libs/utils";

interface CalendarIdeasListProps {
    ideas: EventIdea[];
}

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-2"),
        empty: cn(
            "rounded-2xl border border-border-subtle bg-bg-surface-1 p-6",
            "text-center text-sm text-ink-muted",
        ),
    },
});

const CalendarIdeasList = ({ ideas }: CalendarIdeasListProps) => {
    const { root, empty } = styles();
    if (ideas.length === 0) {
        return <div className={empty()}>идеи появятся здесь</div>;
    }
    return (
        <div className={root()}>
            {ideas.map((idea) => (
                <CalendarIdeaCard key={idea.id} idea={idea} />
            ))}
        </div>
    );
};

export default CalendarIdeasList;
