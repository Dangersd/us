import { type SVGProps, useId } from "react";

import { cn } from "~libs/utils";

interface MoodThreadProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
    /** Если false — ничего не рисуем (один из партнёров без чек-ина сегодня). */
    visible: boolean;
    /** Ширина в px между центрами блобов. */
    width?: number;
    /** Высота полотна. */
    height?: number;
}

// «Нить света» между двумя mood-блобами — статичная SVG-кривая.
// Per docs/03-rooms/mood.md:59 — «лёгкая нить света (очень тонкая, тёплая)».
// Наличие нити = оба отметились сегодня; никакого distance/closeness mapping
// (см. mood.md:94-95 — сравнение с партнёром запрещено).
//
// Цвет берётся из `currentColor` родителя — родитель в MoodPairGlance ставит
// класс text-glow-soft (#E8B4FF lilac, см. src/styles/globals.css:19),
// поэтому нить буквально «тёплая лилово-лунная». Градиент терминируется в
// opacity 0 на обоих концах — нить будто выходит из каждого блоба.
const MoodThread = ({
    visible,
    width = 96,
    height = 24,
    className,
    ...rest
}: MoodThreadProps) => {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
    if (!visible) return null;
    const cx = width / 2;
    const cy = height / 2;
    const d = `M 0 ${cy} Q ${cx} ${cy + 4} ${width} ${cy}`;
    // useId — per-instance gradient id (same pattern as MoodBlob:88).
    // Без него два MoodThread'а на странице делят один <linearGradient>;
    // Safari исторически рендерит для всех url(#…) последний defined.
    const gradId = `mood-thread-grad-${uid}`;
    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={cn("pointer-events-none", className)}
            aria-hidden="true"
            {...rest}
        >
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                    <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0"
                    />
                    <stop
                        offset="50%"
                        stopColor="currentColor"
                        stopOpacity="0.55"
                    />
                    <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0"
                    />
                </linearGradient>
            </defs>
            <path
                d={d}
                stroke={`url(#${gradId})`}
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default MoodThread;
