"use client";

import { useMemo, useState } from "react";

import { tv } from "tailwind-variants";

import CycleMonthDayCell from "~components/widgets/profile/cycle/CycleMonthDayCell";
import { useOpenCycleLogModal } from "~components/widgets/profile/cycle/useOpenCycleLogModal";
import { useTodayDate } from "~hooks/use-today-date";
import {
    RU_WEEKDAY_SHORT,
    addDays,
    currentYearMonth,
    endOfIsoWeek,
    endOfMonth,
    formatRuMonth,
    startOfIsoWeek,
} from "~libs/date";
import { cn } from "~libs/utils";
import {
    computeStats,
    dayPhaseToken,
    extractPeriodStarts,
} from "~queries/cycle";
import { useCycleHistory } from "~queries/cycle/use-cycle-history";
import { useCycleMonth } from "~queries/cycle/use-cycle-month";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-2"),
        nav: cn("flex items-center justify-between px-2"),
        navBtn: cn(
            "text-ink-muted hover:text-ink-secondary transition-colors p-1 rounded",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-glow-warm/40",
        ),
        title: cn("font-display text-ink-primary text-[20px]"),
        header: cn("grid grid-cols-7 gap-1 px-2"),
        weekday: cn(
            "text-ink-muted text-[10px] font-medium uppercase",
            "text-center tracking-wide py-1",
        ),
        grid: cn("grid grid-cols-7 gap-1"),
    },
});

function buildMonthDays(ym: string): string[] {
    const first = `${ym}-01`;
    const last = endOfMonth(ym);
    const gridStart = startOfIsoWeek(first);
    const gridEnd = endOfIsoWeek(last);
    const out: string[] = [];
    let cursor = gridStart;
    for (let i = 0; i < 50 && cursor <= gridEnd; i++) {
        out.push(cursor);
        cursor = addDays(cursor, 1);
    }
    return out;
}

function shiftMonth(ym: string, delta: number): string {
    const [y, m] = ym.split("-").map(Number);
    const newM = m + delta;
    const ny = y + Math.floor((newM - 1) / 12);
    const nm = ((((newM - 1) % 12) + 12) % 12) + 1;
    return `${ny}-${String(nm).padStart(2, "0")}`;
}

const CycleMonthGrid = () => {
    const { root, nav, navBtn, title, header, weekday, grid } = styles();
    const today = useTodayDate();
    const [ym, setYm] = useState(currentYearMonth());

    const { data: monthEntries } = useCycleMonth(ym);
    const { data: historyEntries } = useCycleHistory(180);
    const openLog = useOpenCycleLogModal();

    const periodStarts = useMemo(
        () => extractPeriodStarts(historyEntries ?? []),
        [historyEntries],
    );
    const stats = useMemo(() => computeStats(periodStarts, 28), [periodStarts]);
    const days = useMemo(() => buildMonthDays(ym), [ym]);

    const entries = monthEntries ?? [];
    const avgLen = stats.avgLength;

    return (
        <div className={root()}>
            <div className={nav()}>
                <button
                    type="button"
                    onClick={() => setYm((v) => shiftMonth(v, -1))}
                    className={navBtn()}
                    aria-label="предыдущий месяц"
                >
                    ‹
                </button>
                <span className={title()}>{formatRuMonth(ym)}</span>
                <button
                    type="button"
                    onClick={() => setYm((v) => shiftMonth(v, 1))}
                    className={navBtn()}
                    aria-label="следующий месяц"
                >
                    ›
                </button>
            </div>

            <div className={header()} aria-hidden="true">
                {RU_WEEKDAY_SHORT.map((w) => (
                    <span key={w} className={weekday()}>
                        {w}
                    </span>
                ))}
            </div>

            <div className={grid()}>
                {days.map((d) => (
                    <CycleMonthDayCell
                        key={d}
                        date={d}
                        ym={ym}
                        today={today}
                        token={dayPhaseToken(d, entries, periodStarts, avgLen)}
                        onTap={(date) => openLog({ date })}
                    />
                ))}
            </div>
        </div>
    );
};

export default CycleMonthGrid;
