"use client";

import { useState } from "react";

import { cn } from "~libs/utils";

// CSS-only rain для coarse-pointer (mobile). Никакого canvas, никакого
// RAF, никакого MutationObserver. 26 absolute-positioned span'ов с pure CSS
// `transform: translateY()` анимацией. Transform animations GPU-композитятся
// без principle thread work и без force re-paint background layers.
//
// Visual fidelity ниже canvas версии: фиксированная скорость per drop, нет
// wind drift, нет collision/splash. Но это десятки раз дешевле для phone GPU.
//
// state="snow" не покрывается — на mobile снег отображается только tint'ом.

interface WeatherCssRainProps {
    state: "rain" | "snow";
}

const DROP_COUNT = 26;

const WeatherCssRain = ({ state }: WeatherCssRainProps) => {
    // Generate drops once per mount через useState lazy init (Math.random нельзя
    // в useMemo по React 19 purity rule). Drops стабильны на всё время жизни
    // компонента — GPU перерисовывает только transform каждой капли.
    const [drops] = useState(() =>
        Array.from({ length: DROP_COUNT }, (_, i) => ({
            left: (i * 100) / DROP_COUNT + (Math.random() - 0.5) * 4,
            duration: 0.55 + Math.random() * 0.3,
            delay: Math.random() * 1.5,
            length: 14 + Math.random() * 8,
            opacity: 0.18 + Math.random() * 0.14,
        })),
    );

    if (state !== "rain") return null;

    return (
        <div
            aria-hidden
            className={cn(
                "pointer-events-none fixed inset-0 z-1 overflow-hidden",
            )}
        >
            {drops.map((d, i) => (
                <span
                    key={i}
                    className="weather-css-drop"
                    style={{
                        left: `${d.left}%`,
                        height: `${d.length}px`,
                        opacity: d.opacity,
                        animationDuration: `${d.duration}s`,
                        animationDelay: `-${d.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default WeatherCssRain;
