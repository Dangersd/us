"use client";

import { tv } from "tailwind-variants";

import { PHASE_LABELS } from "~config/cycle";
import type { CyclePhaseInfo } from "~interfaces/cycle";
import { pluralizeRu } from "~libs/ru-pluralize";
import { cn } from "~libs/utils";

interface CycleHeroProps {
    phase: CyclePhaseInfo | null;
}

const styles = tv({
    slots: {
        root: cn(
            "relative overflow-hidden rounded-[32px] p-6",
            "bg-bg-surface-1/85 border border-border-warm",
        ),
        halo: cn(
            "pointer-events-none absolute -left-4 top-2 z-0",
            "h-40 w-40 rounded-full bg-mesh-rose opacity-50 blur-3xl",
        ),
        chip: cn(
            "inline-flex items-center gap-2 rounded-full bg-bg-surface-2 px-3 py-1.5",
            "text-ink-primary text-[12px] font-medium",
        ),
        chipDot: cn("h-2 w-2 rounded-full bg-glow-warm"),
        day: cn(
            "font-display text-ink-primary text-[84px] leading-none font-medium",
            "mt-3",
        ),
        caption: cn("text-ink-secondary text-[11px] mt-1"),
        empty: cn("text-ink-secondary text-[13px] italic"),
    },
});

const CycleHero = ({ phase }: CycleHeroProps) => {
    const { root, halo, chip, chipDot, day, caption, empty } = styles();

    if (!phase || phase.phase === null || phase.dayOfCycle === null) {
        return (
            <div className={cn(root(), "flex flex-col gap-2")}>
                <div aria-hidden className={halo()} />
                <span className={chip()}>
                    <span className={chipDot()} />
                    Нет данных
                </span>
                <p className={cn("relative z-10", empty())}>
                    Отметь первый период, чтобы начать отслеживание.
                </p>
            </div>
        );
    }

    return (
        <div className={cn(root(), "relative")}>
            <div aria-hidden className={halo()} />
            <div className="relative z-10 flex flex-col items-start">
                <span className={chip()}>
                    <span className={chipDot()} />
                    {PHASE_LABELS[phase.phase]}
                </span>
                <span className={day()}>{phase.dayOfCycle}</span>
                <span className={caption()}>
                    день цикла
                    {phase.daysToNextPeriod !== null
                        ? ` · до периода ${phase.daysToNextPeriod} ${pluralizeRu(
                              phase.daysToNextPeriod,
                              ["день", "дня", "дней"],
                          )}`
                        : ""}
                </span>
            </div>
        </div>
    );
};

export default CycleHero;
