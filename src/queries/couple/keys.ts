export const coupleKeys = {
    all: ["couple"] as const,
    current: () => [...coupleKeys.all, "current"] as const,
};
