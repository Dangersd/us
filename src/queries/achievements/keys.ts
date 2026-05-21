export const achievementsKeys = {
    all: ["achievements"] as const,
    couple: () => [...achievementsKeys.all, "couple"] as const,
};
