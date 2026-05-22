"use client";

import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import Button from "~components/ui/Button";
import MoodBlob from "~components/ui/MoodBlob";
import MoodThread from "~components/widgets/pair-glance/MoodThread";
import PartnerMoodReadout from "~components/widgets/pair-glance/PartnerMoodReadout";
import PrivacyPill from "~components/widgets/pair-glance/PrivacyPill";
import { EMOTION_BY_ID, emotionLabel } from "~config/mood";
import { useTodayDate } from "~hooks/use-today-date";
import type { CyclePhaseInfo } from "~interfaces/cycle";
import type { MoodEntry } from "~interfaces/mood";
import type { Gender } from "~interfaces/user";
import { cn } from "~libs/utils";
import { usePartnerPhase } from "~queries/cycle/use-partner-phase";
import { usePartnerTodayMood } from "~queries/mood/use-partner-today-mood";
import { useTodayMood } from "~queries/mood/use-today-mood";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useCurrentUser } from "~queries/user/use-current-user";

interface MoodPairGlanceProps {
    /** «Свой» цвет-fallback когда emotion не выбран. */
    userFallbackColor: string;
    /** Personal-hue заглушка для partner. */
    partnerFallbackColor: string;
    /** Сообщение если партнёр не отметился сегодня. */
    partnerMissingLabel: string;
    /** Override даты — для тестов. По умолчанию — useTodayDate(). */
    date?: string;
}

const PLACEHOLDER_COLOR = "#6F6677";
// Размер MoodBlob = размер halo per design (untitled.pen: halo-him/her 160×160).
// Внутренний blob занимает ~0.7×scale размера = ~110px, что близко к
// дизайн-блобу 120px. Halo "выходит" из MoodBlob aura.
const BLOB_SIZE = 160;

// Per design untitled.pen → Jtmiv → jMTNN (Pair Room):
//   card 32-corner, fill #1A1620EE, border #FFC9A833 1px, padding 24
//   inside: mesh-lilac + mesh-rose ambient ellipses + 1px thread + 2 columns
// Каждая колонка: halo 160×160 → MoodBlob 120 центром → имя → эмоция курсивом → privacy-pill.

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
    const currentUser = useCurrentUser();
    // Phase 0.11: partner ambient. usePartnerPhase сам gates по
    // phase_visible_to_partner toggle (default OFF). Партнёр-female не
    // получает данных (RPC возвращает null). Female-viewer тоже не получит
    // (RPC ищет partner с gender=female).
    const partnerPhase = usePartnerPhase();
    const showPartnerPhaseRing =
        partnerProfile.data?.gender === "female" && partnerPhase.data != null;

    const [open, setOpen] = useState(false);

    const partnerHasEntry = partner.data != null;
    const threadVisible = me.data != null && partner.data != null;
    const myName = currentUser.data?.displayName ?? "ты";
    const partnerName = partnerProfile.data?.displayName ?? "партнёр";

    const toggleReadout = () => {
        if (!partnerHasEntry) return;
        setOpen((o) => !o);
    };

    return (
        <div className={cn("flex flex-col items-stretch gap-3 mb-6")}>
            <div
                data-weather-surface="true"
                className={cn(
                    "relative overflow-hidden",
                    "rounded-[32px] p-4 md:p-6",
                    "bg-bg-surface-1/85 backdrop-blur-xl",
                    "border border-border-warm",
                    "text-glow-soft",
                )}
            >
                {/* mesh-lilac (ITyMn) — слева-сверху ambient свет.
                    blur-3xl делает мягкую glowing-сферу вместо жёсткого диска.
                    Opacity 70 + blur = тёплый vibe позади контента (z-0). */}
                <div
                    aria-hidden
                    className={cn(
                        "pointer-events-none absolute -left-8 top-0 z-0",
                        "h-57.5 w-57.5 rounded-full",
                        "bg-mesh-lilac opacity-70 blur-3xl",
                    )}
                />
                {/* mesh-rose (L3qDg) — справа-снизу */}
                <div
                    aria-hidden
                    className={cn(
                        "pointer-events-none absolute right-0 top-20 z-0",
                        "h-60 w-60 rounded-full",
                        "bg-mesh-rose opacity-60 blur-3xl",
                    )}
                />

                <div
                    className={cn(
                        "relative z-10 flex items-start justify-center gap-4 md:gap-8",
                    )}
                >
                    <PairColumn
                        name={myName}
                        gender={currentUser.data?.gender ?? null}
                        entry={me.data ?? null}
                        fallbackColor={userFallbackColor}
                        missingLabel="ещё не отметился(ась)"
                    />

                    <div
                        className={cn(
                            "flex h-30 flex-col justify-center md:h-40",
                        )}
                    >
                        <MoodThread
                            visible={threadVisible}
                            width={64}
                            height={1}
                            className={cn("w-8 md:w-16")}
                        />
                    </div>

                    <PairColumn
                        name={partnerName}
                        gender={partnerProfile.data?.gender ?? null}
                        entry={partner.data ?? null}
                        fallbackColor={partnerFallbackColor}
                        placeholderColor={PLACEHOLDER_COLOR}
                        missingLabel={partnerMissingLabel}
                        as="button"
                        onClick={toggleReadout}
                        open={open}
                        phaseRing={
                            showPartnerPhaseRing
                                ? (partnerPhase.data ?? null)
                                : null
                        }
                    />
                </div>
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
                        className={cn("w-full max-w-sm self-center")}
                    >
                        <PartnerMoodReadout
                            entry={partner.data}
                            partnerName={partnerName}
                            partnerGender={partnerProfile.data?.gender ?? null}
                        />
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

// ---- inline subcomponent: одна колонка партнёра ----

interface PairColumnProps {
    name: string;
    /** Гендер владельца entry — для склонения эмоции. */
    gender: Gender | null;
    entry: MoodEntry | null;
    fallbackColor: string;
    placeholderColor?: string;
    missingLabel: string;
    as?: "div" | "button";
    onClick?: () => void;
    open?: boolean;
    /** Phase 0.11: ambient moon-ring вокруг blob'а. Null если toggle OFF
     *  у партнёра или viewer-female. */
    phaseRing?: CyclePhaseInfo | null;
}

const PairColumn = ({
    name,
    gender,
    entry,
    fallbackColor,
    placeholderColor,
    missingLabel,
    as = "div",
    onClick,
    open,
    phaseRing,
}: PairColumnProps) => {
    const hasEntry = entry != null;
    const color = hasEntry
        ? entry.emotion
            ? EMOTION_BY_ID[entry.emotion].color
            : fallbackColor
        : (placeholderColor ?? fallbackColor);

    const emotionText =
        hasEntry && entry.emotion ? emotionLabel(entry.emotion, gender) : null;

    const content = (
        <>
            <div className={cn("relative")}>
                {phaseRing ? (
                    <span
                        aria-hidden
                        className={cn(
                            "pointer-events-none absolute inset-0 rounded-full",
                            "border border-hue-female/40",
                            "size-30 md:size-40",
                        )}
                        style={{
                            boxShadow: "0 0 24px rgba(184, 143, 170, 0.25)",
                        }}
                    />
                ) : null}
                <MoodBlob
                    color={color}
                    energy={entry?.energy ?? 50}
                    stress={entry?.stress ?? 0}
                    socialBattery={entry?.socialBattery ?? 50}
                    size={BLOB_SIZE}
                    aura={hasEntry}
                    className={cn("size-30 md:size-40", {
                        "opacity-50": !hasEntry,
                    })}
                    aria-label={
                        hasEntry
                            ? `Блоб настроения: ${name}`
                            : `${name}: ${missingLabel}`
                    }
                />
            </div>

            <p
                className={cn(
                    "font-sans text-ink-primary text-base font-medium",
                )}
            >
                {name}
            </p>
            {hasEntry ? (
                <p
                    className={cn(
                        "font-display italic",
                        "text-ink-secondary text-[13px]",
                    )}
                >
                    {emotionText ?? "без эмоции"}
                </p>
            ) : (
                <p className={cn("font-sans text-ink-muted text-[13px]")}>
                    {missingLabel}
                </p>
            )}
            {hasEntry ? <PrivacyPill level={entry.visibility.emotion} /> : null}
        </>
    );

    if (as === "button") {
        return (
            <Button
                variant="ghost"
                onClick={onClick}
                disabled={!hasEntry}
                aria-expanded={open}
                aria-controls={open ? "partner-mood-readout" : undefined}
                className={cn(
                    "h-auto p-0 rounded-[24px]",
                    "flex flex-col items-center gap-2",
                    "hover:scale-[1.03] motion-safe:transition-transform",
                )}
            >
                {content}
            </Button>
        );
    }

    return (
        <figure className={cn("flex flex-col items-center gap-2")}>
            {content}
        </figure>
    );
};

export default MoodPairGlance;
