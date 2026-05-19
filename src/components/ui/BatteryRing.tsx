"use client";

import {
    type KeyboardEvent,
    type PointerEvent,
    useCallback,
    useId,
    useRef,
    useState,
} from "react";

import { useReducedMotion } from "framer-motion";

import {
    clampBatteryValue,
    pointerToValue,
} from "~components/ui/battery-ring-utils";
import BatteryRingVisual from "~components/ui/battery-ring-visual";
import { cn } from "~libs/utils";

export interface BatteryRingProps {
    /** 0..100. */
    value: number;
    onChange?: (value: number) => void;
    onValueCommit?: (value: number) => void;
    /** Цвет filled-дотов. По умолчанию currentColor (наследуется через CSS). */
    color?: string;
    /** Цвет светящегося orb в центре (R12). Default warm amber. */
    centerColor?: string;
    /** Кол-во дотов (default 24). Минимум 1 — guard (R6). */
    segments?: number;
    /** Пиксельный размер квадрата (default 128). */
    size?: number;
    /** Если true — рендерим текст с процентом по центру (Fraunces). */
    showPercent?: boolean;
    /** Текст под/вместо процента. Например, "к ней хочу". */
    centerLabel?: string;
    disabled?: boolean;
    "aria-label"?: string;
    className?: string;
}

const BatteryRing = ({
    value,
    onChange,
    onValueCommit,
    color = "currentColor",
    centerColor = "#FFD5A8",
    segments = 24,
    size = 128,
    showPercent = true,
    centerLabel,
    disabled = false,
    "aria-label": ariaLabel,
    className,
}: BatteryRingProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);
    const reduceMotion = useReducedMotion();
    // R4: уникальные gradient IDs — иначе при двух BatteryRing'ах на одной
    // странице (0.5.5 partner-glance) defs коллидят и второй рендер берёт
    // первый gradient.
    // React 19 useId() возвращает строку с двоеточиями (":r0:"); очищаем
    // до алфавитно-цифрового для безопасной подстановки в SVG url(#...).
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
    const haloId = `${uid}-halo`;
    const orbId = `${uid}-orb`;

    // R6: guard segments >= 1.
    const safeSegments = Math.max(1, segments);
    const safeValue = clampBatteryValue(value);
    const cx = size / 2;
    const cy = size / 2;
    const dotSize = Math.max(6, Math.round(size * 0.0625));
    const ringR = (size - dotSize * 1.4) / 2;
    const filled = Math.round((safeValue / 100) * safeSegments);

    const valueFromPointer = useCallback(
        (clientX: number, clientY: number): number => {
            const el = ref.current;
            if (!el) return 0;
            return pointerToValue(el.getBoundingClientRect(), clientX, clientY);
        },
        [],
    );

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        onChange?.(valueFromPointer(event.clientX, event.clientY));
    };
    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!dragging || disabled) return;
        onChange?.(valueFromPointer(event.clientX, event.clientY));
    };
    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (!dragging) return;
        setDragging(false);
        const next = valueFromPointer(event.clientX, event.clientY);
        onChange?.(next);
        onValueCommit?.(next);
    };

    const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        const step = event.shiftKey ? 10 : 100 / safeSegments;
        let next: number | null = null;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown")
            next = clampBatteryValue(safeValue - step);
        else if (event.key === "ArrowRight" || event.key === "ArrowUp")
            next = clampBatteryValue(safeValue + step);
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = 100;
        if (next === null) return;
        event.preventDefault();
        onChange?.(next);
        onValueCommit?.(next);
    };

    return (
        <div
            ref={ref}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={safeValue}
            aria-disabled={disabled || undefined}
            aria-label={ariaLabel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={onKey}
            className={cn(
                "relative inline-block touch-none select-none",
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus",
                { "opacity-40 pointer-events-none": disabled },
                className,
            )}
            style={{ width: size, height: size, color }}
        >
            <BatteryRingVisual
                size={size}
                segments={safeSegments}
                filled={filled}
                cx={cx}
                cy={cy}
                ringR={ringR}
                dotSize={dotSize}
                haloId={haloId}
                orbId={orbId}
                centerColor={centerColor}
                reduceMotion={reduceMotion}
            />
            {(showPercent || centerLabel) && (
                <div
                    className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center",
                        "pointer-events-none text-ink-primary",
                    )}
                >
                    {showPercent && (
                        <span
                            className={cn(
                                "font-display text-xl tabular-nums leading-none",
                            )}
                        >
                            {safeValue}%
                        </span>
                    )}
                    {centerLabel && (
                        <span
                            className={cn(
                                "mt-1 text-xs text-ink-muted leading-none",
                            )}
                        >
                            {centerLabel}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default BatteryRing;
