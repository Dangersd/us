"use client";

import { tv } from "tailwind-variants";

import type { CycleStats } from "~interfaces/cycle";
import { pluralizeRu } from "~libs/ru-pluralize";
import { cn } from "~libs/utils";

interface CycleStatsRowProps {
    stats: CycleStats;
}

const styles = tv({
    slots: {
        root: cn("px-4 text-ink-secondary text-[12px]"),
        muted: cn("text-ink-muted"),
    },
});

const REGULARITY_LABEL: Record<CycleStats["regularity"], string> = {
    regular: "регулярный",
    irregular: "нерегулярный",
    unknown: "недостаточно данных",
};

const CycleStatsRow = ({ stats }: CycleStatsRowProps) => {
    const { root, muted } = styles();

    if (stats.regularity === "unknown") {
        return (
            <p className={cn(root(), muted())}>
                {REGULARITY_LABEL[stats.regularity]} — нужно отслеживать 3+
                цикла
            </p>
        );
    }

    return (
        <p className={root()}>
            Средняя длина {stats.avgLength}{" "}
            {pluralizeRu(stats.avgLength, ["день", "дня", "дней"])} ·{" "}
            <span className={muted()}>
                {REGULARITY_LABEL[stats.regularity]}
            </span>
            {" · "}
            {stats.trackedCycles}{" "}
            {pluralizeRu(stats.trackedCycles, ["цикл", "цикла", "циклов"])}{" "}
            отслежено
        </p>
    );
};

export default CycleStatsRow;
