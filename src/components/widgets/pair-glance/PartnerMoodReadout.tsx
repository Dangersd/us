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

interface PartnerMoodReadoutProps {
    entry: MoodEntry;
    /** Имя партнёра для aria-label (Design polish #6). */
    partnerName: string;
    /** Гендер партнёра — для склонения эмоции. */
    partnerGender: Gender | null;
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

const HIDDEN_DASH = "—";

const PartnerMoodReadout = ({
    entry,
    partnerName,
    partnerGender,
    className,
}: PartnerMoodReadoutProps) => {
    const { row, label, value, hidden, root, empty } = styles();

    // emotion privacy в эффекте бинарна: full = показываем эмоцию, иначе
    // прячем (vibe не имеет смысла — эмоция уже бакет-лейбл, не число).
    const emotionShown = entry.visibility.emotion === "full" && entry.emotion;
    const emotionText = emotionShown
        ? emotionLabel(entry.emotion!, partnerGender)
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

    // Если ничего не разрешено к показу — тап не должен открывать пустую
    // плашку с 4 прочерками. Покажем одну строку «ничего не делится сегодня».
    const allHidden =
        !emotionShown &&
        energy.kind === "hidden" &&
        stress.kind === "hidden" &&
        social.kind === "hidden";

    const ariaLabel = `Настроение: ${partnerName || "партнёр"} сегодня`;

    if (allHidden) {
        return (
            <div
                className={cn(root(), className)}
                role="group"
                aria-label={ariaLabel}
            >
                <p className={empty()}>ничего не делится сегодня</p>
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

export default PartnerMoodReadout;
