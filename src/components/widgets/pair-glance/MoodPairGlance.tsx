"use client";

import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import Button from "~components/ui/Button";
import MoodBlob from "~components/ui/MoodBlob";
import MoodThread from "~components/widgets/pair-glance/MoodThread";
import PartnerMoodReadout from "~components/widgets/pair-glance/PartnerMoodReadout";
import { EMOTION_BY_ID } from "~config/mood";
import { useTodayDate } from "~hooks/use-today-date";
import { cn } from "~libs/utils";
import { usePartnerTodayMood } from "~queries/mood/use-partner-today-mood";
import { useTodayMood } from "~queries/mood/use-today-mood";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";

interface MoodPairGlanceProps {
    /** «Свой» цвет-fallback когда emotion не выбран. */
    userFallbackColor: string;
    /** Personal-hue заглушка для partner. */
    partnerFallbackColor: string;
    /** Сообщение если партнёр не отметился сегодня. */
    partnerMissingLabel: string;
    /** Override даты — для тестов/Storybook. По умолчанию — useTodayDate(). */
    date?: string;
}

const PLACEHOLDER_COLOR = "#6F6677";
const BLOB_SIZE = 120;

// Полный pair-glance для Mood-комнаты (заменяет MoodPairStub в 0.5.5):
// 2 блоба + «нить света» (per docs/03-rooms/mood.md:59) + tap-to-reveal
// PartnerMoodReadout с фильтрацией по privacy (per mood.md:61-63).
// Дыхание блобов — через общий BreathProvider в /mood/page.tsx (один useTime
// на все три MoodBlob'а на странице).
const MoodPairGlance = ({
    userFallbackColor,
    partnerFallbackColor,
    partnerMissingLabel,
    date: dateProp,
}: MoodPairGlanceProps) => {
    const todayDate = useTodayDate();
    const date = dateProp ?? todayDate;

    const me = useTodayMood(date);
    const partner = usePartnerTodayMood(date);
    const partnerProfile = usePartnerProfile();

    const [open, setOpen] = useState(false);

    const myColor = me.data?.emotion
        ? EMOTION_BY_ID[me.data.emotion].color
        : userFallbackColor;
    const partnerHasEntry = partner.data != null;
    const partnerColor = partnerHasEntry
        ? partner.data!.emotion
            ? EMOTION_BY_ID[partner.data!.emotion].color
            : partnerFallbackColor
        : PLACEHOLDER_COLOR;

    const threadVisible = me.data != null && partner.data != null;
    const partnerName = partnerProfile.data?.displayName ?? "";
    const partnerLabel = partnerHasEntry
        ? partnerName || "партнёр"
        : partnerMissingLabel;

    const toggleReadout = () => {
        if (!partnerHasEntry) return;
        setOpen((o) => !o);
    };

    return (
        <div className={cn("flex flex-col items-center gap-3 mb-8")}>
            <div
                className={cn(
                    "flex items-end justify-center gap-4 md:gap-8",
                    "text-glow-soft",
                )}
            >
                <figure className={cn("flex flex-col items-center gap-2")}>
                    <MoodBlob
                        color={myColor}
                        energy={me.data?.energy ?? 50}
                        stress={me.data?.stress ?? 0}
                        socialBattery={me.data?.socialBattery ?? 50}
                        size={BLOB_SIZE}
                        aria-label="Твой блоб настроения"
                    />
                    <figcaption className={cn("text-ink-secondary text-xs")}>
                        ты
                    </figcaption>
                </figure>

                <div className={cn("flex items-center", "self-center")}>
                    <MoodThread
                        visible={threadVisible}
                        width={64}
                        height={24}
                    />
                </div>

                <figure className={cn("flex flex-col items-center gap-2")}>
                    <Button
                        variant="ghost"
                        onClick={toggleReadout}
                        disabled={!partnerHasEntry}
                        aria-expanded={open}
                        aria-controls={
                            open ? "partner-mood-readout" : undefined
                        }
                        aria-label={
                            partnerHasEntry
                                ? `Открыть настроение: ${partnerName || "партнёр"}`
                                : partnerMissingLabel
                        }
                        className={cn(
                            "h-auto p-0 rounded-full",
                            "hover:scale-[1.04] motion-safe:transition-transform",
                        )}
                    >
                        <MoodBlob
                            color={partnerColor}
                            energy={partner.data?.energy ?? 50}
                            stress={partner.data?.stress ?? 0}
                            socialBattery={partner.data?.socialBattery ?? 50}
                            size={BLOB_SIZE}
                            aura={partnerHasEntry}
                            aria-label={
                                partnerHasEntry
                                    ? "Блоб настроения партнёра"
                                    : partnerMissingLabel
                            }
                        />
                    </Button>
                    <figcaption className={cn("text-ink-secondary text-xs")}>
                        {partnerLabel}
                    </figcaption>
                </figure>
            </div>

            <AnimatePresence initial={false}>
                {open && partner.data ? (
                    <motion.div
                        key="readout"
                        id="partner-mood-readout"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{
                            duration: 0.3,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className={cn("w-full max-w-sm")}
                    >
                        <PartnerMoodReadout
                            entry={partner.data}
                            partnerName={partnerName}
                        />
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default MoodPairGlance;
