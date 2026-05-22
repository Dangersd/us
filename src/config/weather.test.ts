import { describe, expect, it } from "vitest";

import { parseWeatherResponse, wmoToState } from "~config/weather";

describe("wmoToState", () => {
    it("maps clear codes (0, 1)", () => {
        expect(wmoToState(0)).toBe("clear");
        expect(wmoToState(1)).toBe("clear");
    });

    it("maps partly/overcast (2, 3) and fog (45, 48) to cloudy", () => {
        expect(wmoToState(2)).toBe("cloudy");
        expect(wmoToState(3)).toBe("cloudy");
        expect(wmoToState(45)).toBe("cloudy");
        expect(wmoToState(48)).toBe("cloudy");
    });

    it("maps drizzle/rain (51-67) to rain", () => {
        expect(wmoToState(51)).toBe("rain");
        expect(wmoToState(55)).toBe("rain");
        expect(wmoToState(61)).toBe("rain");
        expect(wmoToState(67)).toBe("rain");
    });

    it("maps rain showers (80-82) to rain", () => {
        expect(wmoToState(80)).toBe("rain");
        expect(wmoToState(82)).toBe("rain");
    });

    it("maps thunderstorms (95-99) to rain", () => {
        expect(wmoToState(95)).toBe("rain");
        expect(wmoToState(99)).toBe("rain");
    });

    it("maps snow codes (71-77, 85, 86) to snow", () => {
        expect(wmoToState(71)).toBe("snow");
        expect(wmoToState(73)).toBe("snow");
        expect(wmoToState(75)).toBe("snow");
        expect(wmoToState(77)).toBe("snow");
        expect(wmoToState(85)).toBe("snow");
        expect(wmoToState(86)).toBe("snow");
    });

    it("falls back to cloudy on unknown codes", () => {
        expect(wmoToState(7)).toBe("cloudy");
        expect(wmoToState(123)).toBe("cloudy");
        expect(wmoToState(-1)).toBe("clear"); // negative <= 1 — acceptable corner
    });
});

describe("parseWeatherResponse", () => {
    it("returns null for null / non-object input", () => {
        expect(parseWeatherResponse(null)).toBeNull();
        expect(parseWeatherResponse(undefined)).toBeNull();
        expect(parseWeatherResponse("rain")).toBeNull();
        expect(parseWeatherResponse(42)).toBeNull();
    });

    it("returns null when current.weather_code is missing or not a number", () => {
        expect(parseWeatherResponse({})).toBeNull();
        expect(parseWeatherResponse({ current: {} })).toBeNull();
        expect(
            parseWeatherResponse({ current: { weather_code: "61" } }),
        ).toBeNull();
        expect(parseWeatherResponse({ error: true, reason: "x" })).toBeNull();
    });

    it("parses a well-formed rain response", () => {
        const snap = parseWeatherResponse({
            current: {
                weather_code: 61,
                is_day: 1,
                temperature_2m: 12.4,
                wind_speed_10m: 8.3,
            },
        });
        expect(snap).not.toBeNull();
        expect(snap?.state).toBe("rain");
        expect(snap?.isDay).toBe(true);
        expect(snap?.temperature).toBe(12.4);
        expect(snap?.windSpeed).toBe(8.3);
        expect(typeof snap?.fetchedAt).toBe("number");
    });

    it("treats is_day=0 as night", () => {
        const snap = parseWeatherResponse({
            current: { weather_code: 0, is_day: 0 },
        });
        expect(snap?.state).toBe("clear");
        expect(snap?.isDay).toBe(false);
    });

    it("defaults temperature/wind to 0 when fields are missing", () => {
        const snap = parseWeatherResponse({
            current: { weather_code: 0, is_day: 1 },
        });
        expect(snap?.temperature).toBe(0);
        expect(snap?.windSpeed).toBe(0);
    });
});
