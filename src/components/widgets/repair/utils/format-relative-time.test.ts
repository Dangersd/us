import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "~components/widgets/repair/utils/format-relative-time";

const NOW = new Date("2026-05-21T15:00:00Z").getTime();

describe("formatRelativeTime", () => {
    it("returns «только что» for under 60s", () => {
        expect(formatRelativeTime("2026-05-21T14:59:30Z", NOW)).toBe(
            "только что",
        );
        expect(formatRelativeTime("2026-05-21T15:00:00Z", NOW)).toBe(
            "только что",
        );
    });

    it("formats minutes with Russian plural", () => {
        // 1 minute
        expect(formatRelativeTime("2026-05-21T14:59:00Z", NOW)).toBe(
            "1 минуту назад",
        );
        // 3 minutes
        expect(formatRelativeTime("2026-05-21T14:57:00Z", NOW)).toBe(
            "3 минуты назад",
        );
        // 5 minutes
        expect(formatRelativeTime("2026-05-21T14:55:00Z", NOW)).toBe(
            "5 минут назад",
        );
        // 11 — special case (11-14 → «минут»)
        expect(formatRelativeTime("2026-05-21T14:49:00Z", NOW)).toBe(
            "11 минут назад",
        );
        // 21 — back to «минуту»
        expect(formatRelativeTime("2026-05-21T14:39:00Z", NOW)).toBe(
            "21 минуту назад",
        );
    });

    it("formats hours with Russian plural", () => {
        expect(formatRelativeTime("2026-05-21T14:00:00Z", NOW)).toBe(
            "1 час назад",
        );
        expect(formatRelativeTime("2026-05-21T12:00:00Z", NOW)).toBe(
            "3 часа назад",
        );
        expect(formatRelativeTime("2026-05-21T10:00:00Z", NOW)).toBe(
            "5 часов назад",
        );
    });

    it("formats days with Russian plural", () => {
        expect(formatRelativeTime("2026-05-20T15:00:00Z", NOW)).toBe(
            "1 день назад",
        );
        expect(formatRelativeTime("2026-05-19T15:00:00Z", NOW)).toBe(
            "2 дня назад",
        );
        expect(formatRelativeTime("2026-05-16T15:00:00Z", NOW)).toBe(
            "5 дней назад",
        );
    });

    it("handles invalid ISO gracefully", () => {
        expect(formatRelativeTime("not-a-date", NOW)).toBe("только что");
    });
});
