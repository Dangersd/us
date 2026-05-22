import { afterEach, describe, expect, it, vi } from "vitest";

import {
    GRACE_PERIOD_MS,
    __resetSurfaceCache,
    __seedSurfaceCache,
    findTopEdgeHit,
    getActiveSurfaces,
} from "~components/shell/weather-surfaces";

afterEach(() => {
    __resetSurfaceCache();
    vi.useRealTimers();
});

describe("getActiveSurfaces — grace period", () => {
    it("filters out surfaces younger than GRACE_PERIOD_MS", () => {
        vi.useFakeTimers();
        const t0 = new Date("2026-05-22T10:00:00Z").getTime();
        vi.setSystemTime(t0);
        __seedSurfaceCache([
            {
                id: "fresh",
                rect: { top: 0, left: 0, right: 100, bottom: 100 },
                edge: "top",
                mountedAt: t0,
            },
            {
                id: "settled",
                rect: { top: 200, left: 0, right: 100, bottom: 300 },
                edge: "top",
                mountedAt: t0 - 500,
            },
        ]);

        expect(getActiveSurfaces().map((s) => s.id)).toEqual(["settled"]);
        vi.setSystemTime(t0 + GRACE_PERIOD_MS + 10);
        expect(
            getActiveSurfaces()
                .map((s) => s.id)
                .sort(),
        ).toEqual(["fresh", "settled"]);
    });

    it("returns empty when cache empty", () => {
        expect(getActiveSurfaces()).toEqual([]);
    });
});

describe("findTopEdgeHit", () => {
    const surfaces = [
        {
            id: "lower",
            rect: { top: 200, left: 0, right: 300, bottom: 500 },
            edge: "top" as const,
            mountedAt: 0,
        },
        {
            id: "upper",
            rect: { top: 100, left: 50, right: 250, bottom: 400 },
            edge: "top" as const,
            mountedAt: 0,
        },
    ];

    it("returns null when no crossing", () => {
        expect(findTopEdgeHit(100, 50, 80, surfaces)).toBeNull();
    });

    it("returns surface when particle crosses top edge", () => {
        const hit = findTopEdgeHit(100, 90, 105, surfaces);
        expect(hit?.id).toBe("upper");
    });

    it("respects horizontal bounds", () => {
        expect(findTopEdgeHit(400, 90, 105, surfaces)).toBeNull();
    });

    it("reverse iteration picks last-in-DOM surface for stack ordering", () => {
        const stacked = [
            {
                id: "modal",
                rect: { top: 100, left: 0, right: 500, bottom: 600 },
                edge: "top" as const,
                mountedAt: 0,
            },
            {
                id: "dialog-on-top",
                rect: { top: 100, left: 100, right: 400, bottom: 500 },
                edge: "top" as const,
                mountedAt: 0,
            },
        ];
        const hit = findTopEdgeHit(200, 90, 105, stacked);
        expect(hit?.id).toBe("dialog-on-top");
    });

    it("returns null when surface array empty", () => {
        expect(findTopEdgeHit(100, 0, 1000, [])).toBeNull();
    });
});
