"use client";

import { useId, useMemo, useSyncExternalStore } from "react";

import { motion, useTransform } from "framer-motion";

import { blobPath } from "~components/ui/blob-path";
import { useBreathTime } from "~components/ui/breath-context";
import { cn } from "~libs/utils";

// Mount-detection без setState-in-effect (React 19 strict rule). Сервер
// возвращает false, клиент после hydrate — true.
const noopSubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

// Animated mood-blob: SVG-path-морфинг с дыханием. ИСПОЛЬЗУЕТСЯ как живая
// «клякса»-аватар в Mood-комнате (карточка + pair-glance).
// НЕ ПУТАТЬ с emotion-picker иконками в ~icons/emotions/ (BlobIcon + 8 *Blob)
// — те статичные SVG-кружки для пикера эмоций.
// Контракт: чистая презентация. Form layer подгоняет цвет/значения.
//
// RAF-таймер берётся из <BreathProvider> через useBreathTime — один useTime()
// драйвит все блобы на странице. Без провайдера или при reduce-motion блоб
// рендерится со статичной формой (phase = 0).
//
// Маппинг полей mood → визуальные параметры (см. docs/03-rooms/mood.md:50-57):
//   energy   → breathPeriod (низкая = медленно, высокая = живее, в диапазоне
//              atmospheric loops 20-40s per docs/02-design-system.md:84) +
//              aspectY (низкая = "опавший" сплющенный, высокая = надутый)
//   stress   → jitter (0 = круг, 1 = искривлённый)
//   social   → scale (low = compact, high = "надутый")

export interface MoodBlobProps {
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

const MoodBlob = ({
    color,
    energy = 50,
    stress = 0,
    socialBattery = 50,
    size = 200,
    aura = true,
    className,
    "aria-label": ariaLabel,
}: MoodBlobProps) => {
    const e = norm(energy);
    const s = norm(stress);
    const sb = norm(socialBattery);

    // Период дыхания: 20s при e=0, 12s при e=1. Линейная интерполяция.
    // Atmospheric loop band per docs/02-design-system.md (20-40s).
    const breathMs = 20000 - 8000 * e;
    // Аспект: 0.92 при e=0, 1.0 при e=1. Узкий диапазон, чтобы блоб не
    // выглядел овальным — морфинг даёт лёгкий «опавший» намёк, не сплющивает.
    const aspectY = 0.92 + 0.08 * e;
    // Jitter: 0 при s=0, 0.18 при s=1.
    const jitter = 0.18 * s;
    // Scale: компенсируем размер в зависимости от socialBattery (0.85..1.0).
    const scale = 0.85 + 0.15 * sb;

    const cx = size / 2;
    const cy = size / 2;
    // Радиус с учётом aura — оставляем поля ~30% от размера для свечения.
    const radius = (size / 2) * 0.7 * scale;

    const time = useBreathTime();
    const liveD = useTransform(time, (t) => {
        // t === 0 (frozen MotionValue без провайдера или с reduce-motion) →
        // phase = 0, статичная форма.
        const phase = (t / breathMs) * Math.PI * 2;
        return blobPath({ cx, cy, radius, points: 8, jitter, aspectY, phase });
    });

    // SSR/hydration safety: RAF в BreathProvider стартует через useEffect
    // (после commit). Между server-render (time=0) и client-первого-рендера
    // RAF может уже сделать tick → time > 0 → path d отличается на ~0.01px,
    // что бьётся как hydration mismatch на motion.path. Решение: на первый
    // рендер всегда отдаём static (phase=0) path-строку, после mount свопаем
    // на live MotionValue. motion.path принимает оба типа.
    const staticD = useMemo(
        () =>
            blobPath({
                cx,
                cy,
                radius,
                points: 8,
                jitter,
                aspectY,
                phase: 0,
            }),
        [cx, cy, radius, jitter, aspectY],
    );
    const mounted = useSyncExternalStore(
        noopSubscribe,
        getClientMounted,
        getServerMounted,
    );
    const d = mounted ? liveD : staticD;

    // useId — стабильный per-instance ID, безопасный в SVG url(#...) после
    // sanitize (React 19 useId возвращает с двоеточиями/брекетами). Раньше
    // ID строился от `color`, что коллидило при двух MoodBlob'ах одного
    // цвета на одной странице (partner-glance в 0.5.5).
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
    const gradId = `mood-blob-grad-${uid}`;
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
            overflow="visible"
            // drop-shadow на root <svg> = CSS filter без SVG-filter region
            // clipping. На inner path он клипался по 110% bbox → виден был
            // тёмный квадрат вокруг блоба. ${color}44 = ~27% alpha; ~4% size
            // — мягкий, не «glowy».
            style={{
                filter: `drop-shadow(0 0 ${size * 0.04}px ${color}44)`,
                overflow: "visible",
            }}
        >
            <defs>
                {/* Тело блоба: ядро яркое, плавный спад к 40% в краях
                 * (раньше 25% — выглядел приглушённым). */}
                <radialGradient id={gradId} cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor={color} stopOpacity="1" />
                    <stop offset="55%" stopColor={color} stopOpacity="0.88" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                </radialGradient>
                {/* Halo вокруг блоба: подсветка чуть теплее (0.5 vs 0.35),
                 * с дополнительной mid-stop для более плотного «свечения». */}
                <radialGradient id={auraId} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                    <stop offset="55%" stopColor={color} stopOpacity="0.18" />
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

export default MoodBlob;
