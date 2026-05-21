// Browser-safe экспорты query-слоя mood.
// fetch*Server и create*ServerQuery импортируются явно из *.server.ts чтобы
// случайно не утащить next/headers / server-only в client bundle.
export {
    createFetchPartnerTodayMoodQuery,
    fetchPartnerTodayMood,
} from "~queries/mood/fetch-partner-today-mood";
export {
    createFetchOwnMoodRangeQuery,
    fetchOwnMoodRange,
} from "~queries/mood/fetch-own-mood-range";
export {
    createFetchPartnerMoodRangeQuery,
    fetchPartnerMoodRange,
} from "~queries/mood/fetch-partner-mood-range";
export {
    createFetchTodayMoodQuery,
    fetchTodayMood,
} from "~queries/mood/fetch-today-mood";
export { moodKeys } from "~queries/mood/keys";
export {
    MOOD_COLUMNS,
    mapMoodRow,
    type MoodEntryRow,
} from "~queries/mood/map-mood-row";
export { useMoodDraft } from "~queries/mood/use-mood-draft";
export { useOwnMoodRange } from "~queries/mood/use-own-mood-range";
export { usePartnerMoodRange } from "~queries/mood/use-partner-mood-range";
export { usePartnerTodayMood } from "~queries/mood/use-partner-today-mood";
export { useTodayMood } from "~queries/mood/use-today-mood";
export {
    type UpsertMoodInput,
    useUpsertMood,
} from "~queries/mood/use-upsert-mood";
