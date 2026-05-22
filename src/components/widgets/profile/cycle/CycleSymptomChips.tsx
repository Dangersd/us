"use client";

import { tv } from "tailwind-variants";

import { SYMPTOM_LABELS } from "~config/cycle";
import { CYCLE_SYMPTOMS } from "~interfaces/cycle";
import type { CycleSymptom } from "~interfaces/cycle";
import { cn } from "~libs/utils";

interface CycleSymptomChipsProps {
    selected: CycleSymptom[];
    onToggle: (symptom: CycleSymptom) => void;
    /** Если задан — показываются только эти теги (для top-N в Mood checkin). */
    visible?: readonly CycleSymptom[];
    disabled?: boolean;
}

const styles = tv({
    slots: {
        root: cn("flex flex-wrap gap-2"),
        chip: cn(
            "rounded-full px-3 py-1.5 text-[12px]",
            "border transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-glow-warm/40",
        ),
        chipOn: cn("bg-glow-warm/20 border-glow-warm/50 text-ink-primary"),
        chipOff: cn(
            "bg-bg-surface-2/60 border-border-warm/40 text-ink-secondary",
            "hover:border-border-warm",
        ),
    },
});

const CycleSymptomChips = ({
    selected,
    onToggle,
    visible,
    disabled,
}: CycleSymptomChipsProps) => {
    const { root, chip, chipOn, chipOff } = styles();
    const list = visible ?? CYCLE_SYMPTOMS;
    const selectedSet = new Set(selected);

    return (
        <div className={root()}>
            {list.map((s) => {
                const on = selectedSet.has(s);
                return (
                    <button
                        key={s}
                        type="button"
                        onClick={() => onToggle(s)}
                        disabled={disabled}
                        className={cn(chip(), on ? chipOn() : chipOff())}
                        aria-pressed={on}
                    >
                        {SYMPTOM_LABELS[s]}
                    </button>
                );
            })}
        </div>
    );
};

export default CycleSymptomChips;
