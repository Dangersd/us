import { afterEach, describe, expect, it } from "vitest";

import {
    type SplashEvent,
    type SplashParticle,
    __resetSplashState,
    canSpawnOnSurface,
    markSpawn,
    spawnSplash,
    updateSplashPool,
} from "~components/shell/weather-splash";

const ev = (
    surfaceId: string,
    overrides: Partial<SplashEvent> = {},
): SplashEvent => ({
    x: 100,
    y: 50,
    surfaceId,
    surfaceLeft: 0,
    surfaceTop: 50,
    surfaceWidth: 300,
    ...overrides,
});

afterEach(() => {
    __resetSplashState();
});

describe("cooldown throttle", () => {
    it("first spawn allowed; second within 200ms blocked", () => {
        const t = 1000;
        expect(canSpawnOnSurface("a", t)).toBe(true);
        markSpawn("a", t);
        expect(canSpawnOnSurface("a", t + 100)).toBe(false);
        expect(canSpawnOnSurface("a", t + 201)).toBe(true);
    });
});

describe("spawnSplash", () => {
    it("spawns 4 particles with upward kick", () => {
        const pool: SplashParticle[] = [];
        spawnSplash(pool, ev("a"));
        expect(pool).toHaveLength(4);
        for (const p of pool) {
            expect(p.life).toBe(1);
            expect(p.vy).toBeLessThan(0); // upward
        }
    });
});

describe("updateSplashPool", () => {
    it("decays life and gravity-pulls particles", () => {
        const pool: SplashParticle[] = [
            { x: 0, y: 0, vx: 1, vy: -2, life: 1.0 },
        ];
        updateSplashPool(pool);
        expect(pool[0].x).toBe(1);
        expect(pool[0].life).toBeLessThan(1.0);
        expect(pool[0].vy).toBeGreaterThan(-2); // gravity decreased upward velocity
    });

    it("removes particles at life <= 0", () => {
        const pool: SplashParticle[] = [
            { x: 0, y: 0, vx: 0, vy: 0, life: 0.04 },
        ];
        updateSplashPool(pool);
        expect(pool).toHaveLength(0);
    });
});
