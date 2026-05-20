"use client";

import { useEffect, useRef, useState } from "react";

import BatteryRing from "~components/ui/BatteryRing";
import Card from "~components/ui/Card";
import Slider from "~components/ui/Slider";
import EmotionPicker from "~components/widgets/mood/EmotionPicker";
import GhostControl from "~components/widgets/mood/GhostControl";
import MoodCardHeader from "~components/widgets/mood/MoodCardHeader";
import MoodCardSection from "~components/widgets/mood/MoodCardSection";
import MoodErrorPill from "~components/widgets/mood/MoodErrorPill";
import { useTodayDate } from "~hooks/use-today-date";
import type { Gender } from "~interfaces/user";
import { cn } from "~libs/utils";
import { useMoodDraft } from "~queries/mood/use-mood-draft";

interface MoodCheckinCardProps {
    /** Override даты — для тестов / edit-yesterday (0.5.6). По умолчанию — useTodayDate(). */
    date?: string;
    /** Personal-hue заглушка для MoodBlob (когда emotion не выбран). */
    userFallbackColor: string;
    /** Светлый stop для orb BatteryRing (per design — gradient bright→base). */
    userBrightColor: string;
    /** Гендер юзера — для склонения emotion-label'ов в EmotionPicker. */
    userGender: Gender | null;
    className?: string;
}

const DEFAULT_SLIDER_VALUE = 50;
const DEFAULT_BATTERY_VALUE = 50;

const MoodCheckinCard = ({
    date: dateProp,
    userFallbackColor,
    userBrightColor,
    userGender,
    className,
}: MoodCheckinCardProps) => {
    const todayDate = useTodayDate();
    const date = dateProp ?? todayDate;
    const draft = useMoodDraft(date);

    // pulseKey бампается при каждом успешном commit'е — триггерит aura-pulse
    // в MoodCardHeader. Ловим переход pending→success.
    const [pulseKey, setPulseKey] = useState(0);
    const wasPendingRef = useRef(false);
    useEffect(() => {
        if (draft.upsertState.isPending) {
            wasPendingRef.current = true;
            return;
        }
        if (wasPendingRef.current && draft.upsertState.isSuccess) {
            wasPendingRef.current = false;
            setPulseKey((k) => k + 1);
        } else if (wasPendingRef.current && draft.upsertState.isError) {
            wasPendingRef.current = false;
        }
    }, [
        draft.upsertState.isPending,
        draft.upsertState.isSuccess,
        draft.upsertState.isError,
    ]);

    const energyHidden = draft.visibility.energy === "hidden";
    const stressHidden = draft.visibility.stress === "hidden";
    const batteryHidden = draft.visibility.social_battery === "hidden";
    const emotionHidden = draft.visibility.emotion === "hidden";

    const hasEnergy = draft.energy !== null;
    const hasStress = draft.stress !== null;
    const hasBattery = draft.socialBattery !== null;

    return (
        <Card
            className={cn(
                "flex flex-col gap-6 p-6 rounded-lg mx-auto w-full text-left",
                className,
            )}
        >
            <MoodCardHeader
                energy={draft.energy}
                stress={draft.stress}
                socialBattery={draft.socialBattery}
                emotion={draft.emotion}
                userFallbackColor={userFallbackColor}
                pulseKey={pulseKey}
            />

            <MoodCardSection
                label="Эмоция дня"
                fieldLabel="эмоция"
                privacy={draft.visibility.emotion}
                onPrivacyChange={(next) =>
                    draft.commitVisibility("emotion", next)
                }
            >
                <EmotionPicker
                    value={draft.emotion}
                    onChange={(e) => draft.commitEmotion(e)}
                    gender={userGender}
                    disabled={emotionHidden}
                />
            </MoodCardSection>

            <MoodCardSection
                label="Хочу общения"
                fieldLabel="общение"
                privacy={draft.visibility.social_battery}
                onPrivacyChange={(next) =>
                    draft.commitVisibility("social_battery", next)
                }
                placeholder={
                    !hasBattery && !batteryHidden ? (
                        <GhostControl
                            label="коснись чтобы оценить"
                            onEngage={() => {
                                draft.setLiveSocialBattery(
                                    DEFAULT_BATTERY_VALUE,
                                );
                                draft.commitSocialBattery(
                                    DEFAULT_BATTERY_VALUE,
                                );
                            }}
                        />
                    ) : undefined
                }
            >
                <div className={cn("flex justify-center")}>
                    <BatteryRing
                        value={draft.socialBattery ?? DEFAULT_BATTERY_VALUE}
                        onChange={(v) => draft.setLiveSocialBattery(v)}
                        onValueCommit={(v) => draft.commitSocialBattery(v)}
                        disabled={batteryHidden}
                        size={128}
                        color={userFallbackColor}
                        centerColor={userBrightColor}
                        aria-label="Заряд социальной батареи 0–100"
                    />
                </div>
            </MoodCardSection>

            <MoodCardSection
                label="Энергия"
                fieldLabel="энергия"
                privacy={draft.visibility.energy}
                onPrivacyChange={(next) =>
                    draft.commitVisibility("energy", next)
                }
                placeholder={
                    !hasEnergy && !energyHidden ? (
                        <GhostControl
                            label="коснись чтобы оценить"
                            onEngage={() => {
                                draft.setLiveEnergy(DEFAULT_SLIDER_VALUE);
                                draft.commitEnergy(DEFAULT_SLIDER_VALUE);
                            }}
                        />
                    ) : undefined
                }
            >
                <Slider
                    value={draft.energy ?? DEFAULT_SLIDER_VALUE}
                    onChange={(v) => draft.setLiveEnergy(v)}
                    onValueCommit={(v) => draft.commitEnergy(v)}
                    tone="energy"
                    disabled={energyHidden}
                    aria-label="Уровень энергии 0–100"
                />
            </MoodCardSection>

            <MoodCardSection
                label="Стресс"
                fieldLabel="стресс"
                privacy={draft.visibility.stress}
                onPrivacyChange={(next) =>
                    draft.commitVisibility("stress", next)
                }
                placeholder={
                    !hasStress && !stressHidden ? (
                        <GhostControl
                            label="коснись чтобы оценить"
                            onEngage={() => {
                                draft.setLiveStress(DEFAULT_SLIDER_VALUE);
                                draft.commitStress(DEFAULT_SLIDER_VALUE);
                            }}
                        />
                    ) : undefined
                }
            >
                <Slider
                    value={draft.stress ?? DEFAULT_SLIDER_VALUE}
                    onChange={(v) => draft.setLiveStress(v)}
                    onValueCommit={(v) => draft.commitStress(v)}
                    tone="stress"
                    disabled={stressHidden}
                    aria-label="Уровень стресса 0–100"
                />
            </MoodCardSection>

            <MoodErrorPill
                visible={draft.upsertState.isError}
                onRetry={draft.retry}
            />
        </Card>
    );
};

export default MoodCheckinCard;
