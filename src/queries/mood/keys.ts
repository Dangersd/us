export const moodKeys = {
    all: ["mood"] as const,
    byDate: (date: string) => [...moodKeys.all, "byDate", date] as const,
    partnerByDate: (date: string) =>
        [...moodKeys.all, "partner", "byDate", date] as const,
};
