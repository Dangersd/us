import { describe, expect, it } from "vitest";

import {
    driftForRainParticle,
    initRainPool,
    initSnowPool,
    updateRainPool,
    updateSnowPool,
} from "~components/shell/weather-particles";

const W = 800;
const H = 600;

describe("initRainPool", () => {
    it("allocates 120 particles across 3 layers (40 + 50 + 30)", () => {
        const pool = initRainPool(W, H);
        expect(pool).toHaveLength(120);
        expect(pool.filter((p) => p.layer === 0)).toHaveLength(40);
        expect(pool.filter((p) => p.layer === 1)).toHaveLength(50);
        expect(pool.filter((p) => p.layer === 2)).toHaveLength(30);
    });

    it("spawns particles within the viewport", () => {
        const pool = initRainPool(W, H);
        for (const p of pool) {
            expect(p.x).toBeGreaterThanOrEqual(0);
            expect(p.x).toBeLessThanOrEqual(W);
            expect(p.y).toBeGreaterThanOrEqual(0);
            expect(p.y).toBeLessThanOrEqual(H);
            expect(p.alpha).toBeGreaterThan(0);
            expect(p.windFactor).toBeGreaterThanOrEqual(0.7);
            expect(p.windFactor).toBeLessThanOrEqual(1.3);
        }
    });
});

describe("initSnowPool", () => {
    it("allocates 25 particles across 3 layers (7 + 10 + 8)", () => {
        const pool = initSnowPool(W, H);
        expect(pool).toHaveLength(25);
        expect(pool.filter((p) => p.layer === 0)).toHaveLength(7);
        expect(pool.filter((p) => p.layer === 1)).toHaveLength(10);
        expect(pool.filter((p) => p.layer === 2)).toHaveLength(8);
    });
});

describe("updateRainPool", () => {
    it("moves particles down by their speed", () => {
        const pool = initRainPool(W, H);
        const yBefore = pool.map((p) => p.y);
        updateRainPool(pool, W, H, 0, false);
        for (let i = 0; i < pool.length; i += 1) {
            expect(pool[i].y).toBeCloseTo(yBefore[i] + pool[i].speed, 5);
        }
    });

    it("respawns at top when particle drops below height", () => {
        const pool = initRainPool(W, H);
        pool[0].y = H + 100;
        updateRainPool(pool, W, H, 0, false);
        expect(pool[0].y).toBeLessThanOrEqual(0);
    });

    it("decay active shrinks alpha toward zero", () => {
        const pool = initRainPool(W, H);
        const a0 = pool[0].alpha;
        updateRainPool(pool, W, H, 0, true);
        expect(pool[0].alpha).toBeLessThan(a0);
    });

    it("wind drifts particles horizontally", () => {
        const pool = initRainPool(W, H);
        const x0 = pool[0].x;
        updateRainPool(pool, W, H, 10, false); // 10 m/s wind
        expect(pool[0].x).not.toBe(x0);
    });

    it("wraps particles around horizontal edges", () => {
        const pool = initRainPool(W, H);
        pool[0].x = W + 100;
        updateRainPool(pool, W, H, 0, false);
        expect(pool[0].x).toBeLessThan(0);
    });
});

describe("driftForRainParticle", () => {
    it("returns zero drift at zero wind", () => {
        expect(driftForRainParticle(12, 0, 1)).toBe(0);
    });

    it("caps angle at ~3° from vertical regardless of wind speed", () => {
        // Hurricane-level wind (40 m/s) on slowest possible particle
        const drift = driftForRainParticle(8, 40, 1.3);
        const tilt = Math.abs(drift) / 8;
        expect(tilt).toBeLessThanOrEqual(0.056); // ≈ tan(3.2°)
    });

    it("scales drift with windFactor inside the cap", () => {
        const a = Math.abs(driftForRainParticle(13, 2, 0.7));
        const b = Math.abs(driftForRainParticle(13, 2, 1.3));
        expect(b).toBeGreaterThan(a);
    });
});

describe("updateSnowPool", () => {
    it("moves particles down + wiggle", () => {
        const pool = initSnowPool(W, H);
        const yBefore = pool[0].y;
        updateSnowPool(pool, W, H, 0, false);
        expect(pool[0].y).toBeGreaterThan(yBefore);
    });

    it("respawns at top when particle drops below height", () => {
        const pool = initSnowPool(W, H);
        pool[0].y = H + 100;
        updateSnowPool(pool, W, H, 0, false);
        expect(pool[0].y).toBeLessThanOrEqual(0);
    });
});
