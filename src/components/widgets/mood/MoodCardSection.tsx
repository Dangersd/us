"use client";

import type { ReactNode } from "react";

import PrivacyToggle from "~components/widgets/mood/PrivacyToggle";
import type { VisibilityLevel } from "~interfaces/mood";
import { cn } from "~libs/utils";

interface MoodCardSectionProps {
    label: string;
    fieldLabel: string; // для aria-label PrivacyToggle (винительный падеж)
    privacy: VisibilityLevel;
    onPrivacyChange: (next: VisibilityLevel) => void;
    /** Контрол (Slider / BatteryRing / EmotionPicker) или ghost-placeholder. */
    children: ReactNode;
    /** Заглушка для untouched-state (показывается ВМЕСТО control). */
    placeholder?: ReactNode;
}

// Раскладка одной секции чек-ина:
//   [Лейбл] [Privacy toggle справа]
//   [Контрол | placeholder]
// privacy=hidden — диагональный hatch overlay + opacity-40.
// Tab-order: control сначала (children), privacy toggle после (DOM-after).
const MoodCardSection = ({
    label,
    fieldLabel,
    privacy,
    onPrivacyChange,
    children,
    placeholder,
}: MoodCardSectionProps) => {
    const isHidden = privacy === "hidden";
    return (
        <section className={cn("flex flex-col gap-3")}>
            <div className={cn("flex items-center justify-between gap-3")}>
                <h3
                    className={cn(
                        "text-ink-secondary text-sm font-medium leading-none",
                    )}
                >
                    {label}
                </h3>
                <PrivacyToggle
                    value={privacy}
                    onChange={onPrivacyChange}
                    fieldLabel={fieldLabel}
                />
            </div>
            <div
                className={cn("relative", {
                    "opacity-40 bg-hatch-soft rounded-sm": isHidden,
                })}
            >
                {placeholder ?? children}
            </div>
        </section>
    );
};

export default MoodCardSection;
