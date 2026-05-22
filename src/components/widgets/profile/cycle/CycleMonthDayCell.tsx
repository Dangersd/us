"use client";

import { tv } from "tailwind-variants";

import { CYCLE_COLORS } from "~config/cycle";
import type { CyclePhaseToken } from "~interfaces/cycle";
import { cn } from "~libs/utils";

interface CycleMonthDayCellProps {
    date: string; // YYYY-MM-DD
    ym: string;
    today: string;
    token: CyclePhaseToken;
    onTap: (date: string) => void;
}

const styles = tv({
    slots: {
        cell: cn(
            "relative flex h-11 items-center justify-center rounded-full",
            "transition-colors duration-200",
            "hover:bg-bg-surface-1/40",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-glow-warm/40",
        ),
        out: cn("opacity-30 pointer-events-none"),
        num: cn("text-ink-primary text-[14px] leading-none"),
        numOut: cn("text-ink-disabled text-[14px] leading-none"),
        todayRing: cn(
            "absolute inset-0 rounded-full border border-glow-warm/40",
        ),
        ovulationHalo: cn(
            "absolute inset-[-4px] rounded-full opacity-40",
            "bg-glow-warm/30 blur-md",
        ),
    },
});

const CycleMonthDayCell = ({
    date,
    ym,
    today,
    token,
    onTap,
}: CycleMonthDayCellProps) => {
    const { cell, out, num, numOut, todayRing, ovulationHalo } = styles();
    const inMonth = date.slice(0, 7) === ym;
    const dayNum = Number(date.slice(8, 10));
    const isToday = date === today;

    if (!inMonth) {
        return (
            <div className={cn(cell(), out())} aria-hidden="true">
                <span className={numOut()}>{dayNum}</span>
            </div>
        );
    }

    const isPeriod = token === "period";
    const isOvulation = token === "ovulation";
    const isFertile = token === "fertile";
    const isPrognosis = token === "prognosis";

    const bgStyle = isPeriod
        ? { backgroundColor: CYCLE_COLORS.period }
        : isOvulation
          ? undefined // glow-warm class applied below
          : undefined;

    return (
        <button
            type="button"
            onClick={() => onTap(date)}
            id={`cycle-${date}`}
            className={cn(cell(), {
                "bg-glow-warm": isOvulation,
            })}
            style={bgStyle}
            aria-label={`${dayNum} — ${token}`}
        >
            {isToday ? <span aria-hidden className={todayRing()} /> : null}
            {isOvulation ? (
                <span aria-hidden className={ovulationHalo()} />
            ) : null}
            {isPrognosis ? (
                <span
                    aria-hidden
                    className="absolute inset-0 rounded-full border"
                    style={{ borderColor: CYCLE_COLORS.prognosisRing }}
                />
            ) : null}
            <span
                className={cn(
                    num(),
                    isOvulation && "text-bg-surface-1 font-semibold",
                )}
            >
                {dayNum}
            </span>
            {isFertile ? (
                <span
                    aria-hidden
                    className="absolute bottom-1 h-1 w-1 rounded-full"
                    style={{ backgroundColor: CYCLE_COLORS.fertile }}
                />
            ) : null}
        </button>
    );
};

export default CycleMonthDayCell;
