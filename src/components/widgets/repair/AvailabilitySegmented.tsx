"use client";

import { tv } from "tailwind-variants";

import type { RepairAvailability } from "~interfaces/repair";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-2 sm:flex-row sm:gap-3", "w-full"),
        option: cn(
            "flex-1 px-4 py-3 rounded-sm text-base text-left",
            "border transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
        ),
    },
    variants: {
        active: {
            true: cn(
                "bg-bg-surface-2 text-ink-primary border-ink-primary",
                "shadow-warm",
            ),
            false: cn(
                "bg-transparent text-ink-secondary border-border-warm",
                "hover:bg-bg-surface-1 hover:text-ink-primary",
            ),
        },
    },
});

const OPTIONS: { value: RepairAvailability; label: string }[] = [
    { value: "ready_to_talk", label: "Готов(а) поговорить" },
    { value: "need_pause", label: "Нужна пауза" },
];

export interface AvailabilitySegmentedProps {
    value: RepairAvailability;
    onChange: (value: RepairAvailability) => void;
    labelledBy?: string;
    className?: string;
}

const AvailabilitySegmented = ({
    value,
    onChange,
    labelledBy,
    className,
}: AvailabilitySegmentedProps) => {
    const s = styles();
    return (
        <div
            role="radiogroup"
            aria-labelledby={labelledBy}
            className={cn(s.root(), className)}
        >
            {OPTIONS.map((opt) => {
                const isActive = opt.value === value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => onChange(opt.value)}
                        className={s.option({ active: isActive })}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};

export default AvailabilitySegmented;
