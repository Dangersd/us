"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { cn } from "~libs/utils";

// View-only canvas component. Phase 2: WeatherLayer владеет RAF и pools,
// canvas только setup'ит DPR scaling и expose'ит ctx через ref.
//
// На mount: создаёт canvas размером с viewport, scaled by devicePixelRatio.
// На resize: re-setups dimensions (caller does redraw on next tick).
//
// z-index — prop из caller'а (rain canvas z-1, splash canvas z-[51]).

export interface WeatherCanvasHandle {
    getCtx: () => CanvasRenderingContext2D | null;
    getSize: () => { w: number; h: number };
    setup: () => void;
}

interface Props {
    zClass: string; // e.g. "z-1" or "z-[51]"
}

const WeatherCanvas = forwardRef<WeatherCanvasHandle, Props>(
    ({ zClass }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement | null>(null);
        const sizeRef = useRef({ w: 0, h: 0 });

        const setup = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const w = window.innerWidth;
            const h = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            sizeRef.current = { w, h };
        };

        useEffect(() => {
            setup();
        }, []);

        useImperativeHandle(ref, () => ({
            getCtx: () => canvasRef.current?.getContext("2d") ?? null,
            getSize: () => sizeRef.current,
            setup,
        }));

        return (
            <canvas
                ref={canvasRef}
                aria-hidden
                className={cn("pointer-events-none fixed inset-0", zClass)}
            />
        );
    },
);

WeatherCanvas.displayName = "WeatherCanvas";

export default WeatherCanvas;
