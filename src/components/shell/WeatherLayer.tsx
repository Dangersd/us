"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import WeatherCanvas, {
    type WeatherCanvasHandle,
} from "~components/shell/WeatherCanvas";
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
import {
    type SplashParticle,
    canSpawnOnSurface,
    drawSplashPool,
    markSpawn,
    spawnSplash,
    updateSplashPool,
} from "~components/shell/weather-splash";
import {
    __debugLog,
    getActiveSurfaces,
    refreshSurfaceCache,
} from "~components/shell/weather-surfaces";
import { useWeatherSetting } from "~hooks/use-weather-setting";
import type { WeatherStateKind } from "~interfaces/weather";
import { cn } from "~libs/utils";
import { useCurrentWeather } from "~queries/weather/weather";

// Single-RAF orchestrator. Один useEffect → один RAF tick → два canvas'а:
//  - rain (z-1): падающие капли
//  - splash (z-51): "корона" мини-частиц при ударе капли о surface
//
// Stuck-drops (стекающие капли) удалены — оставлен только splash при ударе.
// Pools живут в useRef'ах внутри компонента → HMR safe + cleanup автоматом.

const REFRESH_DEBOUNCE_MS = 150;

// Per-device profile. iPhone Safari/Chrome (оба WebKit на iOS) тянут canvas
// рендеринг ощутимо хуже desktop chip'ов из-за compositor cost с backdrop-blur
// картами. Mobile path использует тот же canvas pipeline (collision/splash
// сохраняются), но с агрессивными cuts:
//   - DPR 1.0 vs 2.0 → -66% pixel area на iPhone 15 (native DPR 3)
//   - density 0.4 vs 1.0 → ~48 drops вместо 120
//   - 24fps vs 30fps → -20% per-frame работы
//
// SSR-safe: typeof window check возвращает false на сервере. Mobile detection
// делается после useSyncExternalStore-mount gate (см. ниже) — hydration safe.
const isCoarsePointer = (): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(pointer: coarse)")?.matches === true;
};

const FRAME_INTERVAL_DESKTOP = 1000 / 60;
const FRAME_INTERVAL_MOBILE = 1000 / 20; // ещё ниже — 20fps
const DENSITY_DESKTOP = 1;
const DENSITY_MOBILE = 0.3; // ~36 drops вместо 120

// Hard cap длительности активного weather-эффекта. Через 10 минут rain/snow
// очищается с canvas и RAF останавливается — батарея спасена. Следующая
// state-смена (refetch weather → новое состояние) перезапустит таймер.
const EFFECT_MAX_DURATION_MS = 10 * 60 * 1000;

// Mount-detection без setState-in-effect (mirror MoodBlob pattern).
// Сервер всегда возвращает false → WeatherLayer returns null. Client после
// hydration → true. Это гарантирует одинаковый tree-shape на сервере и при
// первом client-рендере, чтобы useId-counter downstream компонентов
// (MoodBlob, EdgeGlow и др.) не сдвигался.
const noopSubscribe = () => () => {};
const getMountedClient = () => true;
const getMountedServer = () => false;

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
    const mounted = useSyncExternalStore(
        noopSubscribe,
        getMountedClient,
        getMountedServer,
    );
    const { enabled } = useWeatherSetting();
    const { data: weather } = useCurrentWeather({
        enabled: enabled && mounted,
    });
    const reducedMotion = useReducedMotion();
    // Resolved после mount — на сервере и first-render всегда false (canvas
    // path), что соответствует isCoarsePointer()===false. Реальное определение
    // только после mounted=true. До этого canvas-effect не запускается
    // (всё равно нет weather data).
    const coarsePointer = mounted ? isCoarsePointer() : false;

    const rainCanvasRef = useRef<WeatherCanvasHandle | null>(null);
    const splashCanvasRef = useRef<WeatherCanvasHandle | null>(null);

    const rainPoolRef = useRef<RainParticle[]>([]);
    const snowPoolRef = useRef<SnowParticle[]>([]);
    const splashPoolRef = useRef<SplashParticle[]>([]);

    const stateRef = useRef<WeatherStateKind | null>(null);
    const stateStartedAtRef = useRef(0);
    const windRef = useRef(0);

    useEffect(() => {
        if (!enabled || !weather || reducedMotion) return;
        if (weather.state !== "rain" && weather.state !== "snow") return;

        const rainCanvas = rainCanvasRef.current;
        const splashCanvas = splashCanvasRef.current;
        if (!rainCanvas || !splashCanvas) return;

        // Per-device tuning resolved once per effect run.
        const frameInterval = coarsePointer
            ? FRAME_INTERVAL_MOBILE
            : FRAME_INTERVAL_DESKTOP;
        const density = coarsePointer ? DENSITY_MOBILE : DENSITY_DESKTOP;

        // State changed → clear splash pool + init new pool + перезапуск
        // 10-min таймера экономии батареи.
        if (stateRef.current !== weather.state) {
            splashPoolRef.current.length = 0;
            rainCanvas.setup();
            splashCanvas.setup();
            const { w, h } = rainCanvas.getSize();
            if (weather.state === "rain") {
                rainPoolRef.current = initRainPool(w, h, density);
                snowPoolRef.current = [];
            } else {
                snowPoolRef.current = initSnowPool(w, h, density);
                rainPoolRef.current = [];
            }
            stateRef.current = weather.state;
            stateStartedAtRef.current = Date.now();
        }
        windRef.current = weather.windSpeed;

        // Surface refresh strategy зависит от устройства:
        //  - Desktop: MutationObserver на body с attributeFilter — мгновенное
        //    обнаружение новых modal/card mounts.
        //  - Mobile: MutationObserver — persistent CPU overhead (даже с
        //    attributeFilter браузер фильтрует ВСЕ мутации body subtree).
        //    Заменяем на periodic poll (1.5s). Modals регистрируются с
        //    задержкой до 1.5s, что приемлемо для атмосферного эффекта.
        let refreshTimer: number | undefined;
        const scheduleRefresh = () => {
            window.clearTimeout(refreshTimer);
            refreshTimer = window.setTimeout(
                refreshSurfaceCache,
                REFRESH_DEBOUNCE_MS,
            );
        };
        refreshSurfaceCache(); // initial
        let mo: MutationObserver | null = null;
        let pollInterval: number | undefined;
        if (coarsePointer) {
            pollInterval = window.setInterval(refreshSurfaceCache, 1500);
        } else {
            mo = new MutationObserver(scheduleRefresh);
            mo.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["data-weather-surface"],
            });
        }

        const onResize = () => {
            rainCanvas.setup();
            splashCanvas.setup();
            const { w, h } = rainCanvas.getSize();
            if (weather.state === "rain") {
                rainPoolRef.current = initRainPool(w, h, density);
            } else {
                snowPoolRef.current = initSnowPool(w, h, density);
            }
            scheduleRefresh();
        };
        let resizeTimer: number | undefined;
        const debouncedResize = () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(onResize, 200);
        };
        window.addEventListener("resize", debouncedResize);

        let rafId: number | null = null;
        let lastFrame = 0;

        const onCollision = (c: {
            x: number;
            y: number;
            surface: {
                id: string;
                rect: {
                    left: number;
                    right: number;
                    top: number;
                    bottom: number;
                };
            };
        }) => {
            const now = performance.now();
            __debugLog(
                "collision-attempt",
                `id=${c.surface.id.slice(0, 8)} at x=${Math.round(c.x)}, y=${Math.round(c.y)}, surface.top=${Math.round(c.surface.rect.top)}`,
            );
            if (!canSpawnOnSurface(c.surface.id, now)) return;
            markSpawn(c.surface.id, now);
            const event = {
                x: c.x,
                y: c.y,
                surfaceId: c.surface.id,
                surfaceLeft: c.surface.rect.left,
                surfaceTop: c.surface.rect.top,
                surfaceWidth: c.surface.rect.right - c.surface.rect.left,
            };
            spawnSplash(splashPoolRef.current, event);
            __debugLog(
                "splash-spawned",
                `surface=${c.surface.id.slice(0, 8)} pool=${splashPoolRef.current.length}`,
            );
        };

        const tick = (ts: number) => {
            // 10-min hard cap. Если состояние держится дольше — глушим canvas
            // и останавливаем RAF до следующей state-смены (re-fire effect).
            if (
                Date.now() - stateStartedAtRef.current >
                EFFECT_MAX_DURATION_MS
            ) {
                const rainCtxFinal = rainCanvas.getCtx();
                const splashCtxFinal = splashCanvas.getCtx();
                const { w: fw, h: fh } = rainCanvas.getSize();
                if (rainCtxFinal) rainCtxFinal.clearRect(0, 0, fw, fh);
                if (splashCtxFinal) splashCtxFinal.clearRect(0, 0, fw, fh);
                rafId = null;
                return;
            }
            rafId = requestAnimationFrame(tick);
            if (ts - lastFrame < frameInterval) return;
            lastFrame = ts;

            const surfaces = getActiveSurfaces();
            const { w, h } = rainCanvas.getSize();
            const rainCtx = rainCanvas.getCtx();
            const splashCtx = splashCanvas.getCtx();
            if (!rainCtx || !splashCtx) return;

            rainCtx.clearRect(0, 0, w, h);

            if (weather.state === "rain") {
                // Skip splash canvas работу когда pool пустой — full-viewport
                // clearRect + draw loop впустую съедает кадр на mobile.
                const hasSplash = splashPoolRef.current.length > 0;
                if (hasSplash) splashCtx.clearRect(0, 0, w, h);
                updateRainPool(
                    rainPoolRef.current,
                    w,
                    h,
                    windRef.current,
                    false,
                    surfaces,
                    onCollision,
                );
                drawRainPool(rainCtx, rainPoolRef.current, windRef.current);
                updateSplashPool(splashPoolRef.current);
                // Draw only if pool has active particles after update.
                if (splashPoolRef.current.length > 0) {
                    // Если до update'а splash pool был пуст но новые spawn'ы
                    // появились в onCollision этого же tick'а — clearRect не
                    // вызвался выше. Гарантируем чистый canvas перед draw.
                    if (!hasSplash) splashCtx.clearRect(0, 0, w, h);
                    drawSplashPool(splashCtx, splashPoolRef.current);
                }
            } else {
                updateSnowPool(
                    snowPoolRef.current,
                    w,
                    h,
                    windRef.current,
                    false,
                );
                drawSnowPool(rainCtx, snowPoolRef.current);
                // splash canvas НЕ трогаем — снег не разбивается, и пустой
                // clearRect на полный viewport — лишняя композитная работа.
            }
        };
        rafId = requestAnimationFrame(tick);

        return () => {
            if (rafId != null) cancelAnimationFrame(rafId);
            mo?.disconnect();
            if (pollInterval) window.clearInterval(pollInterval);
            window.removeEventListener("resize", debouncedResize);
            if (refreshTimer) window.clearTimeout(refreshTimer);
            if (resizeTimer) window.clearTimeout(resizeTimer);
            splashPoolRef.current.length = 0;
        };
    }, [enabled, weather, reducedMotion, coarsePointer]);

    if (!mounted || !enabled || !weather) return null;

    const tint = TINT[weather.state];
    const tintOpacity = tint ? (weather.isDay ? tint.day : tint.night) : 0;
    const showCanvases =
        !reducedMotion &&
        (weather.state === "rain" || weather.state === "snow");

    return (
        <motion.div
            aria-hidden
            data-weather-layer
            className={cn("pointer-events-none fixed inset-0 z-1")}
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
            {showCanvases && (
                <>
                    <WeatherCanvas ref={rainCanvasRef} zClass="z-1" />
                    <WeatherCanvas ref={splashCanvasRef} zClass="z-51" />
                </>
            )}
        </motion.div>
    );
};

export default WeatherLayer;
