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

// «Нить света» между двумя mood-блобами — статичная прямая линия с линейным
// градиентом (#FFC9A8 центр → 0 на концах). Per design untitled.pen → AKmkK
// («thread» rectangle 138×1, fill linear-gradient warm, opacity 0.8).
// Никакого distance/closeness mapping (mood.md:94-95 — сравнение запрещено).
const MoodThread = ({
    visible,
    width = 96,
    height = 1,
    className,
    ...rest
}: MoodThreadProps) => {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
    if (!visible) return null;
    const gradId = `mood-thread-grad-${uid}`;
    return (
        <svg
            width={width}
            height={Math.max(height, 1)}
            viewBox={`0 0 ${width} ${Math.max(height, 1)}`}
            className={cn("pointer-events-none", className)}
            aria-hidden="true"
            {...rest}
        >
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FFC9A8" stopOpacity="0" />
                    <stop offset="50%" stopColor="#FFC9A8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FFC9A8" stopOpacity="0" />
                </linearGradient>
            </defs>
            <line
                x1="0"
                y1={Math.max(height, 1) / 2}
                x2={width}
                y2={Math.max(height, 1) / 2}
                stroke={`url(#${gradId})`}
                strokeWidth="1"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default MoodThread;
