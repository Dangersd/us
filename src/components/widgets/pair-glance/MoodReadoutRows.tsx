"use client";

import { tv } from "tailwind-variants";

import { renderMoodField } from "~components/widgets/pair-glance/render-mood-field";
import {
    ENERGY_LABELS,
    SOCIAL_BATTERY_LABELS,
    STRESS_LABELS,
    emotionLabel,
    energyBucket,
    socialBatteryBucket,
    stressBucket,
} from "~config/mood";
import type { MoodEntry } from "~interfaces/mood";
import type { Gender } from "~interfaces/user";
import { cn } from "~libs/utils";

// Shared row body для partner-glance (сегодня) и history day-detail.
// `emptyCopy` параметр — иначе history-режим говорил бы «сегодня» на
// прошлых днях.
interface MoodReadoutRowsProps {
    entry: MoodEntry;
    /** Гендер субъекта — для склонения эмоции. */
    gender: Gender | null;
    /** Копия для "всё скрыто" состояния (зависит от контекста). */
    emptyCopy: string;
    /** aria-label для контейнера. */
    ariaLabel: string;
    className?: string;
}

const styles = tv({
    slots: {
        root: cn(
            "flex flex-col gap-2",
            "rounded-md bg-bg-surface-1/85 backdrop-blur-xl",
            "border border-border-warm px-4 py-3",
            "text-sm text-ink-secondary",
        ),
        row: cn("flex items-center justify-between gap-4"),
        label: cn("text-ink-tertiary text-xs uppercase tracking-wide"),
        value: cn("text-ink-secondary"),
        hidden: cn("text-ink-tertiary opacity-50"),
        empty: cn("text-ink-tertiary text-sm italic text-center py-1"),
    },
});

// Em-dash зарезервирован под "скрыто партнёром" (privacy-hidden), не под
// "нет данных". См. plan Phase 2 design MF3.
export const HIDDEN_DASH = "—";

const MoodReadoutRows = ({
    entry,
    gender,
    emptyCopy,
    ariaLabel,
    className,
}: MoodReadoutRowsProps) => {
    const { row, label, value, hidden, root, empty } = styles();

    const emotionShown = entry.visibility.emotion === "full" && entry.emotion;
    const emotionText = emotionShown
        ? emotionLabel(entry.emotion!, gender)
        : null;

    const energyB = energyBucket(entry.energy);
    const stressB = stressBucket(entry.stress);
    const socialB = socialBatteryBucket(entry.socialBattery);

    const energy = renderMoodField({
        value: entry.energy,
        visibility: entry.visibility.energy,
        bucketLabel: energyB ? ENERGY_LABELS[energyB] : null,
    });
    const stress = renderMoodField({
        value: entry.stress,
        visibility: entry.visibility.stress,
        bucketLabel: stressB ? STRESS_LABELS[stressB] : null,
    });
    const social = renderMoodField({
        value: entry.socialBattery,
        visibility: entry.visibility.social_battery,
        bucketLabel: socialB ? SOCIAL_BATTERY_LABELS[socialB] : null,
    });

    const allHidden =
        !emotionShown &&
        energy.kind === "hidden" &&
        stress.kind === "hidden" &&
        social.kind === "hidden";

    if (allHidden) {
        return (
            <div
                className={cn(root(), className)}
                role="group"
                aria-label={ariaLabel}
            >
                <p className={empty()}>{emptyCopy}</p>
            </div>
        );
    }

    const renderValue = (f: typeof energy) => {
        if (f.kind === "hidden") {
            return <span className={hidden()}>{HIDDEN_DASH}</span>;
        }
        if (f.kind === "vibe") {
            return <span className={value()}>{f.label}</span>;
        }
        return (
            <span className={value()}>
                {f.label} · {f.value}%
            </span>
        );
    };

    return (
        <div
            className={cn(root(), className)}
            role="group"
            aria-label={ariaLabel}
        >
            <div className={row()}>
                <span className={label()}>эмоция</span>
                {emotionText ? (
                    <span className={value()}>{emotionText}</span>
                ) : (
                    <span className={hidden()}>{HIDDEN_DASH}</span>
                )}
            </div>
            <div className={row()}>
                <span className={label()}>энергия</span>
                {renderValue(energy)}
            </div>
            <div className={row()}>
                <span className={label()}>стресс</span>
                {renderValue(stress)}
            </div>
            <div className={row()}>
                <span className={label()}>социалка</span>
                {renderValue(social)}
            </div>
        </div>
    );
};

export default MoodReadoutRows;
