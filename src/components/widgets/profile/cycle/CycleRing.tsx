"use client";

import { tv } from "tailwind-variants";

import { CYCLE_COLORS } from "~config/cycle";
import type { CyclePhaseInfo } from "~interfaces/cycle";
import { pluralizeRu } from "~libs/ru-pluralize";
import { cn } from "~libs/utils";

interface CycleRingProps {
    phase: CyclePhaseInfo | null;
    /** Past period starts (DESC). Используется для точек вокруг кольца. */
    periodStarts: string[];
}

const SIZE = 128;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

const styles = tv({
    slots: {
        root: cn("relative flex h-32 w-32 items-center justify-center"),
        center: cn(
            "relative z-10 flex flex-col items-center justify-center gap-0.5",
            "leading-none",
        ),
        labelTop: cn("text-ink-muted text-[9px] leading-none"),
        num: cn("font-display text-ink-primary text-[26px] leading-none"),
        unit: cn("text-ink-secondary text-[10px] leading-none"),
    },
});

const CycleRing = ({ phase, periodStarts }: CycleRingProps) => {
    const { root, center, labelTop, num, unit } = styles();

    const daysTo = phase?.daysToNextPeriod ?? null;
    const cycleLen = phase?.cycleLength ?? 28;
    const progress =
        daysTo !== null && cycleLen > 0
            ? Math.max(0, Math.min(1, 1 - daysTo / cycleLen))
            : 0;
    const dashOffset = CIRC * (1 - progress);

    // Past period dots на окружности — за последние 6 месяцев максимум.
    const dots = periodStarts.slice(0, 6).map((_, idx) => {
        const angle = (idx / 6) * Math.PI * 2 - Math.PI / 2;
        const r = RADIUS + STROKE / 2 + 4;
        const cx = SIZE / 2 + Math.cos(angle) * r;
        const cy = SIZE / 2 + Math.sin(angle) * r;
        return { cx, cy };
    });

    return (
        <div className={root()}>
            <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="absolute inset-0"
                aria-hidden
            >
                {/* Track */}
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke="var(--color-bg-surface-2)"
                    strokeWidth={STROKE}
                />
                {/* Progress (cycle moved-through) */}
                {daysTo !== null ? (
                    <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={RADIUS}
                        fill="none"
                        stroke="var(--color-glow-warm)"
                        strokeWidth={STROKE}
                        strokeLinecap="round"
                        strokeDasharray={CIRC}
                        strokeDashoffset={dashOffset}
                        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                    />
                ) : null}
                {/* Past period dots */}
                {dots.map((d, i) => (
                    <circle
                        key={i}
                        cx={d.cx}
                        cy={d.cy}
                        r={3}
                        fill={CYCLE_COLORS.period}
                    />
                ))}
            </svg>
            <div className={center()}>
                <span className={labelTop()}>до периода</span>
                {daysTo !== null ? (
                    <>
                        <span className={num()}>{daysTo}</span>
                        <span className={unit()}>
                            {pluralizeRu(daysTo, ["день", "дня", "дней"])}
                        </span>
                    </>
                ) : (
                    <span className={unit()}>—</span>
                )}
            </div>
        </div>
    );
};

export default CycleRing;
