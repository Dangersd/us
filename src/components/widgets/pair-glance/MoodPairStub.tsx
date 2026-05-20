"use client";

import MoodBlob from "~components/ui/MoodBlob";
import { EMOTION_BY_ID } from "~config/mood";
import { todayDateString } from "~libs/date";
import { cn } from "~libs/utils";
import { usePartnerTodayMood } from "~queries/mood/use-partner-today-mood";
import { useTodayMood } from "~queries/mood/use-today-mood";

interface MoodPairStubProps {
    /** "Свой" цвет-fallback когда emotion не выбран. */
    userFallbackColor: string;
    /** Personal-hue заглушка для partner. */
    partnerFallbackColor: string;
    /** Подпись партнёра ("она" / "он"). */
    partnerLabel: string;
    /** Сообщение когда партнёр не отметился сегодня. */
    partnerMissingLabel: string;
    date?: string;
}

const PLACEHOLDER_COLOR = "#6F6677";

// Минимальный pair-glance stub: два блоба рядом, имена-подписи.
// Полноценный polished MoodPairGlance — 0.5.5. Этот stub нужен чтобы
// dogfooding-сессия не выглядела как комната с одним человеком.
//
// Свой блоб = useTodayMood(committed) — НЕ draft. Live drag юзера живёт
// внутри MoodCheckinCard'а, чтобы не было визуального шума в room-view.
const MoodPairStub = ({
    userFallbackColor,
    partnerFallbackColor,
    partnerLabel,
    partnerMissingLabel,
    date = todayDateString(),
}: MoodPairStubProps) => {
    const me = useTodayMood(date);
    const partner = usePartnerTodayMood(date);

    const myEmotion = me.data?.emotion ?? null;
    const myColor = myEmotion
        ? EMOTION_BY_ID[myEmotion].color
        : userFallbackColor;
    const partnerHasEntry = partner.data !== null && partner.data !== undefined;
    const partnerEmotion = partner.data?.emotion ?? null;
    const partnerColor = partnerHasEntry
        ? partnerEmotion
            ? EMOTION_BY_ID[partnerEmotion].color
            : partnerFallbackColor
        : PLACEHOLDER_COLOR;

    return (
        <div
            className={cn("flex items-end justify-center gap-6 md:gap-12 mb-8")}
        >
            <figure className={cn("flex flex-col items-center gap-2")}>
                <MoodBlob
                    color={myColor}
                    energy={me.data?.energy ?? 50}
                    stress={me.data?.stress ?? 0}
                    socialBattery={me.data?.socialBattery ?? 50}
                    size={120}
                    aria-label="Твой блоб настроения"
                />
                <figcaption className={cn("text-ink-secondary text-xs")}>
                    ты
                </figcaption>
            </figure>
            <figure className={cn("flex flex-col items-center gap-2")}>
                <MoodBlob
                    color={partnerColor}
                    energy={partner.data?.energy ?? 50}
                    stress={partner.data?.stress ?? 0}
                    socialBattery={partner.data?.socialBattery ?? 50}
                    size={120}
                    aura={partnerHasEntry}
                    aria-label={
                        partnerHasEntry
                            ? "Блоб настроения партнёра"
                            : partnerMissingLabel
                    }
                    className={cn({ "opacity-50": !partnerHasEntry })}
                />
                <figcaption className={cn("text-ink-secondary text-xs")}>
                    {partnerHasEntry ? partnerLabel : partnerMissingLabel}
                </figcaption>
            </figure>
        </div>
    );
};

export default MoodPairStub;
