import { describe, expect, it } from "vitest";

import type { CycleEntry, PeriodFlow } from "~interfaces/cycle";
import {
    computeStats,
    extractPeriodStarts,
    predictNextPeriod,
} from "~queries/cycle/cycle-math";

function entry(
    date: string,
    flow: PeriodFlow | null = 2,
    overrides: Partial<CycleEntry> = {},
): CycleEntry {
    return {
        userId: "user-1",
        coupleId: "couple-1",
        date,
        periodFlow: flow,
        symptoms: [],
        note: null,
        createdAt: "2026-05-22T00:00:00Z",
        updatedAt: "2026-05-22T00:00:00Z",
        ...overrides,
    };
}

describe("extractPeriodStarts", () => {
    it("returns empty for no entries", () => {
        expect(extractPeriodStarts([])).toEqual([]);
    });

    it("returns empty when no flow entries", () => {
        expect(
            extractPeriodStarts([
                entry("2026-05-01", null),
                entry("2026-05-02", null),
            ]),
        ).toEqual([]);
    });

    it("treats first flow day as start when no prior", () => {
        expect(extractPeriodStarts([entry("2026-05-01", 2)])).toEqual([
            "2026-05-01",
        ]);
    });

    it("collapses consecutive flow days into one start (the first)", () => {
        expect(
            extractPeriodStarts([
                entry("2026-05-01", 2),
                entry("2026-05-02", 3),
                entry("2026-05-03", 1),
            ]),
        ).toEqual(["2026-05-01"]);
    });

    it("returns DESC order (newest first)", () => {
        expect(
            extractPeriodStarts([
                entry("2026-03-01", 2),
                entry("2026-04-01", 2),
                entry("2026-05-01", 2),
            ]),
        ).toEqual(["2026-05-01", "2026-04-01", "2026-03-01"]);
    });

    it("detects gap > 1 day as new period start", () => {
        // 5-day period in March, 4-day period in April → 2 starts
        expect(
            extractPeriodStarts([
                entry("2026-03-01", 2),
                entry("2026-03-02", 2),
                entry("2026-03-03", 1),
                entry("2026-04-01", 2),
                entry("2026-04-02", 1),
            ]),
        ).toEqual(["2026-04-01", "2026-03-01"]);
    });
});

describe("predictNextPeriod", () => {
    it("returns null with no data", () => {
        expect(predictNextPeriod([], 28)).toBeNull();
    });

    it("adds avgLen to last period start", () => {
        expect(predictNextPeriod(["2026-05-01"], 28)).toBe("2026-05-29");
        expect(predictNextPeriod(["2026-05-01"], 30)).toBe("2026-05-31");
    });

    it("works for shorter cycles", () => {
        expect(predictNextPeriod(["2026-05-01"], 21)).toBe("2026-05-22");
    });

    it("uses only the most recent start (index 0 of DESC array)", () => {
        expect(
            predictNextPeriod(["2026-05-01", "2026-04-01", "2026-03-01"], 28),
        ).toBe("2026-05-29");
    });
});

describe("computeStats", () => {
    it("returns unknown with no data", () => {
        expect(computeStats([], 28)).toEqual({
            avgLength: 28,
            regularity: "unknown",
            trackedCycles: 0,
        });
    });

    it("returns unknown with single start (no cycle length to measure)", () => {
        expect(computeStats(["2026-05-01"], 28)).toEqual({
            avgLength: 28,
            regularity: "unknown",
            trackedCycles: 0,
        });
    });

    it("returns unknown with two starts but only one length (need 3+ для regularity verdict)", () => {
        // DESC order: latest first
        const stats = computeStats(["2026-05-01", "2026-04-03"], 28);
        expect(stats.avgLength).toBe(28); // 28 days between
        expect(stats.regularity).toBe("unknown");
        expect(stats.trackedCycles).toBe(1);
    });

    it("classifies tight std as regular", () => {
        // Циклы: 28, 28, 28 — std=0
        const stats = computeStats(
            ["2026-05-01", "2026-04-03", "2026-03-06", "2026-02-06"],
            28,
        );
        expect(stats.avgLength).toBe(28);
        expect(stats.regularity).toBe("regular");
        expect(stats.trackedCycles).toBe(3);
    });

    it("classifies wide std as irregular", () => {
        // Циклы: 20, 35, 25 — std > 3
        const stats = computeStats(
            ["2026-05-01", "2026-04-06", "2026-03-02", "2026-02-10"],
            28,
        );
        expect(stats.regularity).toBe("irregular");
        expect(stats.trackedCycles).toBe(3);
    });

    it("rounds avgLength", () => {
        // Циклы: 28, 29 → avg 28.5 → 29 (или 28 в зависимости от round mode)
        const stats = computeStats(
            ["2026-05-01", "2026-04-02", "2026-03-05"],
            28,
        );
        expect(Number.isInteger(stats.avgLength)).toBe(true);
    });
});
