import { describe, expect, it } from "vitest";

import {
    pluralizeDays,
    pluralizeHours,
} from "~components/widgets/home/utils/pluralize-days";

describe("pluralizeDays", () => {
    it.each([
        [1, "день"],
        [21, "день"],
        [101, "день"],
        [2, "дня"],
        [3, "дня"],
        [4, "дня"],
        [22, "дня"],
        [104, "дня"],
        [5, "дней"],
        [10, "дней"],
        [11, "дней"],
        [12, "дней"],
        [13, "дней"],
        [14, "дней"],
        [15, "дней"],
        [20, "дней"],
        [111, "дней"],
        [112, "дней"],
        [0, "дней"],
    ])("pluralizeDays(%i) == %s", (n, expected) => {
        expect(pluralizeDays(n)).toBe(expected);
    });
});

describe("pluralizeHours", () => {
    it.each([
        [1, "час"],
        [21, "час"],
        [2, "часа"],
        [23, "часа"],
        [5, "часов"],
        [11, "часов"],
        [17208, "часов"],
        [0, "часов"],
    ])("pluralizeHours(%i) == %s", (n, expected) => {
        expect(pluralizeHours(n)).toBe(expected);
    });
});
