export const moodKeys = {
    all: ["mood"] as const,
    byDate: (date: string) => [...moodKeys.all, "byDate", date] as const,
};
