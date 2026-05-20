"use client";

import MoodReadoutRows from "~components/widgets/pair-glance/MoodReadoutRows";
import type { MoodEntry } from "~interfaces/mood";
import type { Gender } from "~interfaces/user";

interface PartnerMoodReadoutProps {
    entry: MoodEntry;
    /** Имя партнёра для aria-label (Design polish #6). */
    partnerName: string;
    /** Гендер партнёра — для склонения эмоции. */
    partnerGender: Gender | null;
    className?: string;
}

const PartnerMoodReadout = ({
    entry,
    partnerName,
    partnerGender,
    className,
}: PartnerMoodReadoutProps) => (
    <MoodReadoutRows
        entry={entry}
        gender={partnerGender}
        emptyCopy="ничего не делится сегодня"
        ariaLabel={`Настроение: ${partnerName || "партнёр"} сегодня`}
        className={className}
    />
);

export default PartnerMoodReadout;
