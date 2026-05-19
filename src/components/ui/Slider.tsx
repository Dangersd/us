"use client";

import {
    type KeyboardEvent,
    type PointerEvent,
    useCallback,
    useRef,
    useState,
} from "react";

import { motion, useReducedMotion } from "framer-motion";

import { sliderStyles } from "~components/ui/slider-styles";
import { cn } from "~libs/utils";

export type SliderTone = "energy" | "stress";
export type SliderOrientation = "horizontal" | "vertical";

export interface SliderProps {
    /** Текущее значение 0..100 (controlled). */
    value: number;
    /** Срабатывает на каждом pointer-move + keyboard step (live feedback). */
    onChange?: (value: number) => void;
    /** Срабатывает на pointer-up / keyup (= "свайп — подтверждение"). */
    onValueCommit?: (value: number) => void;
    /** Палитра градиента. */
    tone: SliderTone;
    /** Default "horizontal". */
    orientation?: SliderOrientation;
    /** Отключение взаимодействия. */
    disabled?: boolean;
    /** ARIA-label (обязателен если рядом нет визуального лейбла). */
    "aria-label"?: string;
    className?: string;
}

// R7: NaN-guard + clamp 0..100. Math.min/max не защищены от NaN сами по себе.
const clamp = (v: number) => {
    if (!Number.isFinite(v)) return 0;
    return Math.min(100, Math.max(0, v));
};

const Slider = ({
    value,
    onChange,
    onValueCommit,
    tone,
    orientation = "horizontal",
    disabled = false,
    "aria-label": ariaLabel,
    className,
}: SliderProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);
    const reduceMotion = useReducedMotion();
    const s = sliderStyles({ orientation, tone });

    // R3: deps только [orientation]. Fallback при пустом ref — 0 (не используется
    // callers, но не undefined и не stale `value`).
    const valueFromPointer = useCallback(
        (clientX: number, clientY: number): number => {
            const el = ref.current;
            if (!el) return 0;
            const rect = el.getBoundingClientRect();
            if (orientation === "horizontal") {
                const pct = (clientX - rect.left) / rect.width;
                return clamp(Math.round(pct * 100));
            }
            const pct = 1 - (clientY - rect.top) / rect.height;
            return clamp(Math.round(pct * 100));
        },
        [orientation],
    );

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        const next = valueFromPointer(event.clientX, event.clientY);
        onChange?.(next);
    };
    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!dragging || disabled) return;
        const next = valueFromPointer(event.clientX, event.clientY);
        onChange?.(next);
    };
    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (!dragging) return;
        setDragging(false);
        const next = valueFromPointer(event.clientX, event.clientY);
        onChange?.(next);
        onValueCommit?.(next);
    };

    const stepKey = (event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        const big = event.shiftKey ? 10 : 1;
        let next: number | null = null;
        const dec = orientation === "horizontal" ? "ArrowLeft" : "ArrowDown";
        const inc = orientation === "horizontal" ? "ArrowRight" : "ArrowUp";
        if (event.key === dec) next = clamp(value - big);
        else if (event.key === inc) next = clamp(value + big);
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = 100;
        else if (event.key === "PageDown") next = clamp(value - 10);
        else if (event.key === "PageUp") next = clamp(value + 10);
        if (next === null) return;
        event.preventDefault();
        onChange?.(next);
        onValueCommit?.(next);
    };

    const pct = clamp(value);
    const fillAnim =
        orientation === "horizontal"
            ? { width: `${pct}%`, height: "100%" }
            : { height: `${pct}%`, width: "100%" };
    const handlePos =
        orientation === "horizontal"
            ? { left: `${pct}%` }
            : { bottom: `${pct}%` };

    // R8: prefers-reduced-motion → instant transitions (без 180ms easing).
    const moveTransition = {
        type: "tween" as const,
        duration: reduceMotion ? 0 : dragging ? 0 : 0.18,
    };

    return (
        <div
            ref={ref}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-orientation={orientation}
            aria-disabled={disabled || undefined}
            aria-label={ariaLabel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={stepKey}
            className={cn("group", s.root(), className, {
                "opacity-40 pointer-events-none": disabled,
            })}
        >
            <div className={s.track()} />
            <motion.div
                className={s.fill()}
                animate={fillAnim}
                transition={moveTransition}
            />
            <motion.div
                className={s.halo()}
                animate={handlePos}
                transition={moveTransition}
            />
            <motion.div
                className={s.handle()}
                animate={handlePos}
                transition={moveTransition}
            />
        </div>
    );
};

export default Slider;
