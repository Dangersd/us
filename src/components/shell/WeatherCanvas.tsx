"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "framer-motion";

import {
    type RainParticle,
    type SnowParticle,
    drawRainPool,
    drawSnowPool,
    initRainPool,
    initSnowPool,
    updateRainPool,
    updateSnowPool,
} from "~components/shell/weather-particles";
import { cn } from "~libs/utils";

// Canvas-слой rain/snow particles. RAF loop с 30fps gate (для атмосферных
// эффектов 60fps — wasted battery, см. autoplan D7). DPR scaling
// обязателен — иначе на retina капли blurry. Pure logic в weather-particles.ts.
//
// При prefers-reduced-motion → возвращаем null (никаких частиц вообще,
// статичные капли выглядят сломанными — autoplan D2). Tint живёт отдельно
// в WeatherLayer, он остаётся под reduced-motion.

const FRAME_INTERVAL = 1000 / 30; // 30fps cap

interface Props {
    state: "rain" | "snow";
    windSpeed: number;
}

const WeatherCanvas = ({ state, windSpeed }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastFrameRef = useRef<number>(0);
    const rainPoolRef = useRef<RainParticle[]>([]);
    const snowPoolRef = useRef<SnowParticle[]>([]);
    const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        if (reducedMotion) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const setup = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
            ctx.scale(dpr, dpr);
            sizeRef.current = { w, h };

            if (state === "rain") {
                rainPoolRef.current = initRainPool(w, h);
                snowPoolRef.current = [];
            } else {
                snowPoolRef.current = initSnowPool(w, h);
                rainPoolRef.current = [];
            }
        };

        setup();

        const tick = (ts: number) => {
            rafRef.current = requestAnimationFrame(tick);
            if (ts - lastFrameRef.current < FRAME_INTERVAL) return;
            lastFrameRef.current = ts;
            const { w, h } = sizeRef.current;
            ctx.clearRect(0, 0, w, h);

            if (state === "rain") {
                updateRainPool(rainPoolRef.current, w, h, windSpeed, false);
                drawRainPool(ctx, rainPoolRef.current, windSpeed);
            } else {
                updateSnowPool(snowPoolRef.current, w, h, windSpeed, false);
                drawSnowPool(ctx, snowPoolRef.current);
            }
        };
        rafRef.current = requestAnimationFrame(tick);

        let resizeTimer: number | undefined;
        const onResize = () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(setup, 200);
        };
        window.addEventListener("resize", onResize);

        return () => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", onResize);
            if (resizeTimer) window.clearTimeout(resizeTimer);
        };
    }, [state, windSpeed, reducedMotion]);

    if (reducedMotion) return null;

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={cn("pointer-events-none fixed inset-0")}
        />
    );
};

export default WeatherCanvas;
