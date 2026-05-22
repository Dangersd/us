"use client";

import { tv } from "tailwind-variants";

import { CYCLE_COLORS } from "~config/cycle";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-wrap items-center gap-x-4 gap-y-2 px-2"),
        item: cn("flex items-center gap-1.5"),
        dot: cn("h-2 w-2 rounded-full"),
        label: cn("text-ink-secondary text-[10px]"),
        ring: cn("h-2 w-2 rounded-full border"),
    },
});

const CycleLegend = () => {
    const { root, item, dot, label, ring } = styles();
    return (
        <div className={root()} aria-hidden>
            <div className={item()}>
                <span
                    className={dot()}
                    style={{ backgroundColor: CYCLE_COLORS.period }}
                />
                <span className={label()}>Период</span>
            </div>
            <div className={item()}>
                <span
                    className={dot()}
                    style={{ backgroundColor: CYCLE_COLORS.fertile }}
                />
                <span className={label()}>Фертильно</span>
            </div>
            <div className={item()}>
                <span className={cn(dot(), "bg-glow-warm")} />
                <span className={label()}>Овуляция</span>
            </div>
            <div className={item()}>
                <span
                    className={ring()}
                    style={{ borderColor: CYCLE_COLORS.prognosisRing }}
                />
                <span className={label()}>Прогноз</span>
            </div>
        </div>
    );
};

export default CycleLegend;
