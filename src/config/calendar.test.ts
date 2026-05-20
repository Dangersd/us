import { describe, expect, it } from "vitest";

import {
    CUSTOM_CATEGORY_FALLBACK_COLOR,
    categoryColor,
    categoryLabel,
    displayCategoryColor,
    displayCategoryLabel,
} from "~config/calendar";

describe("displayCategoryLabel", () => {
    it("returns built-in label when customLabel is null", () => {
        expect(displayCategoryLabel("dinner", null)).toBe(
            categoryLabel("dinner"),
        );
    });

    it("returns customLabel when provided, regardless of category", () => {
        expect(displayCategoryLabel("generic", "йога")).toBe("йога");
        expect(displayCategoryLabel("dinner", "йога")).toBe("йога");
    });
});

describe("displayCategoryColor", () => {
    it("returns built-in color when customLabel is null", () => {
        expect(displayCategoryColor("dinner", null)).toBe(
            categoryColor("dinner"),
        );
    });

    it("returns fallback color when customLabel is set", () => {
        expect(displayCategoryColor("generic", "йога")).toBe(
            CUSTOM_CATEGORY_FALLBACK_COLOR,
        );
        expect(displayCategoryColor("dinner", "йога")).toBe(
            CUSTOM_CATEGORY_FALLBACK_COLOR,
        );
    });
});
