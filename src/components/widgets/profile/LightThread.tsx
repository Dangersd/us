import { useId } from "react";

import { cn } from "~libs/utils";

// Нитка света между двумя blob'ами в Profile-шапке. SVG svg-кривая с двумя
// gradient stops от hueHim → midpoint → hueHer. Контейнер задаёт width/height,
// path сидит горизонтально по центру.
//
// Edge-cases:
//  - Если оба hue одинаковые (например, default состояние пока чужой gender не
//    подгрузился) — градиент выглядит как монотонный glow, всё ок.
//  - Высота фиксирована небольшая (~24px), визуально это «нитка»; основной
//    weight — у blob'ов слева/справа.

export interface LightThreadProps {
    /** Hue левого blob'а (его) — hex. */
    hueLeft: string;
    /** Hue правого blob'а (её) — hex. */
    hueRight: string;
    /** Ширина в px (контейнер sized via flex в ProfileBlobPair). */
    width?: number;
    height?: number;
    className?: string;
}

const LightThread = ({
    hueLeft,
    hueRight,
    width = 160,
    height = 24,
    className,
}: LightThreadProps) => {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
    const gradId = `profile-thread-grad-${uid}`;
    const glowId = `${gradId}-glow`;

    const cy = height / 2;
    // Лёгкий sag — не идеальная прямая, чтобы было «органично».
    const sag = 2;
    const d = `M 0 ${cy} Q ${width / 2} ${cy + sag}, ${width} ${cy}`;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            xmlns="http://www.w3.org/2000/svg"
            className={cn("pointer-events-none select-none", className)}
            aria-hidden
        >
            <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={hueLeft} stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop
                        offset="100%"
                        stopColor={hueRight}
                        stopOpacity="0.7"
                    />
                </linearGradient>
                <linearGradient id={glowId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={hueLeft} stopOpacity="0.25" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.35" />
                    <stop
                        offset="100%"
                        stopColor={hueRight}
                        stopOpacity="0.25"
                    />
                </linearGradient>
            </defs>
            <path
                d={d}
                stroke={`url(#${glowId})`}
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
            />
            <path
                d={d}
                stroke={`url(#${gradId})`}
                strokeWidth={1.5}
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default LightThread;
