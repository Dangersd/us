import { describe, expect, it } from "vitest";

import {
    displayDateToIso,
    isoToDisplayDate,
    maskDate,
    maskTime,
} from "~libs/form/masks";

describe("maskDate", () => {
    it("вставляет дефисы по мере ввода", () => {
        expect(maskDate("")).toBe("");
        expect(maskDate("2")).toBe("2");
        expect(maskDate("20")).toBe("20");
        expect(maskDate("205")).toBe("20-5");
        expect(maskDate("2005")).toBe("20-05");
        expect(maskDate("20052024")).toBe("20-05-2024");
    });

    it("отбрасывает буквы", () => {
        expect(maskDate("20a05b2024")).toBe("20-05-2024");
        expect(maskDate("abc")).toBe("");
    });

    it("ограничивает до 8 цифр", () => {
        expect(maskDate("200520242025")).toBe("20-05-2024");
    });
});

describe("maskTime — basic", () => {
    it("вставляет двоеточие после 2 цифр", () => {
        expect(maskTime("")).toBe("");
        expect(maskTime("1")).toBe("1");
        expect(maskTime("19")).toBe("19");
        expect(maskTime("190")).toBe("19:0");
        expect(maskTime("1900")).toBe("19:00");
    });

    it("отбрасывает буквы и спецсимволы", () => {
        expect(maskTime("19:00")).toBe("19:00");
        expect(maskTime("a1b9:c0d0")).toBe("19:00");
        expect(maskTime("abc")).toBe("");
    });
});

describe("maskTime — clamp hours до 23", () => {
    it("auto-prepend 0 когда первая цифра 3-9", () => {
        expect(maskTime("3")).toBe("03");
        expect(maskTime("5")).toBe("05");
        expect(maskTime("9")).toBe("09");
        expect(maskTime("55")).toBe("05:5");
        expect(maskTime("999")).toBe("09:59");
    });

    it("0,1,2 как первая цифра не префиксятся", () => {
        expect(maskTime("0")).toBe("0");
        expect(maskTime("1")).toBe("1");
        expect(maskTime("2")).toBe("2");
        expect(maskTime("00")).toBe("00");
        expect(maskTime("23")).toBe("23");
    });

    it("clamp второй цифры когда первая = 2", () => {
        expect(maskTime("24")).toBe("23");
        expect(maskTime("29")).toBe("23");
        expect(maskTime("2400")).toBe("23:00");
        expect(maskTime("2999")).toBe("23:59");
    });

    it("first=1 — вторая цифра 0-9 свободна", () => {
        expect(maskTime("19")).toBe("19");
        expect(maskTime("13")).toBe("13");
    });
});

describe("maskTime — clamp minutes до 59", () => {
    it("clamp первой цифры минут когда >5", () => {
        expect(maskTime("196")).toBe("19:5");
        expect(maskTime("199")).toBe("19:5");
        expect(maskTime("1960")).toBe("19:50");
        expect(maskTime("1999")).toBe("19:59");
    });

    it("0-5 как первая минутная — свободно", () => {
        expect(maskTime("1900")).toBe("19:00");
        expect(maskTime("1959")).toBe("19:59");
    });
});

describe("displayDateToIso", () => {
    it("конвертирует ДД-ММ-ГГГГ → YYYY-MM-DD", () => {
        expect(displayDateToIso("20-05-2024")).toBe("2024-05-20");
        expect(displayDateToIso("01-01-2026")).toBe("2026-01-01");
    });

    it("возвращает исходник для невалидных", () => {
        expect(displayDateToIso("abc")).toBe("abc");
        expect(displayDateToIso("20-05")).toBe("20-05");
    });
});

describe("isoToDisplayDate", () => {
    it("конвертирует YYYY-MM-DD → ДД-ММ-ГГГГ", () => {
        expect(isoToDisplayDate("2024-05-20")).toBe("20-05-2024");
    });

    it("возвращает исходник для невалидных", () => {
        expect(isoToDisplayDate("abc")).toBe("abc");
    });
});
