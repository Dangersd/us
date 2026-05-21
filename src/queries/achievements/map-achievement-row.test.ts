import { describe, expect, it } from "vitest";

import {
    type AchievementUnlockRow,
    mapAchievementRow,
    mapAchievementRows,
} from "~queries/achievements/map-achievement-row";

const row = (
    overrides: Partial<AchievementUnlockRow> = {},
): AchievementUnlockRow => ({
    key: "first_moon",
    scope: "user",
    unlocked_by_user_id: "user-1",
    unlocked_at: "2026-05-22T00:00:00Z",
    ...overrides,
});

describe("mapAchievementRow", () => {
    it("maps a known row to camelCase shape", () => {
        const out = mapAchievementRow(row());
        expect(out).toEqual({
            key: "first_moon",
            scope: "user",
            unlockedByUserId: "user-1",
            unlockedAt: "2026-05-22T00:00:00Z",
        });
    });

    it("returns null for unknown key (catalog drift)", () => {
        expect(mapAchievementRow(row({ key: "removed_key" }))).toBeNull();
    });

    it("returns null for invalid scope literal", () => {
        expect(mapAchievementRow(row({ scope: "global" }))).toBeNull();
    });

    it("preserves null unlocked_by_user_id (couple scope)", () => {
        const out = mapAchievementRow(
            row({ scope: "couple", unlocked_by_user_id: null }),
        );
        expect(out?.unlockedByUserId).toBeNull();
        expect(out?.scope).toBe("couple");
    });
});

describe("mapAchievementRows", () => {
    it("filters out unknown keys and invalid scopes", () => {
        const out = mapAchievementRows([
            row({ key: "first_moon" }),
            row({ key: "removed_key" }),
            row({
                key: "parallel",
                scope: "couple",
                unlocked_by_user_id: null,
            }),
            row({ key: "first_moon", scope: "garbage" }),
        ]);
        expect(out.map((u) => u.key)).toEqual(["first_moon", "parallel"]);
    });

    it("returns empty array for empty input", () => {
        expect(mapAchievementRows([])).toEqual([]);
    });
});
