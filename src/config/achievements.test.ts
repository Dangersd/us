import { describe, expect, it } from "vitest";

import { ACHIEVEMENTS, findAchievement } from "~config/achievements";

describe("ACHIEVEMENTS catalog", () => {
    it("has unique keys", () => {
        const keys = ACHIEVEMENTS.map((a) => a.key);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it("uses valid scope values only", () => {
        for (const a of ACHIEVEMENTS) {
            expect(a.scope === "couple" || a.scope === "user").toBe(true);
        }
    });

    it("has non-empty title and description for every entry", () => {
        for (const a of ACHIEVEMENTS) {
            expect(a.title.length).toBeGreaterThan(0);
            expect(a.description.length).toBeGreaterThan(0);
        }
    });

    it("has at least one disabled entry (reserved for v0.2)", () => {
        const disabled = ACHIEVEMENTS.filter((a) => !a.enabled);
        expect(disabled.length).toBeGreaterThan(0);
        expect(disabled.some((a) => a.key === "twelve_moons")).toBe(true);
    });

    it("uses snake_case keys (anchor for RPC criterion mapping)", () => {
        for (const a of ACHIEVEMENTS) {
            expect(a.key).toMatch(/^[a-z][a-z0-9_]*$/);
        }
    });
});

describe("findAchievement", () => {
    it("returns def for known key", () => {
        const def = findAchievement("first_moon");
        expect(def?.title).toBe("Первая луна");
    });

    it("returns null for unknown key", () => {
        expect(findAchievement("not_a_real_key")).toBeNull();
        expect(findAchievement("")).toBeNull();
    });
});
