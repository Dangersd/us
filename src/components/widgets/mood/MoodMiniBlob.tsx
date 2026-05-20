"use client";

import { tv } from "tailwind-variants";

import MoodBlob from "~components/ui/MoodBlob";
import { HIDDEN_DASH } from "~components/widgets/pair-glance/MoodReadoutRows";
import { EMOTION_BY_ID } from "~config/mood";
import type { MoodEntry } from "~interfaces/mood";
import { cn } from "~libs/utils";

// Mini-blob для WeekPattern + MoodMonthDayCell. Размер 24px по решению
// автоплана T4 (вместо 20px из .pen mockup — иначе 8 hues плохо различимы).
//
// Empty-vocabulary (Design MF1/MF3):
//   entry == null              → muted dot (no entry that day)
//   emotion privacy "hidden"   → em-dash (privacy-hidden by partner)
//   otherwise                  → blob (emotion color | fallback)

export interface MoodMiniBlobProps {
    entry: MoodEntry | null;
    /** Цвет, если emotion null или скрыт. */
    fallbackColor: string;
    size?: number;
    /** aria-label для блоба (a11y MF2). */
    "aria-label"?: string;
    className?: string;
}

const styles = tv({
    slots: {
        wrap: cn("inline-flex items-center justify-center"),
        dot: cn("rounded-full bg-ink-tertiary/25"),
        dash: cn("text-ink-tertiary opacity-50 text-sm leading-none"),
    },
});

const MoodMiniBlob = ({
    entry,
    fallbackColor,
    size = 24,
    "aria-label": ariaLabel,
    className,
}: MoodMiniBlobProps) => {
    const { wrap, dot, dash } = styles();
    const frameStyle = { width: size, height: size };

    if (entry === null) {
        // No entry: 4px muted dot, центрирован в ячейке.
        return (
            <span
                className={cn(wrap(), className)}
                style={frameStyle}
                aria-label={ariaLabel ?? "нет записи"}
                role="img"
            >
                <span className={dot()} style={{ width: 4, height: 4 }} />
            </span>
        );
    }

    // Em-dash резерв за privacy-hidden. Применяется когда все 4 поля скрыты.
    const v = entry.visibility;
    const allHidden =
        v.emotion === "hidden" &&
        v.energy === "hidden" &&
        v.stress === "hidden" &&
        v.social_battery === "hidden";

    if (allHidden) {
        return (
            <span
                className={cn(wrap(), className)}
                style={frameStyle}
                aria-label={ariaLabel ?? "скрыто партнёром"}
                role="img"
            >
                <span className={dash()}>{HIDDEN_DASH}</span>
            </span>
        );
    }

    const emotionShown = v.emotion === "full" && entry.emotion;
    const color = emotionShown
        ? EMOTION_BY_ID[entry.emotion!].color
        : fallbackColor;

    return (
        <span className={cn(wrap(), className)} style={frameStyle}>
            <MoodBlob
                color={color}
                energy={entry.energy ?? 50}
                stress={entry.stress ?? 0}
                socialBattery={entry.socialBattery ?? 50}
                size={size}
                aura={false}
                aria-label={ariaLabel}
            />
        </span>
    );
};

export default MoodMiniBlob;
