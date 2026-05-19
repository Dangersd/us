"use client";

import { useId } from "react";

import { motion, useReducedMotion, useTime, useTransform } from "framer-motion";

import { blobPath } from "~components/ui/blob-path";
import { cn } from "~libs/utils";

// Animated blob: SVG-path-морфинг с дыханием.
// Контракт: чистая презентация. Form layer в 0.5.4 подгоняет цвет/значения.
//
// Маппинг полей mood → визуальные параметры (см. docs/03-rooms/mood.md:50-57):
//   energy   → breathPeriod (низкая = медленно, высокая = живее, в диапазоне
//              atmospheric loops 20-40s per docs/02-design-system.md:84) +
//              aspectY (низкая = "опавший" сплющенный, высокая = надутый)
//   stress   → jitter (0 = круг, 1 = искривлённый)
//   social   → scale (low = compact, high = "надутый")

export interface BlobProps {
    /** Базовый hex color (без альфы). Применяется к fill блоба и aura. */
    color: string;
    /** 0..100, default 50. Управляет периодом дыхания и aspectY. */
    energy?: number;
    /** 0..100, default 0. Управляет амплитудой искривления. */
    stress?: number;
    /** 0..100, default 50. Управляет размером (scale). */
    socialBattery?: number;
    /** Пиксельный размер квадрата SVG. Default 200. */
    size?: number;
    /** Рендерить ли halo вокруг блоба. Default true. */
    aura?: boolean;
    className?: string;
    "aria-label"?: string;
}

// Нормализация 0..100 → 0..1 + клампинг + NaN-guard.
const norm = (v: number) => {
    if (!Number.isFinite(v)) return 0.5;
    return Math.min(1, Math.max(0, v / 100));
};

const Blob = ({
    color,
    energy = 50,
    stress = 0,
    socialBattery = 50,
    size = 200,
    aura = true,
    className,
    "aria-label": ariaLabel,
}: BlobProps) => {
    const reduceMotion = useReducedMotion();

    const e = norm(energy);
    const s = norm(stress);
    const sb = norm(socialBattery);

    // Период дыхания: 20s при e=0, 12s при e=1. Линейная интерполяция.
    // Atmospheric loop band per docs/02-design-system.md (20-40s).
    const breathMs = 20000 - 8000 * e;
    // Аспект: 0.78 при e=0, 1.0 при e=1.
    const aspectY = 0.78 + 0.22 * e;
    // Jitter: 0 при s=0, 0.18 при s=1.
    const jitter = 0.18 * s;
    // Scale: компенсируем размер в зависимости от socialBattery (0.85..1.0).
    const scale = 0.85 + 0.15 * sb;

    const cx = size / 2;
    const cy = size / 2;
    // Радиус с учётом aura — оставляем поля ~30% от размера для свечения.
    const radius = (size / 2) * 0.7 * scale;

    const time = useTime();
    const d = useTransform(time, (t) => {
        // reducedMotion → фиксированный phase = 0 (статичная форма).
        const phase = reduceMotion ? 0 : (t / breathMs) * Math.PI * 2;
        return blobPath({ cx, cy, radius, points: 8, jitter, aspectY, phase });
    });

    // useId — стабильный per-instance ID, безопасный в SVG url(#...) после
    // sanitize (React 19 useId возвращает с двоеточиями/брекетами). Раньше
    // ID строился от `color`, что коллидило при двух Blob'ах одного цвета
    // на одной странице (partner-glance в 0.5.5).
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
    const gradId = `blob-grad-${uid}`;
    const auraId = `${gradId}-aura`;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            xmlns="http://www.w3.org/2000/svg"
            className={cn("select-none", className)}
            aria-label={ariaLabel}
            role={ariaLabel ? "img" : undefined}
            aria-hidden={ariaLabel ? undefined : true}
        >
            <defs>
                <radialGradient id={gradId} cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor={color} stopOpacity="1" />
                    <stop offset="65%" stopColor={color} stopOpacity="0.7" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.25" />
                </radialGradient>
                <radialGradient id={auraId} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
            </defs>
            {aura ? (
                <circle cx={cx} cy={cy} r={size / 2} fill={`url(#${auraId})`} />
            ) : null}
            <motion.path d={d} fill={`url(#${gradId})`} />
        </svg>
    );
};

export default Blob;
