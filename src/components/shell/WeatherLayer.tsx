"use client";

import { AnimatePresence, motion } from "framer-motion";

import WeatherCanvas from "~components/shell/WeatherCanvas";
import { useWeatherSetting } from "~hooks/use-weather-setting";
import type { WeatherStateKind } from "~interfaces/weather";
import { cn } from "~libs/utils";
import { useCurrentWeather } from "~queries/weather/weather";

// Глобальный погодный слой. Mount'ится в AppShell после EdgeGlow, ниже всего
// контента. z-index 1 — выше EdgeGlow (без z), ниже модалок (которые порталят
// в body c z-50+). pointer-events:none — никогда не блокирует клики.
//
// Hook useCurrentWeather получает `enabled`, чтобы при выключенном toggle
// сеть не дёргалась вообще (autoplan E1).
//
// Initial mount — 600ms fade-in. State change — AnimatePresence по tint key.
// Reduced-motion — tint остаётся, canvas рендерит null (см. WeatherCanvas).

// Tint цвета по state + opacity для day/night. clear не показывается вообще
// (autoplan D5 — на тёплом ambient доп. ярче не имеет смысла).
const TINT: Record<
    WeatherStateKind,
    { color: string; day: number; night: number } | null
> = {
    clear: null,
    cloudy: { color: "58, 54, 64", day: 0.03, night: 0.04 },
    rain: { color: "44, 62, 80", day: 0.06, night: 0.08 },
    snow: { color: "224, 230, 237", day: 0.05, night: 0.07 },
};

const WeatherLayer = () => {
    const { enabled } = useWeatherSetting();
    const { data: weather } = useCurrentWeather({ enabled });
    if (!enabled || !weather) return null;

    const tint = TINT[weather.state];
    const tintOpacity = tint ? (weather.isDay ? tint.day : tint.night) : 0;

    return (
        <motion.div
            aria-hidden
            data-weather-layer
            className={cn("pointer-events-none fixed inset-0 z-[1]")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <AnimatePresence mode="sync">
                {tint && tintOpacity > 0 ? (
                    <motion.div
                        key={weather.state + (weather.isDay ? "-d" : "-n")}
                        className={cn("absolute inset-0")}
                        style={{
                            backgroundColor: `rgba(${tint.color}, ${tintOpacity})`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    />
                ) : null}
            </AnimatePresence>
            {(weather.state === "rain" || weather.state === "snow") && (
                <WeatherCanvas
                    state={weather.state}
                    windSpeed={weather.windSpeed}
                />
            )}
        </motion.div>
    );
};

export default WeatherLayer;
