"use client";

import { tv } from "tailwind-variants";

import Button from "~components/ui/Button";
import { EMOTIONS, emotionLabel } from "~config/mood";
import { EMOTION_ICONS } from "~icons/emotions";
import type { EmotionId } from "~interfaces/mood";
import type { Gender } from "~interfaces/user";
import { cn } from "~libs/utils";

interface EmotionPickerProps {
    value: EmotionId | null;
    onChange: (next: EmotionId) => void;
    /** Гендер юзера — для склонения label'а в RU. */
    gender: Gender | null;
    disabled?: boolean;
    className?: string;
}

// role="group" (не radiogroup) — radiogroup требует roving tabindex + arrow nav,
// что overhead для 8-emotion grid'а. Каждый button сам по себе a11y-валиден
// + aria-pressed сообщает selected-state (review P0 EmotionPicker).
const styles = tv({
    slots: {
        grid: cn("grid grid-cols-4 gap-3", "md:grid-cols-8"),
        cell: cn(
            "h-auto flex flex-col items-center justify-center gap-1",
            "min-h-16 px-2 py-2 rounded-md",
            "border border-transparent",
            "text-ink-secondary hover:text-ink-primary",
        ),
    },
    variants: {
        selected: {
            true: {
                cell: cn(
                    "border-[rgba(255,201,168,0.4)]",
                    "shadow-[0_0_24px_rgba(232,180,255,0.18)]",
                    "scale-105 text-ink-primary",
                ),
            },
            false: { cell: "" },
        },
    },
    defaultVariants: { selected: false },
});

const EmotionPicker = ({
    value,
    onChange,
    gender,
    disabled,
    className,
}: EmotionPickerProps) => {
    const { grid, cell } = styles();
    return (
        <div
            className={cn(grid(), className)}
            role="group"
            aria-label="Эмоция дня"
        >
            {EMOTIONS.map((meta) => {
                const Icon = EMOTION_ICONS[meta.id];
                const isSelected = value === meta.id;
                const label = emotionLabel(meta.id, gender);
                return (
                    <Button
                        key={meta.id}
                        variant="ghost"
                        size="sm"
                        aria-pressed={isSelected}
                        aria-label={label}
                        disabled={disabled}
                        onClick={() => onChange(meta.id)}
                        className={cn(cell({ selected: isSelected }))}
                    >
                        <Icon width={48} height={48} />
                        <span
                            className={cn(
                                "font-display italic text-[13px] leading-none",
                            )}
                        >
                            {label}
                        </span>
                    </Button>
                );
            })}
        </div>
    );
};

export default EmotionPicker;
