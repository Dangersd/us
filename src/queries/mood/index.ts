// Browser-safe экспорты query-слоя mood.
// fetch*Server импортируются явно из *.server.ts чтобы случайно не утащить
// next/headers / server-only в client bundle.
export { fetchPartnerTodayMood } from "~queries/mood/fetch-partner-today-mood";
export { fetchTodayMood } from "~queries/mood/fetch-today-mood";
export { moodKeys } from "~queries/mood/keys";
export {
    MOOD_COLUMNS,
    mapMoodRow,
    type MoodEntryRow,
} from "~queries/mood/map-mood-row";
export { useMoodDraft } from "~queries/mood/use-mood-draft";
export { usePartnerTodayMood } from "~queries/mood/use-partner-today-mood";
export { useTodayMood } from "~queries/mood/use-today-mood";
export {
    type UpsertMoodInput,
    useUpsertMood,
} from "~queries/mood/use-upsert-mood";
