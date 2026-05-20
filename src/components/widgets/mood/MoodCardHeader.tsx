"use client";

import { useEffect, useState } from "react";

import { motion, useReducedMotion } from "framer-motion";

import MoodBlob from "~components/ui/MoodBlob";
import { EMOTION_BY_ID } from "~config/mood";
import type { EmotionId } from "~interfaces/mood";
import { cn } from "~libs/utils";

interface MoodCardHeaderProps {
    energy: number | null;
    stress: number | null;
    socialBattery: number | null;
    emotion: EmotionId | null;
    userFallbackColor: string;
    /** Меняется на каждый успешный commit — триггерит pulse-аура. */
    pulseKey: number;
}

const PULSE_MS = 600;

const MoodCardHeader = ({
    energy,
    stress,
    socialBattery,
    emotion,
    userFallbackColor,
    pulseKey,
}: MoodCardHeaderProps) => {
    const reduceMotion = useReducedMotion();
    const [pulseSeen, setPulseSeen] = useState(pulseKey);
    const pulsing = pulseSeen !== pulseKey;

    useEffect(() => {
        if (pulseSeen === pulseKey) return;
        const t = setTimeout(() => setPulseSeen(pulseKey), PULSE_MS);
        return () => clearTimeout(t);
    }, [pulseKey, pulseSeen]);

    // Цвет блоба = emotion-цвет если выбран, иначе personal-hue заглушка.
    const color = emotion ? EMOTION_BY_ID[emotion].color : userFallbackColor;

    return (
        <div className={cn("relative flex flex-col items-center")}>
            {/* h3 — semantic подзаголовок под room h2 ("Настроение"). */}
            <h3
                className={cn(
                    "font-display text-2xl text-ink-primary mb-3 tracking-[-0.01em]",
                )}
            >
                Как ты?
            </h3>
            <div className={cn("relative")}>
                <MoodBlob
                    color={color}
                    energy={energy ?? 50}
                    stress={stress ?? 0}
                    socialBattery={socialBattery ?? 50}
                    size={140}
                    aria-label="Твоё настроение"
                />
                {pulsing && !reduceMotion ? (
                    <motion.div
                        key={pulseKey}
                        initial={{ opacity: 0.45, scale: 0.9 }}
                        animate={{ opacity: 0, scale: 1.25 }}
                        transition={{
                            duration: PULSE_MS / 1000,
                            ease: "easeOut",
                        }}
                        className={cn(
                            "absolute inset-0 rounded-full pointer-events-none",
                            "shadow-glow",
                        )}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default MoodCardHeader;
