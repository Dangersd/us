export const profileKeys = {
    all: ["profile"] as const,
    partner: () => [...profileKeys.all, "partner"] as const,
};
