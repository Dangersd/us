// Pure particle module — никакого React, никакого DOM (только Canvas2D).
// Тестируется через src/components/shell/weather-particles.test.ts.
//
// Цвет — тёплый кремовый ink-primary (rgba(244,237,228,...)) и NIKAKOI cool
// blue. Это решение autoplan D4 (palette harmony).
//
// Параллакс — 3 слоя (far/mid/near), разная скорость / размер / альфа.
// Размер pool'а фиксированный, мутируем in place — без per-frame allocations.
//
// Phase 2: updateRainPool принимает surfaces + onCollision callback.
// При пересечении top-edge surface'а капля респавнится сверху и вызывается
// onCollision со снимком события. WeatherLayer передаёт callback, который
// throttle'ит через canSpawnOnSurface и spawn'ит splash + stuck.
import {
    type SurfaceSnapshot,
    findTopEdgeHit,
} from "~components/shell/weather-surfaces";

export interface RainParticle {
    layer: 0 | 1 | 2;
    x: number;
    y: number;
    length: number;
    speed: number;
    alpha: number;
    targetAlpha: number;
    windFactor: number; // 0.7..1.3 — индивидуальная вариативность
}

export interface SnowParticle {
    layer: 0 | 1 | 2;
    x: number;
    y: number;
    radius: number;
    speed: number;
    alpha: number;
    targetAlpha: number;
    windFactor: number;
    phase: number; // для горизонтального wiggle
}

// Layer config: [count, speedMul, sizeMul, alpha].
// Rain — iOS Weather style: плотный поток ~120 капель across 3 слоёв.
// Snow — остаётся «cozy», 25 снежинок (autoplan D7).
const RAIN_LAYERS: Array<[number, number, number, number]> = [
    [40, 0.6, 0.65, 0.12], // far  — мелкий далёкий дождь
    [50, 0.9, 1.0, 0.22], // mid  — основной поток
    [30, 1.2, 1.3, 0.32], // near — крупные близкие капли
];

const SNOW_LAYERS: Array<[number, number, number, number]> = [
    [7, 0.55, 0.8, 0.12], // far
    [10, 0.85, 1.0, 0.2], // mid
    [8, 1.15, 1.3, 0.28], // near
];

const RAIN_BASE_SPEED = 22; // px/frame at 30fps на mid-layer (iOS-like fast)
const SNOW_BASE_SPEED = 1; // px/frame at 30fps на mid-layer
const RAIN_BASE_LENGTH = 20;
const SNOW_BASE_RADIUS = 2;

// Wind: m/s → px/frame горизонтального drift.
// Hard-cap drift to keep rain near-vertical: angle ≤ ~3° from vertical
// (tan 3° ≈ 0.0524), match user request «градусом 2-3».
// Каждая капля имеет windFactor ∈ [0.7,1.3] для лёгкой вариативности.
const WIND_PX_PER_MS = 0.45;
const SNOW_WIND_FACTOR = 0.5;
const RAIN_MAX_TILT_TAN = 0.055; // ≈ 3.15° от вертикали

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// density: 1 = full count (desktop), 0.55 = mobile (coarse pointer). Снижает
// CPU + GC + composite cost на iPhone Safari без визуальной деградации (rain
// на 65 drops остаётся плотным потоком).
export const initRainPool = (
    width: number,
    height: number,
    density = 1,
): RainParticle[] => {
    const pool: RainParticle[] = [];
    RAIN_LAYERS.forEach(([count, speedMul, sizeMul, baseAlpha], layerIdx) => {
        const adjusted = Math.max(2, Math.round(count * density));
        for (let i = 0; i < adjusted; i += 1) {
            pool.push({
                layer: layerIdx as 0 | 1 | 2,
                x: Math.random() * width,
                y: Math.random() * height,
                length: RAIN_BASE_LENGTH * sizeMul * rand(0.85, 1.15),
                speed: RAIN_BASE_SPEED * speedMul * rand(0.9, 1.1),
                alpha: baseAlpha,
                targetAlpha: baseAlpha,
                windFactor: rand(0.7, 1.3),
            });
        }
    });
    return pool;
};

export const initSnowPool = (
    width: number,
    height: number,
    density = 1,
): SnowParticle[] => {
    const pool: SnowParticle[] = [];
    SNOW_LAYERS.forEach(([count, speedMul, sizeMul, baseAlpha], layerIdx) => {
        const adjusted = Math.max(2, Math.round(count * density));
        for (let i = 0; i < adjusted; i += 1) {
            pool.push({
                layer: layerIdx as 0 | 1 | 2,
                x: Math.random() * width,
                y: Math.random() * height,
                radius: SNOW_BASE_RADIUS * sizeMul * rand(0.8, 1.2),
                speed: SNOW_BASE_SPEED * speedMul * rand(0.85, 1.15),
                alpha: baseAlpha,
                targetAlpha: baseAlpha,
                windFactor: rand(0.7, 1.3),
                phase: Math.random() * Math.PI * 2,
            });
        }
    });
    return pool;
};

// driftFor — горизонтальный шаг капли per frame с учётом ветра, ограничен
// по углу, чтобы наклон оставался в ~3° от вертикали. Вынесено для тестов.
export const driftForRainParticle = (
    speed: number,
    windSpeed: number,
    windFactor: number,
): number => {
    const raw = windSpeed * WIND_PX_PER_MS * windFactor;
    const maxDrift = speed * RAIN_MAX_TILT_TAN;
    if (raw > maxDrift) return maxDrift;
    if (raw < -maxDrift) return -maxDrift;
    return raw;
};

export interface RainCollision {
    x: number;
    y: number;
    surface: SurfaceSnapshot;
}

export const updateRainPool = (
    pool: RainParticle[],
    width: number,
    height: number,
    windSpeed: number,
    decayActive: boolean,
    surfaces: SurfaceSnapshot[] = [],
    onCollision?: (c: RainCollision) => void,
): void => {
    for (let i = 0; i < pool.length; i += 1) {
        const p = pool[i];
        if (decayActive) {
            // фаза затухания — старые капли исчезают
            p.alpha *= 0.985;
        } else if (p.alpha < p.targetAlpha) {
            p.alpha = Math.min(p.alpha + 0.02, p.targetAlpha);
        }
        const prevY = p.y;
        p.y += p.speed;
        p.x += driftForRainParticle(p.speed, windSpeed, p.windFactor);

        // Phase 2 collision: head капли (нижняя точка линии) пересекла surface.top
        if (surfaces.length > 0 && onCollision) {
            const hit = findTopEdgeHit(p.x, prevY, p.y, surfaces);
            if (hit) {
                onCollision({ x: p.x, y: hit.rect.top, surface: hit });
                p.y = -p.length - Math.random() * 50;
                p.x = Math.random() * width;
                p.alpha = 0;
                continue;
            }
        }

        if (p.y > height + p.length) {
            p.y = -p.length;
            p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        else if (p.x < -20) p.x = width + 20;
    }
};

export const updateSnowPool = (
    pool: SnowParticle[],
    width: number,
    height: number,
    windSpeed: number,
    decayActive: boolean,
): void => {
    const drift = windSpeed * WIND_PX_PER_MS * SNOW_WIND_FACTOR;
    for (let i = 0; i < pool.length; i += 1) {
        const p = pool[i];
        if (decayActive) {
            p.alpha *= 0.985;
        } else if (p.alpha < p.targetAlpha) {
            p.alpha = Math.min(p.alpha + 0.015, p.targetAlpha);
        }
        p.y += p.speed;
        p.phase += 0.02;
        const wiggle = Math.sin(p.phase) * 0.4;
        p.x += drift * p.windFactor + wiggle;
        if (p.y > height + p.radius) {
            p.y = -p.radius;
            p.x = Math.random() * width;
        }
        if (p.x > width + 10) p.x = -10;
        else if (p.x < -10) p.x = width + 10;
    }
};

// === Draw ===

const RAIN_COLOR = "244, 237, 228"; // ink-primary cream
const SNOW_COLOR = "252, 246, 235"; // cream + slight warmth

export const drawRainPool = (
    ctx: CanvasRenderingContext2D,
    pool: RainParticle[],
    windSpeed: number,
): void => {
    // Performance: flat alpha stroke вместо head-to-tail gradient. Было
    // ctx.createLinearGradient per-drop per-frame = 3600 alloc/sec при 120 drops
    // × 30fps — основной источник GC давления на iPhone Safari. На motion-blur
    // 30fps разница между gradient и flat stroke неотличима.
    ctx.lineCap = "round";
    for (let i = 0; i < pool.length; i += 1) {
        const p = pool[i];
        if (p.alpha < 0.005) continue;
        // Тот же clamped drift, что и в updateRainPool — линия капли совпадает
        // с её траекторией (max ~3° от вертикали).
        const gx = driftForRainParticle(p.speed, windSpeed, p.windFactor);
        const gy = p.length;
        ctx.strokeStyle = `rgba(${RAIN_COLOR}, ${p.alpha})`;
        ctx.lineWidth = p.layer === 2 ? 1.4 : p.layer === 1 ? 1.1 : 0.9;
        ctx.beginPath();
        ctx.moveTo(p.x - gx, p.y - gy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    }
};

export const drawSnowPool = (
    ctx: CanvasRenderingContext2D,
    pool: SnowParticle[],
): void => {
    for (let i = 0; i < pool.length; i += 1) {
        const p = pool[i];
        if (p.alpha < 0.005) continue;
        ctx.fillStyle = `rgba(${SNOW_COLOR}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    }
};
