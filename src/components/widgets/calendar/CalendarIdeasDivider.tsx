import { tv } from "tailwind-variants";

import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex items-center gap-3 py-2"),
        line: cn("h-px flex-1 bg-border-subtle"),
        text: cn("text-[11px] tracking-[0.1em] uppercase text-ink-muted"),
    },
});

const CalendarIdeasDivider = () => {
    const { root, line, text } = styles();
    return (
        <div className={root()}>
            <span className={line()} aria-hidden />
            <span className={text()}>Идеи</span>
            <span className={line()} aria-hidden />
        </div>
    );
};

export default CalendarIdeasDivider;
