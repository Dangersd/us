import { describe, expect, it } from "vitest";

import { createFetchOwnMoodRangeQuery } from "~queries/mood/fetch-own-mood-range";
import { createFetchOwnMoodRangeServerQuery } from "~queries/mood/fetch-own-mood-range.server";
import { createFetchPartnerMoodRangeQuery } from "~queries/mood/fetch-partner-mood-range";
import { createFetchPartnerMoodRangeServerQuery } from "~queries/mood/fetch-partner-mood-range.server";
import { createFetchPartnerTodayMoodQuery } from "~queries/mood/fetch-partner-today-mood";
import { createFetchPartnerTodayMoodServerQuery } from "~queries/mood/fetch-partner-today-mood.server";
import { createFetchTodayMoodQuery } from "~queries/mood/fetch-today-mood";
import { createFetchTodayMoodServerQuery } from "~queries/mood/fetch-today-mood.server";
import { moodKeys } from "~queries/mood/keys";

// Smoke-инвариант: queryKey фабрики === moodKeys.method(args). Гарантирует
// что мутации (use-upsert-mood) invalidate'ят те же ключи что prefetch'нул
// сервер. Если форма ключа изменится в keys.ts — тест упадёт.
describe("mood factories — queryKey shape", () => {
    const date = "2026-05-21";
    const start = "2026-05-18";
    const end = "2026-05-24";

    it("createFetchTodayMoodQuery", () => {
        expect(createFetchTodayMoodQuery(date).queryKey).toEqual(
            moodKeys.byDate(date),
        );
    });

    it("createFetchTodayMoodServerQuery", () => {
        expect(createFetchTodayMoodServerQuery(date).queryKey).toEqual(
            moodKeys.byDate(date),
        );
    });

    it("createFetchPartnerTodayMoodQuery", () => {
        expect(createFetchPartnerTodayMoodQuery(date).queryKey).toEqual(
            moodKeys.partnerByDate(date),
        );
    });

    it("createFetchPartnerTodayMoodServerQuery", () => {
        expect(createFetchPartnerTodayMoodServerQuery(date).queryKey).toEqual(
            moodKeys.partnerByDate(date),
        );
    });

    it("createFetchOwnMoodRangeQuery", () => {
        expect(createFetchOwnMoodRangeQuery(start, end).queryKey).toEqual(
            moodKeys.ownRange(start, end),
        );
    });

    it("createFetchOwnMoodRangeServerQuery", () => {
        expect(createFetchOwnMoodRangeServerQuery(start, end).queryKey).toEqual(
            moodKeys.ownRange(start, end),
        );
    });

    it("createFetchPartnerMoodRangeQuery", () => {
        expect(createFetchPartnerMoodRangeQuery(start, end).queryKey).toEqual(
            moodKeys.partnerRange(start, end),
        );
    });

    it("createFetchPartnerMoodRangeServerQuery", () => {
        expect(
            createFetchPartnerMoodRangeServerQuery(start, end).queryKey,
        ).toEqual(moodKeys.partnerRange(start, end));
    });
});
