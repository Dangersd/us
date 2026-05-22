"use client";

import { motion, useTransform } from "framer-motion";

import { useBreathTime } from "~components/ui/breath-context";
import { cn } from "~libs/utils";

// «us»-wordmark в Sidebar дышит на общей breath-clock (тот же RAF, что
// драйвит MoodBlob'ы и PartnerStatus). Период ~30s, амплитуда text-shadow
// 4..8px тёплого glow. Без BreathProvider (или с reduce-motion) — статика
// на minimum glow (4px).
//
// Desktop-only by design: Sidebar скрыт на mobile (см. Sidebar.tsx). Mobile
// получает свои magic-моменты (MoodBlob в Mood, EdgeGlow по углам).

const BREATH_PERIOD_MS = 30_000;

const SidebarWordmark = () => {
    const time = useBreathTime();
    const textShadow = useTransform(time, (t) => {
        const phase = (t / BREATH_PERIOD_MS) * Math.PI * 2;
        const ratio = Math.sin(phase) * 0.5 + 0.5; // 0..1
        const intensity = 4 + 4 * ratio; // 4..8px
        return `0 0 ${intensity}px rgba(255,201,168,0.35)`;
    });

    return (
        <motion.span
            style={{ textShadow }}
            className={cn(
                "font-display text-2xl font-medium text-ink-primary",
                "tracking-[-0.02em]",
            )}
        >
            us
        </motion.span>
    );
};

export default SidebarWordmark;
