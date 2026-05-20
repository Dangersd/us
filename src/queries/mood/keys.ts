export const moodKeys = {
    all: ["mood"] as const,
    byDate: (date: string) => [...moodKeys.all, "byDate", date] as const,
    partnerByDate: (date: string) =>
        [...moodKeys.all, "partner", "byDate", date] as const,
    ownRange: (start: string, end: string) =>
        [...moodKeys.all, "own-range", start, end] as const,
    partnerRange: (start: string, end: string) =>
        [...moodKeys.all, "partner-range", start, end] as const,
};
