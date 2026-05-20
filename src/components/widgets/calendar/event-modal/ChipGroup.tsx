"use client";

import { tv } from "tailwind-variants";

import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-wrap gap-2"),
        chip: cn(
            "inline-flex items-center gap-1.5 select-none",
            "rounded-full border border-border-subtle bg-bg-surface-2",
            "px-3 py-1.5 text-[13px] text-ink-secondary",
            "transition-colors",
            "hover:text-ink-primary",
        ),
        chipActive: cn("border-border-focus bg-bg-surface-3 text-ink-primary"),
        chipDot: cn("h-2 w-2 rounded-full"),
    },
});

export interface ChipOption<T extends string> {
    id: T;
    label: string;
    color?: string;
}

interface ChipGroupProps<T extends string> {
    options: readonly ChipOption<T>[];
    selected: T[] | T | null;
    onChange: (value: T) => void;
    multi?: boolean;
    ariaLabel?: string;
}

function ChipGroup<T extends string>({
    options,
    selected,
    onChange,
    multi = false,
    ariaLabel,
}: ChipGroupProps<T>) {
    const { root, chip, chipActive, chipDot } = styles();
    const isActive = (id: T) =>
        multi
            ? Array.isArray(selected) && selected.includes(id)
            : selected === id;

    return (
        <div
            className={root()}
            role={multi ? "group" : "radiogroup"}
            aria-label={ariaLabel}
        >
            {options.map((opt) => {
                const active = isActive(opt.id);
                return (
                    <button
                        key={opt.id}
                        type="button"
                        role={multi ? "checkbox" : "radio"}
                        aria-checked={active}
                        onClick={() => onChange(opt.id)}
                        className={cn(chip(), active && chipActive())}
                    >
                        {opt.color && (
                            <span
                                className={chipDot()}
                                style={{ backgroundColor: opt.color }}
                                aria-hidden
                            />
                        )}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

export default ChipGroup;
