import { describe, expect, it } from "vitest";

import { formatDateLine } from "~components/widgets/home/utils/format-date-line";

describe("formatDateLine", () => {
    it("formats Friday 22 May 2026", () => {
        // 2026-05-22 — пятница.
        expect(formatDateLine("2026-05-22")).toBe("Пт · 22 мая");
    });
    it("formats Sunday correctly (ISO weekday wrap)", () => {
        // 2026-05-24 — воскресенье.
        expect(formatDateLine("2026-05-24")).toBe("Вс · 24 мая");
    });
    it("formats Monday correctly (ISO weekday 1)", () => {
        // 2026-05-25 — понедельник.
        expect(formatDateLine("2026-05-25")).toBe("Пн · 25 мая");
    });
    it("formats leap-day February 29", () => {
        // 2028-02-29 — вторник.
        expect(formatDateLine("2028-02-29")).toBe("Вт · 29 февраля");
    });
});
