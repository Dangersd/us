"use client";

import { tv } from "tailwind-variants";

import type { RepairIntensity } from "~interfaces/repair";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex items-center gap-3"),
        dot: cn(
            "size-6 rounded-full transition-colors",
            "border border-border-warm",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
        ),
        label: cn("text-sm text-ink-secondary"),
    },
    variants: {
        active: {
            true: cn("bg-ink-primary border-ink-primary"),
            false: cn("bg-transparent hover:bg-bg-surface-2"),
        },
    },
});

const ARIA_LABELS: Record<RepairIntensity, string> = {
    1: "лёгкий укол",
    2: "задело",
    3: "сильно болит",
};

const VALUES: RepairIntensity[] = [1, 2, 3];

export interface IntensitySelectorProps {
    value: RepairIntensity;
    onChange: (value: RepairIntensity) => void;
    /** ID лейбла снаружи, чтобы a11y радио-группа объявляла его. */
    labelledBy?: string;
    className?: string;
}

const IntensitySelector = ({
    value,
    onChange,
    labelledBy,
    className,
}: IntensitySelectorProps) => {
    const s = styles();
    return (
        <div
            role="radiogroup"
            aria-labelledby={labelledBy}
            className={cn(s.root(), className)}
        >
            {VALUES.map((v) => {
                const isActive = v === value;
                return (
                    <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        aria-label={ARIA_LABELS[v]}
                        onClick={() => onChange(v)}
                        className={s.dot({ active: isActive })}
                    />
                );
            })}
            <span className={s.label()}>{ARIA_LABELS[value]}</span>
        </div>
    );
};

export default IntensitySelector;
