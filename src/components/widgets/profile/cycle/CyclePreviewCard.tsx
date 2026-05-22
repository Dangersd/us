"use client";

import Link from "next/link";
import { tv } from "tailwind-variants";

import { PHASE_LABELS } from "~config/cycle";
import { PROFILE_CYCLE_R } from "~config/routes";
import { pluralizeRu } from "~libs/ru-pluralize";
import { cn } from "~libs/utils";
import { useMyPhase } from "~queries/cycle/use-my-phase";

const styles = tv({
    slots: {
        root: cn(
            "block rounded-lg p-4 bg-bg-surface-1/85 border border-border-warm",
            "transition-colors hover:border-glow-warm/30",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-glow-warm/40",
        ),
        head: cn("flex items-center justify-between"),
        title: cn("text-[11px] uppercase tracking-wider text-ink-muted"),
        arrow: cn("text-ink-muted text-[14px]"),
        body: cn("flex items-end justify-between gap-3 mt-3"),
        left: cn("flex flex-col"),
        chip: cn(
            "inline-flex items-center gap-1.5 rounded-full bg-bg-surface-2 px-2 py-1 self-start",
            "text-ink-secondary text-[11px]",
        ),
        chipDot: cn("h-1.5 w-1.5 rounded-full bg-glow-warm"),
        day: cn(
            "font-display text-ink-primary text-[40px] leading-none font-medium mt-2",
        ),
        sub: cn("text-ink-muted text-[11px]"),
        empty: cn("text-ink-secondary text-[13px] italic mt-2"),
    },
});

const CyclePreviewCard = () => {
    const {
        root,
        head,
        title,
        arrow,
        body,
        left,
        chip,
        chipDot,
        day,
        sub,
        empty,
    } = styles();
    const { data: phase } = useMyPhase();

    return (
        <Link href={PROFILE_CYCLE_R()} className={root()}>
            <div className={head()}>
                <span className={title()}>Цикл</span>
                <span aria-hidden className={arrow()}>
                    →
                </span>
            </div>

            {phase && phase.phase && phase.dayOfCycle !== null ? (
                <div className={body()}>
                    <div className={left()}>
                        <span className={chip()}>
                            <span className={chipDot()} />
                            {PHASE_LABELS[phase.phase]}
                        </span>
                        <span className={day()}>{phase.dayOfCycle}</span>
                        <span className={sub()}>день цикла</span>
                    </div>
                    {phase.daysToNextPeriod !== null ? (
                        <span className={sub()}>
                            до периода {phase.daysToNextPeriod}{" "}
                            {pluralizeRu(phase.daysToNextPeriod, [
                                "день",
                                "дня",
                                "дней",
                            ])}
                        </span>
                    ) : null}
                </div>
            ) : (
                <p className={empty()}>
                    Лог цикла пуст — добавь первый период.
                </p>
            )}
        </Link>
    );
};

export default CyclePreviewCard;
