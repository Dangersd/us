export const repairKeys = {
    all: ["repair"] as const,
    /**
     * Single active repair episode for the current user's couple.
     * Partial unique index в DB гарантирует ≤1 строку.
     */
    active: () => [...repairKeys.all, "active"] as const,
};
