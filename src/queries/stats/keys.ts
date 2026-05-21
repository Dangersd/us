export const statsKeys = {
    all: ["stats"] as const,
    couple: () => [...statsKeys.all, "couple"] as const,
};
