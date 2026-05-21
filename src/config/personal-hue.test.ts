import { describe, expect, it } from "vitest";

import { HUE_PRESETS, hueToHex } from "~config/personal-hue";

describe("hueToHex", () => {
    it("male default → copper", () => {
        expect(hueToHex("male", "default")).toBe("#E8A87C");
    });

    it("female default → rose", () => {
        expect(hueToHex("female", "default")).toBe("#F4A5B9");
    });

    it("falls back to gender default when variant is null", () => {
        expect(hueToHex("male", null)).toBe("#E8A87C");
        expect(hueToHex("female", null)).toBe("#F4A5B9");
    });

    it("falls back to gender default when variant is undefined", () => {
        expect(hueToHex("male", undefined)).toBe("#E8A87C");
    });

    it("falls back to gender default on unknown variant", () => {
        expect(hueToHex("male", "unicorn")).toBe("#E8A87C");
        expect(hueToHex("female", "")).toBe("#F4A5B9");
    });

    it("resolves named male variants", () => {
        expect(hueToHex("male", "copper")).toBe("#E8A87C");
        expect(hueToHex("male", "honey")).toBe("#E0B872");
        expect(hueToHex("male", "earth")).toBe("#C9967B");
    });

    it("resolves named female variants", () => {
        expect(hueToHex("female", "rose")).toBe("#F4A5B9");
        expect(hueToHex("female", "blush")).toBe("#F0B8C4");
        expect(hueToHex("female", "wine")).toBe("#C77B8A");
    });

    it("HUE_PRESETS shape matches docs/07-open-questions palette", () => {
        expect(HUE_PRESETS.male.default).toBe("#E8A87C");
        expect(HUE_PRESETS.female.default).toBe("#F4A5B9");
    });
});
