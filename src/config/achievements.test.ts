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

    it("has non-empty title, description and criterion for every entry", () => {
        for (const a of ACHIEVEMENTS) {
            expect(a.title.length).toBeGreaterThan(0);
            expect(a.description.length).toBeGreaterThan(0);
            expect(a.criterion.length).toBeGreaterThan(0);
        }
    });

    it("has all 12 entries enabled (no disabled stubs left)", () => {
        // Disabled-stub паттерн ушёл вместе с twelve_moons. Каталог теперь
        // полностью активный — если что-то нужно отложить, лучше удалить
        // entry до момента готовности и обновить SQL RPC.
        expect(ACHIEVEMENTS.every((a) => a.enabled)).toBe(true);
        expect(ACHIEVEMENTS.length).toBe(12);
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
