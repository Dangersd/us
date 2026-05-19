// Browser-safe экспорты query-слоя mood.
// fetchTodayMoodServer импортируется явно из ~queries/mood/fetch-today-mood.server
// чтобы случайно не утащить next/headers / server-only в client bundle.
export { fetchTodayMood } from "~queries/mood/fetch-today-mood";
export { moodKeys } from "~queries/mood/keys";
export {
    MOOD_COLUMNS,
    mapMoodRow,
    type MoodEntryRow,
} from "~queries/mood/map-mood-row";
export { useTodayMood } from "~queries/mood/use-today-mood";
export {
    type UpsertMoodInput,
    useUpsertMood,
} from "~queries/mood/use-upsert-mood";
