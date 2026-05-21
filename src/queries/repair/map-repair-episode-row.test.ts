import { describe, expect, it } from "vitest";

import {
    type RepairEpisodeRow,
    mapRepairEpisodeRow,
} from "~queries/repair/map-repair-episode-row";

function baseRow(overrides: Partial<RepairEpisodeRow> = {}): RepairEpisodeRow {
    return {
        id: "ep-1",
        couple_id: "c-1",
        initiator_id: "u-1",
        intensity: 2,
        note: null,
        availability: "ready_to_talk",
        acknowledged_at: null,
        initiator_resolved_at: null,
        partner_resolved_at: null,
        closed_at: null,
        created_at: "2026-05-21T14:32:00Z",
        ...overrides,
    };
}

describe("mapRepairEpisodeRow", () => {
    it("maps all snake_case fields to camelCase domain shape", () => {
        const row = baseRow({
            id: "ep-7",
            couple_id: "c-42",
            initiator_id: "u-9",
            intensity: 3,
            note: "меня задело это",
            availability: "need_pause",
            acknowledged_at: "2026-05-21T14:35:00Z",
            initiator_resolved_at: "2026-05-21T15:01:00Z",
            partner_resolved_at: "2026-05-21T15:02:00Z",
            closed_at: "2026-05-21T15:02:00Z",
            created_at: "2026-05-21T14:32:00Z",
        });

        expect(mapRepairEpisodeRow(row)).toEqual({
            id: "ep-7",
            coupleId: "c-42",
            initiatorId: "u-9",
            intensity: 3,
            note: "меня задело это",
            availability: "need_pause",
            acknowledgedAt: "2026-05-21T14:35:00Z",
            initiatorResolvedAt: "2026-05-21T15:01:00Z",
            partnerResolvedAt: "2026-05-21T15:02:00Z",
            closedAt: "2026-05-21T15:02:00Z",
            createdAt: "2026-05-21T14:32:00Z",
        });
    });

    it("preserves null note as null (not undefined)", () => {
        const result = mapRepairEpisodeRow(baseRow({ note: null }));
        expect(result.note).toBe(null);
    });

    it("keeps all *_at timestamps null for a fresh open episode", () => {
        const result = mapRepairEpisodeRow(
            baseRow({
                acknowledged_at: null,
                initiator_resolved_at: null,
                partner_resolved_at: null,
                closed_at: null,
            }),
        );
        expect(result.acknowledgedAt).toBe(null);
        expect(result.initiatorResolvedAt).toBe(null);
        expect(result.partnerResolvedAt).toBe(null);
        expect(result.closedAt).toBe(null);
    });

    it("preserves a half-resolved episode (one side resolved, closed_at still null)", () => {
        const result = mapRepairEpisodeRow(
            baseRow({
                initiator_resolved_at: "2026-05-21T15:00:00Z",
                partner_resolved_at: null,
                closed_at: null,
            }),
        );
        expect(result.initiatorResolvedAt).toBe("2026-05-21T15:00:00Z");
        expect(result.partnerResolvedAt).toBe(null);
        expect(result.closedAt).toBe(null);
    });

    it("maps both availability enum values", () => {
        expect(
            mapRepairEpisodeRow(baseRow({ availability: "ready_to_talk" }))
                .availability,
        ).toBe("ready_to_talk");
        expect(
            mapRepairEpisodeRow(baseRow({ availability: "need_pause" }))
                .availability,
        ).toBe("need_pause");
    });

    it("maps all three intensity values", () => {
        expect(mapRepairEpisodeRow(baseRow({ intensity: 1 })).intensity).toBe(
            1,
        );
        expect(mapRepairEpisodeRow(baseRow({ intensity: 2 })).intensity).toBe(
            2,
        );
        expect(mapRepairEpisodeRow(baseRow({ intensity: 3 })).intensity).toBe(
            3,
        );
    });
});
