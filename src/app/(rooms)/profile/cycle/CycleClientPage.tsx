"use client";

import { useMemo } from "react";

import Link from "next/link";
import { tv } from "tailwind-variants";

import RoomShell from "~components/shell/RoomShell";
import {
    CycleHero,
    CycleLegend,
    CycleMonthGrid,
    CyclePhaseToggle,
    CycleRing,
    CycleStatsRow,
} from "~components/widgets/profile/cycle";
import { PROFILE_R } from "~config/routes";
import { cn } from "~libs/utils";
import { computeStats, extractPeriodStarts } from "~queries/cycle";
import { useCycleHistory } from "~queries/cycle/use-cycle-history";
import { useMyPhase } from "~queries/cycle/use-my-phase";

const styles = tv({
    slots: {
        topBar: cn("flex items-center justify-between mb-4 px-2"),
        backLink: cn(
            "text-ink-muted text-[14px] hover:text-ink-secondary transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-glow-warm/40 rounded",
        ),
        title: cn("font-display text-ink-primary text-[18px]"),
        heroRow: cn("flex items-stretch gap-4"),
        heroLeft: cn("flex-1"),
        heroRight: cn("flex items-center"),
        stack: cn("flex flex-col gap-6"),
    },
});

const CycleClientPage = () => {
    const { topBar, backLink, title, heroRow, heroLeft, heroRight, stack } =
        styles();
    const { data: phase } = useMyPhase();
    const { data: history } = useCycleHistory(180);

    const periodStarts = useMemo(
        () => extractPeriodStarts(history ?? []),
        [history],
    );
    const stats = useMemo(
        () => computeStats(periodStarts, phase?.cycleLength ?? 28),
        [periodStarts, phase?.cycleLength],
    );

    return (
        <RoomShell roomId="profile">
            <div className={topBar()}>
                <Link href={PROFILE_R()} className={backLink()}>
                    ‹ Профиль
                </Link>
                <span className={title()}>Цикл</span>
                <span className="w-12" aria-hidden />
            </div>

            <div className={stack()}>
                <div className={heroRow()}>
                    <div className={heroLeft()}>
                        <CycleHero phase={phase ?? null} />
                    </div>
                    <div className={heroRight()}>
                        <CycleRing
                            phase={phase ?? null}
                            periodStarts={periodStarts}
                        />
                    </div>
                </div>

                <CycleMonthGrid />

                <CycleLegend />

                <CycleStatsRow stats={stats} />

                <CyclePhaseToggle />
            </div>
        </RoomShell>
    );
};

export default CycleClientPage;
