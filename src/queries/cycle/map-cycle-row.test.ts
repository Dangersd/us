import { describe, expect, it } from "vitest";

import { type CycleEntryRow, mapCycleRow } from "~queries/cycle/map-cycle-row";

const row = (overrides: Partial<CycleEntryRow> = {}): CycleEntryRow => ({
    user_id: "user-1",
    couple_id: "couple-1",
    date: "2026-05-22",
    period_flow: 2,
    symptoms: ["cramps", "headache"],
    note: null,
    created_at: "2026-05-22T00:00:00Z",
    updated_at: "2026-05-22T00:00:00Z",
    ...overrides,
});

describe("mapCycleRow", () => {
    it("maps a known row to camelCase shape", () => {
        const out = mapCycleRow(row());
        expect(out).toEqual({
            userId: "user-1",
            coupleId: "couple-1",
            date: "2026-05-22",
            periodFlow: 2,
            symptoms: ["cramps", "headache"],
            note: null,
            createdAt: "2026-05-22T00:00:00Z",
            updatedAt: "2026-05-22T00:00:00Z",
        });
    });

    it("silently filters unknown symptom tags (catalog drift defense)", () => {
        const out = mapCycleRow(
            row({ symptoms: ["cramps", "removed_symptom", "bloating"] }),
        );
        expect(out.symptoms).toEqual(["cramps", "bloating"]);
    });

    it("normalizes null symptoms to empty array", () => {
        const out = mapCycleRow(row({ symptoms: null }));
        expect(out.symptoms).toEqual([]);
    });

    it("clamps invalid period_flow values to null", () => {
        expect(mapCycleRow(row({ period_flow: 5 })).periodFlow).toBeNull();
        expect(mapCycleRow(row({ period_flow: 0 })).periodFlow).toBeNull();
        expect(mapCycleRow(row({ period_flow: null })).periodFlow).toBeNull();
    });

    it("preserves note when present", () => {
        const out = mapCycleRow(row({ note: "feeling off" }));
        expect(out.note).toBe("feeling off");
    });
});
