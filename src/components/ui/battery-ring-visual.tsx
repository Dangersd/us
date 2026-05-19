"use client";

import { motion } from "framer-motion";

import { dotAngle } from "~components/ui/battery-ring-utils";

// SVG render для <BatteryRing />. Halo + N дотов + центр orb с pulse animation.
// Вынесено из BatteryRing.tsx ради file-lines.md (200 max).
// Принимает чистые числовые/строковые параметры. Pointer/keyboard живут в
// BatteryRing.tsx — этот файл презентационный.

interface BatteryRingVisualProps {
    size: number;
    segments: number;
    filled: number;
    cx: number;
    cy: number;
    ringR: number;
    dotSize: number;
    haloId: string;
    orbId: string;
    centerColor: string;
    reduceMotion: boolean | null;
}

const BatteryRingVisual = ({
    size,
    segments,
    filled,
    cx,
    cy,
    ringR,
    dotSize,
    haloId,
    orbId,
    centerColor,
    reduceMotion,
}: BatteryRingVisualProps) => (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
            <radialGradient id={haloId} cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={orbId} cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor={centerColor} />
                <stop offset="100%" stopColor="currentColor" />
            </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={size / 2} fill={`url(#${haloId})`} />
        {Array.from({ length: segments }).map((_, i) => {
            const a = dotAngle(i, segments);
            const dx = cx + Math.cos(a) * ringR;
            const dy = cy + Math.sin(a) * ringR;
            const isFilled = i < filled;
            return (
                <circle
                    key={i}
                    cx={dx}
                    cy={dy}
                    r={dotSize / 2}
                    // R9: fallback цвет если Tailwind v4 var не подмонтирован.
                    fill={
                        isFilled
                            ? "currentColor"
                            : "var(--color-bg-surface-3, #302637)"
                    }
                    opacity={isFilled ? 1 : 0.7}
                />
            );
        })}
        <motion.circle
            cx={cx}
            cy={cy}
            r={size * 0.22}
            fill={`url(#${orbId})`}
            opacity={0.85}
            animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
    </svg>
);

export default BatteryRingVisual;
