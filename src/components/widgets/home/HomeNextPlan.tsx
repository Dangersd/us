"use client";

import Link from "next/link";
import { tv } from "tailwind-variants";

import { formatDateLine } from "~components/widgets/home/utils/format-date-line";
import { pickNextEvent } from "~components/widgets/home/utils/pick-next-event";
import { EVENT_CATEGORY_BY_ID } from "~config/calendar";
import { CALENDAR_R } from "~config/routes";
import { useTodayDate } from "~hooks/use-today-date";
import { addDays } from "~libs/date";
import { cn } from "~libs/utils";
import { useEventsRange } from "~queries/calendar/use-events-range";

const styles = tv({
    slots: {
        root: cn(
            "relative block overflow-hidden",
            "rounded-3xl p-5",
            "bg-bg-surface-1/85 backdrop-blur-xl",
            "border border-border-warm",
        ),
        accent: cn(
            "pointer-events-none absolute left-0 top-1/2 -translate-y-1/2",
            "h-32 w-[3px] rounded-r-full",
            "bg-home-accent-bar",
        ),
        topRow: cn("flex items-center gap-2 text-[13px] text-ink-muted"),
        dot: cn("inline-block size-2.5 rounded-full"),
        title: cn(
            "mt-2 font-display text-2xl font-medium leading-tight text-ink-primary",
        ),
        sub: cn("mt-1 text-xs text-ink-muted"),
        empty: cn(
            "block rounded-3xl bg-bg-surface-1/60 border border-border-warm",
            "p-5 text-center text-ink-secondary text-sm",
            "backdrop-blur-md transition-colors hover:bg-bg-surface-1/80",
        ),
    },
});

const HomeNextPlan = () => {
    const today = useTodayDate();
    const range = { start: today, end: addDays(today, 60) };
    const events = useEventsRange(range, today);
    const next = pickNextEvent(events.data, today);
    const { root, accent, topRow, dot, title, sub, empty } = styles();

    if (!next) {
        return (
            <Link href={CALENDAR_R()} className={empty()}>
                Тишина. Может, придумаем что-то?
            </Link>
        );
    }

    const cat = EVENT_CATEGORY_BY_ID[next.category];

    return (
        <Link href={CALENDAR_R()} className={root()}>
            <span aria-hidden className={accent()} />
            <div className={topRow()}>
                <span
                    aria-hidden
                    className={dot()}
                    style={{ backgroundColor: cat.color }}
                />
                <span className="uppercase tracking-wide">
                    {formatDateLine(next.occurrenceDate)}
                </span>
                {next.time ? (
                    <>
                        <span aria-hidden>·</span>
                        <span className="text-ink-primary">
                            {next.time.slice(0, 5)}
                        </span>
                    </>
                ) : null}
            </div>
            <h2 className={title()}>{next.title}</h2>
            {next.note ? <p className={sub()}>{next.note}</p> : null}
        </Link>
    );
};

export default HomeNextPlan;
