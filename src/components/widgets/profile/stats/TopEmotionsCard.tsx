import StatCardShell from "~components/widgets/profile/stats/StatCardShell";
import { emotionLabel } from "~config/mood";
import type { EmotionId } from "~interfaces/mood";
import type { Gender } from "~interfaces/user";
import { cn } from "~libs/utils";

export interface TopEmotionsCardProps {
    myEmotion: EmotionId | null;
    partnerEmotion: EmotionId | null;
    myGender: Gender | null;
    partnerGender: Gender | null;
    partnerName: string | null;
}

const TopEmotionsCard = ({
    myEmotion,
    partnerEmotion,
    myGender,
    partnerGender,
    partnerName,
}: TopEmotionsCardProps) => {
    if (!myEmotion && !partnerEmotion) {
        return (
            <StatCardShell title="Настроения">
                <span className={cn("text-sm italic text-ink-muted")}>
                    За последние 30 дней пока тихо
                </span>
            </StatCardShell>
        );
    }

    return (
        <StatCardShell title="Настроения">
            <div className={cn("flex flex-col gap-2")}>
                <Row name="Ты" emotion={myEmotion} gender={myGender} />
                <Row
                    name={partnerName ?? "Партнёр"}
                    emotion={partnerEmotion}
                    gender={partnerGender}
                />
            </div>
        </StatCardShell>
    );
};

const Row = ({
    name,
    emotion,
    gender,
}: {
    name: string;
    emotion: EmotionId | null;
    gender: Gender | null;
}) => (
    <div className={cn("flex items-baseline justify-between gap-2")}>
        <span className={cn("text-xs text-ink-muted")}>{name}</span>
        <span
            className={cn(
                emotion
                    ? "font-display text-lg text-ink-primary"
                    : "text-sm text-ink-muted italic",
            )}
        >
            {emotion ? emotionLabel(emotion, gender) : "—"}
        </span>
    </div>
);

export default TopEmotionsCard;
